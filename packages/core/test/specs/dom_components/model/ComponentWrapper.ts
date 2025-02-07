import Component from '../../../../src/dom_components/model/Component';
import ComponentHead from '../../../../src/dom_components/model/ComponentHead';
import Editor from '../../../../src/editor';

describe('ComponentWrapper', () => {
  let em: Editor;

  beforeEach(() => {
    em = new Editor({ avoidDefaults: true });
    em.Pages.onLoad();
  });

  describe('.clone', () => {
    test('clones the component and returns a new instance for head and document element', () => {
      const originalComponent = em.Pages.getSelected()?.getMainComponent();
      const clonedComponent = originalComponent?.clone();
      em.Pages.add(
        {
          id: 'PAGE_ID',
          clonedComponent,
        },
        {
          select: true,
        },
      );
      const newPageComponent = em.Pages.get('PAGE_ID')?.getMainComponent();

      expect(clonedComponent?.head).toBeInstanceOf(ComponentHead);
      expect(clonedComponent?.head.cid).not.toEqual(originalComponent?.head.cid);

      expect(clonedComponent?.docEl).toBeInstanceOf(Component);
      expect(clonedComponent?.docEl.cid).not.toEqual(originalComponent?.docEl.cid);
      expect(newPageComponent?.head.cid).not.toEqual(originalComponent?.head.cid);
    });
  });
});
