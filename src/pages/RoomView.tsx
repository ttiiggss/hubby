import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Share2, Settings, Info } from 'lucide-react';
import { RoomScene } from '@/components/rooms/RoomScene';
import { RoomChat } from '@/components/rooms/RoomChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRoom } from '@/hooks/useRooms';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { genUserName } from '@/lib/genUserName';
import { LoginArea } from '@/components/auth/LoginArea';
import type { UserPosition } from '@/types/rooms';

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
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-white">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex h-screen items-center justify-center">
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
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
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
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <Users className="h-4 w-4" />
            <span>0/{room.scene.maxUsers || 20}</span>
          </div>

          {room.tags.length > 0 && (
            <div className="hidden md:flex gap-1">
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
        {/* Room Info & 3D Scene */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Room Info Card */}
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
            <CardContent className="p-6">
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
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white mb-1">About this space</h3>
                    <p className="text-sm text-gray-300">{room.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {room.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-purple-500/30 text-purple-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      <span>Room Type: {room.scene.roomType || 'Social'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3D Scene */}
          <Card className="flex-1 bg-black/40 backdrop-blur-sm border-purple-500/20 overflow-hidden">
            <CardContent className="h-full p-0">
              <RoomScene
                room={room}
                users={[]}
                currentUserPubkey={user?.pubkey}
              />
            </CardContent>
          </Card>
        </div>

        {/* Chat Sidebar */}
        <div className={`transition-all duration-300 ${isChatCollapsed ? 'hidden' : 'w-96 flex'}`}>
          <RoomChat
            roomEventId={room.eventId}
            roomId={room.id}
            isCollapsed={isChatCollapsed}
            onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
          />
        </div>
      </div>

      {/* Login Prompt for Non-Logged-In Users */}
      {!user && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur-sm p-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <p className="text-gray-300">
              🎮 Join the conversation! Log in to chat and interact in 3D spaces.
            </p>
            <LoginArea className="shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
}
