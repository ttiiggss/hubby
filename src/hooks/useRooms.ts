import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { parseRoomEvent, type Room } from '@/lib/roomUtils';

/**
 * Fetch all public rooms
 */
export function useRooms() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['rooms'],
    queryFn: async ({ signal }) => {
      const events = await nostr.query(
        [
          {
            kinds: [12347],
            limit: 100,
          },
        ],
        { signal }
      );

      const rooms = events
        .map((event) => parseRoomEvent(event))
        .filter((room): room is Room => room !== null)
        .sort((a, b) => b.updatedAt - a.updatedAt);

      return rooms;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Fetch a specific room by author and room ID
 */
export function useRoom(authorPubkey: string, roomId: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['room', authorPubkey, roomId],
    queryFn: async ({ signal }) => {
      const events = await nostr.query(
        [
          {
            kinds: [12347],
            authors: [authorPubkey],
            '#d': [roomId],
            limit: 1,
          },
        ],
        { signal }
      );

      if (events.length === 0) {
        return null;
      }

      const room = parseRoomEvent(events[0]);
      return room;
    },
    enabled: !!authorPubkey && !!roomId,
    staleTime: 60000, // 1 minute
  });
}
