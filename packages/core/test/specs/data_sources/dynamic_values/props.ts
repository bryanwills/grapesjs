import Editor from '../../../../src/editor/model/Editor';
import DataSourceManager from '../../../../src/data_sources';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import { DataVariableType } from '../../../../src/data_sources/model/DataVariable';
import { setupTestEditor } from '../../../common';

describe('Component Dynamic Properties', () => {
  let em: Editor;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;

  beforeEach(() => {
    ({ em, dsm, cmpRoot } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });

  test('set static and dynamic properties', () => {
    const dataSource = {
      id: 'ds_id',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(dataSource);

    const properties = {
      custom_property: 'static-value',
      content: {
        type: DataVariableType,
        path: 'ds_id.id1.value',
        defaultValue: 'default',
      },
    };

    const cmp = cmpRoot.append({
      tagName: 'div',
      ...properties,
    })[0];

    expect(cmp.get('custom_property')).toBe('static-value');
    expect(cmp.get('content')).toBe('test-value');
  });

  test('dynamic properties respond to data changes', () => {
    const dataSource = {
      id: 'ds_id',
      records: [{ id: 'id1', value: 'initial-value' }],
    };
    dsm.add(dataSource);

    const cmp = cmpRoot.append({
      tagName: 'div',
      content: {
        type: DataVariableType,
        path: 'ds_id.id1.value',
        defaultValue: 'default',
      },
    })[0];

    expect(cmp.get('content')).toBe('initial-value');
    dsm.get('ds_id').getRecord('id1')?.set('value', 'updated-value');
    expect(cmp.get('content')).toBe('updated-value');
  });

  test('setting static values stops dynamic updates', () => {
    const dataSource = {
      id: 'ds_id',
      records: [{ id: 'id1', value: 'dynamic-value' }],
    };
    dsm.add(dataSource);

    const dataVariable = {
      type: DataVariableType,
      path: 'ds_id.id1.value',
      defaultValue: 'default',
    };
    const cmp = cmpRoot.append({
      tagName: 'div',
      content: dataVariable,
    })[0];

    cmp.set('content', 'static-value');
    dsm.get('ds_id').getRecord('id1')?.set('value', 'new-dynamic-value');
    expect(cmp.get('content')).toBe('static-value');

    // @ts-ignore
    cmp.set({ content: dataVariable });
    expect(cmp.get('content')).toBe('new-dynamic-value');
  });

  test('updating to a new dynamic value listens to the new dynamic value only', () => {
    const dataSource = {
      id: 'ds_id',
      records: [
        { id: 'id1', value: 'dynamic-value1' },
        { id: 'id2', value: 'dynamic-value2' },
      ],
    };
    dsm.add(dataSource);

    const cmp = cmpRoot.append({
      tagName: 'div',
      content: {
        type: DataVariableType,
        path: 'ds_id.id1.value',
        defaultValue: 'default',
      },
    })[0];

    cmp.set({
      content: {
        type: DataVariableType,
        path: 'ds_id.id2.value',
        defaultValue: 'default',
      } as any,
    });
    dsm.get('ds_id').getRecord('id1')?.set('value', 'new-dynamic-value1');
    expect(cmp.get('content')).toBe('dynamic-value2');
    dsm.get('ds_id').getRecord('id2')?.set('value', 'new-dynamic-value2');
    expect(cmp.get('content')).toBe('new-dynamic-value2');
  });

  test('unset properties stops dynamic updates', () => {
    const dataSource = {
      id: 'ds_id',
      records: [
        { id: 'id1', value: 'dynamic-value1' },
        { id: 'id2', value: 'dynamic-value2' },
      ],
    };
    dsm.add(dataSource);

    const cmp = cmpRoot.append({
      tagName: 'div',
      custom_property: {
        type: DataVariableType,
        path: 'ds_id.id1.value',
        defaultValue: 'default',
      },
    })[0];

    cmp.unset('custom_property');
    dsm.get('ds_id').getRecord('id1')?.set('value', 'new-dynamic-value');
    expect(cmp.get('custom_property')).toBeUndefined();
  });
});
