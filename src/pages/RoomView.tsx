import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Share2, Settings, Info, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRoom } from '@/hooks/useRooms';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { genUserName } from '@/lib/genUserName';
import { LoginArea } from '@/components/auth/LoginArea';

export function RoomView() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  // Parse room ID which is in format "pubkey:roomSlug"
  const roomParts = roomId?.split(':');
  const authorPubkey = roomParts?.[0];
  const roomSlug = roomParts?.[1];

  const { data: room, isLoading: isLoadingRoom } = useRoom(authorPubkey || '', roomSlug || '');
  const { data: author } = useAuthor(authorPubkey || '');

  if (isLoadingRoom) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-white">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
        <Card className="max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏚️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Room Not Found</h2>
            <p className="text-gray-400 mb-6">
              This room doesn't exist or may have been removed.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const authorName = author?.metadata?.name || genUserName(room.author);
  const authorImage = author?.metadata?.picture;
  const initials = authorName.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">{room.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Avatar className="h-5 w-5">
                <AvatarImage src={authorImage} />
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <span>by {authorName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="h-4 w-4" />
            <span>Active: 0</span>
          </div>

          {room.tags.length > 0 && (
            <div className="flex gap-1">
              {room.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-purple-600/20 text-purple-200">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            title="Share room"
          >
            <Share2 className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            title="Chat"
            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {user && user.pubkey === room.author && (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              title="Room settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* Room Info Card */}
        <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20 flex-1">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex gap-6">
              {room.image && (
                <div className="hidden md:block shrink-0">
                  <img
                    src={room.image}
                    alt={room.title}
                    className="h-32 w-32 rounded-xl object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">About this space</h3>
                  <p className="text-sm text-gray-300">{room.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      <span>Room Type: {room.scene.roomType || 'Social'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Max Users: {room.scene.maxUsers || 20}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Background: {room.scene.backgroundColor || '#1a1a2e'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {room.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-purple-500/30 text-purple-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Area - Currently Disabled */}
        <div className={`transition-all duration-300 ${isChatCollapsed ? 'hidden' : 'w-96 bg-black/40 backdrop-blur-sm border-purple-500/20 rounded-xl'}`}>
          <div className="flex h-full items-center justify-center p-6 text-center">
            <MessageSquare className="h-16 w-16 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Chat</h3>
            <p className="text-gray-400 mb-4">
              Chat is temporarily disabled while we resolve technical issues.
            </p>
            <div className="text-sm text-gray-500">
              Room ID: <code className="bg-gray-800 px-2 py-1 rounded">{room.id}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Login Prompt for Non-Logged-In Users */}
      {!user && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur-sm p-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <p className="text-gray-300">
              🎮 Join the conversation! Log in to chat and interact in spaces.
            </p>
            <LoginArea className="shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
}
