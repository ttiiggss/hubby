import type { NostrEvent } from '@nostrify/nostrify';

export interface RoomSceneConfig {
  backgroundColor?: string;
  maxUsers?: number;
  isPublic?: boolean;
  roomType?: 'lobby' | 'meeting' | 'social' | 'workspace' | 'custom';
}

export interface Room {
  id: string;
  eventId: string;
  author: string;
  title: string;
  description: string;
  image?: string;
  scene: RoomSceneConfig;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface RoomMessage extends NostrEvent {
  roomId: string;
}

export interface UserPosition {
  pubkey: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  roomId: string;
  updatedAt: number;
}

export interface RoomState {
  room: Room;
  users: UserPosition[];
  messages: RoomMessage[];
}
