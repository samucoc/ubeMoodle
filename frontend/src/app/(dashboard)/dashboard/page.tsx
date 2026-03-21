'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  BookOpen,
  BarChart3,
  ClipboardList,
  MessageSquare,
  Calendar,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

interface DashboardStats {
  enrolledCourses: number;
  averageGrade: number;
  pendingActivities: number;
  unreadMessages: number;
}

interface RecentCourse {
  id: number;
  fullName: string;
  shortName: string;
  image?: string;
  progress: number;
}

interface UpcomingEvent {
  id: number;
  name: string;
  date: string;
  type: string;
  courseName?: string;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data;
    },
  });

  const { data: recentCourses, isLoading: coursesLoading } = useQuery<RecentCourse[]>({
    queryKey: ['dashboard', 'recent-courses'],
    queryFn: async () => {
      const res = await api.get('/dashboard/recent-courses');
      return res.data;
    },
  });

  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery<UpcomingEvent[]>({
    queryKey: ['dashboard', 'upcoming-events'],
    queryFn: async () => {
      const res = await api.get('/dashboard/upcoming-events');
      return res.data;
    },
  });

  const statCards = [
    {
      label: 'Enrolled Courses',
      value: stats?.enrolledCourses ?? 0,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400',
    },
    {
      label: 'Average Grade',
      value: stats?.averageGrade != null ? `${stats.averageGrade.toFixed(1)}%` : '—',
      icon: BarChart3,
      color: 'text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400',
    },
    {
      label: 'Pending Activities',
      value: stats?.pendingActivities ?? 0,
      icon: ClipboardList,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-950 dark:text-orange-400',
    },
    {
      label: 'Messages',
      value: stats?.unreadMessages ?? 0,
      icon: MessageSquare,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Welcome back, {user?.firstName ?? 'Student'}! 👋
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Here&apos;s what&apos;s happening with your courses today.
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
                    {card.value}
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
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Recent Courses
              </h2>
              <Link
                href="/courses"
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {coursesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : recentCourses && recentCourses.length > 0 ? (
                recentCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900 dark:text-white">
                        {course.fullName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {course.shortName}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-indigo-600"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                        {course.progress}%
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  No courses yet.{' '}
                  <Link href="/courses" className="text-indigo-600 hover:underline">
                    Browse courses
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Upcoming Events
              </h2>
              <Link
                href="/calendar"
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Calendar <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {eventsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : upcomingEvents && upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {event.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {event.courseName && (
                          <p className="mt-0.5 text-xs text-indigo-600 dark:text-indigo-400">
                            {event.courseName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  No upcoming events
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
