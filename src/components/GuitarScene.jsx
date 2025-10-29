// src/components/GuitarScene.jsx
import React, { useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import InteractiveGuitar from './InteractiveGuitar'
import { useSpring } from '@react-spring/three'

function AnimatedCamera({ activeZone }) {
  const { camera } = useThree()

  const positions = {
    default: [0, 1.5, 7], // moved slightly back
    body: [0, 0.5, 3.5],
    neck: [0, 2, 3.8],
    head: [0, 3.5, 4.2],
    strings: [0, 1, 3.2],
  }

  const lookAtPoints = {
    default: [0, 0, 0],
    body: [0, -0.5, 0],
    neck: [0, 1, 0],
    head: [0, 2.5, 0],
    strings: [0, 0.5, 0],
  }

  const spring = useSpring({
    position: positions[activeZone || 'default'],
    config: { mass: 1, tension: 120, friction: 18 },
  })

  useFrame(() => {
    const pos = spring.position.get()
    camera.position.lerp({ x: pos[0], y: pos[1], z: pos[2] }, 0.08)
    const look = lookAtPoints[activeZone || 'default']
    camera.lookAt(...look)
  })
}

export default function GuitarScene() {
  const [activeZone, setActiveZone] = useState(null)

  const handleZoneClick = (zone) => {
    console.log('Clicked zone:', zone)
    setActiveZone((prev) => (prev === zone ? null : zone))
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        background: 'radial-gradient(circle at center, #0a0a0a, #000)',
      }}
    >
      <Canvas camera={{ position: [0, 1.5, 7], fov: 45 }}>
        <Environment preset="city" />

        {/* Softer lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 4, 4]} intensity={1.3} />
        <pointLight position={[0, 2, 2]} intensity={1.5} />
        <spotLight position={[0, 8, 2]} angle={0.4} penumbra={0.6} intensity={1.5} />

        <AnimatedCamera activeZone={activeZone} />
        <InteractiveGuitar onZoneClick={handleZoneClick} activeZone={activeZone} />

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}
