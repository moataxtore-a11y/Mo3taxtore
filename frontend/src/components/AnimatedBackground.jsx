import React, { useRef, useEffect, useCallback } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    resize();

    // Wave configurations — each wave has its own personality
    const waves = [
      // Bottom flowing waves (main)
      { y: 0.82, amplitude: 28, frequency: 0.0025, speed: 0.018, color: 'rgba(49, 96, 95, 0.055)', lineWidth: 0 },
      { y: 0.78, amplitude: 22, frequency: 0.003,  speed: 0.022, color: 'rgba(49, 96, 95, 0.04)',  lineWidth: 0 },
      { y: 0.85, amplitude: 18, frequency: 0.0035, speed: 0.015, color: 'rgba(49, 96, 95, 0.045)', lineWidth: 0 },
      // Middle accent waves
      { y: 0.55, amplitude: 15, frequency: 0.002,  speed: 0.012, color: 'rgba(49, 96, 95, 0.03)',  lineWidth: 0 },
      { y: 0.50, amplitude: 12, frequency: 0.0028, speed: 0.016, color: 'rgba(36, 73, 72, 0.025)', lineWidth: 0 },
      // Top subtle waves
      { y: 0.25, amplitude: 10, frequency: 0.0018, speed: 0.01,  color: 'rgba(49, 96, 95, 0.02)',  lineWidth: 0 },
      { y: 0.20, amplitude: 14, frequency: 0.0022, speed: 0.014, color: 'rgba(36, 73, 72, 0.018)', lineWidth: 0 },
      // Speed lines — thin, fast-moving horizontal streaks
      { y: 0.35, amplitude: 5,  frequency: 0.005,  speed: 0.04,  color: 'rgba(49, 96, 95, 0.06)',  lineWidth: 1.5 },
      { y: 0.65, amplitude: 4,  frequency: 0.006,  speed: 0.045, color: 'rgba(49, 96, 95, 0.05)',  lineWidth: 1.2 },
      { y: 0.45, amplitude: 3,  frequency: 0.007,  speed: 0.05,  color: 'rgba(36, 73, 72, 0.04)',  lineWidth: 1 },
    ];

    const drawWave = (wave, t, w, h) => {
      const { y, amplitude, frequency, speed, color, lineWidth } = wave;
      const baseY = h * y;

      ctx.beginPath();

      if (lineWidth > 0) {
        // Speed line style — a flowing sinusoidal stroke
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(0, baseY + Math.sin(t * speed) * amplitude);
        for (let x = 0; x <= w; x += 3) {
          const yOffset =
            Math.sin(x * frequency + t * speed) * amplitude +
            Math.sin(x * frequency * 1.8 + t * speed * 1.3) * (amplitude * 0.4);
          ctx.lineTo(x, baseY + yOffset);
        }
        ctx.stroke();
      } else {
        // Filled wave — smooth area fill
        ctx.fillStyle = color;
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 3) {
          const yOffset =
            Math.sin(x * frequency + t * speed) * amplitude +
            Math.sin(x * frequency * 2.2 + t * speed * 0.7) * (amplitude * 0.35) +
            Math.cos(x * frequency * 0.8 + t * speed * 1.5) * (amplitude * 0.2);
          ctx.lineTo(x, baseY + yOffset);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
      }
    };

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Background base
      ctx.fillStyle = '#EEF4F3';
      ctx.fillRect(0, 0, w, h);

      // Soft radial glows for depth
      const grd1 = ctx.createRadialGradient(w * 0.15, h * 0.2, 0, w * 0.15, h * 0.2, w * 0.5);
      grd1.addColorStop(0, 'rgba(49, 96, 95, 0.06)');
      grd1.addColorStop(1, 'rgba(49, 96, 95, 0)');
      ctx.fillStyle = grd1;
      ctx.fillRect(0, 0, w, h);

      const grd2 = ctx.createRadialGradient(w * 0.85, h * 0.8, 0, w * 0.85, h * 0.8, w * 0.45);
      grd2.addColorStop(0, 'rgba(249, 195, 36, 0.03)');
      grd2.addColorStop(1, 'rgba(249, 195, 36, 0)');
      ctx.fillStyle = grd2;
      ctx.fillRect(0, 0, w, h);

      // Draw all waves
      for (let i = 0; i < waves.length; i++) {
        drawWave(waves[i], timeRef.current, w, h);
      }

      timeRef.current += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [resize]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default React.memo(AnimatedBackground);
