import EditorModel from '../../../editor/model/Editor';
import { Condition, ConditionProps } from './Condition';
import { LogicalOperator } from './operators/LogicalOperator';

export class LogicalGroupStatement {
  private em: EditorModel;

  constructor(
    private operator: LogicalOperator,
    private statements: ConditionProps[],
    opts: { em: EditorModel },
  ) {
    this.em = opts.em;
  }

  evaluate(): boolean {
    const results = this.statements.map((statement) => {
      const condition = new Condition(statement, { em: this.em });
      return condition.evaluate();
    });
    return this.operator.evaluate(results);
  }
}
