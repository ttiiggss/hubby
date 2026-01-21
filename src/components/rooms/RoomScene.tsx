import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Sphere, Cylinder, Text } from '@react-three/drei';
import type { Room, UserPosition } from '@/types/rooms';

interface RoomSceneProps {
  room: Room;
  users: UserPosition[];
  currentUserPubkey?: string;
}

function RoomEnvironment() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#8b5cf6" />
    </>
  );
}

function RoomFloor({ size = 20, color = '#1a1a2e' }: { size?: number; color?: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <boxGeometry args={[size, size, 0.1]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function UserAvatar({ pubkey, position, isCurrentUser = false }: { pubkey: string; position: [number, number, number]; isCurrentUser?: boolean }) {
  const hash = pubkey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = (hash % 360) / 360;
  const color = `hsl(${hue * 360}, 70%, 60%)`;
  const name = pubkey.substring(0, 8);

  return (
    <group position={position}>
      <Sphere args={[0.5, 16, 16]} castShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.5}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>

      <Cylinder args={[0.4, 0.4, 0.1, 16]} position={[0, -0.35, 0]} castShadow>
        <meshStandardMaterial color="#8b5cf6" roughness={0.2} />
      </Cylinder>

      <Text
        position={[0, 1.2, 0]}
        fontSize={0.4}
        color={isCurrentUser ? '#22c55e' : 'white'}
        anchorX="center"
        anchorY="bottom"
      >
        {name}
        {isCurrentUser && ' (You)'}
      </Text>

      {isCurrentUser && (
        <Sphere args={[0.7, 16, 16, 32]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#22c55e" wireframe />
        </Sphere>
      )}
    </group>
  );
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

  return (
    <div className="canvas-container rounded-xl overflow-hidden bg-black">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2}
        />

        <RoomEnvironment />

        <RoomFloor
          size={floorSize}
          color={room.scene.backgroundColor || '#1a1a2e'}
        />

        {demoUsers.map((user, index) => {
          const isCurrentUser = user.pubkey === currentUserPubkey;
          const angle = (index / Math.max(1, demoUsers.length)) * Math.PI * 2;
          const radius = 3;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <UserAvatar
              key={user.pubkey}
              pubkey={user.pubkey}
              position={[x, 0, z]}
              isCurrentUser={isCurrentUser}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
