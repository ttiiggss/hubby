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

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <boxGeometry args={[floorSize, floorSize, 0.2]} />
          <meshStandardMaterial color={bgColor} roughness={0.9} />
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
              <mesh castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.3}
                  metalness={0.5}
                  emissive={color}
                  emissiveIntensity={isCurrentUser ? 0.4 : 0.2}
                />
              </mesh>

              {/* Base */}
              <mesh castShadow position={[0, -0.6, 0]}>
                <boxGeometry args={[0.8, 0.2, 0.8]} />
                <meshStandardMaterial color="#8b5cf6" roughness={0.5} />
              </mesh>

              {/* Current User Indicator */}
              {isCurrentUser && (
                <mesh position={[0, 1.1, 0]}>
                  <boxGeometry args={[1.2, 0.1, 1.2]} />
                  <meshBasicMaterial color="#22c55e" transparent opacity={0.9} />
                </mesh>
              )}
            </group>
          );
        })}
      </Canvas>
    </div>
  );
}
