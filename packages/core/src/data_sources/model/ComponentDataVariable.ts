import Component from '../../dom_components/model/Component';
import { ComponentOptions } from '../../dom_components/model/types';
import { toLowerCase } from '../../utils/mixins';
import DataVariable, { DataVariableProps, DataVariableType } from './DataVariable';

export default class ComponentDataVariable extends Component {
  dataResolver: DataVariable;

  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      type: DataVariableType,
      path: '',
      defaultValue: '',
    };
  }

  constructor(props: DataVariableProps, opt: ComponentOptions) {
    super(props, opt);
    const { type, path, defaultValue } = props;
    this.dataResolver = new DataVariable({ type, path, defaultValue }, opt);
  }

  getDataValue() {
    return this.dataResolver.getDataValue();
  }

  getInnerHTML() {
    return this.getDataValue();
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === DataVariableType;
  }
}
