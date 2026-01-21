import { useMutation } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import {
  createRoomEventTags,
  createRoomMessageTags,
  generateRoomId,
} from '@/lib/roomUtils';
import type { RoomSceneConfig } from '@/types/rooms';

/**
 * Publish a new room
 */
export function usePublishRoom() {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      image?: string;
      scene?: RoomSceneConfig;
      tags?: string[];
    }) => {
      if (!user) {
        throw new Error('You must be logged in to create a room');
      }

      const roomId = generateRoomId();
      const tags = createRoomEventTags(
        roomId,
        data.title,
        data.description,
        data.image,
        data.scene,
        data.tags
      );

      const event = await publishEvent({
        kind: 12347,
        content: data.description,
        tags,
      });

      return { ...event, roomId };
    },
  });
}

/**
 * Update an existing room
 */
export function useUpdateRoom() {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();

  return useMutation({
    mutationFn: async (data: {
      roomId: string;
      title: string;
      description: string;
      image?: string;
      scene?: RoomSceneConfig;
      tags?: string[];
    }) => {
      if (!user) {
        throw new Error('You must be logged in to update a room');
      }

      const tags = createRoomEventTags(
        data.roomId,
        data.title,
        data.description,
        data.image,
        data.scene,
        data.tags
      );

      const event = await publishEvent({
        kind: 12347,
        content: data.description,
        tags,
      });

      return event;
    },
  });
}

/**
 * Publish a message to a room
 */
export function usePublishRoomMessage() {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();

  return useMutation({
    mutationFn: async (data: {
      roomEventId: string;
      content: string;
      mentionedUsers?: string[];
    }) => {
      if (!user) {
        throw new Error('You must be logged in to send messages');
      }

      const tags = createRoomMessageTags(data.roomEventId, data.mentionedUsers);

      const event = await publishEvent({
        kind: 1,
        content: data.content,
        tags,
      });

      return event;
    },
  });
}
