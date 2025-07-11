"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Block } from '@/lib/types';
import { Crate } from '@/lib/types';
import { loadData } from '@/lib/loadData';
import { useRouter } from 'next/navigation';

interface DashboardProps {
  initialBlocks?: Block[];
  initialCrates?: Crate[];
}

export default function Dashboard({ initialBlocks = [], initialCrates = [] }: DashboardProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [crates, setCrates] = useState<Crate[]>(initialCrates);
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<'blocks' | 'crates'>>(new Set(['blocks', 'crates'] as const));
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await loadData({ types: selectedTypes });
        setBlocks(result.blocks);
        setCrates(result.crates);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTypes]);

  const handleBlockClick = (blockId: string) => {
    router.push(`/dashboard/block/${blockId}`);
  };

  const handleCrateClick = (crateId: string) => {
    router.push(`/dashboard/crate/${crateId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push('/dashboard/block/new')}>
          Create New Block
        </Button>
      </div>

      <Tabs defaultValue="blocks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blocks">Blocks ({blocks.length})</TabsTrigger>
          <TabsTrigger value="crates">Crates ({crates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks.map((block) => (
              <Card 
                key={block.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleBlockClick(block.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{block.title}</CardTitle>
                  <CardDescription>
                    Created {new Date(block.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Block</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crates.map((crate) => (
              <Card 
                key={crate.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCrateClick(crate.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{crate.name}</CardTitle>
                  <CardDescription>
                    Created {new Date(crate.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{crate.icon}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}