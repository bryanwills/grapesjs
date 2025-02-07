import { isArray } from 'underscore';
import { ObjectAny } from '../../../common';
import Component from '../../../dom_components/model/Component';
import { ComponentDefinition, ComponentOptions } from '../../../dom_components/model/types';
import EditorModel from '../../../editor/model/Editor';
import { isObject, serialize, toLowerCase } from '../../../utils/mixins';
import DataResolverListener from '../DataResolverListener';
import DataSource from '../DataSource';
import DataVariable, { DataVariableProps, DataVariableType } from '../DataVariable';
import { isDataVariable } from '../utils';
import { DataCollectionType, keyCollectionDefinition, keyCollectionsStateMap, keyIsCollectionItem } from './constants';
import {
  ComponentDataCollectionProps,
  DataCollectionConfig,
  DataCollectionDataSource,
  DataCollectionProps,
  DataCollectionState,
  DataCollectionStateMap,
} from './types';
import { updateFromWatcher } from '../../../dom_components/model/ComponentDataResolverWatchers';

export default class ComponentDataCollection extends Component {
  constructor(props: ComponentDataCollectionProps, opt: ComponentOptions) {
    const collectionDef = props[keyCollectionDefinition];
    // If we are cloning, leave setting the collection items to the main symbol collection
    if (opt.forCloning) {
      return super(props as any, opt) as unknown as ComponentDataCollection;
    }

    const em = opt.em;
    const newProps = { ...props, components: undefined, droppable: false } as any;
    const cmp: ComponentDataCollection = super(newProps, opt) as unknown as ComponentDataCollection;

    if (!collectionDef) {
      em.logError('missing collection definition');
      return cmp;
    }

    const parentCollectionStateMap = (props[keyCollectionsStateMap] || {}) as DataCollectionStateMap;
    const components: Component[] = getCollectionItems(em, collectionDef, parentCollectionStateMap, opt);
    cmp.components(components, opt);

    if (isDataVariable(this.collectionDataSource)) {
      this.watchDataSource(parentCollectionStateMap, opt);
    }

    return cmp;
  }

  get collectionConfig() {
    return this.get(keyCollectionDefinition).collectionConfig as DataCollectionConfig;
  }

  get collectionDataSource() {
    return this.collectionConfig.dataSource;
  }

  toJSON(opts?: ObjectAny) {
    const json = super.toJSON.call(this, opts) as ComponentDataCollectionProps;
    json[keyCollectionDefinition].componentDef = this.getComponentDef();
    delete json.components;
    delete json.droppable;
    return json;
  }

  private getComponentDef() {
    const firstChild = this.components().at(0);
    const firstChildJSON = firstChild ? serialize(firstChild) : this.get(keyCollectionDefinition).componentDef;
    delete firstChildJSON?.draggable;
    return firstChildJSON;
  }

  private watchDataSource(parentCollectionStateMap: DataCollectionStateMap, opt: ComponentOptions) {
    const { em } = this;
    const path = this.collectionDataSource?.path;
    if (!path) return;

    new DataResolverListener({
      em,
      resolver: new DataVariable({ type: DataVariableType, path }, { em }),
      onUpdate: () => {
        const collectionDef = { ...this.get(keyCollectionDefinition), componentDef: this.getComponentDef() };
        const collectionItems = getCollectionItems(em, collectionDef, parentCollectionStateMap, opt);
        this.components().reset(collectionItems, updateFromWatcher as any);
      },
    });
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === DataCollectionType;
  }
}

function getCollectionItems(
  em: EditorModel,
  collectionDef: DataCollectionProps,
  parentCollectionStateMap: DataCollectionStateMap,
  opt: ComponentOptions,
) {
  const { componentDef, collectionConfig } = collectionDef;
  const result = validateCollectionConfig(collectionConfig, componentDef, em);
  if (!result) {
    return [];
  }

  const components: Component[] = [];
  const collectionId = collectionConfig.collectionId;
  const items = getDataSourceItems(collectionConfig.dataSource, em);
  const startIndex = Math.max(0, collectionConfig.startIndex || 0);
  const endIndex = Math.min(
    items.length - 1,
    collectionConfig.endIndex !== undefined ? collectionConfig.endIndex : Number.MAX_VALUE,
  );
  const totalItems = endIndex - startIndex + 1;
  let symbolMain: Component;

  for (let index = startIndex; index <= endIndex; index++) {
    const item = items[index];
    const collectionState: DataCollectionState = {
      collectionId,
      currentIndex: index,
      currentItem: item,
      startIndex: startIndex,
      endIndex: endIndex,
      totalItems: totalItems,
      remainingItems: totalItems - (index + 1),
    };

    if (parentCollectionStateMap[collectionId]) {
      em.logError(
        `The collection ID "${collectionId}" already exists in the parent collection state. Overriding it is not allowed.`,
      );
      return [];
    }

    const collectionsStateMap: DataCollectionStateMap = {
      ...parentCollectionStateMap,
      [collectionId]: collectionState,
    };

    if (index === startIndex) {
      const componentType = (componentDef?.type as string) || 'default';
      let type = em.Components.getType(componentType) || em.Components.getType('default');
      const Model = type.model;
      symbolMain = new Model({ ...serialize(componentDef), draggable: false }, opt);
      setCollectionStateMapAndPropagate(collectionsStateMap, collectionId)(symbolMain);
    }

    const instance = symbolMain!.clone({ symbol: true });
    setCollectionStateMapAndPropagate(collectionsStateMap, collectionId)(instance);

    components.push(instance);
  }

  return components;
}

function setCollectionStateMapAndPropagate(
  collectionsStateMap: DataCollectionStateMap,
  collectionId: string | undefined,
) {
  return (cmp: Component) => {
    setCollectionStateMap(collectionsStateMap)(cmp);

    const addListener = (component: Component) => {
      setCollectionStateMapAndPropagate(collectionsStateMap, collectionId)(component);
    };

    const listenerKey = `_hasAddListener${collectionId ? `_${collectionId}` : ''}`;
    const cmps = cmp.components();

    // Add the 'add' listener if not already in the listeners array
    if (!cmp.collectionStateListeners.includes(listenerKey)) {
      cmp.listenTo(cmps, 'add', addListener);
      cmp.collectionStateListeners.push(listenerKey);

      const removeListener = (component: Component) => {
        component.stopListening(component.components(), 'add', addListener);
        component.off(`change:${keyCollectionsStateMap}`, handleCollectionStateMapChange);
        const index = component.collectionStateListeners.indexOf(listenerKey);
        if (index > -1) {
          component.collectionStateListeners.splice(index, 1);
        }
      };

      cmp.listenTo(cmps, 'remove', removeListener);
    }

    cmps?.toArray().forEach((component: Component) => {
      setCollectionStateMapAndPropagate(collectionsStateMap, collectionId)(component);
    });

    cmp.on(`change:${keyCollectionsStateMap}`, handleCollectionStateMapChange);
  };
}

function handleCollectionStateMapChange(this: Component) {
  const updatedCollectionsStateMap = this.get(keyCollectionsStateMap);
  this.components()
    ?.toArray()
    .forEach((component: Component) => {
      setCollectionStateMap(updatedCollectionsStateMap)(component);
    });
}

function logErrorIfMissing(property: any, propertyPath: string, em: EditorModel) {
  if (!property) {
    em.logError(`The "${propertyPath}" property is required in the collection definition.`);
    return false;
  }
  return true;
}

function validateCollectionConfig(
  collectionConfig: DataCollectionConfig,
  componentDef: ComponentDefinition,
  em: EditorModel,
) {
  const validations = [
    { property: collectionConfig, propertyPath: 'collectionConfig' },
    { property: componentDef, propertyPath: 'componentDef' },
    { property: collectionConfig?.collectionId, propertyPath: 'collectionConfig.collectionId' },
    { property: collectionConfig?.dataSource, propertyPath: 'collectionConfig.dataSource' },
  ];

  for (const { property, propertyPath } of validations) {
    if (!logErrorIfMissing(property, propertyPath, em)) {
      return [];
    }
  }

  return true;
}

function setCollectionStateMap(collectionsStateMap: DataCollectionStateMap) {
  return (cmp: Component) => {
    cmp.set(keyIsCollectionItem, true);
    const updatedCollectionStateMap = {
      ...cmp.get(keyCollectionsStateMap),
      ...collectionsStateMap,
    };
    cmp.set(keyCollectionsStateMap, updatedCollectionStateMap);
    cmp.dataResolverWatchers.updateCollectionStateMap(updatedCollectionStateMap);
  };
}

function getDataSourceItems(dataSource: DataCollectionDataSource, em: EditorModel) {
  let items: DataVariableProps[] = [];

  switch (true) {
    case isArray(dataSource):
      items = dataSource;
      break;
    case isObject(dataSource) && dataSource instanceof DataSource: {
      const id = dataSource.get('id')!;
      items = listDataSourceVariables(id, em);
      break;
    }
    case isDataVariable(dataSource): {
      const isDataSourceId = dataSource.path.split('.').length === 1;
      if (isDataSourceId) {
        const id = dataSource.path;
        items = listDataSourceVariables(id, em);
      } else {
        // Path points to a record in the data source
        items = em.DataSources.getValue(dataSource.path, []);
      }
      break;
    }
    default:
  }

  return items;
}

function listDataSourceVariables(dataSource_id: string, em: EditorModel): DataVariableProps[] {
  const records = em.DataSources.getValue(dataSource_id, []);
  const keys = Object.keys(records);

  return keys.map((key) => ({
    type: DataVariableType,
    path: dataSource_id + '.' + key,
  }));
}
