import ComponentView from '../../dom_components/view/ComponentView';
import DataResolverListener from '../model/DataResolverListener';
import ComponentDataCollectionVariable from '../model/data_collection/ComponentDataCollectionVariable';

export default class ComponentDataCollectionVariableView extends ComponentView<ComponentDataCollectionVariable> {
  dataResolverListener?: DataResolverListener;

  initialize(opt = {}) {
    super.initialize(opt);
    this.dataResolverListener = new DataResolverListener({
      em: this.em!,
      resolver: this.model.dataResolver,
      onUpdate: this.postRender.bind(this),
    });
  }

  postRender() {
    this.el.innerHTML = this.model.getDataValue();
    super.postRender();
  }
}
