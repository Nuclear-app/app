import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getPointsAction } from '@/lib/blockFetch';

export function useRealtimePoints(blockId: string) {
  const [points, setPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    const fetchInitialPoints = async () => {
      try {
        const cachedPoints = await getPointsAction(blockId);
        setPoints(cachedPoints);
      } catch (error) {
        console.error('Error fetching initial points:', error);
        // Fallback to direct Supabase query if server action fails
        try {
          const { data, error } = await supabase
            .from('Block')
            .select('points')
            .eq('id', blockId)
            .single();

          if (error) throw error;
          setPoints(data?.points || 0);
        } catch (fallbackError) {
          console.error('Error in fallback points fetch:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      // Subscribe to changes on the PointsUpdate table
      // This will trigger when new point updates are created
      channel = supabase
        .channel(`block-points-${blockId}`)
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
            // Fetch the latest points from server action (which uses cache)
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