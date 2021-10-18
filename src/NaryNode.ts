import { DEFAULT_CHILD_KEY } from './constants';

export class NaryNode<T> {
  isNull: boolean = false;
  prev: NaryNode<T> = NULL_NODE;
  children: NaryNode<T>[] = [];
  value: T = null;

  constructor(_value: T, childKey = DEFAULT_CHILD_KEY) {
    this.value = _value;
    this.children = (_value && _value[childKey] || []).map((rawChild: T) => {
      const newNode = new NaryNode(rawChild, childKey);
      newNode.prev = this;
      return newNode;
    });
  }

  deepFind(targetValue: any, { valueKey }): NaryNode<T> {
    return this.deepFindRecurse(this, targetValue, { valueKey });
  }

  deepFindRecurse(node: NaryNode<T>, targetValue: any, { valueKey }): NaryNode<T> {
    const val = valueKey ? node.value && node.value[valueKey] : node.value;
    if (val === targetValue) {
      return node;
    }
    for (const child of node.children) {
      const childResult = this.deepFindRecurse(child, targetValue, { valueKey });
      if (childResult) {
        return childResult;
      }
    }

    return null;
  }

  static equals<T>(n1: NaryNode<T>, n2: NaryNode<T>) {
    return !!(n1 == null && n2 == null 
      || n1 === n2 
      || (
        n1 && n2 && n1.value && n2.value && JSON.stringify(n1.value) === JSON.stringify(n2.value)
      ))
    ;
  }
}

// avoids circular dependency issue
export class NullNode extends NaryNode<any> {
  constructor() {
    super(null);
    this.isNull = true;
    this.prev = this;
    this.children = [];
  }
}

export const NULL_NODE = new NullNode();