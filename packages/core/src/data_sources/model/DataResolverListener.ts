import { DataSourcesEvents, DataSourceListener } from '../types';
import { stringToPath } from '../../utils/mixins';
import { Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import DataVariable, { DataVariableType } from './DataVariable';
import { DataResolver } from '../types';
import { DataCondition, DataConditionType } from './conditional_variables/DataCondition';
import { DataCollectionVariableType } from './data_collection/constants';
import DataCollectionVariable from './data_collection/DataCollectionVariable';

export interface DataResolverListenerProps {
  em: EditorModel;
  resolver: DataResolver;
  onUpdate: (value: any) => void;
}

export default class DataResolverListener {
  private listeners: DataSourceListener[] = [];
  private em: EditorModel;
  private onUpdate: (value: any) => void;
  private model = new Model();
  resolver: DataResolver;

  constructor(props: DataResolverListenerProps) {
    this.em = props.em;
    this.resolver = props.resolver;
    this.onUpdate = props.onUpdate;
    this.listenToResolver();
  }

  private onChange = () => {
    const value = this.resolver.getDataValue();
    this.onUpdate(value);
  };

  listenToResolver() {
    const { resolver, model } = this;
    this.removeListeners();
    let listeners: DataSourceListener[] = [];
    const type = resolver.attributes.type;

    switch (type) {
      case DataCollectionVariableType:
        listeners = this.listenToDataCollectionVariable(resolver as DataCollectionVariable);
        break;
      case DataVariableType:
        listeners = this.listenToDataVariable(resolver as DataVariable);
        break;
      case DataConditionType:
        listeners = this.listenToConditionalVariable(resolver as DataCondition);
        break;
    }

    listeners.forEach((ls) => model.listenTo(ls.obj, ls.event, this.onChange));
    this.listeners = listeners;
  }

  private listenToConditionalVariable(dataVariable: DataCondition) {
    const { em } = this;
    const dataListeners = dataVariable.getDependentDataVariables().flatMap((dataVariable) => {
      return this.listenToDataVariable(new DataVariable(dataVariable, { em }));
    });

    return dataListeners;
  }

  private listenToDataVariable(dataVariable: DataVariable) {
    const { em } = this;
    const dataListeners: DataSourceListener[] = [];
    const { path } = dataVariable.attributes;
    const normPath = stringToPath(path || '').join('.');
    const [ds, dr] = em.DataSources.fromPath(path!);
    ds && dataListeners.push({ obj: ds.records, event: 'add remove reset' });
    dr && dataListeners.push({ obj: dr, event: 'change' });
    dataListeners.push(
      { obj: dataVariable, event: 'change:path change:defaultValue' },
      { obj: em.DataSources.all, event: 'add remove reset' },
      { obj: em, event: `${DataSourcesEvents.path}:${normPath}` },
    );

    return dataListeners;
  }

  private listenToDataCollectionVariable(dataVariable: DataCollectionVariable) {
    return [{ obj: dataVariable, event: 'change:value' }];
  }

  private removeListeners() {
    this.listeners.forEach((ls) => this.model.stopListening(ls.obj, ls.event, this.onChange));
    this.listeners = [];
  }

  destroy() {
    this.removeListeners();
  }
}
