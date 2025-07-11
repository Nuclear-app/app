import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Block as BlockType } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface BlockProps {
  block: BlockType;
  onUpdate?: (updatedBlock: BlockType) => void;
}

export default function Block({ block, onUpdate }: BlockProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/block/${block.id}`);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <CardHeader>
        <CardTitle className="text-lg">{block.title}</CardTitle>
        <CardDescription>
          Created {new Date(block.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Block</Badge>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">
            Root level
          </span>
        </div>
      </CardContent>
    </Card>
  );
}