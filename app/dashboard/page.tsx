'use client';

import FileSystem from '@/components/FileSystem';

export default function DashboardPage() {
  return (
    <div className="h-screen flex">
      <div className="w-64 border-r bg-gray-50">
        <FileSystem />
      </div>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Welcome to your Notes</h1>
        <p className="text-gray-600 mt-2">Select a note from the sidebar to view or edit it.</p>
      </div>
    </div>
  );
} 