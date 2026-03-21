import { useAuthStore } from '@/store/auth.store';
import { RoleType } from '@/types';

/**
 * Custom auth hook that re-exports useAuthStore with additional
 * convenience helpers for role checking.
 */
export function useAuth() {
  const store = useAuthStore();

  const hasRole = (role: RoleType | string): boolean => {
    return store.user?.roles?.includes(role) ?? false;
  };

  const isAdmin = hasRole(RoleType.ADMIN);
  const isManager = hasRole(RoleType.MANAGER);
  const isTeacher =
    hasRole(RoleType.TEACHER) || hasRole(RoleType.TEACHING_ASSISTANT);
  const isStudent = hasRole(RoleType.STUDENT);
  const isCourseCreator = hasRole(RoleType.COURSE_CREATOR);

  return {
    ...store,
    hasRole,
    isAdmin,
    isManager,
    isTeacher,
    isStudent,
    isCourseCreator,
  };
}

export default useAuth;
