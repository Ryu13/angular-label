import { expect } from 'chai';
import 'mocha';
import { NaryTree } from '../src/NaryTree';
import { NULL_NODE } from '../src/NaryNode';

describe('tests NaryTree', () => {
  const idKey = 'label'; // ties to rawNode
  const referenceKey = 'parent';
  const mockChildKey = 'items';
  const rawNode = {
    [idKey]: '1',
    [mockChildKey]: [{
      [idKey]: '1-1',
      [referenceKey]: '1',
      [mockChildKey]: [{
        [idKey]: '1-1-1',
        [referenceKey]: '1-1'
      }, {
        [idKey]: '1-1-2',
        [referenceKey]: '1-1'
      }]
    }, {
      [idKey]: '1-2',
      [referenceKey]: '1',
      [mockChildKey]: [{
        [idKey]: '1-2-1',
        [referenceKey]: '1-2'
      }]
    }]
  };
  
  let sampleNodes = [
    { [idKey]: 36, [referenceKey]: null },
    { [idKey]: 37, [referenceKey]: 36 },
    { [idKey]: 39, [referenceKey]: 37 },
    { [idKey]: 40, [referenceKey]: 37 },
    { [idKey]: 42, [referenceKey]: 37 },
    { [idKey]: 43, [referenceKey]: 37 },
    { [idKey]: 38, [referenceKey]: 36 },
    { [idKey]: 41, [referenceKey]: 38 },
    { [idKey]: 44, [referenceKey]: 37 },
    { [idKey]: 45, [referenceKey]: 37 }
  ];

  describe('tests constructor', () => {
    it('has 1 root node', () => {
      const tree = new NaryTree<any>({ nestKey: mockChildKey }, rawNode);
      const node = tree.root;
      expect(node.prev).to.equal(NULL_NODE);
      expect(node.value).to.equal(rawNode);
  
      const [child11, child12] = node.children;
      expect(child11.prev.value[idKey]).to.equal(rawNode[idKey]);
      expect(child11.children.length).to.equal(2);
      expect(child11.value[idKey]).to.equal(rawNode[mockChildKey][0][idKey]);
      expect(child12.prev.value[idKey]).to.equal(rawNode[idKey]);
      expect(child12.children.length).to.equal(1);
      expect(child12.value[idKey]).to.equal(rawNode[mockChildKey][1][idKey]);
  
      const [child111, child112] = child11.children;
      expect(child111.prev.value[idKey]).to.equal(child11.value[idKey]);
      expect(child111.children.length).to.equal(0);
      expect(child111.value[idKey]).to.equal(child11.children[0].value[idKey]);
      expect(child112.prev.value[idKey]).to.equal(child11.value[idKey]);
      expect(child112.children.length).to.equal(0);
      expect(child112.value[idKey]).to.equal(child11.children[1].value[idKey]);
  
      const [child121] = child12.children;
      expect(child121.prev.value[idKey]).to.equal(child12.value[idKey]);
      expect(child121.children.length).to.equal(0);
      expect(child121.value[idKey]).to.equal(child12.children[0].value[idKey]);
    });

    it('has multiple root nodes', () => {
      const rawNode1 = sampleNodes[0];
      const rawNode2 = sampleNodes[1];
      const tree = new NaryTree<any>({}, rawNode1, rawNode2);
      const root = tree.root;
      expect(root).to.equal(NULL_NODE);
      expect(root.children.length).to.equal(2);
      const [child1, child2] = root.children;
      expect(child1.value[idKey]).to.equal(rawNode1[idKey]);
      expect(child2.value[idKey]).to.equal(rawNode2[idKey]);
    });

    it('should deep construct', () => {
      const tree = new NaryTree<any>({ idKey, referenceKey }, ...sampleNodes);
      const node = tree.root;
      expect(node.prev).to.equal(NULL_NODE);
      expect(node.value[idKey]).to.equal(36);
  
      const [child11, child12] = node.children;
      expect(child11.prev.value[idKey]).to.equal(36);
      expect(child11.children.length).to.equal(6);
      expect(child11.value[idKey]).to.equal(37);
      expect(child12.prev.value[idKey]).to.equal(36);
      expect(child12.children.length).to.equal(1);
      expect(child12.value[idKey]).to.equal(38);
  
      const [child111, child112, child113, child114, child115, child116] = child11.children;
      expect(child111.prev.value[idKey]).to.equal(37);
      expect(child111.children.length).to.equal(0);
      expect(child111.value[idKey]).to.equal(39);
      expect(child112.prev.value[idKey]).to.equal(37);
      expect(child112.children.length).to.equal(0);
      expect(child112.value[idKey]).to.equal(40);
      expect(child113.prev.value[idKey]).to.equal(37);
      expect(child113.children.length).to.equal(0);
      expect(child113.value[idKey]).to.equal(42);
      expect(child114.prev.value[idKey]).to.equal(37);
      expect(child114.children.length).to.equal(0);
      expect(child114.value[idKey]).to.equal(43);
      expect(child115.prev.value[idKey]).to.equal(37);
      expect(child115.children.length).to.equal(0);
      expect(child115.value[idKey]).to.equal(44);
      expect(child116.prev.value[idKey]).to.equal(37);
      expect(child116.children.length).to.equal(0);
      expect(child116.value[idKey]).to.equal(45);
  
      const [child121] = child12.children;
      expect(child121.prev.value[idKey]).to.equal(38);
      expect(child121.children.length).to.equal(0);
      expect(child121.value[idKey]).to.equal(41);
    });
  });

  it('tests depthTraversal', () => {
    const tree = new NaryTree<any>({ idKey, referenceKey }, ...sampleNodes);
    expect(tree.traverseByDepth().map(n => n.value[idKey])).to.eql([
      36,
        37,
          39,
          40,
          42,
          43,
          44,
          45,
        38,
          41
    ]);
  });

  // assumes idKey and referenceKey are set
  describe('tests deepConstruct()', () => {
    it('tests data that as a single root node', () => {
      const testNodes = [
        ...sampleNodes,
        { [idKey]: 'random-1', [referenceKey]: 45 },
        { [idKey]: 'random-2', [referenceKey]: 41}
      ];
      const tree = new NaryTree<any>({ }, ...testNodes);
      tree.idKey = idKey;
      tree.referenceKey = referenceKey;

      const deepRoot = tree.deepConstruct();
      expect(tree.depthTraversal(deepRoot).map(n => n.value[idKey])).to.eql([
        36,
        37,
          39,
          40,
          42,
          43,
          44,
          45,
            'random-1',
        38,
          41,
            'random-2'
      ]);
    });
    
    it('tests data that has multiple root nodes', () => {
      const testNodes = [
        ...sampleNodes, 
        { [idKey]: 'random-1', [referenceKey]: 45 },
        { [idKey]: 'random-2' }
      ];
      const tree = new NaryTree<any>({  }, ...testNodes);
      tree.idKey = idKey;
      tree.referenceKey = referenceKey;

      const deepRoot = tree.deepConstruct();
      expect(tree.depthTraversal(deepRoot).map(n => n.value[idKey])).to.eql([
        36,
        37,
          39,
          40,
          42,
          43,
          44,
          45,
            'random-1',
        38,
          41,
        'random-2'
      ]);
    });
  });

  describe('tests deepFind', () => {
    it('has a startNode', () => {
      const tree = new NaryTree<any>({ idKey, referenceKey }, ...sampleNodes);
      const startNode = tree.root.children[1];
      const targetValue = 41;
      const valueKey = idKey;
      
      let foundNode = tree.deepFind(startNode, targetValue, { valueKey });
      expect(foundNode.value[valueKey]).to.equal(targetValue);

      foundNode = tree.deepFind(tree.root.children[0], targetValue, { valueKey });
      expect(foundNode).to.equal(null);
    });
  });
});