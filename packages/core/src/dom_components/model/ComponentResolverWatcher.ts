import { ObjectAny } from '../../common';
import { DataCollectionVariableType } from '../../data_sources/model/data_collection/constants';
import { DataCollectionStateMap } from '../../data_sources/model/data_collection/types';
import DataResolverListener from '../../data_sources/model/DataResolverListener';
import { getDataResolverInstanceValue, isDataResolverProps } from '../../data_sources/model/utils';
import EditorModel from '../../editor/model/Editor';
import { DataResolverProps } from '../../data_sources/types';
import Component from './Component';

export interface DynamicWatchersOptions {
  skipWatcherUpdates?: boolean;
  fromDataSource?: boolean;
}

export interface ComponentResolverWatcherOptions {
  em: EditorModel;
  collectionsStateMap?: DataCollectionStateMap;
}

type UpdateFn = (component: Component | undefined, key: string, value: any) => void;

export class ComponentResolverWatcher {
  private em: EditorModel;
  private collectionsStateMap?: DataCollectionStateMap;
  private resolverListeners: Record<string, DataResolverListener> = {};

  constructor(
    private component: Component | undefined,
    private updateFn: UpdateFn,
    options: ComponentResolverWatcherOptions,
  ) {
    this.em = options.em;
    this.collectionsStateMap = options.collectionsStateMap;
  }

  bindComponent(component: Component) {
    this.component = component;
  }

  updateCollectionStateMap(collectionsStateMap: DataCollectionStateMap) {
    this.collectionsStateMap = collectionsStateMap;

    const collectionVariablesKeys = this.getDynamicValuesOfType(DataCollectionVariableType);
    const collectionVariablesObject = collectionVariablesKeys.reduce(
      (acc: { [key: string]: DataResolverProps | null }, key) => {
        acc[key] = null;
        return acc;
      },
      {},
    );
    const newVariables = this.getSerializableValues(collectionVariablesObject);
    const evaluatedValues = this.addDynamicValues(newVariables);

    Object.keys(evaluatedValues).forEach((key) => {
      this.updateFn(this.component, key, evaluatedValues[key]);
    });
  }

  setDynamicValues(values: ObjectAny | undefined, options: DynamicWatchersOptions = {}) {
    const shouldSkipWatcherUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!shouldSkipWatcherUpdates) {
      this.removeListeners();
    }

    return this.addDynamicValues(values, options);
  }

  addDynamicValues(values: ObjectAny | undefined, options: DynamicWatchersOptions = {}) {
    if (!values) return {};
    const evaluatedValues = this.evaluateValues(values);

    const shouldSkipWatcherUpdates = options.skipWatcherUpdates || options.fromDataSource;
    if (!shouldSkipWatcherUpdates) {
      this.updateListeners(values);
    }

    return evaluatedValues;
  }

  private updateListeners(values: { [key: string]: any }) {
    const { em, collectionsStateMap } = this;
    this.removeListeners(Object.keys(values));
    const propsKeys = Object.keys(values);

    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      const resolverProps = values[key];

      if (!isDataResolverProps(resolverProps)) {
        continue;
      }

      const { resolver } = getDataResolverInstanceValue(resolverProps, { em, collectionsStateMap });
      this.resolverListeners[key] = new DataResolverListener({
        em,
        resolver,
        onUpdate: (value) => this.updateFn.bind(this)(this.component, key, value),
      });
    }
  }

  private evaluateValues(values: ObjectAny) {
    const { em, collectionsStateMap } = this;
    const evaluatedValues = { ...values };
    const propsKeys = Object.keys(values);

    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      const resolverProps = values[key];

      if (!isDataResolverProps(resolverProps)) {
        continue;
      }

      const { value } = getDataResolverInstanceValue(resolverProps, { em, collectionsStateMap });
      evaluatedValues[key] = value;
    }

    return evaluatedValues;
  }

  /**
   * removes listeners to stop watching for changes,
   * if keys argument is omitted, remove all listeners
   * @argument keys
   */
  removeListeners(keys?: string[]) {
    const propsKeys = keys ? keys : Object.keys(this.resolverListeners);

    propsKeys.forEach((key) => {
      if (this.resolverListeners[key]) {
        this.resolverListeners[key].destroy?.();
        delete this.resolverListeners[key];
      }
    });

    return propsKeys;
  }

  getSerializableValues(values: ObjectAny | undefined) {
    if (!values) return {};
    const serializableValues = { ...values };
    const propsKeys = Object.keys(serializableValues);

    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      const resolverListener = this.resolverListeners[key];
      if (resolverListener) {
        serializableValues[key] = resolverListener.resolver.toJSON();
      }
    }

    return serializableValues;
  }

  getAllSerializableValues() {
    const serializableValues: ObjectAny = {};
    const propsKeys = Object.keys(this.resolverListeners);

    for (let index = 0; index < propsKeys.length; index++) {
      const key = propsKeys[index];
      serializableValues[key] = this.resolverListeners[key].resolver.toJSON();
    }

    return serializableValues;
  }

  getDynamicValuesOfType(type: DataResolverProps['type']) {
    const keys = Object.keys(this.resolverListeners).filter((key: string) => {
      // @ts-ignore
      return this.resolverListeners[key].resolver.get('type') === type;
    });

    return keys;
  }

  destroy() {
    this.removeListeners();
  }
}
