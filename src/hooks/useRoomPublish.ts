import { useMutation } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
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
      scene: RoomSceneConfig;
      isEphemeral?: boolean;
      expiresIn?: number;
      tags?: string[];
    }) => {
      if (!user) {
        throw new Error('You must be logged in to create a room');
      }

      const roomTags = [
        ['d', generateEphemeralId()],
        ['title', data.title],
        ['description', data.description],
        ['image', data.image || ''],
        ['max_users', data.scene.maxUsers.toString()],
        ['room_type', data.scene.roomType],
        ['background_color', data.scene.backgroundColor],
        ['is_public', 'true'],
      ];

      // Add ephemeral tags if enabled
      if (data.isEphemeral) {
        roomTags.push(['ephemeral', 'true']);
        roomTags.push(['expiration', Date.now().toString()]);
      }

      // Add custom tags if provided
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach((tag) => {
          roomTags.push(['t', tag]);
        });
      }

      const event = await publishEvent({
        kind: 12347,
        content: data.description,
        tags: roomTags,
      });

      return event;
    },
  });
}
