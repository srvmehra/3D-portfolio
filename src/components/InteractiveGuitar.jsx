import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCursor, useGLTF } from '@react-three/drei'

export default function InteractiveGuitar({ onZoneClick }) {
  const { scene } = useGLTF('/models/guitar.glb')
  const ref = useRef()
  const [hovered, setHovered] = useState(null)
  const [clickable, setClickable] = useState(true)

  useCursor(!!hovered)

  // auto rotate only when not interacting
  useFrame(() => {
    if (ref.current && clickable) {
      ref.current.rotation.y += 0.0025
    }
  })

  // zones with better proportions
  const zones = [
    { name: 'body', position: [0, -0.5, 0], size: [2.3, 1.3, 0.4] },
    { name: 'neck', position: [0, 1.2, 0], size: [0.5, 3, 0.25] },
    { name: 'head', position: [0, 3.2, 0], size: [1, 1, 0.4] },
    { name: 'strings', position: [0, 0.2, 0.3], size: [1.8, 3.5, 0.1] },
  ]

  const handlePointerDown = (e) => {
    e.stopPropagation() // let orbit controls still work
    setClickable(false)
  }

  const handlePointerUp = (e, zoneName) => {
    e.stopPropagation()
    setClickable(true)
    // only trigger if it's not a drag
    if (e.delta < 2) onZoneClick(zoneName)
  }

  return (
    <group ref={ref} position={[0, -0.8, 0]} scale={[2.3, 2.3, 2.3]}>
      <primitive object={scene} />

      {zones.map((zone) => (
        <mesh
          key={zone.name}
          position={zone.position}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(zone.name)
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            setHovered(null)
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={(e) => handlePointerUp(e, zone.name)}
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
