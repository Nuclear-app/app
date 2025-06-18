import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimePoints(blockId: string) {
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    const fetchInitialPoints = async () => {
      try {
        const { data, error } = await supabase
          .from('Block')
          .select('points')
          .eq('id', blockId)
          .single();

        if (error) throw error;
        setPoints(data?.points || 0);
      } catch (error) {
        console.error('Error fetching initial points:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      // Subscribe to changes on the Block table
      channel = supabase
        .channel(`block-points-${blockId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'Block',
            filter: `id=eq.${blockId}`,
          },
          (payload) => {
            console.log('Points updated in real-time:', payload);
            const newPoints = payload.new.points;
            setPoints(newPoints || 0);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'PointsUpdate',
            filter: `blockId=eq.${blockId}`,
          },
          (payload) => {
            console.log('Points update record created:', payload);
            // Fetch the latest points from Block table
            fetchInitialPoints();
          }
        )
        .subscribe();

      return channel;
    };

    fetchInitialPoints();
    channel = setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [blockId, supabase]);

  return { points, isLoading };
} 