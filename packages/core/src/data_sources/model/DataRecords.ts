import { Collection } from '../../common';
import { DataRecordProps } from '../types';
import DataRecord from './DataRecord';
import DataSource from './DataSource';

export default class DataRecords<T extends DataRecordProps = DataRecordProps> extends Collection<DataRecord<T>> {
  dataSource: DataSource;

  constructor(models: DataRecord[] | DataRecordProps[], options: { dataSource: DataSource }) {
    super(models, options);
    this.dataSource = options.dataSource;
  }
}

DataRecords.prototype.model = DataRecord;
