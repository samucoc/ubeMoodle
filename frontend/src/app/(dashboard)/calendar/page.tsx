'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import api from '@/lib/api';

interface CalendarEvent {
  id: number;
  name: string;
  description?: string;
  date: string;
  type: 'course' | 'site' | 'user' | 'assignment' | 'quiz';
  courseName?: string;
}

const eventColors: Record<string, string> = {
  course: 'bg-blue-500',
  site: 'bg-purple-500',
  user: 'bg-green-500',
  assignment: 'bg-orange-500',
  quiz: 'bg-red-500',
};

const eventBgColors: Record<string, string> = {
  course: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  site: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  user: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  assignment: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  quiz: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [view, setView] = useState<'month' | 'week'>('month');
  const [showAddModal, setShowAddModal] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data: events, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ['calendar', 'events', year, month],
    queryFn: async () => {
      const res = await api.get('/calendar/events', {
        params: { year, month: month + 1 },
      });
      return res.data;
    },
  });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events?.forEach((event) => {
      const dateKey = new Date(event.date).toISOString().split('T')[0];
      const list = map.get(dateKey) ?? [];
      list.push(event);
      map.set(dateKey, list);
    });
    return map;
  }, [events]);

  // Month view calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Week view
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, []);

  const navigateMonth = (dir: number) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getDateKey = (date: Date) => date.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Calendar
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Track events, deadlines, and activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 text-sm font-medium transition ${
                view === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              } rounded-l-lg`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 text-sm font-medium transition ${
                view === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              } rounded-r-lg`}
            >
              Week
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      {view === 'month' && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : view === 'month' ? (
        /* Month View Grid */
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
            {DAYS.map((day) => (
              <div
                key={day}
                className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((item, idx) => {
              const dateKey = getDateKey(item.date);
              const dayEvents = eventsByDate.get(dateKey) ?? [];
              return (
                <div
                  key={idx}
                  className={`min-h-[100px] border-b border-r border-gray-100 p-2 dark:border-gray-800 ${
                    !item.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50' : ''
                  }`}
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                      isToday(item.date)
                        ? 'bg-indigo-600 font-semibold text-white'
                        : item.isCurrentMonth
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {item.date.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className={`truncate rounded px-1.5 py-0.5 text-xs font-medium ${
                          eventBgColors[ev.type] ?? eventBgColors.course
                        }`}
                        title={ev.name}
                      >
                        {ev.name}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="px-1.5 text-xs text-gray-500 dark:text-gray-400">
                        +{dayEvents.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Week View */
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-7">
            {weekDays.map((date) => {
              const dateKey = getDateKey(date);
              const dayEvents = eventsByDate.get(dateKey) ?? [];
              return (
                <div
                  key={dateKey}
                  className="min-h-[300px] border-r border-gray-100 p-3 last:border-r-0 dark:border-gray-800"
                >
                  <div className="mb-3 text-center">
                    <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      {DAYS[date.getDay()]}
                    </p>
                    <p
                      className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        isToday(date)
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {date.getDate()}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={`rounded-lg p-2 text-xs ${
                          eventBgColors[ev.type] ?? eventBgColors.course
                        }`}
                      >
                        <p className="font-medium">{ev.name}</p>
                        <p className="mt-0.5 opacity-75">
                          {new Date(ev.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {Object.entries(eventColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${color}`} />
            <span className="text-xs capitalize text-gray-600 dark:text-gray-400">
              {type}
            </span>
          </div>
        ))}
      </div>

      {/* Add Event Modal (simplified) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Event
            </h3>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setShowAddModal(false);
              }}
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter event name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </label>
                <select className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  <option value="user">Personal</option>
                  <option value="course">Course</option>
                  <option value="site">Site</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
