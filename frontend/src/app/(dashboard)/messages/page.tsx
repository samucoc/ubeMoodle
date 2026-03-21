'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  PenSquare,
  Loader2,
  Search,
  Check,
  CheckCheck,
  MessageSquare,
} from 'lucide-react';
import api from '@/lib/api';
import { showToast } from '@/lib/swal';
import { useAuthStore } from '@/store/auth.store';

interface Conversation {
  id: number;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

interface Message {
  id: number;
  text: string;
  senderId: number;
  senderName: string;
  createdAt: string;
  isRead: boolean;
}

export default function MessagesPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState('');

  const { data: conversations, isLoading: convsLoading } = useQuery<Conversation[]>({
    queryKey: ['messages', 'conversations'],
    queryFn: async () => {
      const res = await api.get('/messages/conversations');
      return res.data;
    },
  });

  const { data: messages, isLoading: msgsLoading } = useQuery<Message[]>({
    queryKey: ['messages', 'thread', selectedConversation],
    queryFn: async () => {
      const res = await api.get(`/messages/conversations/${selectedConversation}`);
      return res.data;
    },
    enabled: !!selectedConversation,
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      await api.post(`/messages/conversations/${selectedConversation}/send`, {
        text,
      });
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({
        queryKey: ['messages', 'thread', selectedConversation],
      });
      queryClient.invalidateQueries({
        queryKey: ['messages', 'conversations'],
      });
    },
    onError: () => {
      showToast.error('Failed to send message');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      await api.post(`/messages/conversations/${conversationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] });
    },
  });

  const handleSelectConversation = (id: number) => {
    setSelectedConversation(id);
    const conv = conversations?.find((c) => c.id === id);
    if (conv && conv.unreadCount > 0) {
      markReadMutation.mutate(id);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    sendMutation.mutate(newMessage.trim());
  };

  const selectedConv = conversations?.find((c) => c.id === selectedConversation);

  const filteredConversations = conversations?.filter((c) =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Messages
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Chat with your classmates and teachers
          </p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <PenSquare className="h-4 w-4" />
          Compose
        </button>
      </div>

      <div className="flex h-[calc(100vh-260px)] overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* Conversation List */}
        <div
          className={`w-full flex-shrink-0 border-r border-gray-200 dark:border-gray-800 sm:w-80 ${
            selectedConversation ? 'hidden sm:block' : ''
          }`}
        >
          {/* Search */}
          <div className="border-b border-gray-200 p-3 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ height: 'calc(100% - 57px)' }}>
            {convsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : filteredConversations && filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    selectedConversation === conv.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/30'
                      : ''
                  }`}
                >
                  {conv.participantAvatar ? (
                    <img
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      className="h-10 w-10 flex-shrink-0 rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      {conv.participantName[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`truncate text-sm ${
                          conv.unreadCount > 0
                            ? 'font-semibold text-gray-900 dark:text-white'
                            : 'font-medium text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {conv.participantName}
                      </p>
                      <span className="ml-2 flex-shrink-0 text-xs text-gray-400">
                        {new Date(conv.lastMessageDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No conversations
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div
          className={`flex flex-1 flex-col ${
            !selectedConversation ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {selectedConversation && selectedConv ? (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-500 sm:hidden"
                >
                  ←
                </button>
                {selectedConv.participantAvatar ? (
                  <img
                    src={selectedConv.participantAvatar}
                    alt={selectedConv.participantName}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    {selectedConv.participantName[0]}
                  </div>
                )}
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedConv.participantName}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMine = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                            isMine
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                              isMine
                                ? 'text-indigo-200'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {isMine &&
                              (msg.isRead ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center py-12 text-sm text-gray-500 dark:text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>

              {/* Send */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-800"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendMutation.isPending}
                  className="rounded-lg bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center">
              <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Select a conversation to start messaging
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              New Message
            </h3>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                showToast.success('Message sent!');
                setShowCompose(false);
                setComposeRecipient('');
              }}
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recipient
                </label>
                <input
                  type="text"
                  value={composeRecipient}
                  onChange={(e) => setComposeRecipient(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Search for a user..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Type your message..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
