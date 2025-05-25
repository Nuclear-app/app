'use client';

import FileSystem from '@/components/FileSystem';

export default function DashboardPage() {
  return (
    <div className="h-screen flex">
      <div className="w-64 border-r">
        <FileSystem />
      </div>
    </div>
  );
} 