'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  GraduationCap,
  FolderOpen,
  UserPlus,
  PlusCircle,
  Settings,
  Loader2,
  Shield,
  Activity,
  Clock,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { showToast } from '@/lib/swal';

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCategories: number;
  activeUsers: number;
}

interface RecentActivity {
  id: number;
  action: string;
  userName: string;
  targetName?: string;
  createdAt: string;
  type: 'user' | 'course' | 'enrollment' | 'system';
}

const ADMIN_ROLES = ['admin', 'manager', 'siteadmin'];

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const isAdmin = user?.roles?.some((r: string) => ADMIN_ROLES.includes(r));

  useEffect(() => {
    if (user && !isAdmin) {
      showToast.error('You do not have permission to access this page.');
      router.replace('/dashboard');
    }
  }, [user, isAdmin, router]);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data;
    },
    enabled: !!isAdmin,
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery<
    RecentActivity[]
  >({
    queryKey: ['admin', 'recent-activity'],
    queryFn: async () => {
      const res = await api.get('/admin/recent-activity');
      return res.data;
    },
    enabled: !!isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Access restricted to administrators
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400',
    },
    {
      label: 'Total Courses',
      value: stats?.totalCourses ?? 0,
      icon: BookOpen,
      color: 'text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400',
    },
    {
      label: 'Total Enrollments',
      value: stats?.totalEnrollments ?? 0,
      icon: GraduationCap,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400',
    },
    {
      label: 'Active Users',
      value: stats?.activeUsers ?? 0,
      icon: Activity,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-950 dark:text-orange-400',
    },
  ];

  const quickActions = [
    {
      label: 'Create User',
      description: 'Add a new user account',
      icon: UserPlus,
      href: '/admin/users/create',
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400',
    },
    {
      label: 'Create Course',
      description: 'Set up a new course',
      icon: PlusCircle,
      href: '/admin/courses/create',
      color: 'text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400',
    },
    {
      label: 'Manage Categories',
      description: 'Organize course categories',
      icon: FolderOpen,
      href: '/admin/categories',
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400',
    },
    {
      label: 'Site Settings',
      description: 'Configure system settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
    },
  ];

  const activityIcons: Record<string, React.ElementType> = {
    user: Users,
    course: BookOpen,
    enrollment: GraduationCap,
    system: Settings,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Manage your platform overview and settings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
                {statsLoading ? (
                  <Loader2 className="mt-1 h-5 w-5 animate-spin text-gray-400" />
                ) : (
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value.toLocaleString()}
                  </p>
                )}
              </div>
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
              >
                <div className={`rounded-lg p-2.5 ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {action.label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {activityLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {recentActivity.map((activity) => {
                  const Icon = activityIcons[activity.type] ?? Activity;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 px-6 py-4"
                    >
                      <div className="mt-0.5 rounded-lg bg-gray-100 p-2 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">{activity.userName}</span>{' '}
                          {activity.action}
                          {activity.targetName && (
                            <>
                              {' '}
                              <span className="font-medium">
                                {activity.targetName}
                              </span>
                            </>
                          )}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(activity.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Activity className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No recent activity
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
