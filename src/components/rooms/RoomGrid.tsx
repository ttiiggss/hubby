import { RoomCard } from './RoomCard';
import type { Room } from '@/types/rooms';
import { Skeleton } from '@/components/ui/skeleton';

interface RoomGridProps {
  rooms: Room[];
  isLoading?: boolean;
}

export function RoomGrid({ rooms, isLoading }: RoomGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
        <div className="mb-4 text-6xl">🏠</div>
        <h3 className="mb-2 text-xl font-semibold text-white">No rooms yet</h3>
        <p className="max-w-md text-gray-400">
          Be the first to create a space! Start your own room and invite others to join.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}
