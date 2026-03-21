/**
 * Utility to sanitize dynamic column names used in ORDER BY clauses.
 * Prevents SQL injection through sortBy parameters.
 */

const COMMON_SORTABLE_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'id',
]);

const ENTITY_SORTABLE_FIELDS: Record<string, Set<string>> = {
  course: new Set([
    ...COMMON_SORTABLE_FIELDS,
    'fullName',
    'shortName',
    'startDate',
    'endDate',
    'visibility',
    'isFeatured',
  ]),
  user: new Set([
    ...COMMON_SORTABLE_FIELDS,
    'username',
    'email',
    'firstName',
    'lastName',
    'isActive',
    'lastLogin',
  ]),
  enrollment: new Set([
    ...COMMON_SORTABLE_FIELDS,
    'enrolledAt',
    'status',
    'progress',
    'lastAccessed',
    'completedAt',
  ]),
  grade: new Set([
    ...COMMON_SORTABLE_FIELDS,
    'grade',
    'percentage',
    'status',
    'gradedAt',
    'submittedAt',
  ]),
  activity: new Set([
    ...COMMON_SORTABLE_FIELDS,
    'name',
    'type',
    'section',
    'sortOrder',
    'dueDate',
    'isVisible',
  ]),
  message: new Set([
    ...COMMON_SORTABLE_FIELDS,
    'status',
    'subject',
    'readAt',
  ]),
  category: new Set([
    ...COMMON_SORTABLE_FIELDS,
    'name',
    'sortOrder',
    'isVisible',
    'courseCount',
  ]),
  calendar: new Set([
    ...COMMON_SORTABLE_FIELDS,
    'title',
    'startTime',
    'endTime',
    'eventType',
    'isVisible',
  ]),
  file: new Set([
    ...COMMON_SORTABLE_FIELDS,
    'originalName',
    'mimeType',
    'size',
  ]),
};

/**
 * Validates and sanitizes a sortBy field name against allowed columns for an entity.
 * Returns the validated field or the default if invalid.
 */
export function sanitizeSortBy(
  entity: string,
  sortBy: string | undefined,
  defaultField: string = 'createdAt',
): string {
  if (!sortBy) return defaultField;

  const allowedFields = ENTITY_SORTABLE_FIELDS[entity];
  if (!allowedFields) return defaultField;

  return allowedFields.has(sortBy) ? sortBy : defaultField;
}

/**
 * Validates sort order is ASC or DESC only.
 */
export function sanitizeSortOrder(sortOrder?: string): 'ASC' | 'DESC' {
  if (sortOrder === 'ASC' || sortOrder === 'DESC') return sortOrder;
  return 'DESC';
}
