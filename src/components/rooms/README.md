# Nostr-Space: 3D Social Rooms on Nostr - Ephemeral Messaging

## Overview

Nostr-Space is a decentralized 3D social platform built on Nostr that allows users to create, join, and interact in virtual spaces.

## Event Kinds

### Kind 12347: Room Definition

A replaceable event that defines a 3D social room/space. Each room is identified by the author's pubkey and a `d` tag (room ID).

**Tags:**
- `d` (required): Unique room identifier (slug/ID)
- `title` (required): Room name
- `description`: Room description
- `image`: Cover image URL for the room
- `scene`: Scene configuration (JSON string)
  - `backgroundColor`: Hex color for room background
  - `maxUsers`: Maximum users allowed in room
  - `isPublic`: Boolean for room visibility
  - `roomType`: Type of room (lobby, meeting, social, workspace)
- `t`: Category tags (e.g., "gaming", "social", "work", "education", "music", "art", "tech", "nostr")
- `ephemeral`: Whether ephemeral messaging is enabled (true/false)
- `expirationHours`: Default ephemeral message expiration in hours

**Example:**
```json
{
  "kind": 12347,
  "content": "A cozy space for Nostr enthusiasts to hang out and chat!",
  "tags": [
    ["d", "my-cozy-space"],
    ["title", "Nostr Lounge"],
    ["description", "A cozy space for Nostr enthusiasts to hang out and chat!"],
    ["image", "https://example.com/room-cover.jpg"],
    ["scene", "{\"backgroundColor\":\"#1a1a2e\",\"maxUsers\":20,\"isPublic\":true,\"roomType\":\"social\"}"],
    ["t", "social"],
    ["t", "nostr"],
    ["ephemeral", "true"],
    ["expirationHours", "24"]
  ]
}
```

### Kind 1: Room Messages

Standard text notes used for messages within rooms. Use the `e` tag to reference the room definition event.

**Tags:**
- `e` (required): Event ID of the room (kind 12347)
- `p` (optional): Mentions of other users (pubkeys)
- `root`: Must be "wss://relay.ditto.pub" for proper threading

**Example:**
```json
{
  "kind": 1,
  "content": "Hey everyone! Great to be here! 🎉",
  "tags": [
    ["e", "<room-event-id>", "wss://relay.ditto.pub", "root"],
    ["p", "<mentioned-pubkey>"]
  ]
}
```

### Kind 30000: Ephemeral Messages (NIP-59)

Ephemeral messages for temporary chat that disappear after a set time.

**Tags:**
- `e` (required): Event ID of the room
- `expiration`: Unix timestamp when message should expire
- `ephemeral-chat`: Unique ephemeral ID (auto-generated)

**Example:**
```json
{
  "kind": 30000,
  "content": "This message will disappear in 24 hours",
  "tags": [
    ["e", "<room-event-id>", "wss://relay.ditto.pub", "root"],
    ["expiration", "1699999999"],
    ["ephemeral-chat", "ephem-timestamp-random"]
  ]
}
```

## Query Patterns

### Fetch All Public Rooms
```javascript
const rooms = await nostr.query([{
  kinds: [12347],
  limit: 50,
}]);
```

### Fetch Specific Room
```javascript
const room = await nostr.query([{
  kinds: [12347],
  authors: [authorPubkey],
  '#d': [roomId],
  limit: 1,
}]);
```

### Fetch Room Messages (Permanent + Ephemeral)
```javascript
const messages = await nostr.query([{
  kinds: [1, 30000], // Fetch both permanent (1) and ephemeral (30000) messages
  '#e': [roomEventId],
  limit: 100,
}]);

// Parse ephemeral messages to get expiration time
const ephemeralMessages = messages.filter((m) => m.kind === 30000).map((m) => {
  ...parseRoomMessages(m)[0],
  expiration: m.tags.find(([name]) => name === 'expiration')?.[1],
});

// Combine ephemeral first, then permanent
const allMessages = [...ephemeralMessages, ...permanentMessages];
```

### Fetch Ephemeral Room Activity
```javascript
const activities = await nostr.query([{
  kinds: [30000],
  '#e': [roomId],
  limit: 20,
}]);

// Recent activity (typing, entered room, etc.)
```

### Publish Ephemeral Message
```javascript
const expirationTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

const event = await nostr.signEvent({
  kind: 30000,
  content: message,
  tags: [
    ['e', roomId, 'wss://relay.ditto.pub', 'root'],
    ['expiration', expirationTime.toString()],
  ],
  created_at: Math.floor(Date.now() / 1000),
});
```

## Room States

A room can have the following states:
- **Public**: Anyone can join and view
- **Private**: Room exists but entry is restricted
- **Active**: Users are currently present
- **Inactive**: No users present

## Security Considerations

- Room authors can modify room properties by publishing a new kind 12347 event with the same `d` tag
- To prevent impersonation, always filter room queries by the `authors` field when fetching specific rooms
- Room messages (kind 1) can be posted by anyone, but should be filtered to show only messages in active rooms
- Ephemeral messages are still public while they exist, just for a limited time
- For true privacy: Use encrypted DM (NIP-04/NIP-59) instead of ephemeral messages
- Use NIP-17 for truly ephemeral messages that are only delivered to active users in the room

## Implementation Notes

- Use @react-three/fiber and @react-three/drei for 3D visualization
- Use React Query for data fetching and caching
- Use @tanstack/react-query for state management
- Implement room presence using replaceable events or NIP-46 for coordination
- Use NIP-17 for ephemeral messaging if true temporary messages are needed
- Room scenes can be extended with custom 3D object definitions using additional tags

## Room Configuration Options

### Room Types
- **Lobby**: Open space for casual hangouts
- **Meeting**: Formal meeting space
- **Social**: Social gathering area
- **Workspace**: Collaborative work area

### Message Modes
- **Permanent**: Messages are stored indefinitely (kind 1)
- **Ephemeral**: Messages disappear after set time (kind 30000)

### Ephemeral Message Expiration Times
- **1 Hour**: Messages disappear after 1 hour
- **6 Hours**: Messages disappear after 6 hours
- **12 Hours**: Messages disappear after 12 hours
- **24 Hours**: Messages disappear after 1 day (default)
- **72 Hours**: Messages disappear after 3 days
- **168 Hours**: Messages disappear after 1 week

## License

Nostr-Space is licensed with the [Mozilla Public License 2.0](./LICENSE)

---

## Ephemeral Messaging Feature

Nostr-Space now supports ephemeral messaging using NIP-59 (kind 30000).

### What is Ephemeral Messaging?

Ephemeral messages are temporary Nostr events that automatically expire after a set time. This is perfect for:
- Temporary conversations (voicemail-style)
- Privacy-focused communications
- Reduced relay storage burden
- Auto-expiring content

### How It Works

**Publishing Ephemeral Messages:**
1. Messages are published to kind 30000
2. They include an `expiration` tag with a Unix timestamp
3. They include a unique `ephemeral-chat` identifier
4. Relays should respect the `expiration` tag and delete messages after the time

**UI Features:**
- **Ephemeral Mode Toggle**: Switch between permanent and ephemeral message modes
- **Expiration Display**: Shows when ephemeral messages will disappear
- **Visual Indicators**: Ephemeral messages marked with 🔥 flame icon
- **Expiration Time Options**: Choose 1h, 6h, 24h, 3d, 1w

### Benefits

✅ **Privacy**: Messages disappear automatically - no need to manually delete
✅ **Storage Efficiency**: Reduces long-term data burden on relays
✅ **User Experience**: Clean, temporary conversations like voicemail
✅ **Flexibility**: Choose permanent mode for important messages, ephemeral for casual chat

### Relay Compatibility

**Note**: Some relays may not fully support ephemeral events or may delete them at different times. Test with your target relays before deploying.

### Integration with Room System

Ephemeral messages are seamlessly integrated into the room system:
- Ephemeral mode can be enabled/disabled per room during creation
- Room chat UI displays both permanent and ephemeral messages
- Ephemeral messages are fetched and displayed alongside permanent messages
- Expiration times are visible to users

### Query Implementation

```typescript
// Fetch both permanent (1) and ephemeral (30000) messages
const messages = await nostr.query([{
  kinds: [1, 30000], // Fetch both kinds
  '#e': [roomEventId],
  limit: 100,
}]);

// Parse ephemeral messages to get expiration time
const ephemeralMessages = messages.filter((m) => m.kind === 30000).map((m) => {
  ...parseRoomMessage(m),
  expiration: m.tags.find(([name]) => name === 'expiration')?.[1],
});

// Combine ephemeral first, then permanent
const allMessages = [...ephemeralMessages, ...permanentMessages];
```

### Future Enhancements

- **NIP-17**: Implement NIP-17 for truly ephemeral messages that are only delivered to active users
- **Room Activity**: Show typing indicators, user presence in rooms
- **Message Persistence**: Allow users to save ephemeral messages as permanent before expiration
- **Expiration Countdown**: Real-time countdown showing time until message disappears
- **Bulk Actions**: Delete all messages, export room chat
