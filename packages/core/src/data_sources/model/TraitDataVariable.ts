import DataVariable, { DataVariableProps } from './DataVariable';
import Trait from '../../trait_manager/model/Trait';
import { TraitProperties } from '../../trait_manager/types';

export interface TraitDataVariableProps extends Omit<TraitProperties, 'type'>, DataVariableProps {}

export default class TraitDataVariable extends DataVariable {
  trait?: Trait;

  constructor(props: TraitDataVariableProps, options: any) {
    super(props, options);
    this.trait = options.trait;
  }

  onDataSourceChange() {
    const newValue = this.getDataValue();
    this.trait?.setTargetValue(newValue);
  }
}
