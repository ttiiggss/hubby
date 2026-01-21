import { Link } from 'react-router-dom';
import { Users, MessageCircle, Eye } from 'lucide-react';
import type { Room } from '@/types/rooms';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const { data: author } = useAuthor(room.author);

  const authorName = author?.metadata?.name || genUserName(room.author);
  const authorImage = author?.metadata?.picture;
  const initials = authorName.substring(0, 2).toUpperCase();

  return (
    <Link to={`/room/${encodeURIComponent(room.id)}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1">
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-900/50 to-blue-900/50">
          {room.image ? (
            <img
              src={room.image}
              alt={room.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ backgroundColor: room.scene.backgroundColor || '#1a1a2e' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-3 right-3 flex gap-2">
            {room.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-black/50 text-white backdrop-blur-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="mb-2 text-xl font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
            {room.title}
          </h3>
          <p className="mb-4 text-sm text-gray-400 line-clamp-2">{room.description}</p>

          <div className="flex items-center gap-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarImage src={authorImage} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-gray-300">{authorName}</span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-white/10 p-4">
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Users className="h-4 w-4" />
            <span>0/{room.scene.maxUsers || 20}</span>
          </div>
          <div className="flex gap-3 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>Public</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
