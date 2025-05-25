// Base interface for both folders and blocks
export interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'block';
}

// Composite node (Folder)
export interface Folder extends TreeNode {
  type: 'folder';
  children: (Folder | Block)[];
}

// Leaf node (Block)
export interface Block extends TreeNode {
  type: 'block';
  content: string;
  contentType: 'text' | 'audio' | 'image' | 'pdf';
}

// Type guard functions
export function isFolder(node: TreeNode): node is Folder {
  return node.type === 'folder';
}

export function isBlock(node: TreeNode): node is Block {
  return node.type === 'block';
}

// Helper type for the tree structure
export type FileSystemNode = Folder | Block;

// Response types
export interface TreeResponse {
  folders: Folder[];
  blocks: Block[];
  error?: string;
}

export interface FolderResponse {
  folder?: Folder;
  error?: string;
}

export interface BlockResponse {
  block?: Block;
  error?: string;
} 