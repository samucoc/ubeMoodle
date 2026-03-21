'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/store/auth.store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

interface SocketNotification {
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

type NotificationHandler = (notification: SocketNotification) => void;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef<Set<NotificationHandler>>(new Set());
  const { isAuthenticated } = useAuthStore();

  const onNotification = useCallback((handler: NotificationHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  const joinCourse = useCallback((courseId: string) => {
    socketRef.current?.emit('join-course', courseId);
  }, []);

  const leaveCourse = useCallback((courseId: string) => {
    socketRef.current?.emit('leave-course', courseId);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const token = Cookies.get('accessToken');
    if (!token) return;

    const socket = io(`${WS_URL}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('notification', (payload: SocketNotification) => {
      handlersRef.current.forEach((handler) => handler(payload));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  return { isConnected, onNotification, joinCourse, leaveCourse };
}
