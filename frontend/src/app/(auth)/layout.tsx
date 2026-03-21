'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950" />

      {/* Logo */}
      <div className="relative z-10 mb-8 flex items-center gap-2">
        <GraduationCap className="h-10 w-10 text-indigo-600" />
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          MoodleNext
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
