import FillInTheBlanks from '@/components/fillInTheBlanks';
import { generateFillInTheBlank } from '@/lib/perplexity';

export default async function Page() {


    return (
        // blockID here is important. One needs to not fuck up with that
        <div>
           <FillInTheBlanks blockID="91382eeb-f5ef-408f-a378-0f16c329f519" />
        </div>
    );
}