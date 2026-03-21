'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  MessageSquare,
  GraduationCap,
  Users,
  FolderTree,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { cn, getInitials } from '@/lib/utils';
import { RoleType } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Mis Cursos', href: '/courses', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Calendario', href: '/calendar', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Mensajes', href: '/messages', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Calificaciones', href: '/grades', icon: <GraduationCap className="h-5 w-5" /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Usuarios', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Categorías', href: '/admin/categories', icon: <FolderTree className="h-5 w-5" /> },
  { label: 'Administración', href: '/admin', icon: <Settings className="h-5 w-5" /> },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isAdminUser = user?.roles?.includes(RoleType.ADMIN) || user?.roles?.includes(RoleType.MANAGER);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-900',
        isOpen ? 'w-64' : 'w-20',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 flex-shrink-0 text-blue-600" />
          {isOpen && (
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              MoodleNext
            </span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="hidden rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 lg:block"
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {/* Main links */}
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'sidebar-link-active bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
              !isOpen && 'justify-center',
            )}
            title={!isOpen ? item.label : undefined}
          >
            {item.icon}
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Admin section */}
        {isAdminUser && (
          <>
            <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
            {isOpen && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Administración
              </p>
            )}
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'sidebar-link-active bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
                  !isOpen && 'justify-center',
                )}
                title={!isOpen ? item.label : undefined}
              >
                {item.icon}
                {isOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      {user && (
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className={cn('flex items-center gap-3', !isOpen && 'justify-center')}>
            <Avatar
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              fallback={getInitials(user.firstName, user.lastName)}
              size="sm"
            />
            {isOpen && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.firstName} {user.lastName}
                </p>
                <Badge variant="info" className="mt-0.5">
                  {user.roles?.[0] || 'user'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
