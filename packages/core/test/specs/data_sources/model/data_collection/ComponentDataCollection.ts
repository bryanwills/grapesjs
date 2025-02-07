import { Component, DataRecord, DataSource, DataSourceManager, Editor } from '../../../../../src';
import { DataVariableType } from '../../../../../src/data_sources/model/DataVariable';
import {
  DataCollectionType,
  DataCollectionVariableType,
} from '../../../../../src/data_sources/model/data_collection/constants';
import { DataCollectionStateVariableType } from '../../../../../src/data_sources/model/data_collection/types';
import EditorModel from '../../../../../src/editor/model/Editor';
import { setupTestEditor } from '../../../../common';
import { getSymbolMain } from '../../../../../src/dom_components/model/SymbolUtils';
import { ProjectData } from '../../../../../src/storage_manager';

describe('Collection component', () => {
  let em: EditorModel;
  let editor: Editor;
  let dsm: DataSourceManager;
  let dataSource: DataSource;
  let wrapper: Component;
  let firstRecord: DataRecord;
  let secondRecord: DataRecord;

  beforeEach(() => {
    ({ em, editor, dsm } = setupTestEditor());
    wrapper = em.getWrapper()!;
    dataSource = dsm.add({
      id: 'my_data_source_id',
      records: [
        { id: 'user1', user: 'user1', firstName: 'Name1', age: '12' },
        { id: 'user2', user: 'user2', firstName: 'Name2', age: '14' },
        { id: 'user3', user: 'user3', firstName: 'Name3', age: '16' },
      ],
    });

    firstRecord = dataSource.getRecord('user1')!;
    secondRecord = dataSource.getRecord('user2')!;
  });

  afterEach(() => {
    em.destroy();
  });

  test('Collection component should be undroppable', () => {
    const cmp = wrapper.components({
      type: DataCollectionType,
      collectionDef: {
        componentDef: {
          type: 'default',
        },
        collectionConfig: {
          collectionId: 'my_collection',
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      },
    })[0];

    expect(cmp.get('droppable')).toBe(false);
  });

  test('Collection items should be undraggable', () => {
    const cmp = wrapper.components({
      type: DataCollectionType,
      collectionDef: {
        componentDef: {
          type: 'default',
        },
        collectionConfig: {
          collectionId: 'my_collection',
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      },
    })[0];

    cmp.components().forEach((child) => {
      expect(child.get('draggable')).toBe(false);
    });
  });

  test('Collection items should be symbols', () => {
    const cmp = wrapper.components({
      type: DataCollectionType,
      collectionDef: {
        componentDef: {
          type: 'default',
          components: [
            {
              type: 'default',
            },
          ],
        },
        collectionConfig: {
          collectionId: 'my_collection',
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      },
    })[0];

    expect(cmp.components()).toHaveLength(3);
    cmp.components().forEach((child) => expect(child.get('type')).toBe('default'));
    const children = cmp.components();
    const firstChild = children.at(0);

    children.slice(1).forEach((component) => {
      expect(getSymbolMain(component)).toBe(firstChild);
    });
  });

  describe('Collection variables', () => {
    describe('Properties', () => {
      let cmp: Component;
      let firstChild!: Component;
      let firstGrandchild!: Component;
      let secondChild!: Component;
      let secondGrandchild!: Component;
      let thirdChild!: Component;

      const checkHtmlModelAndView = ({ cmp, innerHTML }: { cmp: Component; innerHTML: string }) => {
        const tagName = cmp.tagName;
        expect(cmp.getInnerHTML()).toBe(innerHTML);
        expect(cmp.toHTML()).toBe(`<${tagName} id="${cmp.getId()}">${innerHTML}</${tagName}>`);
        expect(cmp.getEl()?.innerHTML).toBe(innerHTML);
      };

      const checkRecordsWithInnerCmp = () => {
        dataSource.getRecords().forEach((record, i) => {
          const innerCmp = cmp.components().at(i).components().at(1);
          checkHtmlModelAndView({ cmp: innerCmp, innerHTML: record.get('firstName') });
        });
      };

      beforeEach(() => {
        cmp = wrapper.components({
          type: DataCollectionType,
          collectionDef: {
            componentDef: {
              type: 'default',
              components: [
                {
                  type: 'default',
                  name: {
                    type: DataCollectionVariableType,
                    variableType: DataCollectionStateVariableType.currentItem,
                    collectionId: 'my_collection',
                    path: 'user',
                  },
                },
                {
                  tagName: 'span',
                  type: DataCollectionVariableType,
                  variableType: 'currentItem',
                  collectionId: 'my_collection',
                  path: 'firstName',
                },
              ],
              name: {
                type: DataCollectionVariableType,
                variableType: DataCollectionStateVariableType.currentItem,
                collectionId: 'my_collection',
                path: 'user',
              },
              custom_property: {
                type: DataCollectionVariableType,
                variableType: DataCollectionStateVariableType.currentItem,
                collectionId: 'my_collection',
                path: 'user',
              },
            },
            collectionConfig: {
              collectionId: 'my_collection',
              dataSource: {
                type: DataVariableType,
                path: 'my_data_source_id',
              },
            },
          },
        })[0];

        firstChild = cmp.components().at(0);
        firstGrandchild = firstChild.components().at(0);
        secondChild = cmp.components().at(1);
        secondGrandchild = secondChild.components().at(0);
        thirdChild = cmp.components().at(2);
      });

      test('Evaluating to static value', () => {
        expect(firstChild.get('name')).toBe('user1');
        expect(firstChild.get('custom_property')).toBe('user1');
        expect(firstGrandchild.get('name')).toBe('user1');

        expect(secondChild.get('name')).toBe('user2');
        expect(secondChild.get('custom_property')).toBe('user2');
        expect(secondGrandchild.get('name')).toBe('user2');

        checkRecordsWithInnerCmp();
      });

      test('Watching Records', async () => {
        firstRecord.set('user', 'new_user1_value');
        expect(firstChild.get('name')).toBe('new_user1_value');
        expect(firstChild.get('custom_property')).toBe('new_user1_value');
        expect(firstGrandchild.get('name')).toBe('new_user1_value');

        expect(secondChild.get('name')).toBe('user2');
        expect(secondChild.get('custom_property')).toBe('user2');
        expect(secondGrandchild.get('name')).toBe('user2');

        const firstName = 'Name1-up';
        firstRecord.set({ firstName });
        checkRecordsWithInnerCmp();
      });

      test('Removing a record updates the collection component correctly', () => {
        dataSource.removeRecord('user1');

        expect(cmp.components().length).toBe(2);

        const updatedFirstChild = cmp.components().at(0);
        const updatedSecondChild = cmp.components().at(1);

        expect(updatedFirstChild.get('name')).toBe('user2');
        expect(updatedSecondChild.get('name')).toBe('user3');

        const updatedFirstGrandchild = updatedFirstChild.components().at(0);
        const updatedSecondGrandchild = updatedSecondChild.components().at(0);

        expect(updatedFirstGrandchild.get('name')).toBe('user2');
        expect(updatedSecondGrandchild.get('name')).toBe('user3');

        checkRecordsWithInnerCmp();
      });

      test('Adding a record updates the collection component correctly', () => {
        dataSource.addRecord({ id: 'user4', user: 'user4', firstName: 'Name4', age: '20' });

        expect(cmp.components().length).toBe(4);

        const newChild = cmp.components().at(3);
        expect(newChild.get('name')).toBe('user4');

        const newGrandchild = newChild.components().at(0);
        expect(newGrandchild.get('name')).toBe('user4');

        const firstChild = cmp.components().at(0);
        const secondChild = cmp.components().at(1);
        const thirdChild = cmp.components().at(2);

        expect(firstChild.get('name')).toBe('user1');
        expect(secondChild.get('name')).toBe('user2');
        expect(thirdChild.get('name')).toBe('user3');

        checkRecordsWithInnerCmp();
      });

      test('Updating the value to a static value', async () => {
        firstChild.set('name', 'new_content_value');
        expect(firstChild.get('name')).toBe('new_content_value');
        expect(secondChild.get('name')).toBe('new_content_value');

        firstRecord.set('user', 'wrong_value');
        expect(firstChild.get('name')).toBe('new_content_value');
        expect(secondChild.get('name')).toBe('new_content_value');

        firstGrandchild.set('name', 'new_content_value');
        expect(firstGrandchild.get('name')).toBe('new_content_value');
        expect(secondGrandchild.get('name')).toBe('new_content_value');

        firstRecord.set('user', 'wrong_value');
        expect(firstGrandchild.get('name')).toBe('new_content_value');
        expect(secondGrandchild.get('name')).toBe('new_content_value');
      });

      test('Updating the value to a different collection variable', async () => {
        firstChild.set('name', {
          // @ts-ignore
          type: DataCollectionVariableType,
          variableType: DataCollectionStateVariableType.currentItem,
          collectionId: 'my_collection',
          path: 'age',
        });
        expect(firstChild.get('name')).toBe('12');
        expect(secondChild.get('name')).toBe('14');

        firstRecord.set('age', 'new_value_12');
        secondRecord.set('age', 'new_value_14');

        firstRecord.set('user', 'wrong_value');
        secondRecord.set('user', 'wrong_value');

        expect(firstChild.get('name')).toBe('new_value_12');
        expect(secondChild.get('name')).toBe('new_value_14');

        firstGrandchild.set('name', {
          // @ts-ignore
          type: DataCollectionVariableType,
          variableType: DataCollectionStateVariableType.currentItem,
          collectionId: 'my_collection',
          path: 'age',
        });
        expect(firstGrandchild.get('name')).toBe('new_value_12');
        expect(secondGrandchild.get('name')).toBe('new_value_14');

        firstRecord.set('age', 'most_new_value_12');
        secondRecord.set('age', 'most_new_value_14');

        expect(firstGrandchild.get('name')).toBe('most_new_value_12');
        expect(secondGrandchild.get('name')).toBe('most_new_value_14');
      });

      test('Updating the value to a different dynamic variable', async () => {
        firstChild.set('name', {
          // @ts-ignore
          type: DataVariableType,
          path: 'my_data_source_id.user2.user',
        });
        expect(firstChild.get('name')).toBe('user2');
        expect(secondChild.get('name')).toBe('user2');
        expect(thirdChild.get('name')).toBe('user2');

        secondRecord.set('user', 'new_value');
        expect(firstChild.get('name')).toBe('new_value');
        expect(secondChild.get('name')).toBe('new_value');
        expect(thirdChild.get('name')).toBe('new_value');

        firstGrandchild.set('name', {
          // @ts-ignore
          type: DataVariableType,
          path: 'my_data_source_id.user2.user',
        });
        expect(firstGrandchild.get('name')).toBe('new_value');
        expect(secondGrandchild.get('name')).toBe('new_value');

        secondRecord.set('user', 'most_new_value');

        expect(firstGrandchild.get('name')).toBe('most_new_value');
        expect(secondGrandchild.get('name')).toBe('most_new_value');
      });
    });

    describe('Attributes', () => {
      let cmp: Component;
      let firstChild!: Component;
      let firstGrandchild!: Component;
      let secondChild!: Component;
      let secondGrandchild!: Component;
      let thirdChild!: Component;

      beforeEach(() => {
        cmp = wrapper.components({
          type: DataCollectionType,
          collectionDef: {
            componentDef: {
              type: 'default',
              components: [
                {
                  type: 'default',
                  attributes: {
                    name: {
                      type: DataCollectionVariableType,
                      variableType: DataCollectionStateVariableType.currentItem,
                      collectionId: 'my_collection',
                      path: 'user',
                    },
                  },
                },
              ],
              attributes: {
                name: {
                  type: DataCollectionVariableType,
                  variableType: DataCollectionStateVariableType.currentItem,
                  collectionId: 'my_collection',
                  path: 'user',
                },
              },
            },
            collectionConfig: {
              collectionId: 'my_collection',
              dataSource: {
                type: DataVariableType,
                path: 'my_data_source_id',
              },
            },
          },
        })[0];

        firstChild = cmp.components().at(0);
        firstGrandchild = firstChild.components().at(0);
        secondChild = cmp.components().at(1);
        secondGrandchild = secondChild.components().at(0);
        thirdChild = cmp.components().at(2);
      });

      test('Evaluating to static value', () => {
        expect(firstChild.getAttributes()['name']).toBe('user1');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('user1');
        expect(firstGrandchild.getAttributes()['name']).toBe('user1');
        expect(firstGrandchild.getEl()?.getAttribute('name')).toBe('user1');

        expect(secondChild.getAttributes()['name']).toBe('user2');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('user2');
        expect(secondGrandchild.getAttributes()['name']).toBe('user2');
        expect(secondGrandchild.getEl()?.getAttribute('name')).toBe('user2');
      });

      test('Watching Records', async () => {
        firstRecord.set('user', 'new_user1_value');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('new_user1_value');
        expect(firstChild.getAttributes()['name']).toBe('new_user1_value');
        expect(firstGrandchild.getAttributes()['name']).toBe('new_user1_value');
        expect(firstGrandchild.getEl()?.getAttribute('name')).toBe('new_user1_value');

        expect(secondChild.getAttributes()['name']).toBe('user2');
        expect(secondGrandchild.getAttributes()['name']).toBe('user2');
      });

      test('Updating the value to a static value', async () => {
        firstChild.setAttributes({ name: 'new_content_value' });
        expect(firstChild.getAttributes()['name']).toBe('new_content_value');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('new_content_value');
        expect(secondChild.getAttributes()['name']).toBe('new_content_value');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('new_content_value');

        firstRecord.set('user', 'wrong_value');
        expect(firstChild.getAttributes()['name']).toBe('new_content_value');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('new_content_value');
        expect(secondChild.getAttributes()['name']).toBe('new_content_value');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('new_content_value');

        firstGrandchild.setAttributes({ name: 'new_content_value' });
        expect(firstGrandchild.getAttributes()['name']).toBe('new_content_value');
        expect(secondGrandchild.getAttributes()['name']).toBe('new_content_value');

        firstRecord.set('user', 'wrong_value');
        expect(firstGrandchild.getAttributes()['name']).toBe('new_content_value');
        expect(secondGrandchild.getAttributes()['name']).toBe('new_content_value');
      });

      test('Updating the value to a diffirent collection variable', async () => {
        firstChild.setAttributes({
          name: {
            // @ts-ignore
            type: DataCollectionVariableType,
            variableType: DataCollectionStateVariableType.currentItem,
            collectionId: 'my_collection',
            path: 'age',
          },
        });
        expect(firstChild.getAttributes()['name']).toBe('12');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('12');
        expect(secondChild.getAttributes()['name']).toBe('14');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('14');

        firstRecord.set('age', 'new_value_12');
        secondRecord.set('age', 'new_value_14');

        firstRecord.set('user', 'wrong_value');
        secondRecord.set('user', 'wrong_value');

        expect(firstChild.getAttributes()['name']).toBe('new_value_12');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('new_value_12');
        expect(secondChild.getAttributes()['name']).toBe('new_value_14');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('new_value_14');

        firstGrandchild.setAttributes({
          name: {
            // @ts-ignore
            type: DataCollectionVariableType,
            variableType: DataCollectionStateVariableType.currentItem,
            collectionId: 'my_collection',
            path: 'age',
          },
        });
        expect(firstGrandchild.getAttributes()['name']).toBe('new_value_12');
        expect(firstGrandchild.getEl()?.getAttribute('name')).toBe('new_value_12');
        expect(secondGrandchild.getAttributes()['name']).toBe('new_value_14');
        expect(secondGrandchild.getEl()?.getAttribute('name')).toBe('new_value_14');

        firstRecord.set('age', 'most_new_value_12');
        secondRecord.set('age', 'most_new_value_14');

        expect(firstGrandchild.getAttributes()['name']).toBe('most_new_value_12');
        expect(secondGrandchild.getAttributes()['name']).toBe('most_new_value_14');
      });

      test('Updating the value to a different dynamic variable', async () => {
        firstChild.setAttributes({
          name: {
            // @ts-ignore
            type: DataVariableType,
            path: 'my_data_source_id.user2.user',
          },
        });
        expect(firstChild.getAttributes()['name']).toBe('user2');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('user2');
        expect(secondChild.getAttributes()['name']).toBe('user2');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('user2');
        expect(thirdChild.getAttributes()['name']).toBe('user2');

        secondRecord.set('user', 'new_value');
        expect(firstChild.getAttributes()['name']).toBe('new_value');
        expect(firstChild.getEl()?.getAttribute('name')).toBe('new_value');
        expect(secondChild.getAttributes()['name']).toBe('new_value');
        expect(secondChild.getEl()?.getAttribute('name')).toBe('new_value');
        expect(thirdChild.getAttributes()['name']).toBe('new_value');

        firstGrandchild.setAttributes({
          name: {
            // @ts-ignore
            type: DataVariableType,
            path: 'my_data_source_id.user2.user',
          },
        });
        expect(firstGrandchild.getAttributes()['name']).toBe('new_value');
        expect(firstGrandchild.getEl()?.getAttribute('name')).toBe('new_value');
        expect(secondGrandchild.getAttributes()['name']).toBe('new_value');
        expect(secondGrandchild.getEl()?.getAttribute('name')).toBe('new_value');

        secondRecord.set('user', 'most_new_value');

        expect(firstGrandchild.getAttributes()['name']).toBe('most_new_value');
        expect(firstGrandchild.getEl()?.getAttribute('name')).toBe('most_new_value');
        expect(secondGrandchild.getAttributes()['name']).toBe('most_new_value');
        expect(secondGrandchild.getEl()?.getAttribute('name')).toBe('most_new_value');
      });
    });

    test('Traits', () => {
      const cmp = wrapper.components({
        type: DataCollectionType,
        collectionDef: {
          componentDef: {
            type: 'default',
            traits: [
              {
                name: 'attribute_trait',
                value: {
                  type: DataCollectionVariableType,
                  variableType: DataCollectionStateVariableType.currentItem,
                  collectionId: 'my_collection',
                  path: 'user',
                },
              },
              {
                name: 'property_trait',
                changeProp: true,
                value: {
                  type: DataCollectionVariableType,
                  variableType: DataCollectionStateVariableType.currentItem,
                  collectionId: 'my_collection',
                  path: 'user',
                },
              },
            ],
          },
          collectionConfig: {
            collectionId: 'my_collection',
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        },
      })[0];

      expect(cmp.components()).toHaveLength(3);
      const firstChild = cmp.components().at(0);
      const secondChild = cmp.components().at(1);

      expect(firstChild.getAttributes()['attribute_trait']).toBe('user1');
      expect(firstChild.getEl()?.getAttribute('attribute_trait')).toBe('user1');
      expect(firstChild.get('property_trait')).toBe('user1');

      expect(secondChild.getAttributes()['attribute_trait']).toBe('user2');
      expect(secondChild.getEl()?.getAttribute('attribute_trait')).toBe('user2');
      expect(secondChild.get('property_trait')).toBe('user2');

      firstRecord.set('user', 'new_user1_value');
      expect(firstChild.getAttributes()['attribute_trait']).toBe('new_user1_value');
      expect(firstChild.getEl()?.getAttribute('attribute_trait')).toBe('new_user1_value');
      expect(firstChild.get('property_trait')).toBe('new_user1_value');

      expect(secondChild.getAttributes()['attribute_trait']).toBe('user2');
      expect(secondChild.getEl()?.getAttribute('attribute_trait')).toBe('user2');
      expect(secondChild.get('property_trait')).toBe('user2');
    });
  });

  describe('Serialization', () => {
    let cmp: Component;

    beforeEach(() => {
      const cmpDefinition = {
        type: 'default',
        name: {
          type: DataCollectionVariableType,
          variableType: DataCollectionStateVariableType.currentItem,
          collectionId: 'my_collection',
          path: 'user',
        },
        custom_prop: {
          type: DataCollectionVariableType,
          variableType: DataCollectionStateVariableType.currentIndex,
          collectionId: 'my_collection',
          path: 'user',
        },
        attributes: {
          name: {
            type: DataCollectionVariableType,
            variableType: DataCollectionStateVariableType.currentItem,
            collectionId: 'my_collection',
            path: 'user',
          },
        },
        traits: [
          {
            name: 'attribute_trait',
            value: {
              type: DataCollectionVariableType,
              variableType: DataCollectionStateVariableType.currentItem,
              collectionId: 'my_collection',
              path: 'user',
            },
          },
          {
            name: 'property_trait',
            changeProp: true,
            value: {
              type: DataCollectionVariableType,
              variableType: DataCollectionStateVariableType.currentItem,
              collectionId: 'my_collection',
              path: 'user',
            },
          },
        ],
      };

      const collectionComponentDefinition = {
        type: DataCollectionType,
        collectionDef: {
          componentDef: {
            ...cmpDefinition,
            components: [cmpDefinition, cmpDefinition],
          },
          collectionConfig: {
            collectionId: 'my_collection',
            startIndex: 0,
            endIndex: 1,
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        },
      };

      cmp = wrapper.components(collectionComponentDefinition)[0];
    });

    test('Serializion with Collection Variables to JSON', () => {
      expect(cmp.toJSON()).toMatchSnapshot(`Collection with no grandchildren`);

      const firstChild = cmp.components().at(0);
      const newChildDefinition = {
        type: 'default',
        name: {
          type: DataCollectionVariableType,
          variableType: DataCollectionStateVariableType.currentIndex,
          collectionId: 'my_collection',
          path: 'user',
        },
      };
      firstChild.components().at(0).components(newChildDefinition);
      expect(cmp.toJSON()).toMatchSnapshot(`Collection with grandchildren`);
    });

    test('Saving', () => {
      const projectData = editor.getProjectData();
      const page = projectData.pages[0];
      const frame = page.frames[0];
      const component = frame.component.components[0];

      expect(component).toMatchSnapshot(`Collection with no grandchildren`);

      const firstChild = cmp.components().at(0);
      const newChildDefinition = {
        type: 'default',
        name: {
          type: DataCollectionVariableType,
          variableType: DataCollectionStateVariableType.currentIndex,
          collectionId: 'my_collection',
          path: 'user',
        },
      };
      firstChild.components().at(0).components(newChildDefinition);
      expect(cmp.toJSON()).toMatchSnapshot(`Collection with grandchildren`);
    });

    test('Loading', () => {
      const componentProjectData: ProjectData = {
        assets: [],
        pages: [
          {
            frames: [
              {
                component: {
                  components: [
                    {
                      collectionDef: {
                        componentDef: {
                          attributes: {
                            attribute_trait: {
                              path: 'user',
                              type: DataCollectionVariableType,
                              variableType: DataCollectionStateVariableType.currentItem,
                            },
                            name: {
                              path: 'user',
                              type: DataCollectionVariableType,
                              collectionId: 'my_collection',
                              variableType: DataCollectionStateVariableType.currentItem,
                            },
                          },
                          components: [
                            {
                              attributes: {
                                attribute_trait: {
                                  path: 'user',
                                  type: DataCollectionVariableType,
                                  collectionId: 'my_collection',
                                  variableType: DataCollectionStateVariableType.currentItem,
                                },
                                name: {
                                  path: 'user',
                                  type: DataCollectionVariableType,
                                  collectionId: 'my_collection',
                                  variableType: DataCollectionStateVariableType.currentItem,
                                },
                              },
                              name: {
                                path: 'user',
                                type: DataCollectionVariableType,
                                collectionId: 'my_collection',
                                variableType: DataCollectionStateVariableType.currentItem,
                              },
                              custom_prop: {
                                path: 'user',
                                type: DataCollectionVariableType,
                                collectionId: 'my_collection',
                                variableType: 'currentIndex',
                              },
                              property_trait: {
                                path: 'user',
                                type: DataCollectionVariableType,
                                collectionId: 'my_collection',
                                variableType: DataCollectionStateVariableType.currentItem,
                              },
                              type: 'default',
                            },
                            {
                              attributes: {
                                attribute_trait: {
                                  path: 'user',
                                  type: DataCollectionVariableType,
                                  collectionId: 'my_collection',
                                  variableType: DataCollectionStateVariableType.currentItem,
                                },
                                name: {
                                  path: 'user',
                                  type: DataCollectionVariableType,
                                  collectionId: 'my_collection',
                                  variableType: DataCollectionStateVariableType.currentItem,
                                },
                              },
                              name: {
                                path: 'user',
                                type: DataCollectionVariableType,
                                collectionId: 'my_collection',
                                variableType: DataCollectionStateVariableType.currentItem,
                              },
                              custom_prop: {
                                path: 'user',
                                type: DataCollectionVariableType,
                                collectionId: 'my_collection',
                                variableType: 'currentIndex',
                              },
                              property_trait: {
                                path: 'user',
                                type: DataCollectionVariableType,
                                collectionId: 'my_collection',
                                variableType: DataCollectionStateVariableType.currentItem,
                              },
                              type: 'default',
                            },
                          ],
                          name: {
                            path: 'user',
                            type: DataCollectionVariableType,
                            collectionId: 'my_collection',
                            variableType: DataCollectionStateVariableType.currentItem,
                          },
                          custom_prop: {
                            path: 'user',
                            type: DataCollectionVariableType,
                            collectionId: 'my_collection',
                            variableType: 'currentIndex',
                          },
                          property_trait: {
                            path: 'user',
                            type: DataCollectionVariableType,
                            collectionId: 'my_collection',
                            variableType: DataCollectionStateVariableType.currentItem,
                          },
                          type: 'default',
                        },
                        collectionConfig: {
                          collectionId: 'my_collection',
                          dataSource: {
                            path: 'my_data_source_id',
                            type: DataVariableType,
                          },
                          endIndex: 1,
                          startIndex: 0,
                        },
                      },
                      type: DataCollectionType,
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
        dataSources: [dataSource],
      };
      editor.loadProjectData(componentProjectData);

      const components = editor.getComponents();
      const component = components.models[0];
      const firstChild = component.components().at(0);
      const firstGrandchild = firstChild.components().at(0);
      const secondChild = component.components().at(1);
      const secondGrandchild = secondChild.components().at(0);

      expect(firstChild.get('name')).toBe('user1');
      expect(firstChild.getAttributes()['name']).toBe('user1');
      expect(firstGrandchild.get('name')).toBe('user1');
      expect(firstGrandchild.getAttributes()['name']).toBe('user1');

      expect(secondChild.get('name')).toBe('user2');
      expect(secondChild.getAttributes()['name']).toBe('user2');
      expect(secondGrandchild.get('name')).toBe('user2');
      expect(secondGrandchild.getAttributes()['name']).toBe('user2');

      firstRecord.set('user', 'new_user1_value');
      expect(firstChild.get('name')).toBe('new_user1_value');
      expect(firstChild.getAttributes()['name']).toBe('new_user1_value');
      expect(firstGrandchild.get('name')).toBe('new_user1_value');
      expect(firstGrandchild.getAttributes()['name']).toBe('new_user1_value');

      expect(secondChild.get('name')).toBe('user2');
      expect(secondChild.getAttributes()['name']).toBe('user2');
      expect(secondGrandchild.get('name')).toBe('user2');
      expect(secondGrandchild.getAttributes()['name']).toBe('user2');
    });
  });

  describe('Configuration options', () => {
    test('Collection with start and end indexes', () => {
      const cmp = wrapper.components({
        type: DataCollectionType,
        collectionDef: {
          componentDef: {
            type: 'default',
            name: {
              type: DataCollectionVariableType,
              variableType: DataCollectionStateVariableType.currentItem,
              collectionId: 'my_collection',
              path: 'user',
            },
          },
          collectionConfig: {
            startIndex: 1,
            endIndex: 2,
            collectionId: 'my_collection',
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        },
      })[0];

      expect(cmp.components()).toHaveLength(2);
      const firstChild = cmp.components().at(0);
      const secondChild = cmp.components().at(1);

      expect(firstChild.get('name')).toBe('user2');
      expect(secondChild.get('name')).toBe('user3');
    });
  });

  describe('Diffirent Collection variable types', () => {
    const stateVariableTests = [
      { variableType: DataCollectionStateVariableType.currentIndex, expectedValues: [0, 1, 2] },
      { variableType: DataCollectionStateVariableType.startIndex, expectedValues: [0, 0, 0] },
      { variableType: DataCollectionStateVariableType.endIndex, expectedValues: [2, 2, 2] },
      {
        variableType: DataCollectionStateVariableType.collectionId,
        expectedValues: ['my_collection', 'my_collection', 'my_collection'],
      },
      { variableType: DataCollectionStateVariableType.totalItems, expectedValues: [3, 3, 3] },
      { variableType: DataCollectionStateVariableType.remainingItems, expectedValues: [2, 1, 0] },
    ];

    stateVariableTests.forEach(({ variableType, expectedValues }) => {
      test(`Variable type: ${variableType}`, () => {
        const cmp = wrapper.components({
          type: DataCollectionType,
          collectionDef: {
            componentDef: {
              type: 'default',
              name: {
                type: DataCollectionVariableType,
                variableType: variableType,
                collectionId: 'my_collection',
              },
              attributes: {
                custom_attribute: {
                  type: DataCollectionVariableType,
                  variableType: variableType,
                  collectionId: 'my_collection',
                },
              },
              traits: [
                {
                  name: 'attribute_trait',
                  value: {
                    type: DataCollectionVariableType,
                    variableType: variableType,
                    collectionId: 'my_collection',
                  },
                },
                {
                  name: 'property_trait',
                  changeProp: true,
                  value: {
                    type: DataCollectionVariableType,
                    variableType: variableType,
                    collectionId: 'my_collection',
                  },
                },
              ],
            },
            collectionConfig: {
              collectionId: 'my_collection',
              dataSource: {
                type: DataVariableType,
                path: 'my_data_source_id',
              },
            },
          },
        })[0];

        const children = cmp.components();
        expect(children).toHaveLength(3);

        children.each((child, index) => {
          expect(child.get('name')).toBe(expectedValues[index]);
          expect(child.get('property_trait')).toBe(expectedValues[index]);
          expect(child.getAttributes()['custom_attribute']).toBe(expectedValues[index]);
          expect(child.getAttributes()['attribute_trait']).toBe(expectedValues[index]);
        });
      });
    });
  });
});
