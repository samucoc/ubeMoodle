'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '@/lib/api';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ data: Notification[] }>('/notifications?limit=50');
      const payload = (res as any).data ?? res;
      setNotifications(payload.data ?? payload ?? []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      grade: '📝',
      message: '💬',
      enrollment: '📚',
      course_update: '📢',
      assignment: '📋',
      reminder: '⏰',
      system: '⚙️',
    };
    return iconMap[type] || '🔔';
  };

  const filtered =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Notificaciones
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {unreadCount > 0
              ? `${unreadCount} sin leer`
              : 'Todas leídas'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            filter === 'all'
              ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
          )}
        >
          Todas ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            filter === 'unread'
              ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-gray-100'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
          )}
        >
          Sin leer ({unreadCount})
        </button>
      </div>

      {/* Notifications list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <Bell className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">
              {filter === 'unread'
                ? 'No tienes notificaciones sin leer'
                : 'No tienes notificaciones'}
            </p>
          </div>
        ) : (
          filtered.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'group flex items-start gap-4 rounded-xl border border-gray-200 p-4 transition-colors dark:border-gray-700',
                notification.isRead
                  ? 'bg-white dark:bg-gray-800'
                  : 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10',
              )}
            >
              <span className="mt-0.5 text-2xl">
                {getTypeIcon(notification.type)}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm',
                    notification.isRead
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'font-semibold text-gray-900 dark:text-gray-100',
                  )}
                >
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
                    title="Marcar como leída"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
