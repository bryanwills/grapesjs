import { DataCollectionType, DataCollectionVariableType, keyCollectionDefinition } from './constants';
import { ComponentDefinition, ComponentProperties } from '../../../dom_components/model/types';
import { DataVariableProps } from '../DataVariable';

export type DataCollectionDataSource = DataVariableProps | DataCollectionVariableProps;

export interface DataCollectionConfig {
  collectionId: string;
  startIndex?: number;
  endIndex?: number;
  dataSource: DataCollectionDataSource;
}

export enum DataCollectionStateVariableType {
  currentIndex = 'currentIndex',
  startIndex = 'startIndex',
  currentItem = 'currentItem',
  endIndex = 'endIndex',
  collectionId = 'collectionId',
  totalItems = 'totalItems',
  remainingItems = 'remainingItems',
}

export interface DataCollectionState {
  [DataCollectionStateVariableType.currentIndex]: number;
  [DataCollectionStateVariableType.startIndex]: number;
  [DataCollectionStateVariableType.currentItem]: DataVariableProps;
  [DataCollectionStateVariableType.endIndex]: number;
  [DataCollectionStateVariableType.collectionId]: string;
  [DataCollectionStateVariableType.totalItems]: number;
  [DataCollectionStateVariableType.remainingItems]: number;
}

export interface DataCollectionStateMap {
  [key: string]: DataCollectionState;
}

export interface ComponentDataCollectionProps extends ComponentDefinition {
  [keyCollectionDefinition]: DataCollectionProps;
}

export interface ComponentDataCollectionVariableProps
  extends DataCollectionVariableProps,
    Omit<ComponentProperties, 'type'> {}

export interface DataCollectionProps {
  type: typeof DataCollectionType;
  collectionConfig: DataCollectionConfig;
  componentDef: ComponentDefinition;
}

export interface DataCollectionVariableProps {
  type: typeof DataCollectionVariableType;
  variableType: DataCollectionStateVariableType;
  collectionId: string;
  path?: string;
}
