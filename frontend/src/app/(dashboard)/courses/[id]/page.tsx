'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Users,
  BarChart3,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Loader2,
  UserPlus,
  Play,
  HelpCircle,
  Link2,
} from 'lucide-react';
import api from '@/lib/api';
import { showToast } from '@/lib/swal';

interface CourseDetail {
  id: number;
  fullName: string;
  shortName: string;
  summary: string;
  image?: string;
  teacherName?: string;
  teacherAvatar?: string;
  isEnrolled: boolean;
  startDate?: string;
  endDate?: string;
}

interface Section {
  id: number;
  name: string;
  summary?: string;
  position: number;
  activities: ActivityItem[];
}

interface ActivityItem {
  id: number;
  name: string;
  type: string;
  dueDate?: string;
  completed?: boolean;
}

interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: string;
}

interface GradeItem {
  id: number;
  activityName: string;
  grade?: number;
  maxGrade: number;
  percentage?: number;
}

const activityIcons: Record<string, React.ElementType> = {
  assignment: FileText,
  quiz: HelpCircle,
  forum: MessageSquare,
  resource: Link2,
  url: Link2,
  video: Play,
};

type TabKey = 'content' | 'participants' | 'grades';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('content');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const { data: course, isLoading: courseLoading } = useQuery<CourseDetail>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await api.get(`/courses/${courseId}`);
      return res.data;
    },
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: ['course', courseId, 'sections'],
    queryFn: async () => {
      const res = await api.get(`/courses/${courseId}/sections`);
      return res.data;
    },
    enabled: activeTab === 'content',
  });

  const { data: participants, isLoading: participantsLoading } = useQuery<Participant[]>({
    queryKey: ['course', courseId, 'participants'],
    queryFn: async () => {
      const res = await api.get(`/courses/${courseId}/participants`);
      return res.data;
    },
    enabled: activeTab === 'participants',
  });

  const { data: grades, isLoading: gradesLoading } = useQuery<GradeItem[]>({
    queryKey: ['course', courseId, 'grades'],
    queryFn: async () => {
      const res = await api.get(`/courses/${courseId}/grades`);
      return res.data;
    },
    enabled: activeTab === 'grades',
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/courses/${courseId}/enrol`);
    },
    onSuccess: () => {
      showToast.success('Successfully enrolled in the course!');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
    onError: () => {
      showToast.error('Failed to enroll. Please try again.');
    },
  });

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'content', label: 'Content', icon: BookOpen },
    { key: 'participants', label: 'Participants', icon: Users },
    { key: 'grades', label: 'Grades', icon: BarChart3 },
  ];

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 sm:h-56">
          {course.image && (
            <img
              src={course.image}
              alt={course.fullName}
              className="h-full w-full object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {course.fullName}
              </h1>
              <p className="mt-1 text-sm text-white/80">{course.shortName}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            {course.teacherAvatar ? (
              <img
                src={course.teacherAvatar}
                alt={course.teacherName}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {course.teacherName ?? 'Instructor'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Teacher</p>
            </div>
          </div>
          {!course.isEnrolled && (
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={enrollMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {enrollMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Enroll in Course
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'content' && (
        <div className="space-y-3">
          {sectionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : sections && sections.length > 0 ? (
            sections.map((section) => (
              <div
                key={section.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {section.name}
                  </span>
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has(section.id) && (
                  <div className="border-t border-gray-200 dark:border-gray-800">
                    {section.activities.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {section.activities.map((activity) => {
                          const Icon = activityIcons[activity.type] ?? FileText;
                          return (
                            <div
                              key={activity.id}
                              className="flex items-center gap-4 px-6 py-3"
                            >
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {activity.name}
                                </p>
                                {activity.dueDate && (
                                  <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    Due{' '}
                                    {new Date(activity.dueDate).toLocaleDateString(
                                      'en-US',
                                      {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      },
                                    )}
                                  </p>
                                )}
                              </div>
                              {activity.completed && (
                                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        No activities in this section
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No content available yet
            </div>
          )}
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {participantsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : participants && participants.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                  {p.avatar ? (
                    <img
                      src={p.avatar}
                      alt={`${p.firstName} ${p.lastName}`}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {p.firstName[0]}
                      {p.lastName[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {p.email}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {p.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No participants yet
            </div>
          )}
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {gradesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : grades && grades.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {grades.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.activityName}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">
                      {item.grade != null
                        ? `${item.grade} / ${item.maxGrade}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.percentage != null ? (
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.percentage >= 70
                              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                              : item.percentage >= 50
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                          }`}
                        >
                          {item.percentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No grades available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
