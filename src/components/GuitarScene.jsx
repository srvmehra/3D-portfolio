// src/components/GuitarScene.jsx
import React, { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { Vector3 } from 'three'
import { useSpring } from '@react-spring/three'

function GuitarModel({ onSectionClick, activeSection }) {
  const { scene } = useGLTF('/models/guitar.glb')
  const ref = useRef()
  const [hovered, setHovered] = useState(null)

  useFrame(() => {
    if (!activeSection && ref.current) {
      ref.current.rotation.y += 0.003
    }
  })

  // Define clickable zones
  const zones = [
    { name: 'Body', position: [0, -1.5, 0], size: [2, 1, 1] },
    { name: 'Neck', position: [0, 0.8, 0], size: [0.5, 2, 0.5] },
    { name: 'Head', position: [0, 2.5, 0], size: [0.8, 0.8, 0.5] },
    { name: 'Strings', position: [0, 0, 0.5], size: [1.5, 0.2, 2] },
  ]

  return (
    <group ref={ref} position={[0, -1.5, 0]} scale={[2.5, 2.5, 2.5]} rotation={[0, Math.PI / 6, 0]}>
      <primitive object={scene} />

      {zones.map((zone) => (
        <mesh
          key={zone.name}
          position={zone.position}
          onClick={(e) => {
            e.stopPropagation()
            onSectionClick(zone.name)
          }}
          onPointerOver={() => setHovered(zone.name)}
          onPointerOut={() => setHovered(null)}
        >
          <boxGeometry args={zone.size} />
          <meshBasicMaterial
            transparent
            opacity={hovered === zone.name ? 0.1 : 0}
            depthWrite={false}
            color={hovered === zone.name ? '#ff4d6d' : '#ffffff'}
          />
        </mesh>
      ))}
      
    </group>
  )
}

function AnimatedCamera({ activeZone }) {
  const { camera, gl } = useThree()
  const controlsRef = useRef()

  const positions = {
    default: new Vector3(0, 1.5, 6.5),
    Body: new Vector3(0, 0.5, 3),
    Neck: new Vector3(0, 2, 3.5),
    Head: new Vector3(0, 3.5, 3.8),
    Strings: new Vector3(0, 1, 2.8),
  }

  const lookAtPoints = {
    default: new Vector3(0, 0, 0),
    Body: new Vector3(0, -0.5, 0),
    Neck: new Vector3(0, 1, 0),
    Head: new Vector3(0, 2.5, 0),
    Strings: new Vector3(0, 0.5, 0),
  }

  // Use a single frame interpolation instead of spring
  useFrame(() => {
    const targetPos = positions[activeZone || 'default']
    const targetLook = lookAtPoints[activeZone || 'default']

    // Smooth transition
    camera.position.lerp(targetPos, 0.05)
    camera.lookAt(targetLook)
    camera.updateProjectionMatrix()

    // Sync OrbitControls target to camera lookAt
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook, 0.05)
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableZoom={true}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.6}
      maxDistance={10}
      minDistance={2.5}
    />
  )
}

export default function GuitarScene() {
  const [activeSection, setActiveSection] = useState(null)

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#000' }}>
      <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 5, 1]} intensity={2} />

        <GuitarModel onSectionClick={setActiveSection} activeSection={activeSection} />
        <AnimatedCamera activeSection={activeSection} setActiveSection={setActiveSection} />

        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
