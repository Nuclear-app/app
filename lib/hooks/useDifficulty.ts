'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type UserPreferenceChange = RealtimePostgresChangesPayload<{
  userId: string;
  difficulty: string;
}>;

export function useDifficulty() {
  const [difficulty, setDifficulty] = useState<string>('medium');
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchDifficulty = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('difficulty')
        .eq('userId', user.id)
        .single();

      if (error) {
        console.error('Error fetching difficulty:', error);
        return;
      }

      if (data) {
        setDifficulty(data.difficulty);
      }
    };

    fetchDifficulty();

    let channel: RealtimeChannel;
    const setupChannel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('user_preferences_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_preferences',
            filter: `userId=eq.${user.id}`,
          },
          (payload: UserPreferenceChange) => {
            if (payload.new && 'difficulty' in payload.new) {
              setDifficulty(payload.new.difficulty);
            }
          }
        )
        .subscribe();
    };

    setupChannel();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  const updateDifficulty = async (newDifficulty: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        userId: user.id,
        difficulty: newDifficulty,
      });

    if (error) {
      console.error('Error updating difficulty:', error);
      return;
    }

    setDifficulty(newDifficulty);
  };

  return { difficulty, updateDifficulty };
} 