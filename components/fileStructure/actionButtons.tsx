import { Button } from "../ui/button";
import { Plus } from 'lucide-react';

interface ActionButtonsProps {
    setIsCreatingNew: (value: boolean) => void;
    setNewItemType: (type: 'folder' | 'block') => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ setIsCreatingNew, setNewItemType }) => {
    return (
        <div className="flex items-center gap-2 p-2 border-b">
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setIsCreatingNew(true);
                    setNewItemType('folder');
                }}
            >
                <Plus size={16} className="mr-1.5" />
                New Folder
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setIsCreatingNew(true);
                    setNewItemType('block');
                }}
            >
                <Plus size={16} className="mr-1.5" />
                New Block
            </Button>
        </div>
    );
};

export default ActionButtons;