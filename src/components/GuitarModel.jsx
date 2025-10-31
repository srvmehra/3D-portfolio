// src/components/GuitarModel.jsx
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function GuitarModel() {
  const modelRef = useRef()
  const { scene } = useGLTF('/guitar.glb')

  // Fix materials visibility
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material.side = THREE.DoubleSide
        child.material.needsUpdate = true
      }
    })
  }, [scene])

  // Rotate the guitar
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005
    }
  })

  return <primitive ref={modelRef} object={scene} scale={1.5} />
}
