"use client";

import React, { useEffect, useState } from 'react';

const Particles = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      size: (Math.random() * 3 + 1) + 'px',
      duration: (Math.random() * 15 + 8) + 's',
      delay: (Math.random() * 10) + 's',
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-indigo-500/40 animate-float"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
