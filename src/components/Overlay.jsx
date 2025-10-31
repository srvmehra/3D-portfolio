import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

const overlayData = {
  body: {
    title: "About Me",
    text: "I’m Saurabh — a Laravel and React engineer who turns complex system ideas into scalable, elegant code. My journey started with backend mastery and evolved into building full ecosystems like PMS, Booking Engines, and Channel Managers.",
  },
  neck: {
    title: "Skills",
    text: "Laravel, React, MySQL, API Design, Queue Systems, AWS, Cloudways, and more. I build robust, modular apps with performance, maintainability, and scalability as core principles.",
  },
  head: {
    title: "Projects",
    text: "Channel Manager System, Booking Engine, PMS, Payment Gateway Integrations, Notification Systems — real-world, production-grade projects built end-to-end.",
  },
  strings: {
    title: "Mindset",
    text: "I see coding like tuning a guitar — balance, rhythm, and precision. I believe every line of code should resonate with purpose, scalability, and creative thought.",
  },
}

export default function Overlay({ activeZone, onClose }) {
  const data = overlayData[activeZone]

  return (
    <AnimatePresence>
      {activeZone && (
        <motion.div
          className="overlay"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            maxWidth: '480px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '30px',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 25px rgba(255,255,255,0.15)',
          }}
        >
          <h2 style={{ fontSize: '1.8rem', color: '#ff4081', marginBottom: '10px' }}>{data.title}</h2>
          <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>{data.text}</p>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#ff4081',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#fff',
              fontWeight: '600',
            }}
          >
            Close
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
