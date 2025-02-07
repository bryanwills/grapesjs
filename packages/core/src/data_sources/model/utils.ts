import EditorModel from '../../editor/model/Editor';
import { DataResolver, DataResolverProps } from '../types';
import { DataCollectionStateMap } from './data_collection/types';
import DataCollectionVariable from './data_collection/DataCollectionVariable';
import { DataCollectionVariableType } from './data_collection/constants';
import { DataConditionType, DataCondition } from './conditional_variables/DataCondition';
import DataVariable, { DataVariableProps, DataVariableType } from './DataVariable';

export function isDataResolverProps(value: any): value is DataResolverProps {
  return (
    typeof value === 'object' && [DataVariableType, DataConditionType, DataCollectionVariableType].includes(value?.type)
  );
}

export function isDataResolver(value: any): value is DataResolver {
  return value instanceof DataVariable || value instanceof DataCondition;
}

export function isDataVariable(variable: any): variable is DataVariableProps {
  return variable?.type === DataVariableType;
}

export function isDataCondition(variable: any) {
  return variable?.type === DataConditionType;
}

export function evaluateVariable(variable: any, em: EditorModel) {
  return isDataVariable(variable) ? new DataVariable(variable, { em }).getDataValue() : variable;
}

export function getDataResolverInstance(
  resolverProps: DataResolverProps,
  options: { em: EditorModel; collectionsStateMap?: DataCollectionStateMap },
): DataResolver {
  const { type } = resolverProps;
  let resolver: DataResolver;

  switch (type) {
    case DataVariableType:
      resolver = new DataVariable(resolverProps, options);
      break;
    case DataConditionType: {
      const { condition, ifTrue, ifFalse } = resolverProps;
      resolver = new DataCondition(condition, ifTrue, ifFalse, options);
      break;
    }
    case DataCollectionVariableType: {
      resolver = new DataCollectionVariable(resolverProps, options);
      break;
    }
    default:
      throw new Error(`Unsupported dynamic type: ${type}`);
  }

  return resolver;
}

export function getDataResolverInstanceValue(
  resolverProps: DataResolverProps,
  options: {
    em: EditorModel;
    collectionsStateMap?: DataCollectionStateMap;
  },
) {
  const resolver = getDataResolverInstance(resolverProps, options);

  return { resolver, value: resolver.getDataValue() };
}
