// ============================================
// User Types
// ============================================
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  lang: string;
  timezone: string | null;
  bio: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin: string | null;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: RoleType;
  displayName: string;
  description: string;
  permissions: string[];
}

export enum RoleType {
  ADMIN = 'admin',
  MANAGER = 'manager',
  COURSE_CREATOR = 'course_creator',
  TEACHER = 'teacher',
  TEACHING_ASSISTANT = 'teaching_assistant',
  STUDENT = 'student',
  GUEST = 'guest',
}

// ============================================
// Auth Types
// ============================================
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  avatarUrl: string | null;
}

export interface LoginRequest {
  identity: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  country?: string;
  lang?: string;
}

// ============================================
// Course Types
// ============================================
export interface Course {
  id: string;
  fullName: string;
  shortName: string;
  summary: string | null;
  format: CourseFormat;
  visibility: CourseVisibility;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  maxStudents: number;
  selfEnrollment: boolean;
  numSections: number;
  showGrades: boolean;
  isFeatured: boolean;
  category: Category | null;
  categoryId: string | null;
  creator: User;
  creatorId: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum CourseFormat {
  TOPICS = 'topics',
  WEEKS = 'weeks',
  SINGLE = 'single',
  SOCIAL = 'social',
}

export enum CourseVisibility {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
}

export interface CreateCourseRequest {
  fullName: string;
  shortName: string;
  summary?: string;
  format?: CourseFormat;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  selfEnrollment?: boolean;
  enrollmentKey?: string;
  numSections?: number;
  imageUrl?: string;
  maxStudents?: number;
}

// ============================================
// Category Types
// ============================================
export interface Category {
  id: string;
  name: string;
  description: string | null;
  idNumber: string | null;
  isVisible: boolean;
  sortOrder: number;
  courseCount: number;
  iconUrl: string | null;
  color: string | null;
  children: Category[];
  parent: Category | null;
  createdAt: string;
}

// ============================================
// Enrollment Types
// ============================================
export interface Enrollment {
  id: string;
  user: User;
  userId: string;
  course: Course;
  courseId: string;
  role: EnrollmentRole;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  expiresAt: string | null;
  progress: number;
  lastAccessed: string | null;
  timeSpent: number;
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum EnrollmentRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  TEACHING_ASSISTANT = 'teaching_assistant',
}

// ============================================
// Activity Types
// ============================================
export interface Activity {
  id: string;
  name: string;
  description: string | null;
  type: ActivityType;
  section: number;
  sortOrder: number;
  isVisible: boolean;
  maxGrade: number | null;
  passGrade: number | null;
  dueDate: string | null;
  availableFrom: string | null;
  availableUntil: string | null;
  allowLateSubmission: boolean;
  maxAttempts: number | null;
  timeLimit: number | null;
  settings: Record<string, any>;
  content: Record<string, any>;
  fileUrls: string[];
  courseId: string;
  createdAt: string;
}

export enum ActivityType {
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
  FORUM = 'forum',
  RESOURCE = 'resource',
  URL = 'url',
  PAGE = 'page',
  LABEL = 'label',
  FOLDER = 'folder',
  VIDEO = 'video',
  LESSON = 'lesson',
  WORKSHOP = 'workshop',
  WIKI = 'wiki',
  GLOSSARY = 'glossary',
  H5P = 'h5p',
}

// ============================================
// Grade Types
// ============================================
export interface Grade {
  id: string;
  userId: string;
  user?: User;
  activityId: string;
  activity?: Activity;
  courseId: string;
  grade: number | null;
  maxGrade: number;
  percentage: number | null;
  letterGrade: string | null;
  status: GradeStatus;
  feedback: string | null;
  gradedBy: string | null;
  gradedAt: string | null;
  submittedAt: string | null;
  attemptNumber: number;
}

export enum GradeStatus {
  PENDING = 'pending',
  GRADED = 'graded',
  RELEASED = 'released',
}

// ============================================
// Calendar Types
// ============================================
export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  eventType: EventType;
  startTime: string;
  endTime: string | null;
  allDay: boolean;
  repeat: EventRepeat;
  color: string;
  location: string | null;
  userId: string | null;
  courseId: string | null;
}

export enum EventType {
  COURSE = 'course',
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
  USER = 'user',
  SITE = 'site',
  EXAM = 'exam',
  HOLIDAY = 'holiday',
}

export enum EventRepeat {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

// ============================================
// Message Types
// ============================================
export interface Message {
  id: string;
  sender: User;
  senderId: string;
  recipient: User;
  recipientId: string;
  subject: string | null;
  body: string;
  bodyFormat: string;
  status: MessageStatus;
  readAt: string | null;
  isNotification: boolean;
  attachments: string[];
  createdAt: string;
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ============================================
// Dashboard Types
// ============================================
export interface DashboardStats {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  averageGrade: number;
  upcomingEvents: CalendarEvent[];
  recentActivities: Activity[];
  enrollmentProgress: { courseId: string; courseName: string; progress: number }[];
}

// ============================================
// Notification Types
// ============================================
export enum NotificationType {
  GRADE = 'grade',
  MESSAGE = 'message',
  ENROLLMENT = 'enrollment',
  COURSE_UPDATE = 'course_update',
  ASSIGNMENT = 'assignment',
  REMINDER = 'reminder',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any> | null;
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  relatedUserId: string | null;
  createdAt: string;
}
