import { Operator } from '.';

export enum StringOperation {
  contains = 'contains',
  startsWith = 'startsWith',
  endsWith = 'endsWith',
  matchesRegex = 'matchesRegex',
  equalsIgnoreCase = 'equalsIgnoreCase',
  trimEquals = 'trimEquals',
}

export class StringOperator extends Operator {
  constructor(private operator: StringOperation) {
    super();
  }

  evaluate(left: string, right: string) {
    switch (this.operator) {
      case StringOperation.contains:
        return left.includes(right);
      case StringOperation.startsWith:
        return left.startsWith(right);
      case StringOperation.endsWith:
        return left.endsWith(right);
      case StringOperation.matchesRegex:
        if (!right) throw new Error('Regex pattern must be provided.');
        return new RegExp(right).test(left);
      case StringOperation.equalsIgnoreCase:
        return left.toLowerCase() === right.toLowerCase();
      case StringOperation.trimEquals:
        return left.trim() === right.trim();
      default:
        throw new Error(`Unsupported string operator: ${this.operator}`);
    }
  }
}
