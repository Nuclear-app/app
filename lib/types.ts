// Component Interface
export interface FileSystemComponent {
  getName(): string;
  getSize(): number;
  getParent(): FileSystemComponent | null;
  setParent(parent: FileSystemComponent | null): void;
}

// Leaf Class
export class Block implements FileSystemComponent {
  private name: string;
  private size: number;
  private parent: FileSystemComponent | null = null;

  constructor(name: string, size: number) {
    this.name = name;
    this.size = size;
  }
  getName(): string {
    return this.name;
  }
  getSize(): number {
    return this.size;
  }
  getParent(): FileSystemComponent | null {
    return this.parent;
  }
  setParent(parent: FileSystemComponent | null): void {
    this.parent = parent;
  }
}

// Composite Class
export class Folder implements FileSystemComponent {
  private children: FileSystemComponent[] = [];
  private name: string;
  private parent: FileSystemComponent | null = null;

  constructor(name: string) {
    this.name = name;
  }

  add(component: FileSystemComponent): void {
    this.children.push(component);
    component.setParent(this);
  }

  remove(component: FileSystemComponent): void {
    this.children = this.children.filter(child => child !== component);
    component.setParent(null);
  }

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0);
  }

  getChildren(): FileSystemComponent[] {
    return this.children;
  }

  getParent(): FileSystemComponent | null {
    return this.parent;
  }

  setParent(parent: FileSystemComponent | null): void {
    this.parent = parent;
  }
}

// const block1 = new Block("file1.txt", 2);
// const block2 = new Block("file2.txt", 3);

// const subFolder = new Folder("Sub-1");
// subFolder.add(block1);
// subFolder.add(block2);

// const rootFolder = new Folder("Root");
// rootFolder.add(subFolder);
// rootFolder.add(new Block("file3.txt", 7));

// console.log(`${rootFolder.getName()} Size: ${rootFolder.getSize()} bytes`);

export type FileSystemComponentType = 'file' | 'folder';

export interface FileSystemItem {
  type: FileSystemComponentType;
  name: string;
  size: number;
  children?: FileSystemItem[];
}

export interface TreeResponse {
  id: string;
  name: string;
  type: FileSystemComponentType;
  children?: TreeResponse[];
  content?: any;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export interface FileSystemResponse {
  error?: string;
  folders: Folder[];
  blocks: Block[];
}

export interface CreateFolderResponse {
  error?: string;
  folder: Folder;
}

export interface CreateBlockResponse {
  error?: string;
  block: Block;
}
