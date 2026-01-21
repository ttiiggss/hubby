import type { RoomMessage } from '@/types/rooms';

/**
 * Parse room messages (both permanent kind 1 and ephemeral kind 30000)
 * Returns properly typed messages with expiration information for ephemeral messages
 */
export function parseRoomMessages(events: unknown[], roomEventId: string): RoomMessage[] {
  if (!events || !Array.isArray(events)) {
    return [];
  }

  return events
    .map((event): RoomMessage => {
      const id = event.id;
      const pubkey = event.pubkey;
      const content = event.content;
      const created_at = event.created_at;
      const kind = event.kind;

      // Check if ephemeral message (kind 30000)
      const isEphemeral = kind === 30000;
      
      // Extract expiration time from tags
      let expiration: Date | undefined = undefined;
      const expirationTag = event.tags.find(([name]) => name === 'expiration');
      if (expirationTag && expirationTag[1]) {
        expiration = new Date(parseInt(expirationTag[1]) * 1000);
      }

      // Check if this is an ephemeral chat message (references room)
      const isEphemeralChat = event.tags.some(([name, value]) => 
        name === 'e' && value === roomEventId
      );

      return {
        id,
        pubkey,
        content,
        created_at,
        kind,
        isEphemeral,
        isEphemeralChat,
        expiration,
        tags: event.tags,
      };
    });
}

/**
 * Generate a unique ephemeral room ID
 * Creates an ephemeral identifier that won't conflict with other room events
 */
export function generateEphemeralId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `ephem-${timestamp}-${random}`;
}

/**
 * Create room event tags (for both permanent and ephemeral messages)
 * Returns properly formatted tag arrays
 */
export function createRoomEventTags(
  roomEventId: string,
  isEphemeral?: boolean,
  tags?: string[]
): string[][] {
  const eventTags = [
    ['e', generateEphemeralId(), 'wss://relay.ditto.pub', 'root'],
  ];

  if (isEphemeral) {
    // Add ephemeral-specific tags
    eventTags.push(['ephemeral', 'true']); // Ephemeral marker
    eventTags.push(['expiration', Date.now().toString()]); // Auto-expire in 24 hours (default)
  }

  if (tags && tags.length > 0) {
    // Add custom tags
    tags.forEach((tag) => {
      eventTags.push(['t', tag]);
    });
  }

  return eventTags;
}
