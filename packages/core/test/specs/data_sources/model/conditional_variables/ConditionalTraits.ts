import { DataSourceManager, Editor } from '../../../../../src';
import { DataConditionType } from '../../../../../src/data_sources/model/conditional_variables/DataCondition';
import { NumberOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/NumberOperator';
import ComponentWrapper from '../../../../../src/dom_components/model/ComponentWrapper';
import EditorModel from '../../../../../src/editor/model/Editor';
import { setupTestEditor } from '../../../../common';

describe('conditional traits', () => {
  let editor: Editor;
  let em: EditorModel;
  let dsm: DataSourceManager;
  let cmpRoot: ComponentWrapper;

  beforeEach(() => {
    ({ editor, em, dsm, cmpRoot } = setupTestEditor());
  });

  afterEach(() => {
    em.destroy();
  });
  test('set component attribute to trait value if component has no value for the attribute', () => {
    const inputDataSource = {
      id: 'test-input',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(inputDataSource);

    const cmp = cmpRoot.append({
      tagName: 'input',
      traits: [
        'name',
        {
          type: 'text',
          label: 'Value',
          name: 'value',
          value: {
            type: DataConditionType,
            condition: {
              left: 0,
              operator: NumberOperation.greaterThan,
              right: -1,
            },
            ifTrue: 'test-value',
          },
        },
      ],
    })[0];

    const input = cmp.getEl();
    expect(input?.getAttribute('value')).toBe('test-value');
    expect(cmp?.getAttributes().value).toBe('test-value');
  });

  test('set component prop to trait value if component has no value for the prop', () => {
    const inputDataSource = {
      id: 'test-input',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(inputDataSource);

    const cmp = cmpRoot.append({
      tagName: 'input',
      traits: [
        'name',
        {
          type: 'text',
          label: 'Value',
          name: 'value',
          changeProp: true,
          value: {
            type: DataConditionType,
            condition: {
              left: 0,
              operator: NumberOperation.greaterThan,
              right: -1,
            },
            ifTrue: 'test-value',
          },
        },
      ],
    })[0];

    expect(cmp?.get('value')).toBe('test-value');
  });

  test('should keep component prop if component already has a value for the prop', () => {
    const inputDataSource = {
      id: 'test-input',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(inputDataSource);

    const cmp = cmpRoot.append({
      tagName: 'input',
      attributes: {
        value: 'existing-value',
      },
      traits: [
        'name',
        {
          type: 'text',
          label: 'Value',
          name: 'value',
          changeProp: true,
          value: {
            type: DataConditionType,
            condition: {
              left: 0,
              operator: NumberOperation.greaterThan,
              right: -1,
            },
            ifTrue: 'existing-value',
          },
        },
      ],
    })[0];

    const input = cmp.getEl();
    expect(input?.getAttribute('value')).toBe('existing-value');
    expect(cmp?.getAttributes().value).toBe('existing-value');
  });

  test('should keep component prop if component already has a value for the prop', () => {
    const inputDataSource = {
      id: 'test-input',
      records: [{ id: 'id1', value: 'test-value' }],
    };
    dsm.add(inputDataSource);

    const cmp = cmpRoot.append({
      tagName: 'input',
      value: 'existing-value',
      traits: [
        'name',
        {
          type: 'text',
          label: 'Value',
          name: 'value',
          changeProp: true,
          value: {
            type: DataConditionType,
            condition: {
              left: 0,
              operator: NumberOperation.greaterThan,
              right: -1,
            },
            ifTrue: 'existing-value',
          },
        },
      ],
    })[0];
  });

  it('should handle objects as traits (other than dynamic values)', () => {
    const traitValue = {
      type: 'UNKNOWN_TYPE',
      condition: "This's not a condition",
      value: 'random value',
    };

    const component = cmpRoot.append({
      tagName: 'h1',
      type: 'text',
      traits: [
        {
          type: 'text',
          name: 'title',
          value: traitValue,
        },
      ],
    })[0];
    expect(component.getTrait('title').get('value')).toEqual(traitValue);
    expect(component.getAttributes().title).toEqual(traitValue);
  });
});
