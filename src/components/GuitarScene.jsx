// src/components/GuitarScene.jsx
import React, { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { useSpring } from '@react-spring/three'
import * as THREE from 'three'

// --------------------- Guitar Model ---------------------
function GuitarModel({ onSectionClick, activeSection, modelRef }) {
  const { scene } = useGLTF('/models/guitar.glb')
  const ref = modelRef || useRef()
  const [hovered, setHovered] = useState(null)

  // slow rotation only when no section active
  useFrame(() => {
    if (!activeSection && ref.current) {
      ref.current.rotation.y += 0.003
    }
  })

  // clickable zones
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
            opacity={hovered === zone.name ? 0.15 : 0}
            depthWrite={false}
            color={hovered === zone.name ? '#ff4d6d' : '#ffffff'}
          />
        </mesh>
      ))}
    </group>
  )
}

// --------------------- Lighting ---------------------
function SceneLighting({ activeSection }) {
  const ambient = useRef()
  const directional = useRef()

  const { intensity } = useSpring({
    intensity: activeSection ? 0.5 : 1.2,
    config: { tension: 90, friction: 18 },
  })

  useFrame(() => {
    if (ambient.current) ambient.current.intensity = intensity.get()
    if (directional.current) directional.current.intensity = activeSection ? 1.6 : 2.5
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={1.2} />
      <directionalLight ref={directional} position={[2, 5, 1]} intensity={2.5} />
    </>
  )
}

// --------------------- Animated Camera ---------------------
function AnimatedCamera({ activeSection, modelRef }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const [isUserInteracting, setIsUserInteracting] = useState(false)

  const spring = useSpring({
    offset: activeSection ? 2.5 : 6,
    config: { mass: 1, tension: 100, friction: 25 },
  })

  useFrame(() => {
    if (!modelRef.current || isUserInteracting) return

    const target = new THREE.Vector3()
    modelRef.current.getWorldPosition(target)

    // Section-specific camera focus
    const focus = target.clone()
    if (activeSection === 'Neck') focus.y += 1.2
    if (activeSection === 'Head') focus.y += 2.5
    if (activeSection === 'Body') focus.y -= 0.3
    if (activeSection === 'Strings') focus.z += 0.8

    const offset = spring.offset.get()
    const desiredPos = new THREE.Vector3(target.x + 0.5, target.y + offset / 2, offset)
    camera.position.lerp(desiredPos, 0.08)
    camera.lookAt(focus)
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom
      enablePan={false}
      minDistance={2}
      maxDistance={10}
      onStart={() => setIsUserInteracting(true)}
      onEnd={() => setIsUserInteracting(false)}
    />
  )
}

// --------------------- Main Scene ---------------------
export default function GuitarScene() {
  const [activeSection, setActiveSection] = useState(null)
  const modelRef = useRef()

  const handleSectionClick = (section) => {
    if (activeSection === section) {
      setActiveSection(null) // toggle off
    } else {
      setActiveSection(section)
    }
  }

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#000', position: 'relative' }}>
      <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
        <SceneLighting activeSection={activeSection} />
        <GuitarModel modelRef={modelRef} onSectionClick={handleSectionClick} activeSection={activeSection} />
        <AnimatedCamera activeSection={activeSection} modelRef={modelRef} />
        <Environment preset="city" />
      </Canvas>

      {/* Back to normal view button */}
      {activeSection && (
        <button
          onClick={() => setActiveSection(null)}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            padding: '10px 16px',
            background: '#111',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '14px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.target.style.background = '#222')}
          onMouseLeave={(e) => (e.target.style.background = '#111')}
        >
          ⟵ Back to normal view
        </button>
      )}
    </div>
  )
}
