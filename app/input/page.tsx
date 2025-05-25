import FillInTheBlanks from '@/components/fillInTheBlanks';
import { generateFillInTheBlank } from '@/lib/perplexity';
import { getDifficulty } from '@/components/difficulty-toggle';

export default function Page() {
    // You can now use getDifficulty() directly here if needed
    // const currentDifficulty = getDifficulty();
    
    return (
        // blockID here is important. One needs to not fuck up with that
        //Hello from the other side
        <div>
           <FillInTheBlanks blockID="91382eeb-f5ef-408f-a378-0f16c329f519" />
           <div>//  Add difficulty display here</div>
        </div>
    );
}