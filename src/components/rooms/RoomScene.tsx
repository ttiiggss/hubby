import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Sky, Stars, Grid } from '@react-three/drei';
import { Avatar3D } from './Avatar3D';
import type { Room, UserPosition } from '@/types/rooms';

interface RoomSceneProps {
  room: Room;
  users: UserPosition[];
  currentUserPubkey?: string;
}

function RoomEnvironment({ backgroundColor }: { backgroundColor: string }) {
  return (
    <>
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#8b5cf6" />
    </>
  );
}

function RoomFloor({ size = 20 }: { size?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial
        color="#1a1a2e"
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

function RoomGridCustom({ size = 20, divisions = 20 }: { size?: number; divisions?: number }) {
  return (
    <Grid
      args={[size, divisions]}
      cellColor="#8b5cf6"
      sectionColor="#1e1e3f"
      cellSize={size / divisions}
      cellThickness={0.02}
      cellColor="#8b5cf640"
      sectionSize={size}
      sectionThickness={0.05}
      sectionColor="#8b5cf6"
      fadeDistance={25}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid
    />
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

        <RoomEnvironment backgroundColor={room.scene.backgroundColor || '#1a1a2e'} />
        <RoomFloor size={room.scene.maxUsers ? Math.max(20, room.scene.maxUsers) : 20} />
        <RoomGridCustom size={room.scene.maxUsers ? Math.max(20, room.scene.maxUsers) : 20} />

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
