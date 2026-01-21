import { useState, useRef, useEffect } from 'react';
import { Send, Clock, Flame, Shield } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NoteContent } from '@/components/NoteContent';
import { useRoomMessages } from '@/hooks/useRoomMessages';
import { usePublishEphemeralMessage } from '@/hooks/usePublishEphemeralMessage';
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
  const { mutate: publishPermanentMessage, isPending: isPublishingPermanent } = useNostrPublish();
  const { mutate: publishEphemeral, isPending: isPublishingEphemeral } = usePublishEphemeralMessage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [isEphemeralMode, setIsEphemeralMode] = useState(false);
  const [expirationHours, setExpirationHours] = useState(24);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && !isLoading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = () => {
    if (!message.trim() || !user) return;

    if (isEphemeralMode) {
      // Send ephemeral message
      publishEphemeral(
        {
          roomEventId,
          content: message.trim(),
          mentionedUsers: [],
          expiresIn: expirationHours,
        },
        {
          onSuccess: () => {
            setMessage('');
          },
          onError: (error) => {
            // Handle the error
            console.error('Failed to send ephemeral message:', error);
          },
        }
      );
    } else {
      // Send permanent message
      publishPermanentMessage(
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage();
    }
  };

  const isPublishing = isPublishingPermanent || isPublishingEphemeral;

  return (
    <div className="flex h-full flex-col rounded-xl bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-purple-500/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Chat</h3>
          <p className="text-sm text-gray-400">{messages.length} messages</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Ephemeral Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
            <Flame className={`h-4 w-4 transition-colors ${isEphemeralMode ? 'text-orange-500' : 'text-gray-400'}`} />
            <button
              type="button"
              onClick={() => setIsEphemeralMode(!isEphemeralMode)}
              className={`text-sm font-medium transition-colors ${isEphemeralMode ? 'text-orange-300 hover:text-orange-200' : 'text-gray-300 hover:text-gray-200'}`}
            >
              {isEphemeralMode ? 'Ephemeral Mode' : 'Permanent Mode'}
            </button>
          </div>

          {/* Expiration Time (only for ephemeral mode) */}
          {isEphemeralMode && (
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-2">
              <Clock className={`h-4 w-4 ${isEphemeralMode ? 'text-orange-500' : 'text-gray-400'}`} />
              <select
                value={expirationHours.toString()}
                onChange={(e) => setExpirationHours(parseInt(e.target.value))}
                className="bg-transparent text-sm text-white border-none focus:outline-none cursor-pointer"
              >
                <option value="1">1 Hour</option>
                <option value="6">6 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">1 Day</option>
                <option value="72">3 Days</option>
                <option value="168">1 Week</option>
              </select>
              <span className="text-xs text-gray-400 ml-2">
                {isEphemeralMode && '🔥 Temporary' || '💬 Permanent'}
              </span>
            </div>
          )}

          {isCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="text-gray-400 hover:text-white"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 custom-scrollbar">
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-600" />
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-500" />
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
            messages.map((msg: RoomMessage) => {
              const authorName = msg.author?.metadata?.name || genUserName(msg.pubkey);
              const authorImage = msg.author?.metadata?.picture;
              const initials = authorName.substring(0, 2).toUpperCase();
              const timeAgo = formatDistanceToNow(new Date(msg.created_at * 1000), { addSuffix: true });

              return (
                <div key={msg.id} className="flex gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={authorImage} />
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{authorName}</span>
                      <span className="text-xs text-gray-400">{timeAgo}</span>
                    </div>
                    <div className={`rounded-lg p-3 ${msg.isEphemeral ? 'bg-orange-900/30 border-orange-500/30' : 'bg-white/5'}`}>
                      <div className="flex items-start gap-2">
                        {msg.isEphemeral && (
                          <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <NoteContent event={msg} className="text-sm" />
                        </div>
                      </div>
                      {msg.expiration && (
                        <div className="mt-2 text-xs text-orange-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires in {expirationHours > 24 ? `${Math.floor(expirationHours / 24)} days` : `${expirationHours} hours`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-white/10 p-4 bg-gray-800/50">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={user ? (isEphemeralMode ? 'Send ephemeral message...' : 'Type a message...') : 'Log in to chat...'}
            disabled={!user || isPublishing}
            className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !user || isPublishing}
            className={isEphemeralMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'}
          >
            {isPublishing ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-600/30 border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
