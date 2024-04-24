type StandardMerkleTreeData<T extends any[]> = {
    format: 'standard-v1';
    tree: string[];
    values: {
      value: T;
      treeIndex: number;
    }[];
    leafEncoding: string[];
  }
  
export type AidropMerkleTreeData = StandardMerkleTreeData<string[]>;