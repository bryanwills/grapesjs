import Component from '../../../dom_components/model/Component';
import { ComponentOptions } from '../../../dom_components/model/types';
import { toLowerCase } from '../../../utils/mixins';
import DataCollectionVariable from './DataCollectionVariable';
import { DataCollectionVariableType, keyCollectionsStateMap } from './constants';
import { ComponentDataCollectionVariableProps, DataCollectionStateMap } from './types';

export default class ComponentDataCollectionVariable extends Component {
  dataResolver: DataCollectionVariable;

  get defaults() {
    // @ts-expect-error
    const componentDefaults = super.defaults;

    return {
      ...componentDefaults,
      type: DataCollectionVariableType,
      collectionId: undefined,
      variableType: undefined,
      path: undefined,
    };
  }

  constructor(props: ComponentDataCollectionVariableProps, opt: ComponentOptions) {
    super(props, opt);
    const { type, variableType, path, collectionId } = props;
    this.dataResolver = new DataCollectionVariable(
      { type, variableType, path, collectionId },
      {
        ...opt,
        collectionsStateMap: this.get(keyCollectionsStateMap),
      },
    );

    this.listenTo(this, `change:${keyCollectionsStateMap}`, this.handleCollectionsMapStateUpdate);
  }

  private handleCollectionsMapStateUpdate(m: any, v: DataCollectionStateMap, opts = {}) {
    this.dataResolver.updateCollectionsStateMap(v);
  }

  getDataValue() {
    return this.dataResolver.getDataValue();
  }

  getInnerHTML() {
    return this.getDataValue();
  }

  static isComponent(el: HTMLElement) {
    return toLowerCase(el.tagName) === DataCollectionVariableType;
  }
}
