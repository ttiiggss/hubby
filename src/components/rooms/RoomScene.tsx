import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Avatar3D } from './Avatar3D';
import type { Room, UserPosition } from '@/types/rooms';
import * as THREE from 'three';

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
      <Stars />
    </>
  );
}

function Stars() {
  const points = useRef<THREE.Points>();
  const count = 1000;

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#ffffff" transparent opacity={0.8} />
    </points>
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

function RoomGrid({ size = 20, divisions = 20 }: { size?: number; divisions?: number }) {
  const gridSize = size;
  const step = size / divisions;

  // Create grid lines manually
  const lines: JSX.Element[] = [];
  
  // Horizontal lines
  for (let i = -divisions / 2; i <= divisions / 2; i++) {
    const pos = i * step;
    lines.push(
      <line key={`h-${i}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-gridSize/2, 0, pos, gridSize/2, 0, pos])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
      </line>
    );
  }

  // Vertical lines
  for (let i = -divisions / 2; i <= divisions / 2; i++) {
    const pos = i * step;
    lines.push(
      <line key={`v-${i}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([pos, 0, -gridSize/2, pos, 0, gridSize/2])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
      </line>
    );
  }

  return <group>{lines}</group>;
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

        <RoomEnvironment />
        <RoomFloor 
          size={room.scene.maxUsers ? Math.max(20, room.scene.maxUsers) : 20}
          color={room.scene.backgroundColor || '#1a1a2e'}
        />
        <RoomGrid size={room.scene.maxUsers ? Math.max(20, room.scene.maxUsers) : 20} />

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
