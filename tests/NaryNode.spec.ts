import { expect } from 'chai';
import 'mocha';
import { stub, assert } from 'sinon';

import { NaryNode, NULL_NODE } from '../src/NaryNode';

describe('tests NaryNode', () => {
  const mockChildKey = 'items';
  const rawNestedNode = {
    label: '1',
    [mockChildKey]: [{
      label: '1-1',
      [mockChildKey]: [{
        label: '1-1-1'
      }, {
        label: '1-1-2'
      }]
    }, {
      label: '1-2',
      [mockChildKey]: [{
        label: '1-2-1'
      }]
    }]
  };

  it('has no children', () => {
    const rawNode = {
      label: '1'
    };
    const node = new NaryNode<any>(rawNode);
    expect(node.prev).to.equal(NULL_NODE);
    expect(node.children.length).to.equal(0);
    expect(node.value).to.equal(rawNode);
  });

  it('has fully nested children', () => {
    
    const node = new NaryNode<any>(rawNestedNode, mockChildKey);
    expect(node.prev).to.equal(NULL_NODE);
    expect(node.value).to.equal(rawNestedNode);

    const [child11, child12] = node.children;
    expect(child11.prev.value.label).to.equal(rawNestedNode.label);
    expect(child11.children.length).to.equal(2);
    expect(child11.value.label).to.equal(rawNestedNode[mockChildKey][0].label);
    expect(child12.prev.value.label).to.equal(rawNestedNode.label);
    expect(child12.children.length).to.equal(1);
    expect(child12.value.label).to.equal(rawNestedNode[mockChildKey][1].label);

    const [child111, child112] = child11.children;
    expect(child111.prev.value.label).to.equal(child11.value.label);
    expect(child111.children.length).to.equal(0);
    expect(child111.value.label).to.equal(child11.children[0].value.label);
    expect(child112.prev.value.label).to.equal(child11.value.label);
    expect(child112.children.length).to.equal(0);
    expect(child112.value.label).to.equal(child11.children[1].value.label);

    const [child121] = child12.children;
    expect(child121.prev.value.label).to.equal(child12.value.label);
    expect(child121.children.length).to.equal(0);
    expect(child121.value.label).to.equal(child12.children[0].value.label);
  });

  describe('tests deepFindRecurse()', () => {
    const node = new NaryNode<any>(rawNestedNode, mockChildKey);
    const valueKey = 'label';

    it('should find the target value', () => {
      const targetValue = '1-1-1';
      expect(node.deepFindRecurse(node, targetValue, { valueKey }).value).to.equal(rawNestedNode[mockChildKey][0][mockChildKey][0]);
    });

    it('should not find the target value', () => {
      const targetValue = '6-1-1';
      expect(node.deepFindRecurse(node, targetValue, { valueKey })).to.equal(null);
    });
  });

  it('tests deepFind()', () => {
    const node = new NaryNode<any>(rawNestedNode, mockChildKey);
    const targetValue = 55;
    const valueKey = 'label';
    const recurseSpy = stub(node, 'deepFindRecurse');
    node.deepFind(targetValue, { valueKey });

    assert.calledWithExactly(recurseSpy, node, targetValue, { valueKey });
  });

  describe('tests equals', () => {
    let equals: boolean = false;
    describe('should be equal', () => {
      afterEach(() => {
        expect(equals).to.equal(true);
      });
      
      it('are both null', () => {
        equals = NaryNode.equals<any>(null, null);
      });

      it('are both undefined', () => {
        equals = NaryNode.equals<any>(undefined, undefined);
      });

      it('has one undefined one null', () => {
        equals = NaryNode.equals<any>(undefined, null);
      });

      it('both have the same reference', () => {
        const n1 = new NaryNode({});
        equals = NaryNode.equals<any>(n1, n1);
      });

      it('both have the same value per json string', () => {
        const n1 = new NaryNode({ label: 'THING' });
        const n2 = new NaryNode({ label: 'THING'});
        equals = NaryNode.equals<any>(n1, n2);
      });
    });

    describe('should not be equal', () => {
      afterEach(() => {
        expect(equals).to.equal(false);
      });

      it('one is null other is an obj', () => {
        const n1 = new NaryNode({});
        equals = NaryNode.equals<any>(n1, null);
      });

      it('one is undefined other is an obj', () => {
        const n1 = new NaryNode({});
        equals = NaryNode.equals<any>(n1, undefined);
      });

      it('two different values', () => {
        const n1 = new NaryNode({ label: 'THING' });
        const n2 = new NaryNode({ label: 'THING2'});
        equals = NaryNode.equals<any>(n1, n2);
      });
    });
  });
});