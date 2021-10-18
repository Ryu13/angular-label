import { NULL_NODE, NaryNode } from './NaryNode';
import { DEFAULT_CHILD_KEY } from './constants';


export class NaryTree<T> {
    root: NaryNode<T> = NULL_NODE;
    referenceKey: string;
    idKey: string;

    /*
      Param1 is a configuration object specifying:
        valueKey: the key in the list to use as the value for the node
        nestKey: the key that holds the list of any of nodes expected to be its children.

      Expects list of nodes to already be formatted in a nested structure.
      E.g.
      [
        NAME: {
          NEST_KEY: [
            ...
          ]
        }
      ]

      A sample input of 
      [{
        label: 'label1',
        items: [{
          label: 'childLabel1'
        }]
      }, {
        label: 'label2',
        items: [{
          label: 'childLabel2',
          items: [{
            label: 'childChildLabel1'
          }]
        }]
      }]

      new NaryTree({
        valueKey: 'label',
        nestKey: 'items'
      })

      yields a tree of the form

      EMPTY_ROOT
        -> label1
          -> childLabel1
        -> label2
          -> childLabel2
            -> childChildLabel1
    */
    constructor(config, ...nodes: T[]) {
      const {
        nestKey = DEFAULT_CHILD_KEY,
        referenceKey,
        idKey
      } = config;
      this.referenceKey = referenceKey;
      this.idKey = idKey;

      let root: NaryNode<T> = null;
      // multiple roots so we establish an empty root and set these and level 1 children
      
      if (nodes.length !== 1) { 
        root = NULL_NODE;
        root.children = nodes.map(n => new NaryNode(n, nestKey));
      } else { // singular item, treat as root
        root = new NaryNode(nodes[0], nestKey);
      }
      this.root = root;

      if (referenceKey && idKey) {
        this.root = this.deepConstruct();
      }
    }

    traverseByDepth(): NaryNode<T>[] {
      return this.depthTraversal(this.root);
    }

    depthTraversal(node: NaryNode<T>): NaryNode<T>[] {
      let newItems = [];
      newItems.push(node);
      for (const child of node.children) {
        newItems = newItems.concat(this.depthTraversal(child));
      }
      return newItems.filter(n => n.value !== null);
    }

    deepFind(startNode, targetValue, { valueKey }) {
      if (startNode instanceof NaryNode) {
        return startNode.deepFind(targetValue, { valueKey });
      }
      return this.root.deepFind(targetValue, { valueKey });
    }

    deepConstruct(): NaryNode<T> {
      let root: NaryNode<T>;
      // remove any children already existing to prevent cycles
      let flatNodes = this.traverseByDepth().map(node => {
        node.children = [];
        return node;
      });

      const processedMap = {};

      let rootNodes = [];
      for (const node of flatNodes) {
        // if processed, skip
        if (processedMap[node.value[this.idKey]]) {
          continue;
        }
        
        // find all my children, set them to me marking them as processed
        node.children = flatNodes.reduce((run, node2) => {
          if (node2.value[this.referenceKey] && node2.value[this.referenceKey] === node.value[this.idKey]) {
            processedMap[node2.value[this.idKey]] = true;
            node2.prev = node;
            run.push(node2);
          }          
          return run;
        }, []);

        // finally, find my parent (if any), otherwise, set myself as a rootNode
        if (node.value[this.referenceKey]) {
          let foundParent;
          for (const node2 of flatNodes) {
            if (node2.value[this.idKey] === node.value[this.referenceKey]) {
              foundParent = node2;
              break;
            }
          }

          if (foundParent) {
            node.prev = foundParent;
            foundParent.children.push(node);
            processedMap[node.value[this.idKey]] = true;
          } else {
            // with nowhere else to go, assume that target node is intended to be a root node
            rootNodes.push(node);
          }
        } else {
          rootNodes.push(node);
        }
      }

      if (rootNodes.length != 1) {
        root = NULL_NODE;
        root.children = rootNodes;
      } else {
        root = rootNodes[0];
      }

      return root;
    }
}