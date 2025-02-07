import Editor from '../../../src/editor';
import DataSourceManager from '../../../src/data_sources';
import ComponentWrapper from '../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../src/data_sources/model/DataVariable';
import EditorModel from '../../../src/editor/model/Editor';
import { ProjectData } from '../../../src/storage_manager';
import { filterObjectForSnapshot, setupTestEditor } from '../../common';
describe('DataSource Serialization', () => {
  let editor: Editor;
  let em: EditorModel;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;
  const componentDataSource = {
    id: 'component-serialization',
    records: [
      { id: 'id1', content: 'Hello World' },
      { id: 'id2', color: 'red' },
    ],
    skipFromStorage: true,
  };
  const styleDataSource = {
    id: 'colors-data',
    records: [{ id: 'id1', color: 'red' }],
    skipFromStorage: true,
  };
  const traitDataSource = {
    id: 'test-input',
    records: [{ id: 'id1', value: 'test-value' }],
    skipFromStorage: true,
  };
  const propsDataSource = {
    id: 'test-input',
    records: [{ id: 'id1', value: 'test-value' }],
    skipFromStorage: true,
  };

  beforeEach(() => {
    ({ editor, em, dsm, cmpRoot } = setupTestEditor());

    dsm.add(componentDataSource);
    dsm.add(styleDataSource);
    dsm.add(traitDataSource);
  });

  afterEach(() => {
    em.destroy();
  });

  test('component .getHtml', () => {
    const cmp = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      components: [
        {
          type: DataVariableType,
          defaultValue: 'default',
          path: `${componentDataSource.id}.id1.content`,
        },
      ],
    })[0];

    const el = cmp.getEl();
    expect(el?.innerHTML).toContain('Hello World');

    const html = em.getHtml();
    expect(html).toMatchInlineSnapshot('"<body><h1><div>Hello World</div></h1></body>"');
  });

  describe('.getProjectData', () => {
    test('Dynamic Props', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${propsDataSource.id}.id1.value`,
      };

      cmpRoot.append({
        tagName: 'input',
        content: dataVariable,
        customProp: dataVariable,
      })[0];

      const projectData = editor.getProjectData();
      const page = projectData.pages[0];
      const frame = page.frames[0];
      const component = frame.component.components[0];
      expect(component['content']).toEqual(dataVariable);
      expect(component['customProp']).toEqual(dataVariable);

      const snapshot = filterObjectForSnapshot(projectData);
      expect(snapshot).toMatchSnapshot(``);
    });

    test('Dynamic Attributes', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${propsDataSource.id}.id1.value`,
      };

      cmpRoot.append({
        tagName: 'input',
        attributes: {
          dynamicAttribute: dataVariable,
        },
      })[0];

      const projectData = editor.getProjectData();
      const page = projectData.pages[0];
      const frame = page.frames[0];
      const component = frame.component.components[0];
      expect(component['attributes']['dynamicAttribute']).toEqual(dataVariable);

      const snapshot = filterObjectForSnapshot(projectData);
      expect(snapshot).toMatchSnapshot(``);
    });

    test('ComponentDataVariable', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${componentDataSource.id}.id1.content`,
      };

      cmpRoot.append({
        tagName: 'h1',
        type: 'text',
        components: [dataVariable],
      })[0];

      const projectData = editor.getProjectData();
      const page = projectData.pages[0];
      const frame = page.frames[0];
      const component = frame.component.components[0];
      expect(component.components[0]).toEqual(dataVariable);

      const snapshot = filterObjectForSnapshot(projectData);
      expect(snapshot).toMatchSnapshot(``);
    });

    test('StyleDataVariable', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'black',
        path: 'colors-data.id1.color',
      };

      cmpRoot.append({
        tagName: 'h1',
        type: 'text',
        content: 'Hello World',
        style: {
          color: dataVariable,
        },
      })[0];

      const projectData = editor.getProjectData();
      const page = projectData.pages[0];
      const frame = page.frames[0];
      const component = frame.component.components[0];
      const componentId = component.attributes.id;
      expect(componentId).toBeDefined();

      const styleSelector = projectData.styles.find((style: any) => style.selectors[0] === `#${componentId}`);
      expect(styleSelector.style).toEqual({
        color: dataVariable,
      });

      const snapshot = filterObjectForSnapshot(projectData);
      expect(snapshot).toMatchSnapshot(``);
    });
  });

  describe('.loadProjectData', () => {
    test('Dynamic Props', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${propsDataSource.id}.id1.value`,
      };

      const componentProjectData: ProjectData = {
        assets: [],
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      content: dataVariable,
                      customProp: dataVariable,
                      tagName: 'input',
                      void: true,
                    },
                  ],
                  docEl: {
                    tagName: 'html',
                  },
                  head: {
                    type: 'head',
                  },
                  stylable: [
                    'background',
                    'background-color',
                    'background-image',
                    'background-repeat',
                    'background-attachment',
                    'background-position',
                    'background-size',
                  ],
                  type: 'wrapper',
                },
                id: 'frameid',
              },
            ],
            id: 'pageid',
            type: 'main',
          },
        ],
        styles: [],
        symbols: [],
        dataSources: [propsDataSource],
      };

      editor.loadProjectData(componentProjectData);

      const components = editor.getComponents();
      const component = components.models[0];
      expect(component.get('content')).toEqual('test-value');
      expect(component.get('customProp')).toEqual('test-value');

      dsm.get(propsDataSource.id).getRecord('id1')?.set('value', 'updated-value');
      expect(component.get('content')).toEqual('updated-value');
      expect(component.get('customProp')).toEqual('updated-value');
    });

    test('Dynamic Attributes', () => {
      const dataVariable = {
        type: DataVariableType,
        defaultValue: 'default',
        path: `${propsDataSource.id}.id1.value`,
      };

      const componentProjectData: ProjectData = {
        assets: [],
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      attributes: {
                        dynamicAttribute: dataVariable,
                      },
                      tagName: 'input',
                      void: true,
                    },
                  ],
                  docEl: {
                    tagName: 'html',
                  },
                  head: {
                    type: 'head',
                  },
                  stylable: [
                    'background',
                    'background-color',
                    'background-image',
                    'background-repeat',
                    'background-attachment',
                    'background-position',
                    'background-size',
                  ],
                  type: 'wrapper',
                },
                id: 'frameid',
              },
            ],
            id: 'pageid',
            type: 'main',
          },
        ],
        styles: [],
        symbols: [],
        dataSources: [propsDataSource],
      };

      editor.loadProjectData(componentProjectData);

      const components = editor.getComponents();
      const component = components.at(0);
      expect(component.getAttributes()['dynamicAttribute']).toEqual('test-value');

      dsm.get(propsDataSource.id).getRecord('id1')?.set('value', 'updated-value');
      expect(component.getAttributes()['dynamicAttribute']).toEqual('updated-value');
    });

    test('ComponentDataVariable', () => {
      const componentProjectData: ProjectData = {
        assets: [],
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      components: [
                        {
                          path: 'component-serialization.id1.content',
                          type: 'data-variable',
                          value: 'default',
                        },
                      ],
                      tagName: 'h1',
                      type: 'text',
                    },
                  ],
                  docEl: {
                    tagName: 'html',
                  },
                  head: {
                    type: 'head',
                  },
                  stylable: [
                    'background',
                    'background-color',
                    'background-image',
                    'background-repeat',
                    'background-attachment',
                    'background-position',
                    'background-size',
                  ],
                  type: 'wrapper',
                },
                id: 'data-variable-id',
              },
            ],
            id: 'data-variable-id',
            type: 'main',
          },
        ],
        styles: [],
        symbols: [],
        dataSources: [componentDataSource],
      };

      editor.loadProjectData(componentProjectData);
      const components = editor.getComponents();

      const component = components.models[0];
      const html = component.toHTML();
      expect(html).toContain('Hello World');
    });

    test('StyleDataVariable', () => {
      const componentProjectData: ProjectData = {
        assets: [],
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      attributes: {
                        id: 'selectorid',
                      },
                      content: 'Hello World',
                      tagName: 'h1',
                      type: 'text',
                    },
                  ],
                  docEl: {
                    tagName: 'html',
                  },
                  head: {
                    type: 'head',
                  },
                  stylable: [
                    'background',
                    'background-color',
                    'background-image',
                    'background-repeat',
                    'background-attachment',
                    'background-position',
                    'background-size',
                  ],
                  type: 'wrapper',
                },
                id: 'componentid',
              },
            ],
            id: 'frameid',
            type: 'main',
          },
        ],
        styles: [
          {
            selectors: ['#selectorid'],
            style: {
              color: {
                path: 'colors-data.id1.color',
                type: 'data-variable',
                defaultValue: 'black',
              },
            },
          },
        ],
        symbols: [],
        dataSources: [styleDataSource],
      };

      editor.loadProjectData(componentProjectData);

      const components = editor.getComponents();
      const component = components.models[0];
      const style = component.getStyle();

      expect(style).toEqual({
        color: 'red',
      });
    });
  });
});
