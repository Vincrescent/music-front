import { useEffect, useRef, useCallback } from 'react';

/**
 * Canvas-based audio visualizer with smooth equalizer bars.
 * Purely decorative — no actual audio needed.
 * Uses layered sine waves for organic, music-like motion.
 */
export default function AudioVisualizer({ className = '', barCount = 64, baseColor = [230, 126, 34] }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);

  const draw = useCallback((ctx, width, height, time) => {
    ctx.clearRect(0, 0, width, height);

    const totalBars = barCount;
    const gap = 2;
    const barWidth = Math.max(2, (width - gap * (totalBars - 1)) / totalBars);
    const maxBarHeight = height * 0.7;
    const reflectionHeight = height * 0.2;
    const baseY = height * 0.72;

    for (let i = 0; i < totalBars; i++) {
      const x = i * (barWidth + gap);

      // Layered sine waves for natural, complex movement
      const normalizedI = i / totalBars;
      const wave1 = Math.sin(time * 1.2 + i * 0.15) * 0.35;
      const wave2 = Math.sin(time * 0.8 + i * 0.08 + 1.5) * 0.25;
      const wave3 = Math.sin(time * 2.0 + i * 0.25 + 3.0) * 0.15;
      const wave4 = Math.sin(time * 0.5 + i * 0.05 + 0.7) * 0.1;
      const wave5 = Math.sin(time * 3.0 + i * 0.4) * 0.08;

      // Envelope — bars in center are taller
      const envelope = Math.sin(normalizedI * Math.PI) * 0.6 + 0.4;

      // Combine everything
      const intensity = Math.max(0.08, (0.5 + wave1 + wave2 + wave3 + wave4 + wave5) * envelope);
      const barHeight = intensity * maxBarHeight;

      // Gradient for each bar: bright at top → darker at bottom
      const [r, g, b] = baseColor;
      const gradient = ctx.createLinearGradient(x, baseY - barHeight, x, baseY);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.95)`);
      gradient.addColorStop(0.4, `rgba(${Math.min(255, r + 30)}, ${Math.min(255, g + 40)}, ${b}, 0.85)`);
      gradient.addColorStop(1, `rgba(${r - 40}, ${g - 30}, ${b - 10}, 0.6)`);

      // Main bar (rounded top)
      ctx.fillStyle = gradient;
      ctx.beginPath();
      const radius = Math.min(barWidth / 2, 3);
      ctx.moveTo(x, baseY);
      ctx.lineTo(x, baseY - barHeight + radius);
      ctx.quadraticCurveTo(x, baseY - barHeight, x + radius, baseY - barHeight);
      ctx.lineTo(x + barWidth - radius, baseY - barHeight);
      ctx.quadraticCurveTo(x + barWidth, baseY - barHeight, x + barWidth, baseY - barHeight + radius);
      ctx.lineTo(x + barWidth, baseY);
      ctx.closePath();
      ctx.fill();

      // Glow effect on top of bar
      const glowGradient = ctx.createRadialGradient(
        x + barWidth / 2, baseY - barHeight, 0,
        x + barWidth / 2, baseY - barHeight, barWidth * 2
      );
      glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.3 * intensity})`);
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(x - barWidth, baseY - barHeight - barWidth, barWidth * 3, barWidth * 2);

      // Reflection (mirrored, fading out)
      const reflectionGradient = ctx.createLinearGradient(x, baseY + 2, x, baseY + reflectionHeight);
      reflectionGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.2)`);
      reflectionGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = reflectionGradient;
      const refHeight = Math.min(barHeight * 0.4, reflectionHeight);
      ctx.fillRect(x, baseY + 2, barWidth, refHeight);
    }

    // Horizontal glow line at base
    const lineGradient = ctx.createLinearGradient(0, baseY, width, baseY);
    lineGradient.addColorStop(0, 'rgba(230, 126, 34, 0)');
    lineGradient.addColorStop(0.3, 'rgba(230, 126, 34, 0.3)');
    lineGradient.addColorStop(0.5, 'rgba(230, 126, 34, 0.5)');
    lineGradient.addColorStop(0.7, 'rgba(230, 126, 34, 0.3)');
    lineGradient.addColorStop(1, 'rgba(230, 126, 34, 0)');
    ctx.fillStyle = lineGradient;
    ctx.fillRect(0, baseY - 1, width, 2);
  }, [barCount, baseColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let running = true;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      if (!running) return;
      timeRef.current += 0.016; // ~60fps
      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height, timeRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${className}`}
      style={{ display: 'block' }}
    />
  );
}
