import { useState, useRef, useEffect } from 'react';
import { Send, Minimize2, Maximize2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NoteContent } from '@/components/NoteContent';
import { useRoomMessages } from '@/hooks/useRoomMessages';
import { usePublishRoomMessage } from '@/hooks/useRoomPublish';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { genUserName } from '@/lib/genUserName';
import { formatDistanceToNow } from 'date-fns';
import type { RoomMessage } from '@/types/rooms';

interface RoomChatProps {
  roomEventId: string;
  roomId: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function RoomChat({ roomEventId, roomId, isCollapsed = false, onToggleCollapse }: RoomChatProps) {
  const { user } = useCurrentUser();
  const { data: messages = [], isLoading } = useRoomMessages(roomEventId);
  const { mutate: publishMessage, isPending } = usePublishRoomMessage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && !isLoading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = () => {
    if (!message.trim() || !user) return;

    publishMessage(
      {
        roomEventId,
        content: message.trim(),
      },
      {
        onSuccess: () => {
          setMessage('');
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 shadow-lg hover:bg-purple-700 transition-all hover:scale-110"
      >
        <Maximize2 className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-sm border border-purple-500/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div>
          <h3 className="font-semibold text-white">Chat</h3>
          <p className="text-sm text-gray-400">{messages.length} messages</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-white"
        >
          <Minimize2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
                    <div className="h-16 w-3/4 animate-pulse rounded bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <p className="text-gray-400">No messages yet</p>
              <p className="text-sm text-gray-500">Be the first to say something!</p>
            </div>
          ) : (
            messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={user ? 'Type a message...' : 'Log in to chat...'}
            disabled={!user || isPending}
            className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !user || isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageItem({ message }: { message: RoomMessage }) {
  const { data: author } = useAuthor(message.pubkey);
  const authorName = author?.metadata?.name || genUserName(message.pubkey);
  const authorImage = author?.metadata?.picture;
  const initials = authorName.substring(0, 2).toUpperCase();

  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={authorImage} />
        <AvatarFallback className="bg-purple-600 text-white">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{authorName}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.created_at * 1000), { addSuffix: true })}
          </span>
        </div>
        <div className="rounded-lg bg-white/5 p-3 text-sm text-gray-200">
          <NoteContent event={message} className="text-sm" />
        </div>
      </div>
    </div>
  );
}
