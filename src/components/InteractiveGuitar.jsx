// src/components/InteractiveGuitar.jsx
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCursor, useGLTF, Text } from '@react-three/drei'
import * as THREE from 'three'

export default function InteractiveGuitar({ onZoneClick, activeZone }) {
  const { scene } = useGLTF('/models/guitar.glb')
  const ref = useRef()
  const [hovered, setHovered] = useState(null)

  useCursor(!!hovered)

  useFrame(() => {
    if (ref.current && !activeZone) ref.current.rotation.y += 0.003
  })

  // ✅ Ensure all materials are visible from both sides
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.side = THREE.DoubleSide
        child.material.transparent = true
      }
    })
  }, [scene])

  const zones = [
    { name: 'body', position: [0, -0.5, 0], size: [2.2, 1.4, 0.5], label: 'About' },
    { name: 'neck', position: [0, 1.3, 0], size: [0.6, 3, 0.3], label: 'Skills' },
    { name: 'head', position: [0, 3.2, 0], size: [1, 1, 0.5], label: 'Projects' },
    { name: 'strings', position: [0, 0.2, 0.3], size: [1.8, 3.5, 0.1], label: 'Mindset' },
  ]

  return (
    <group ref={ref} position={[0, -0.8, 0]} scale={[2.3, 2.3, 2.3]}>
      {/* Guitar model */}
      <primitive object={scene} />

      {/* Clickable interactive zones */}
      {zones.map((zone) => {
        const isActive = activeZone === zone.name
        const isHovered = hovered === zone.name

        return (
          <group key={zone.name}>
            <mesh
              position={zone.position}
              onPointerOver={() => setHovered(zone.name)}
              onPointerOut={() => setHovered(null)}
              onClick={() => onZoneClick(zone.name)}
            >
              <boxGeometry args={zone.size} />
              <meshStandardMaterial
                color={isActive ? '#ff4d6d' : isHovered ? '#ff7b8f' : '#ffffff'}
                transparent
                opacity={isActive ? 0.2 : isHovered ? 0.1 : 0}
                emissive={isActive ? new THREE.Color('#ff4d6d') : new THREE.Color(0x000000)}
                emissiveIntensity={isActive ? 2 : 0}
                depthWrite={false}
              />
            </mesh>

            {/* ✅ Floating text that stays on the guitar */}
            {isActive && (
              <Text
                position={[zone.position[0], zone.position[1] + 0.3, zone.position[2] + 0.3]}
                fontSize={0.25}
                color="#ff4d6d"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.005}
                outlineColor="#ffffff"
              >
                {zone.label}
              </Text>
            )}
          </group>
        )
      })}
    </group>
  )
  
}
