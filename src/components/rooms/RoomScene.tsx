import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import type { Room, UserPosition } from '@/types/rooms';

interface RoomSceneProps {
  room: Room;
  users: UserPosition[];
  currentUserPubkey?: string;
}

export function RoomScene({ room, users, currentUserPubkey }: RoomSceneProps) {
  const demoUsers: UserPosition[] = users.length > 0 ? users : [
    {
      pubkey: 'demo1',
      x: 0,
      y: 0,
      z: 0,
      rotation: 0,
      roomId: room.id,
      updatedAt: Date.now(),
    },
  ];

  const floorSize = room.scene.maxUsers ? Math.max(20, room.scene.maxUsers) : 20;
  const bgColor = room.scene.backgroundColor || '#1a1a2e';

  return (
    <div className="canvas-container rounded-xl overflow-hidden bg-black" style={{ height: '400px' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />

        {/* Simple lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[floorSize, floorSize]} />
          <meshStandardMaterial color={bgColor} />
        </mesh>

        {/* User Avatars */}
        {demoUsers.map((user, index) => {
          const isCurrentUser = user.pubkey === currentUserPubkey;
          const angle = (index / Math.max(1, demoUsers.length)) * Math.PI * 2;
          const radius = 3;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const hash = user.pubkey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const hue = (hash % 360) / 360;
          const color = `hsl(${hue * 360}, 70%, 60%)`;

          return (
            <group key={user.pubkey} position={[x, 0.5, z]}>
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={color} />
              </mesh>

              {/* Base */}
              <mesh position={[0, -0.6, 0]}>
                <boxGeometry args={[0.8, 0.2, 0.8]} />
                <meshStandardMaterial color="#8b5cf6" />
              </mesh>

              {/* Current User Indicator */}
              {isCurrentUser && (
                <mesh position={[0, 1.1, 0]}>
                  <boxGeometry args={[1.2, 0.1, 1.2]} />
                  <meshBasicMaterial color="#22c55e" transparent opacity={0.5} />
                </mesh>
              )}
            </group>
          );
        })}
      </Canvas>
    </div>
  );
}
