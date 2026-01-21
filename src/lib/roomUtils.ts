import type { NostrEvent } from '@nostrify/nostrify';
import type { Room, RoomSceneConfig, RoomMessage } from '@/types/rooms';

/**
 * Parse a room definition event (kind 12347) into a Room object
 */
export function parseRoomEvent(event: NostrEvent): Room | null {
  if (event.kind !== 12347) {
    return null;
  }

  const dTag = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const description = event.tags.find(([name]) => name === 'description')?.[1] || event.content;
  const image = event.tags.find(([name]) => name === 'image')?.[1];
  const sceneTag = event.tags.find(([name]) => name === 'scene')?.[1];
  const tags = event.tags
    .filter(([name]) => name === 't')
    .map(([_, tag]) => tag);

  if (!dTag || !title) {
    return null;
  }

  let scene: RoomSceneConfig = {
    backgroundColor: '#1a1a2e',
    maxUsers: 20,
    isPublic: true,
    roomType: 'social',
  };

  if (sceneTag) {
    try {
      const parsed = JSON.parse(sceneTag);
      scene = { ...scene, ...parsed };
    } catch (e) {
      console.warn('Failed to parse scene config:', sceneTag);
    }
  }

  return {
    id: `${event.pubkey}:${dTag}`,
    eventId: event.id,
    author: event.pubkey,
    title,
    description,
    image,
    scene,
    tags,
    createdAt: event.created_at,
    updatedAt: event.created_at,
  };
}

/**
 * Parse room messages from kind 1 events
 */
export function parseRoomMessages(events: NostrEvent[], roomId: string): RoomMessage[] {
  return events
    .filter((event) => {
      // Check if event references the room
      const eTags = event.tags.filter(([name]) => name === 'e');
      return eTags.some(([_, eventId]) => eventId === roomId);
    })
    .map((event) => ({
      ...event,
      roomId,
    }))
    .sort((a, b) => a.created_at - b.created_at);
}

/**
 * Generate a unique room ID
 */
export function generateRoomId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `room-${timestamp}-${random}`;
}

/**
 * Create room event tags
 */
export function createRoomEventTags(
  roomId: string,
  title: string,
  description: string,
  image?: string,
  scene?: RoomSceneConfig,
  tags?: string[]
) {
  const eventTags: string[][] = [
    ['d', roomId],
    ['title', title],
    ['description', description],
  ];

  if (image) {
    eventTags.push(['image', image]);
  }

  if (scene) {
    eventTags.push(['scene', JSON.stringify(scene)]);
  }

  if (tags && tags.length > 0) {
    tags.forEach((tag) => eventTags.push(['t', tag]));
  }

  return eventTags;
}

/**
 * Create room message event tags
 */
export function createRoomMessageTags(roomEventId: string, mentionedUsers?: string[]) {
  const tags: string[][] = [
    ['e', roomEventId, '', 'root'],
  ];

  if (mentionedUsers && mentionedUsers.length > 0) {
    mentionedUsers.forEach((pubkey) => tags.push(['p', pubkey]));
  }

  return tags;
}
