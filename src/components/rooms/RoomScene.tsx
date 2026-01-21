import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import { Avatar3D } from './Avatar3D';
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
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        color={color}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

export function RoomScene({ room, users, currentUserPubkey }: RoomSceneProps) {
  // Generate some demo positions for users if none provided
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

        <Grid
          args={[floorSize, floorSize]}
          cellColor="#8b5cf6"
          sectionColor="#1e1e3f"
          cellSize={1}
          cellThickness={0.02}
          cellColor="#8b5cf640"
          sectionSize={5}
          sectionThickness={0.05}
          sectionColor="#8b5cf6"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        <RoomFloor
          size={floorSize}
          color={room.scene.backgroundColor || '#1a1a2e'}
        />

        {/* Render user avatars */}
        {demoUsers.map((user, index) => {
          const isCurrentUser = user.pubkey === currentUserPubkey;
          const angle = (index / Math.max(1, demoUsers.length)) * Math.PI * 2;
          const radius = 3;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <Avatar3D
              key={user.pubkey}
              pubkey={user.pubkey}
              position={[x, 0, z]}
              rotation={user.rotation || 0}
              isCurrentUser={isCurrentUser}
            />
          );
        })}

        <Environment preset="sunset" blur={0.8} />
      </Canvas>
    </div>
  );
}
