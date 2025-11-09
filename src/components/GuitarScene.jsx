// src/components/GuitarScene.jsx
import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { useSpring, a } from '@react-spring/three'
import * as THREE from 'three'

function GuitarModel({ onSectionClick, activeSection, modelRef }) {
  const { scene } = useGLTF('/models/guitar.glb')
  const ref = modelRef || useRef()
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
            opacity={hovered === zone.name ? 0.15 : 0}
            depthWrite={false}
            color={hovered === zone.name ? '#ff4d6d' : '#ffffff'}
          />
        </mesh>
      ))}
    </group>
  )
}

function SceneLighting({ activeSection }) {
  const ambient = useRef()
  const directional = useRef()

  const { intensity } = useSpring({
    intensity: activeSection ? 0.4 : 1.2,
    config: { tension: 90, friction: 18 },
  })

  useFrame(() => {
    if (ambient.current) ambient.current.intensity = intensity.get()
    if (directional.current) directional.current.intensity = activeSection ? 1.5 : 2.5
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={1.2} />
      <directionalLight ref={directional} position={[2, 5, 1]} intensity={2.5} />
    </>
  )
}

//changes this section in order to make it cinamatic
function AnimatedCamera({ activeSection, modelRef }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  
  const spring = useSpring({
    zoom: activeSection ? 0.4 : 1,
    offset: activeSection ? 2.2 : 6,
    config: { mass: 1, tension: 100, friction: 20 },
  })

  useFrame(() => {
    if (!modelRef.current) return
    if (isUserInteracting) return

    // Guitar’s actual position
    const target = new THREE.Vector3()
    modelRef.current.getWorldPosition(target)

    const zoom = spring.zoom.get()
    const offset = spring.offset.get()

    // Smooth camera transition around target
    camera.position.lerp(
      new THREE.Vector3(target.x + 0.5, target.y + offset / 2, offset),
      0.08
    )

    // Focus on clicked section
    if (activeSection === 'neck') target.y += 1.5
    if (activeSection === 'head') target.y += 3
    if (activeSection === 'body') target.y -= 0.5

    camera.lookAt(target)
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



export default function GuitarScene() {
  const [activeSection, setActiveSection] = useState(null)
  const modelRef = useRef()

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#000' }}>
      <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
        <SceneLighting activeSection={activeSection} />
        {/* <GuitarModel onSectionClick={setActiveSection} activeSection={activeSection} /> */}
        {/* <AnimatedCamera activeSection={activeSection} onReset={() => setActiveSection(null)} /> */}
        <GuitarModel modelRef={modelRef} onSectionClick={setActiveSection} activeSection={activeSection} />
        <AnimatedCamera activeSection={activeSection} modelRef={modelRef} />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
