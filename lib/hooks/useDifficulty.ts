'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

export function useDifficulty() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchDifficulty = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('difficulty')
          .eq('userId', session.user.id)
          .single();

        if (preferences) {
          setDifficulty(preferences.difficulty as Difficulty);
        } else {
          // Create default preferences if none exist
          await supabase.from('user_preferences').insert({
            userId: session.user.id,
            difficulty: 'medium'
          });
        }
      } catch (error) {
        console.error('Error fetching difficulty:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDifficulty();

    // Subscribe to changes
    const channel = supabase
      .channel('user_preferences_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_preferences',
        filter: `userId=eq.${supabase.auth.user()?.id}`,
      }, (payload) => {
        setDifficulty(payload.new.difficulty);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const updateDifficulty = async (newDifficulty: Difficulty) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase
        .from('user_preferences')
        .update({ difficulty: newDifficulty })
        .eq('userId', session.user.id);

      setDifficulty(newDifficulty);
    } catch (error) {
      console.error('Error updating difficulty:', error);
    }
  };

  return {
    difficulty,
    updateDifficulty,
    loading
  };
} 