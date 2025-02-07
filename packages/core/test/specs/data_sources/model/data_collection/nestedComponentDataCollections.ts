import { Component, DataRecord, DataSource, DataSourceManager, Editor } from '../../../../../src';
import { DataVariableType } from '../../../../../src/data_sources/model/DataVariable';
import {
  DataCollectionType,
  DataCollectionVariableType,
} from '../../../../../src/data_sources/model/data_collection/constants';
import { DataCollectionStateVariableType } from '../../../../../src/data_sources/model/data_collection/types';
import EditorModel from '../../../../../src/editor/model/Editor';
import { setupTestEditor } from '../../../../common';

describe('Collection component', () => {
  let em: EditorModel;
  let editor: Editor;
  let dsm: DataSourceManager;
  let dataSource: DataSource;
  let nestedDataSource: DataSource;
  let wrapper: Component;
  let firstRecord: DataRecord;
  let secondRecord: DataRecord;
  let firstNestedRecord: DataRecord;
  let secondNestedRecord: DataRecord;

  beforeEach(() => {
    ({ em, editor, dsm } = setupTestEditor());
    wrapper = em.getWrapper()!;
    dataSource = dsm.add({
      id: 'my_data_source_id',
      records: [
        { id: 'user1', user: 'user1', age: '12' },
        { id: 'user2', user: 'user2', age: '14' },
      ],
    });

    nestedDataSource = dsm.add({
      id: 'nested_data_source_id',
      records: [
        { id: 'nested_user1', user: 'nested_user1', age: '12' },
        { id: 'nested_user2', user: 'nested_user2', age: '14' },
        { id: 'nested_user3', user: 'nested_user3', age: '16' },
      ],
    });

    firstRecord = dataSource.getRecord('user1')!;
    secondRecord = dataSource.getRecord('user2')!;
    firstNestedRecord = nestedDataSource.getRecord('nested_user1')!;
    secondNestedRecord = nestedDataSource.getRecord('nested_user2')!;
  });

  afterEach(() => {
    em.destroy();
  });

  test('Nested collections bind to correct data sources', () => {
    const parentCollection = wrapper.components({
      type: DataCollectionType,
      collectionDef: {
        componentDef: {
          type: DataCollectionType,
          collectionDef: {
            componentDef: {
              type: 'default',
              name: {
                type: DataCollectionVariableType,
                variableType: DataCollectionStateVariableType.currentItem,
                collectionId: 'nested_collection',
                path: 'user',
              },
            },
            collectionConfig: {
              collectionId: 'nested_collection',
              dataSource: {
                type: DataVariableType,
                path: 'nested_data_source_id',
              },
            },
          },
        },
        collectionConfig: {
          collectionId: 'parent_collection',
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      },
    })[0];

    const nestedCollection = parentCollection.components().at(0);
    const nestedFirstChild = nestedCollection.components().at(0);
    const nestedSecondChild = nestedCollection.components().at(1);

    expect(nestedFirstChild.get('name')).toBe('nested_user1');
    expect(nestedSecondChild.get('name')).toBe('nested_user2');
  });

  test('Updates in parent collection propagate to nested collections', () => {
    const parentCollection = wrapper.components({
      type: DataCollectionType,
      collectionDef: {
        componentDef: {
          type: DataCollectionType,
          collectionDef: {
            componentDef: {
              type: 'default',
              name: {
                type: DataCollectionVariableType,
                variableType: DataCollectionStateVariableType.currentItem,
                collectionId: 'nested_collection',
                path: 'user',
              },
            },
            collectionConfig: {
              collectionId: 'nested_collection',
              dataSource: {
                type: DataVariableType,
                path: 'nested_data_source_id',
              },
            },
          },
        },
        collectionConfig: {
          collectionId: 'parent_collection',
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      },
    })[0];

    const nestedCollection = parentCollection.components().at(0);
    const nestedFirstChild = nestedCollection.components().at(0);
    const nestedSecondChild = nestedCollection.components().at(1);

    firstNestedRecord.set('user', 'updated_user1');
    expect(nestedFirstChild.get('name')).toBe('updated_user1');
    expect(nestedSecondChild.get('name')).toBe('nested_user2');
  });

  test('Nested collections are correctly serialized', () => {
    const parentCollection = wrapper.components({
      type: DataCollectionType,
      collectionDef: {
        componentDef: {
          type: DataCollectionType,
          collectionDef: {
            componentDef: {
              type: 'default',
              name: {
                type: DataCollectionVariableType,
                variableType: DataCollectionStateVariableType.currentItem,
                path: 'user',
              },
            },
            collectionConfig: {
              collectionId: 'nested_collection',
              dataSource: {
                type: DataVariableType,
                path: 'nested_data_source_id',
              },
            },
          },
        },
        collectionConfig: {
          collectionId: 'parent_collection',
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      },
    })[0];

    const serialized = parentCollection.toJSON();
    expect(serialized).toMatchSnapshot();
  });

  test('Nested collections respect startIndex and endIndex', () => {
    const parentCollection = wrapper.components({
      type: DataCollectionType,
      collectionDef: {
        componentDef: {
          type: DataCollectionType,
          collectionDef: {
            componentDef: {
              type: 'default',
              name: {
                type: DataCollectionVariableType,
                variableType: DataCollectionStateVariableType.currentItem,
                collectionId: 'nested_collection',
                path: 'user',
              },
            },
            collectionConfig: {
              collectionId: 'nested_collection',
              startIndex: 0,
              endIndex: 1,
              dataSource: {
                type: DataVariableType,
                path: 'nested_data_source_id',
              },
            },
          },
        },
        collectionConfig: {
          collectionId: 'parent_collection',
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      },
    })[0];

    const nestedCollection = parentCollection.components().at(0);
    expect(nestedCollection.components().length).toBe(2);
  });

  test('Nested collection gets and watches value from the parent collection', () => {
    const parentCollection = wrapper.components({
      type: DataCollectionType,
      collectionDef: {
        componentDef: {
          type: DataCollectionType,
          collectionDef: {
            componentDef: {
              type: 'default',
              name: {
                type: DataCollectionVariableType,
                variableType: DataCollectionStateVariableType.currentItem,
                collectionId: 'parent_collection',
                path: 'user',
              },
            },
            collectionConfig: {
              collectionId: 'nested_collection',
              dataSource: {
                type: DataVariableType,
                path: 'nested_data_source_id',
              },
            },
          },
        },
        collectionConfig: {
          collectionId: 'parent_collection',
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      },
    })[0];

    const nestedCollection = parentCollection.components().at(0);
    const firstNestedChild = nestedCollection.components().at(0);

    // Verify initial value
    expect(firstNestedChild.get('name')).toBe('user1');

    // Update value in parent collection and verify nested collection updates
    firstRecord.set('user', 'updated_user1');
    expect(firstNestedChild.get('name')).toBe('updated_user1');
  });

  test('Nested collection switches to using its own collection variable', () => {
    const parentCollection = wrapper.components({
      type: DataCollectionType,
      collectionDef: {
        componentDef: {
          type: DataCollectionType,
          collectionDef: {
            componentDef: {
              type: 'default',
              name: {
                type: DataCollectionVariableType,
                variableType: DataCollectionStateVariableType.currentItem,
                path: 'user',
                collectionId: 'parent_collection',
              },
            },
            collectionConfig: {
              collectionId: 'nested_collection',
              dataSource: {
                type: DataVariableType,
                path: 'nested_data_source_id',
              },
            },
          },
        },
        collectionConfig: {
          collectionId: 'parent_collection',
          dataSource: {
            type: DataVariableType,
            path: 'my_data_source_id',
          },
        },
      },
    })[0];

    const nestedCollection = parentCollection.components().at(0);

    const firstChild = nestedCollection.components().at(0);
    // Replace the collection variable with one from the inner collection
    firstChild.set('name', {
      // @ts-ignore
      type: DataCollectionVariableType,
      variableType: DataCollectionStateVariableType.currentItem,
      path: 'user',
      collectionId: 'nested_collection',
    });

    expect(firstChild.get('name')).toBe('nested_user1');
  });

  describe('Nested Collection Component with Parent and Nested Data Sources', () => {
    let parentCollection: Component;
    let nestedCollection: Component;

    beforeEach(() => {
      // Initialize the parent and nested collections
      parentCollection = wrapper.components({
        type: DataCollectionType,
        collectionDef: {
          componentDef: {
            type: DataCollectionType,
            name: {
              type: DataCollectionVariableType,
              variableType: DataCollectionStateVariableType.currentItem,
              collectionId: 'parent_collection',
              path: 'user',
            },
            collectionDef: {
              componentDef: {
                type: 'default',
                name: {
                  type: DataCollectionVariableType,
                  variableType: DataCollectionStateVariableType.currentItem,
                  collectionId: 'nested_collection',
                  path: 'user',
                },
              },
              collectionConfig: {
                collectionId: 'nested_collection',
                dataSource: {
                  type: DataVariableType,
                  path: 'nested_data_source_id',
                },
              },
            },
          },
          collectionConfig: {
            collectionId: 'parent_collection',
            dataSource: {
              type: DataVariableType,
              path: 'my_data_source_id',
            },
          },
        },
      })[0];

      nestedCollection = parentCollection.components().at(0);
    });

    test('Removing a record from the parent data source updates the parent collection correctly', () => {
      // Verify initial state
      expect(parentCollection.components().length).toBe(2); // 2 parent records initially

      // Remove a record from the parent data source
      dataSource.removeRecord('user1');

      // Verify that the parent collection updates correctly
      expect(parentCollection.components().length).toBe(1); // Only 1 parent record remains
      expect(parentCollection.components().at(0).get('name')).toBe('user2'); // Verify updated name

      // Verify that the nested collection is unaffected
      expect(nestedCollection.components().length).toBe(3); // Nested records remain the same
      expect(nestedCollection.components().at(0).get('name')).toBe('nested_user1'); // Verify nested name
    });

    test('Adding a record to the parent data source updates the parent collection correctly', () => {
      // Verify initial state
      expect(parentCollection.components().length).toBe(2); // 2 parent records initially

      // Add a new record to the parent data source
      dataSource.addRecord({ id: 'user3', user: 'user3', age: '16' });

      // Verify that the parent collection updates correctly
      expect(parentCollection.components().length).toBe(3); // 3 parent records now
      expect(parentCollection.components().at(2).get('name')).toBe('user3'); // Verify new name

      // Verify that the nested collection is unaffected
      expect(nestedCollection.components().length).toBe(3); // Nested records remain the same
      expect(nestedCollection.components().at(0).get('name')).toBe('nested_user1'); // Verify nested name
      expect(parentCollection.components().at(2).components().at(0).get('name')).toBe('nested_user1'); // Verify nested name
    });

    test('Removing a record from the nested data source updates the nested collection correctly', () => {
      // Verify initial state
      expect(nestedCollection.components().length).toBe(3); // 3 nested records initially

      // Remove a record from the nested data source
      nestedDataSource.removeRecord('nested_user1');

      // Verify that the nested collection updates correctly
      expect(nestedCollection.components().length).toBe(2); // Only 2 nested records remain
      expect(nestedCollection.components().at(0).get('name')).toBe('nested_user2'); // Verify updated name
      expect(nestedCollection.components().at(1).get('name')).toBe('nested_user3'); // Verify updated name
    });

    test('Adding a record to the nested data source updates the nested collection correctly', () => {
      // Verify initial state
      expect(nestedCollection.components().length).toBe(3); // 3 nested records initially
      expect(nestedCollection.components().at(0).get('name')).toBe('nested_user1'); // Verify initial name
      expect(nestedCollection.components().at(1).get('name')).toBe('nested_user2'); // Verify initial name
      expect(nestedCollection.components().at(2).get('name')).toBe('nested_user3'); // Verify initial name

      // Add a new record to the nested data source
      nestedDataSource.addRecord({ id: 'user4', user: 'nested_user4', age: '18' });

      // Verify that the nested collection updates correctly
      expect(nestedCollection.components().length).toBe(4); // 4 nested records now
      expect(nestedCollection.components().at(3).get('name')).toBe('nested_user4'); // Verify new name

      // Verify existing records are unaffected
      expect(nestedCollection.components().at(0).get('name')).toBe('nested_user1'); // Verify existing name
      expect(nestedCollection.components().at(1).get('name')).toBe('nested_user2'); // Verify existing name
      expect(nestedCollection.components().at(2).get('name')).toBe('nested_user3'); // Verify existing name
    });
  });
});
