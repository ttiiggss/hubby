# Nostr-Space: 3D Social Rooms on Nostr

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
- `t`: Category tags (e.g., "gaming", "social", "work", "education")

**Example:**
```json
{
  "kind": 12347,
  "content": "A cozy space for Nostr enthusiasts to hang out and chat!",
  "tags": [
    ["d", "nostr-lounge"],
    ["title", "Nostr Lounge"],
    ["description", "A cozy space for Nostr enthusiasts to hang out and chat!"],
    ["image", "https://example.com/room-cover.jpg"],
    ["scene", "{\"backgroundColor\":\"#1a1a2e\",\"maxUsers\":20,\"isPublic\":true}"],
    ["t", "social"],
    ["t", "nostr"]
  ]
}
```

### Kind 1: Room Messages

Standard text notes can be used for messages within rooms. Use the `e` tag to reference the room definition event.

**Tags:**
- `e` (required): Event ID of the room (kind 12347)
- `root`: Event ID of the room (for threading)
- `p`: Mentions of other users

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

## Query Patterns

### Fetch All Public Rooms
```javascript
const rooms = await nostr.query([{
  kinds: [12347],
  limit: 50
}]);
```

### Fetch Specific Room
```javascript
const room = await nostr.query([{
  kinds: [12347],
  authors: [authorPubkey],
  '#d': [roomId],
  limit: 1
}]);
```

### Fetch Room Messages
```javascript
const messages = await nostr.query([{
  kinds: [1],
  '#e': [roomEventId],
  limit: 100
}]);
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

## Implementation Notes

- Use `@react-three/fiber` and `@react-three/drei` for 3D visualization
- User positions in rooms can be tracked using additional custom events or NIP-59 for ephemeral data
- Room scenes can be extended with custom 3D object definitions using additional tags
- Consider implementing room presence using replaceable events or NIP-46 for coordination
