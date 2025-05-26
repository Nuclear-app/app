import { FileSystemComponent } from "@/lib/types";

interface FileSystemTreeProps {
    root: FileSystemComponent;
    renderTree: (node: FileSystemComponent, level?: number) => React.ReactNode;
}

const FileSystemTree: React.FC<FileSystemTreeProps> = ({ root, renderTree }) => {
    return (
        <div className="flex-1 overflow-auto p-2">
            {renderTree(root)}
        </div>
    );
};

export default FileSystemTree;