import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { parseRoomMessages, type RoomMessage } from '@/lib/roomUtils';

/**
 * Fetch messages for a specific room
 */
export function useRoomMessages(roomEventId: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['room-messages', roomEventId],
    queryFn: async ({ signal }) => {
      const events = await nostr.query(
        [
          {
            kinds: [1],
            '#e': [roomEventId],
            limit: 100,
          },
        ],
        { signal }
      );

      const messages = parseRoomMessages(events, roomEventId);
      return messages;
    },
    enabled: !!roomEventId,
    refetchInterval: 10000, // Poll every 10 seconds for new messages
    staleTime: 5000,
  });
}

/**
 * Infinite scroll for room messages
 */
export function useInfiniteRoomMessages(roomEventId: string) {
  const { nostr } = useNostr();

  return useInfiniteQuery({
    queryKey: ['room-messages-infinite', roomEventId],
    queryFn: async ({ signal, pageParam }) => {
      const events = await nostr.query(
        [
          {
            kinds: [1],
            '#e': [roomEventId],
            until: pageParam,
            limit: 50,
          },
        ],
        { signal }
      );

      const messages = parseRoomMessages(events, roomEventId);
      return messages;
    },
    initialPageParam: Math.floor(Date.now() / 1000),
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      const oldestEvent = lastPage[0];
      return oldestEvent.created_at - 1;
    },
    enabled: !!roomEventId,
  });
}
