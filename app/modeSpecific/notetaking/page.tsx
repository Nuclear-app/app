'use client'
import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { useSearchParams } from 'next/navigation';

export default function EditorPage() {
  const searchParams = useSearchParams();
  const blockId = searchParams.get('blockId');

  if (!blockId) {
    return <div>No block ID provided</div>;
  }

  return (
    <div className="p-4">
      <TailwindAdvancedEditor blockId={blockId} />
    </div>
  );
}
