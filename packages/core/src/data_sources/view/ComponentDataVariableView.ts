import ComponentView from '../../dom_components/view/ComponentView';
import ComponentDataVariable from '../model/ComponentDataVariable';
import DataResolverListener from '../model/DataResolverListener';

export default class ComponentDataVariableView extends ComponentView<ComponentDataVariable> {
  dataResolverListener!: DataResolverListener;

  initialize(opt = {}) {
    super.initialize(opt);
    this.dataResolverListener = new DataResolverListener({
      em: this.em,
      resolver: this.model.dataResolver,
      onUpdate: () => this.postRender(),
    });
  }

  remove() {
    this.dataResolverListener.destroy();
    return super.remove();
  }

  postRender() {
    this.el.innerHTML = this.model.getDataValue();
    super.postRender();
  }
}
