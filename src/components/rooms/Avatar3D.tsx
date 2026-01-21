import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { useAuthor } from '@/hooks/useAuthor';

interface Avatar3DProps {
  pubkey: string;
  position: [number, number, number];
  rotation?: number;
  isCurrentUser?: boolean;
}

export function Avatar3D({ pubkey, position, rotation = 0, isCurrentUser = false }: Avatar3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { data: author } = useAuthor(pubkey);

  const name = author?.metadata?.name || pubkey.substring(0, 8);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const y = Math.sin(time * 2) * 0.2 + 1;
      meshRef.current.position.y = y;

      if (!hovered) {
        meshRef.current.rotation.y += 0.005;
      }
    }
  });

  // Generate a color based on pubkey
  const hash = pubkey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = (hash % 360) / 360;
  const color = `hsl(${hue * 360}, 70%, 60%)`;

  return (
    <group ref={meshRef} position={position} rotation={[0, rotation, 0]}>
      <Sphere args={[0.5, 32, 32]} castShadow>
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.5}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </Sphere>

      <Cylinder args={[0.3, 0.5, 0.1, 32]} position={[0, 0.05, 0]} castShadow>
        <meshStandardMaterial color="#8b5cf6" roughness={0.2} metalness={0.8} />
      </Cylinder>

      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color={isCurrentUser ? '#22c55e' : 'white'}
        anchorX="center"
        anchorY="bottom"
      >
        {name}
        {isCurrentUser && ' (You)'}
      </Text>

      {isCurrentUser && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
