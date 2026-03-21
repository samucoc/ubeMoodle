import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Course,
  CreateCourseRequest,
  PaginatedResponse,
  PaginationParams,
  ApiResponse,
} from '@/types';

// ─── Query keys ──────────────────────────────────────────────────────────────
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated list of courses.
 */
export function useCourses(
  params: PaginationParams = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<Course>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PaginatedResponse<Course>>({
    queryKey: courseKeys.list(params),
    queryFn: () => api.get<PaginatedResponse<Course>>('/courses', params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

/**
 * Prefetch the next page of courses into the query cache.
 */
export function usePrefetchNextCoursePage(currentParams: PaginationParams) {
  const queryClient = useQueryClient();

  return (nextPage: number) => {
    const nextParams = { ...currentParams, page: nextPage };
    queryClient.prefetchQuery({
      queryKey: courseKeys.list(nextParams),
      queryFn: () => api.get<PaginatedResponse<Course>>('/courses', nextParams),
      staleTime: 2 * 60 * 1000,
    });
  };
}

/**
 * Fetch a single course by id.
 */
export function useCourse(
  id: string,
  options?: Omit<UseQueryOptions<Course>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<Course>({
    queryKey: courseKeys.detail(id),
    queryFn: () => api.get<Course>(`/courses/${id}`),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new course.
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Course>, Error, CreateCourseRequest>({
    mutationFn: (data) => api.post<ApiResponse<Course>>('/courses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Update an existing course.
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Course>,
    Error,
    { id: string; data: Partial<CreateCourseRequest> }
  >({
    mutationFn: ({ id, data }) =>
      api.put<ApiResponse<Course>>(`/courses/${id}`, data),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: courseKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Delete a course.
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: (id) => api.delete<ApiResponse<void>>(`/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}
