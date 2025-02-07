import { Model } from '../../common';
import EditorModel from '../../editor/model/Editor';

export const DataVariableType = 'data-variable' as const;

export interface DataVariableProps {
  type: typeof DataVariableType;
  path: string;
  defaultValue?: string;
}

export default class DataVariable extends Model<DataVariableProps> {
  em?: EditorModel;

  defaults() {
    return {
      type: DataVariableType,
      defaultValue: '',
      path: '',
    };
  }

  constructor(props: DataVariableProps, options: { em?: EditorModel }) {
    super(props, options);
    this.em = options.em;
  }

  getDataValue() {
    const { path, defaultValue } = this.attributes;
    return this.em?.DataSources.getValue(path!, defaultValue);
  }
}
