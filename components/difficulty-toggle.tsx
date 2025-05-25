'use client';

import { useEffect, useState } from 'react';
import { getMode, setMode } from '@/app/actions';
import { Mode, type Difficulty } from '@/app/types';

export default function DifficultyToggle() {
  const [difficulty, setDifficulty] = useState<Difficulty>(Mode.MEDIUM);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of difficulty
    const fetchDifficulty = async () => {
      try {
        const currentMode = await getMode();
        setDifficulty(currentMode);
      } catch (error) {
        console.error('Error fetching difficulty:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDifficulty();
  }, []);

  const cycleDifficulty = async () => {
    const difficulties: Difficulty[] = [Mode.EASY, Mode.MEDIUM, Mode.HARD];
    const currentIndex = difficulties.indexOf(difficulty);
    const nextDifficulty = difficulties[(currentIndex + 1) % difficulties.length];

    try {
      await setMode(nextDifficulty);
      setDifficulty(nextDifficulty);
    } catch (error) {
      console.error('Error updating difficulty:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const displayText = difficulty.charAt(0) + difficulty.slice(1).toLowerCase();

  return (
    <button
      onClick={cycleDifficulty}
      type="button"
      className={`px-4 py-2 rounded-md font-medium transition-colors
        ${difficulty === Mode.EASY ? 'bg-[#4CAF50] text-white' : ''}
        ${difficulty === Mode.MEDIUM ? 'bg-[#00D3BE] text-white' : ''}
        ${difficulty === Mode.HARD ? 'bg-[#FF4444] text-white' : ''}
      `}
    >
      {displayText} Mode
    </button>
  );
} 