import { useMutation } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import type { RoomSceneConfig } from '@/types/rooms';

interface PublishEphemeralMessageParams {
  roomEventId: string;
  content: string;
  mentionedUsers?: string[];
  expiresIn?: number; // hours
}

/**
 * Publish an ephemeral message (NIP-59, kind 30000) to a room
 * These messages are temporary and disappear after a set time
 */
export function usePublishEphemeralMessage() {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();

  return useMutation({
    mutationFn: async ({ roomEventId, content, mentionedUsers, expiresIn = 24 }: PublishEphemeralMessageParams) => {
      if (!user) {
        throw new Error('You must be logged in to send ephemeral messages');
      }

      const expirationTime = Math.floor(Date.now() / 1000) + (expiresIn || 24) * 3600; // Convert to seconds

      const tags = [
        ['e', roomEventId, 'wss://relay.ditto.pub', 'root'],
        ['expiration', expirationTime.toString()],
      ];

      if (mentionedUsers && mentionedUsers.length > 0) {
        mentionedUsers.forEach((pubkey) => {
          tags.push(['p', pubkey]);
        });
      }

      const event = await publishEvent({
        kind: 30000,
        content,
        tags,
      });

      return event;
    },
  });
}

/**
 * Hook to publish ephemeral room announcements
 * Useful for notifications like "User joined", "User left", etc.
 */
export function usePublishEphemeralAnnouncement() {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();

  return useMutation({
    mutationFn: async ({ roomEventId, content, expiresIn = 1 }: PublishEphemeralMessageParams) => {
      if (!user) {
        throw new Error('You must be logged in to send ephemeral announcements');
      }

      const expirationTime = Math.floor(Date.now() / 1000) + (expiresIn || 1) * 3600;

      const event = await publishEvent({
        kind: 30000,
        content,
        tags: [
          ['e', roomEventId, 'wss://relay.ditto.pub', 'root'],
          ['expiration', expirationTime.toString()],
        ],
      });

      return event;
    },
  });
}

/**
 * Publish ephemeral room event (for presence indicators like "typing", "entered room", etc.)
 */
export function usePublishRoomActivity() {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();

  return useMutation({
    mutationFn: async ({ roomEventId, activity, expiresIn = 1 }: { roomEventId: string; activity: string; expiresIn?: number }) => {
      if (!user) {
        throw new Error('You must be logged in to publish room activity');
      }

      const expirationTime = Math.floor(Date.now() / 1000) + (expiresIn || 1) * 3600;

      const event = await publishEvent({
        kind: 30000,
        content: activity,
        tags: [
          ['e', roomEventId, 'wss://relay.ditto.pub', 'root'],
          ['expiration', expirationTime.toString()],
          ['activity', activity],
        ],
      });

      return event;
    },
  });
}
