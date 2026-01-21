import { useNostr, useSigner, useAccount } from '@nostrify/react';

/**
 * Publish an ephemeral message using NIP-17 (kind 17)
 * These messages are ONLY delivered to users currently present in the room
 * They use the 'delegation' parameter to specify recipients by pubkey
 */
export function usePublishNIP17Ephemeral() {
  const { nostr, signer } = useNostr();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async ({ roomEventId, content, recipientPubkeys }: {
      roomEventId: string;
      content: string;
      recipientPubkeys?: string[];
    }) => {
      if (!account || !signer) {
        throw new Error('You must be logged in to send ephemeral messages');
      }

      // Create ephemeral tags for the specific room
      const tags = [
        ['e', roomEventId],
        ['ephemeral', 'true'], // Mark as ephemeral
      ];

      // Add expiration (24 hours from now)
      const expirationTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours
      tags.push(['expiration', expirationTime.toString()]);

      // Add delegation tags if recipients provided
      if (recipientPubkeys && recipientPubkeys.length > 0) {
        recipientPubkeys.forEach((pubkey) => {
          tags.push(['delegation', 'role', 'recipient', pubkey]);
        });
      }

      const event = await signer.signEvent({
        kind: 17, // NIP-17 ephemeral messages
        content,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });

      // Publish to relays
      await nostr.publish(event);

      return event;
    },
  });
}

/**
 * Publish a room activity event (e.g., "X is typing", "X joined", "X left")
 */
export function usePublishRoomActivity() {
  const { nostr, signer } = useNostr();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async ({ roomEventId, activity, expiresIn = 1 }: {
      roomEventId: string;
      activity: string;
      expiresIn?: number; // hours
    }) => {
      if (!account || !signer) {
        throw new Error('You must be logged in to publish room activity');
      }

      const expirationTime = Math.floor(Date.now() / 1000) + (expiresIn || 1) * 3600;

      const event = await signer.signEvent({
        kind: 30000, // Replaceable ephemeral event for room activity
        content: activity,
        tags: [
          ['e', roomEventId],
          ['expiration', expirationTime.toString()],
          ['activity', activity], // Activity type: typing, joined, left, etc.
        ],
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.publish(event);

      return event;
    },
  });
}

/**
 * Save ephemeral message as permanent (for persistence)
 * Allows users to save important ephemeral messages before they expire
 */
export function useSaveEphemeralMessage() {
  const { nostr, signer } = useNostr();
  const { account } = useAccount();

  return useMutation({
    mutationFn: async ({ ephemeralMessage, content, roomEventId }: {
      ephemeralMessage: unknown; // The ephemeral message event
      content: string;
      roomEventId: string;
    }) => {
      if (!account || !signer) {
        throw new Error('You must be logged in to save messages');
      }

      // Create a permanent kind 1 message with the same content
      const event = await signer.signEvent({
        kind: 1,
        content,
        tags: [
          ['e', roomEventId, 'wss://relay.ditto.pub', 'root'], // Link to room
          ['p', ephemeralMessage], // Reply to original ephemeral message
        ],
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.publish(event);

      return event;
    },
  });
}
