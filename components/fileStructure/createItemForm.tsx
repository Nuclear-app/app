import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface CreateItemFormProps {
    isCreatingNew: boolean;
    newItemType: 'folder' | 'block';
    newItemName: string;
    setNewItemName: (value: string) => void;
    handleCreateNew: () => void;
    setIsCreatingNew: (value: boolean) => void;
}

const CreateItemForm: React.FC<CreateItemFormProps> = ({
    isCreatingNew,
    newItemType,
    newItemName,
    setNewItemName,
    handleCreateNew,
    setIsCreatingNew,
}) => {
    if (!isCreatingNew) return null;

    return (
        <div className="flex items-center gap-2 p-2 border-b bg-gray-50/50">
            <Input
                className="h-8"
                placeholder={`Enter ${newItemType} name...`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleCreateNew();
                    } else if (e.key === 'Escape') {
                        setIsCreatingNew(false);
                        setNewItemName('');
                    }
                }}
                autoFocus
            />
            <Button size="sm" onClick={handleCreateNew}>
                Create
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsCreatingNew(false)}>
                Cancel
            </Button>
        </div>
    );
};

export default CreateItemForm;