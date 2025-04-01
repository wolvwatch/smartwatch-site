// src/components/ThreeDPCBViewer.jsx
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
// useGLTF can be used for STL, but for direct STL loading you'd use: import { useLoader } from '@react-three/fiber'; import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

function RotatingModel() {
  const geom = useLoader(STLLoader, '/Smart_Watch.stl');
  geom.center();
  
  const groupRef = useRef();
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={groupRef} geometry={geom}>
      <meshStandardMaterial metalness={0.3} roughness={0.6} />
    </mesh>
  );

}

const ThreeDPCBViewer = () => {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight intensity={0.8} position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <RotatingModel />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default ThreeDPCBViewer;