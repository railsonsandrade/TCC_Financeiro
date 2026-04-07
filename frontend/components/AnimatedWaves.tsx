'use client'

import { useEffect, useState } from 'react'

const WAVE_PATHS = [
  {
    d: 'M0,300 C180,250 360,200 540,280 C720,360 900,220 1080,260 C1260,300 1350,250 1440,300 L1440,0 L0,0 Z',
    stroke: 'rgba(56,189,248,0.12)',
    strokeWidth: 1.5,
    values: 'M0,300 C180,250 360,200 540,280 C720,360 900,220 1080,260 C1260,300 1350,250 1440,300 L1440,0 L0,0 Z;M0,280 C180,320 360,240 540,260 C720,280 900,340 1080,280 C1260,220 1350,280 1440,260 L1440,0 L0,0 Z;M0,300 C180,250 360,200 540,280 C720,360 900,220 1080,260 C1260,300 1350,250 1440,300 L1440,0 L0,0 Z',
    dur: '12s',
  },
  {
    d: 'M0,450 C240,400 480,500 720,420 C960,340 1200,460 1440,400',
    stroke: 'rgba(56,189,248,0.08)',
    strokeWidth: 1,
    values: 'M0,450 C240,400 480,500 720,420 C960,340 1200,460 1440,400;M0,420 C240,480 480,380 720,460 C960,540 1200,380 1440,450;M0,450 C240,400 480,500 720,420 C960,340 1200,460 1440,400',
    dur: '15s',
  },
  {
    d: 'M0,600 C200,550 400,650 600,580 C800,510 1000,620 1200,570 C1320,545 1380,590 1440,560',
    stroke: 'rgba(56,189,248,0.15)',
    strokeWidth: 1.5,
    values: 'M0,600 C200,550 400,650 600,580 C800,510 1000,620 1200,570 C1320,545 1380,590 1440,560;M0,580 C200,630 400,540 600,620 C800,700 1000,540 1200,600 C1320,620 1380,560 1440,590;M0,600 C200,550 400,650 600,580 C800,510 1000,620 1200,570 C1320,545 1380,590 1440,560',
    dur: '18s',
  },
  {
    d: 'M0,750 C360,700 720,800 1080,720 C1260,680 1350,740 1440,710',
    stroke: 'rgba(56,189,248,0.06)',
    strokeWidth: 1,
    values: 'M0,750 C360,700 720,800 1080,720 C1260,680 1350,740 1440,710;M0,720 C360,780 720,680 1080,760 C1260,800 1350,720 1440,750;M0,750 C360,700 720,800 1080,720 C1260,680 1350,740 1440,710',
    dur: '20s',
  },
]

export default function AnimatedWaves() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render static paths on server to avoid hydration mismatch
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          {WAVE_PATHS.map((wave, i) => (
            <path
              key={i}
              d={wave.d}
              fill="none"
              stroke={wave.stroke}
              strokeWidth={wave.strokeWidth}
            />
          ))}
        </svg>
      </div>
    )
  }

  // Render with animations only on client
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        {WAVE_PATHS.map((wave, i) => (
          <path
            key={i}
            d={wave.d}
            fill="none"
            stroke={wave.stroke}
            strokeWidth={wave.strokeWidth}
          >
            <animate
              attributeName="d"
              values={wave.values}
              dur={wave.dur}
              repeatCount="indefinite"
            />
          </path>
        ))}
      </svg>
    </div>
  )
}
