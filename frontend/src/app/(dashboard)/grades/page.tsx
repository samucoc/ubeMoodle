'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronRight,
  BarChart3,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import api from '@/lib/api';

interface CourseGrade {
  courseId: number;
  courseName: string;
  courseShortName: string;
  overallGrade?: number;
  overallPercentage?: number;
  items: GradeItem[];
}

interface GradeItem {
  id: number;
  activityName: string;
  activityType: string;
  grade?: number;
  maxGrade: number;
  percentage?: number;
  gradedDate?: string;
}

export default function GradesPage() {
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

  const { data: courseGrades, isLoading } = useQuery<CourseGrade[]>({
    queryKey: ['grades', 'overview'],
    queryFn: async () => {
      const res = await api.get('/grades/overview');
      return res.data;
    },
  });

  const toggleCourse = (courseId: number) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const overallAverage =
    courseGrades && courseGrades.length > 0
      ? courseGrades.reduce(
          (sum, c) => sum + (c.overallPercentage ?? 0),
          0,
        ) / courseGrades.filter((c) => c.overallPercentage != null).length
      : null;

  const getGradeColor = (percentage?: number) => {
    if (percentage == null) return 'text-gray-400';
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeBadge = (percentage?: number) => {
    if (percentage == null) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    if (percentage >= 80) return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400';
    if (percentage >= 40) return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400';
    return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400';
  };

  const getProgressWidth = (percentage?: number) => {
    return percentage != null ? `${Math.min(100, Math.max(0, percentage))}%` : '0%';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Grades
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          View your grades across all enrolled courses
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Overall Average
              </p>
              {isLoading ? (
                <Loader2 className="mt-1 h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <p className={`mt-1 text-3xl font-bold ${getGradeColor(overallAverage ?? undefined)}`}>
                  {overallAverage != null ? `${overallAverage.toFixed(1)}%` : '—'}
                </p>
              )}
            </div>
            <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Courses Graded
              </p>
              {isLoading ? (
                <Loader2 className="mt-1 h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {courseGrades?.filter((c) => c.overallPercentage != null).length ?? 0}
                </p>
              )}
            </div>
            <div className="rounded-lg bg-green-100 p-3 text-green-600 dark:bg-green-950 dark:text-green-400">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Activities
              </p>
              {isLoading ? (
                <Loader2 className="mt-1 h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {courseGrades?.reduce((sum, c) => sum + c.items.length, 0) ?? 0}
                </p>
              )}
            </div>
            <div className="rounded-lg bg-purple-100 p-3 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : courseGrades && courseGrades.length > 0 ? (
        <div className="space-y-3">
          {courseGrades.map((course) => (
            <div
              key={course.courseId}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Course Row */}
              <button
                onClick={() => toggleCourse(course.courseId)}
                className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex-shrink-0">
                  {expandedCourses.has(course.courseId) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {course.courseName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {course.courseShortName} · {course.items.length} activities
                  </p>
                </div>
                {/* Progress bar */}
                <div className="hidden w-40 sm:block">
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (course.overallPercentage ?? 0) >= 70
                          ? 'bg-green-500'
                          : (course.overallPercentage ?? 0) >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{
                        width: getProgressWidth(course.overallPercentage),
                      }}
                    />
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${getGradeBadge(
                    course.overallPercentage,
                  )}`}
                >
                  {course.overallPercentage != null
                    ? `${course.overallPercentage.toFixed(1)}%`
                    : '—'}
                </span>
              </button>

              {/* Expanded: Per-activity Grades */}
              {expandedCourses.has(course.courseId) && (
                <div className="border-t border-gray-200 dark:border-gray-800">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Activity
                        </th>
                        <th className="px-6 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Type
                        </th>
                        <th className="px-6 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Grade
                        </th>
                        <th className="px-6 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Percentage
                        </th>
                        <th className="hidden px-6 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:table-cell">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {course.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                            {item.activityName}
                          </td>
                          <td className="px-6 py-3 text-sm capitalize text-gray-500 dark:text-gray-400">
                            {item.activityType}
                          </td>
                          <td className="px-6 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                            {item.grade != null
                              ? `${item.grade} / ${item.maxGrade}`
                              : '—'}
                          </td>
                          <td className="px-6 py-3 text-right">
                            {item.percentage != null ? (
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getGradeBadge(
                                  item.percentage,
                                )}`}
                              >
                                {item.percentage.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="hidden px-6 py-3 text-right text-sm text-gray-500 dark:text-gray-400 sm:table-cell">
                            {item.gradedDate
                              ? new Date(item.gradedDate).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                  },
                                )
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 dark:border-gray-800 dark:bg-gray-900">
          <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            No grades available yet
          </p>
        </div>
      )}
    </div>
  );
}
