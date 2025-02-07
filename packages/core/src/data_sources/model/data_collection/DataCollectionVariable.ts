import { DataCollectionVariableProps } from './types';
import { Model } from '../../../common';
import EditorModel from '../../../editor/model/Editor';
import DataVariable, { DataVariableType } from '../DataVariable';
import { DataCollectionVariableType } from './constants';
import { DataCollectionState, DataCollectionStateMap } from './types';
import DataResolverListener from '../DataResolverListener';

interface DataCollectionVariablePropsDefined extends DataCollectionVariableProps {
  value?: any;
}

export default class DataCollectionVariable extends Model<DataCollectionVariablePropsDefined> {
  em: EditorModel;
  collectionsStateMap?: DataCollectionStateMap;
  dataVariable?: DataVariable;
  resolverListener?: DataResolverListener;

  defaults(): Partial<DataCollectionVariablePropsDefined> {
    return {
      type: DataCollectionVariableType,
      collectionId: undefined,
      variableType: undefined,
      path: undefined,
      value: undefined,
    };
  }

  constructor(
    props: DataCollectionVariablePropsDefined,
    options: {
      em: EditorModel;
      collectionsStateMap?: DataCollectionStateMap;
    },
  ) {
    super(props, options);
    this.em = options.em;
    this.collectionsStateMap = options.collectionsStateMap;
    this.updateDataVariable();
  }

  hasDynamicValue() {
    return !!this.dataVariable;
  }

  getDataValue() {
    const { resolvedValue } = this.updateDataVariable();

    if (resolvedValue?.type === DataVariableType) {
      return this.dataVariable!.getDataValue();
    }

    return resolvedValue;
  }

  private updateDataVariable() {
    if (!this.collectionsStateMap) return { resolvedValue: undefined };

    const resolvedValue = resolveCollectionVariable(
      this.attributes as DataCollectionVariableProps,
      this.collectionsStateMap,
      this.em,
    );

    let dataVariable;
    if (resolvedValue?.type === DataVariableType) {
      dataVariable = new DataVariable(resolvedValue, { em: this.em });
      this.dataVariable = dataVariable;

      this.resolverListener?.destroy();
      this.resolverListener = new DataResolverListener({
        em: this.em,
        resolver: dataVariable,
        onUpdate: () => {
          this.set('value', this.dataVariable?.getDataValue());
        },
      });
    }

    this.set('value', resolvedValue);
    return { resolvedValue, dataVariable };
  }

  updateCollectionsStateMap(collectionsStateMap: DataCollectionStateMap) {
    this.collectionsStateMap = collectionsStateMap;
    this.updateDataVariable();
  }

  destroy() {
    this.resolverListener?.destroy();
    this.dataVariable?.destroy();

    return super.destroy();
  }

  toJSON(options?: any) {
    const json = super.toJSON(options);
    delete json.value;
    !json.collectionId && delete json.collectionId;

    return json;
  }
}

function resolveCollectionVariable(
  collectionVariableDefinition: DataCollectionVariableProps,
  collectionsStateMap: DataCollectionStateMap,
  em: EditorModel,
) {
  const { collectionId, variableType, path } = collectionVariableDefinition;
  if (!collectionsStateMap) return;

  const collectionItem = collectionsStateMap[collectionId];

  if (!collectionItem) {
    return '';
  }

  if (!variableType) {
    em.logError(`Missing collection variable type for collection: ${collectionId}`);
    return '';
  }

  if (variableType === 'currentItem') {
    return resolveCurrentItem(collectionItem, path, collectionId, em);
  }

  return collectionItem[variableType];
}

function resolveCurrentItem(
  collectionItem: DataCollectionState,
  path: string | undefined,
  collectionId: string,
  em: EditorModel,
) {
  const currentItem = collectionItem.currentItem;

  if (!currentItem) {
    em.logError(`Current item is missing for collection: ${collectionId}`);
    return '';
  }

  if (currentItem.type === DataVariableType) {
    const resolvedPath = currentItem.path ? `${currentItem.path}.${path}` : path;
    return {
      ...currentItem,
      path: resolvedPath,
    };
  }

  if (path && !(currentItem as any)[path]) {
    em.logError(`Path not found in current item: ${path} for collection: ${collectionId}`);
    return '';
  }

  return path ? (currentItem as any)[path] : currentItem;
}
