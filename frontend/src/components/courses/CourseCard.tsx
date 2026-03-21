import React from 'react';
import Link from 'next/link';
import { Users, BookOpen } from 'lucide-react';
import { Course } from '@/types';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { truncateText } from '@/lib/utils';

export interface CourseCardProps {
  course: Course;
  progress?: number;
  studentsCount?: number;
}

export default function CourseCard({
  course,
  progress,
  studentsCount,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
        {/* Image header */}
        <div className="relative h-40 overflow-hidden">
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.fullName}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <BookOpen className="h-12 w-12 text-white/80" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {course.category && (
              <Badge variant="primary">{course.category.name}</Badge>
            )}
            <Badge variant="info">{course.format}</Badge>
          </div>

          <h3 className="mb-1 text-base font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
            {course.fullName}
          </h3>

          {course.summary && (
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              {truncateText(course.summary, 80)}
            </p>
          )}

          {/* Progress bar (if enrolled) */}
          {progress !== undefined && (
            <div className="mb-3">
              <ProgressBar value={progress} size="sm" showLabel />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
            {studentsCount !== undefined && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Users className="h-3.5 w-3.5" />
                <span>{studentsCount} estudiantes</span>
              </div>
            )}
            {course.shortName && (
              <span className="text-xs font-medium text-gray-400">
                {course.shortName}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
