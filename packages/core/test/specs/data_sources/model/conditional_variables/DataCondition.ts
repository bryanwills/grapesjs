import { DataSourceManager } from '../../../../../src';
import {
  DataCondition,
  ExpressionProps,
  LogicGroupProps,
} from '../../../../../src/data_sources/model/conditional_variables/DataCondition';
import { GenericOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/GenericOperator';
import { LogicalOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/LogicalOperator';
import { NumberOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/NumberOperator';
import { StringOperation } from '../../../../../src/data_sources/model/conditional_variables/operators/StringOperations';
import { DataVariableType } from '../../../../../src/data_sources/model/DataVariable';
import Editor from '../../../../../src/editor/model/Editor';
import EditorModel from '../../../../../src/editor/model/Editor';

describe('DataCondition', () => {
  let em: EditorModel;
  let dsm: DataSourceManager;
  const dataSource = {
    id: 'USER_STATUS_SOURCE',
    records: [
      { id: 'USER_1', age: 25, status: 'active' },
      { id: 'USER_2', age: 12, status: 'inactive' },
    ],
  };

  beforeEach(() => {
    em = new Editor();
    dsm = em.DataSources;
    dsm.add(dataSource);
  });

  afterEach(() => {
    em.destroy();
  });

  describe('Basic Functionality Tests', () => {
    test('should evaluate a simple boolean condition', () => {
      const condition = true;
      const dataCondition = new DataCondition(condition, 'Yes', 'No', { em });

      expect(dataCondition.getDataValue()).toBe('Yes');
    });

    test('should return ifFalse when condition evaluates to false', () => {
      const condition = false;
      const dataCondition = new DataCondition(condition, 'Yes', 'No', { em });

      expect(dataCondition.getDataValue()).toBe('No');
    });
  });

  describe('Operator Tests', () => {
    test('should evaluate using GenericOperation operators', () => {
      const condition: ExpressionProps = { left: 5, operator: GenericOperation.equals, right: 5 };
      const dataCondition = new DataCondition(condition, 'Equal', 'Not Equal', { em });

      expect(dataCondition.getDataValue()).toBe('Equal');
    });

    test('equals (false)', () => {
      const condition: ExpressionProps = {
        left: 'hello',
        operator: GenericOperation.equals,
        right: 'world',
      };
      const dataCondition = new DataCondition(condition, 'true', 'false', { em });
      expect(dataCondition.evaluate()).toBe(false);
    });

    test('should evaluate using StringOperation operators', () => {
      const condition: ExpressionProps = { left: 'apple', operator: StringOperation.contains, right: 'app' };
      const dataCondition = new DataCondition(condition, 'Contains', "Doesn't contain", { em });

      expect(dataCondition.getDataValue()).toBe('Contains');
    });

    test('should evaluate using NumberOperation operators', () => {
      const condition: ExpressionProps = { left: 10, operator: NumberOperation.lessThan, right: 15 };
      const dataCondition = new DataCondition(condition, 'Valid', 'Invalid', { em });

      expect(dataCondition.getDataValue()).toBe('Valid');
    });

    test('should evaluate using LogicalOperation operators', () => {
      const logicGroup: LogicGroupProps = {
        logicalOperator: LogicalOperation.and,
        statements: [
          { left: true, operator: GenericOperation.equals, right: true },
          { left: 5, operator: NumberOperation.greaterThan, right: 3 },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'Pass', 'Fail', { em });
      expect(dataCondition.getDataValue()).toBe('Pass');
    });
  });

  describe('Edge Case Tests', () => {
    test('should throw error for invalid condition type', () => {
      const invalidCondition: any = { randomField: 'randomValue' };
      expect(() => new DataCondition(invalidCondition, 'Yes', 'No', { em })).toThrow('Invalid condition type.');
    });

    test('should evaluate complex nested conditions', () => {
      const nestedLogicGroup: LogicGroupProps = {
        logicalOperator: LogicalOperation.or,
        statements: [
          {
            logicalOperator: LogicalOperation.and,
            statements: [
              { left: 1, operator: NumberOperation.lessThan, right: 5 },
              { left: 'test', operator: GenericOperation.equals, right: 'test' },
            ],
          },
          { left: 10, operator: NumberOperation.greaterThan, right: 100 },
        ],
      };

      const dataCondition = new DataCondition(nestedLogicGroup, 'Nested Pass', 'Nested Fail', { em });
      expect(dataCondition.getDataValue()).toBe('Nested Pass');
    });
  });

  describe('LogicalGroup Tests', () => {
    test('should correctly handle AND logical operator', () => {
      const logicGroup: LogicGroupProps = {
        logicalOperator: LogicalOperation.and,
        statements: [
          { left: true, operator: GenericOperation.equals, right: true },
          { left: 5, operator: NumberOperation.greaterThan, right: 3 },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'All true', 'One or more false', { em });
      expect(dataCondition.getDataValue()).toBe('All true');
    });

    test('should correctly handle OR logical operator', () => {
      const logicGroup: LogicGroupProps = {
        logicalOperator: LogicalOperation.or,
        statements: [
          { left: true, operator: GenericOperation.equals, right: false },
          { left: 5, operator: NumberOperation.greaterThan, right: 3 },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'At least one true', 'All false', { em });
      expect(dataCondition.getDataValue()).toBe('At least one true');
    });

    test('should correctly handle XOR logical operator', () => {
      const logicGroup: LogicGroupProps = {
        logicalOperator: LogicalOperation.xor,
        statements: [
          { left: true, operator: GenericOperation.equals, right: true },
          { left: 5, operator: NumberOperation.lessThan, right: 3 },
          { left: false, operator: GenericOperation.equals, right: true },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'Exactly one true', 'Multiple true or all false', { em });
      expect(dataCondition.getDataValue()).toBe('Exactly one true');
    });

    test('should handle nested logical groups', () => {
      const logicGroup: LogicGroupProps = {
        logicalOperator: LogicalOperation.and,
        statements: [
          { left: true, operator: GenericOperation.equals, right: true },
          {
            logicalOperator: LogicalOperation.or,
            statements: [
              { left: 5, operator: NumberOperation.greaterThan, right: 3 },
              { left: false, operator: GenericOperation.equals, right: true },
            ],
          },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'All true', 'One or more false', { em });
      expect(dataCondition.getDataValue()).toBe('All true');
    });

    test('should handle groups with false conditions', () => {
      const logicGroup: LogicGroupProps = {
        logicalOperator: LogicalOperation.and,
        statements: [
          { left: true, operator: GenericOperation.equals, right: true },
          { left: false, operator: GenericOperation.equals, right: true },
          { left: 5, operator: NumberOperation.greaterThan, right: 3 },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'All true', 'One or more false', { em });
      expect(dataCondition.getDataValue()).toBe('One or more false');
    });
  });

  describe('Conditions with dataVariables', () => {
    test('should return "Yes" when dataVariable matches expected value', () => {
      const condition: ExpressionProps = {
        left: { type: DataVariableType, path: 'USER_STATUS_SOURCE.USER_1.status' },
        operator: GenericOperation.equals,
        right: 'active',
      };

      const dataCondition = new DataCondition(condition, 'Yes', 'No', { em });
      expect(dataCondition.getDataValue()).toBe('Yes');
    });

    test('should return "No" when dataVariable does not match expected value', () => {
      const condition: ExpressionProps = {
        left: { type: DataVariableType, path: 'USER_STATUS_SOURCE.USER_1.status' },
        operator: GenericOperation.equals,
        right: 'inactive',
      };

      const dataCondition = new DataCondition(condition, 'Yes', 'No', { em });
      expect(dataCondition.getDataValue()).toBe('No');
    });

    // TODO: unskip after adding UndefinedOperator
    test.skip('should handle missing data variable gracefully', () => {
      const condition: ExpressionProps = {
        left: { type: DataVariableType, path: 'USER_STATUS_SOURCE.not_a_user.status' },
        operator: GenericOperation.isDefined,
        right: undefined,
      };

      const dataCondition = new DataCondition(condition, 'Found', 'Not Found', { em });
      expect(dataCondition.getDataValue()).toBe('Not Found');
    });

    test('should correctly compare numeric values from dataVariables', () => {
      const condition: ExpressionProps = {
        left: { type: DataVariableType, path: 'USER_STATUS_SOURCE.USER_1.age' },
        operator: NumberOperation.greaterThan,
        right: 24,
      };
      const dataCondition = new DataCondition(condition, 'Valid', 'Invalid', { em });
      expect(dataCondition.getDataValue()).toBe('Valid');
    });

    test('should evaluate logical operators with multiple data sources', () => {
      const dataSource2 = {
        id: 'SECOND_DATASOURCE_ID',
        records: [{ id: 'RECORD_2', status: 'active', age: 22 }],
      };
      dsm.add(dataSource2);

      const logicGroup: LogicGroupProps = {
        logicalOperator: LogicalOperation.and,
        statements: [
          {
            left: { type: DataVariableType, path: 'USER_STATUS_SOURCE.USER_1.status' },
            operator: GenericOperation.equals,
            right: 'active',
          },
          {
            left: { type: DataVariableType, path: 'SECOND_DATASOURCE_ID.RECORD_2.age' },
            operator: NumberOperation.greaterThan,
            right: 18,
          },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'All conditions met', 'Some conditions failed', { em });
      expect(dataCondition.getDataValue()).toBe('All conditions met');
    });

    test('should handle nested logical conditions with data variables', () => {
      const logicGroup: LogicGroupProps = {
        logicalOperator: LogicalOperation.or,
        statements: [
          {
            logicalOperator: LogicalOperation.and,
            statements: [
              {
                left: { type: DataVariableType, path: 'USER_STATUS_SOURCE.USER_2.status' },
                operator: GenericOperation.equals,
                right: 'inactive',
              },
              {
                left: { type: DataVariableType, path: 'USER_STATUS_SOURCE.USER_2.age' },
                operator: NumberOperation.lessThan,
                right: 14,
              },
            ],
          },
          {
            left: { type: DataVariableType, path: 'USER_STATUS_SOURCE.USER_1.status' },
            operator: GenericOperation.equals,
            right: 'inactive',
          },
        ],
      };

      const dataCondition = new DataCondition(logicGroup, 'Condition met', 'Condition failed', { em });
      expect(dataCondition.getDataValue()).toBe('Condition met');
    });

    test('should handle data variables as an ifTrue return value', () => {
      const dataCondition = new DataCondition(
        true,
        { type: DataVariableType, path: 'USER_STATUS_SOURCE.USER_1.status' },
        'No',
        { em },
      );
      expect(dataCondition.getDataValue()).toBe('active');
    });

    test('should handle data variables as an ifFalse return value', () => {
      const dataCondition = new DataCondition(
        false,
        'Yes',
        { type: DataVariableType, path: 'USER_STATUS_SOURCE.USER_1.status' },
        { em },
      );
      expect(dataCondition.getDataValue()).toBe('active');
    });
  });
});
