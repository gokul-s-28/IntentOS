import { useEffect, useRef, memo } from 'react';

/* ─────────────────────────────────────────────────────────────
   PAGE THEME CONFIGS
   Each page has its own gradient + particle type
───────────────────────────────────────────────────────────── */
export const PAGE_THEMES = {
  login: {
    gradient: 'linear-gradient(135deg, #020917 0%, #0f0c29 40%, #1a0533 70%, #0a0a1a 100%)',
    orbs: ['#0EA5E9', '#6366F1', '#9333EA'],
    particles: 'orbs',
  },
  input: {
    gradient: 'linear-gradient(135deg, #011810 0%, #022b20 40%, #021b2e 100%)',
    orbs: ['#22C55E', '#06B6D4', '#3B82F6'],
    particles: 'waves',
  },
  dashboard: {
    gradient: 'linear-gradient(160deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
    orbs: ['#1d4ed8', '#1e3a5f', '#164e63'],
    particles: 'stars',
  },
  questions: {
    gradient: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 50%, #1a0808 100%)',
    orbs: ['#F59E0B', '#EF4444', '#dc2626'],
    particles: 'dots',
  },
  videos: {
    gradient: 'linear-gradient(135deg, #0d0520 0%, #1a0a3d 50%, #150830 100%)',
    orbs: ['#6366F1', '#8B5CF6', '#7c3aed'],
    particles: 'mesh',
  },
  notes: {
    gradient: 'linear-gradient(135deg, #00150f 0%, #022c22 50%, #011a0f 100%)',
    orbs: ['#14B8A6', '#22C55E', '#059669'],
    particles: 'blobs',
  },
  planner: {
    gradient: 'linear-gradient(135deg, #1a0d00 0%, #2d1900 50%, #1a1000 100%)',
    orbs: ['#FB923C', '#FACC15', '#f97316'],
    particles: 'warm',
  },
  analytics: {
    gradient: 'linear-gradient(135deg, #001a2e 0%, #002440 50%, #001830 100%)',
    orbs: ['#06B6D4', '#3B82F6', '#0284c7'],
    particles: 'grid',
  },
  productivity: {
    gradient: 'linear-gradient(135deg, #150020 0%, #250035 50%, #1a001e 100%)',
    orbs: ['#8B5CF6', '#EC4899', '#7c3aed'],
    particles: 'radial',
  },
};

/* ─────────────────────────────────────────────────────────────
   CANVAS RENDERERS
───────────────────────────────────────────────────────────── */

function useCanvas(drawFn, deps = []) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animating = true;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = (time) => {
      if (!animating) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFn(ctx, canvas, time);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      animating = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, deps);

  return canvasRef;
}

/* Stars (dashboard) */
function StarCanvas({ colors }) {
  const stars = useRef([]);

  const canvasRef = useCanvas((ctx, canvas, time) => {
    if (stars.current.length === 0) {
      for (let i = 0; i < 200; i++) {
        stars.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.3,
          speed: Math.random() * 0.3 + 0.05,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
    stars.current.forEach(s => {
      const alpha = 0.1 + 0.5 * (0.5 + 0.5 * Math.sin(time * 0.001 * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });
  });

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* Floating orbs (login) */
function OrbCanvas({ colors }) {
  const orbs = useRef([]);

  const canvasRef = useCanvas((ctx, canvas, time) => {
    if (orbs.current.length === 0) {
      colors.forEach((c, i) => {
        orbs.current.push({
          x: (canvas.width / (colors.length + 1)) * (i + 1),
          y: canvas.height * (0.3 + i * 0.2),
          r: 200 + i * 80,
          color: c,
          phase: i * Math.PI * 0.7,
          speed: 0.0003 + i * 0.0001,
        });
      });
      // Extra small orbs
      for (let i = 0; i < 8; i++) {
        orbs.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 40 + Math.random() * 60,
          color: colors[i % colors.length],
          phase: Math.random() * Math.PI * 2,
          speed: 0.0002 + Math.random() * 0.0003,
        });
      }
    }
    orbs.current.forEach(orb => {
      const dx = Math.sin(time * orb.speed + orb.phase) * 30;
      const dy = Math.cos(time * orb.speed * 0.7 + orb.phase) * 20;
      const grd = ctx.createRadialGradient(orb.x + dx, orb.y + dy, 0, orb.x + dx, orb.y + dy, orb.r);
      grd.addColorStop(0, orb.color + '18');
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(orb.x + dx, orb.y + dy, orb.r, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    });
  });

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* Glowing dots (questions) */
function DotsCanvas({ colors }) {
  const pts = useRef([]);

  const canvasRef = useCanvas((ctx, canvas, time) => {
    if (pts.current.length === 0) {
      for (let i = 0; i < 60; i++) {
        pts.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.0008 + 0.0003,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }
    }
    pts.current.forEach(p => {
      p.x = (p.x + p.vx + canvas.width)  % canvas.width;
      p.y = (p.y + p.vy + canvas.height) % canvas.height;
      const alpha = 0.08 + 0.25 * (0.5 + 0.5 * Math.sin(time * p.speed + p.phase));
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      grd.addColorStop(0, p.color + Math.round(alpha * 255).toString(16).padStart(2,'0'));
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    });
  });

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* Animated grid (analytics) */
function GridCanvas({ colors }) {
  const canvasRef = useCanvas((ctx, canvas, time) => {
    const spacing = 60;
    const cols = Math.ceil(canvas.width  / spacing) + 1;
    const rows = Math.ceil(canvas.height / spacing) + 1;
    ctx.strokeStyle = colors[0] + '14';
    ctx.lineWidth = 1;
    for (let c = 0; c < cols; c++) {
      const x = (c * spacing + time * 0.01) % canvas.width;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let r = 0; r < rows; r++) {
      const y = (r * spacing + time * 0.005) % canvas.height;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    // Intersection glow
    ctx.fillStyle = colors[1] + '08';
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = (c * spacing + time * 0.01) % canvas.width;
        const y = (r * spacing + time * 0.005) % canvas.height;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      }
    }
  });

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* Radial glow (productivity) */
function RadialCanvas({ colors }) {
  const canvasRef = useCanvas((ctx, canvas, time) => {
    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.4;
    const pulse = 1 + 0.08 * Math.sin(time * 0.001);
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400 * pulse);
    grd.addColorStop(0,   colors[0] + '20');
    grd.addColorStop(0.5, colors[1] + '0a');
    grd.addColorStop(1,   'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ─────────────────────────────────────────────────────────────
   MAIN ANIMATED BACKGROUND
───────────────────────────────────────────────────────────── */
const AnimatedBackground = memo(function AnimatedBackground({ theme = 'dashboard' }) {
  const config = PAGE_THEMES[theme] || PAGE_THEMES.dashboard;

  const renderParticles = () => {
    switch (config.particles) {
      case 'stars':   return <StarCanvas  colors={config.orbs} />;
      case 'orbs':    return <OrbCanvas   colors={config.orbs} />;
      case 'dots':    return <DotsCanvas  colors={config.orbs} />;
      case 'radial':  return <RadialCanvas colors={config.orbs} />;
      case 'grid':    return <GridCanvas  colors={config.orbs} />;
      case 'blobs':
      case 'waves':
      case 'mesh':
      case 'warm':
      default:        return <OrbCanvas   colors={config.orbs} />;
    }
  };

  return (
    <>
      {/* Base gradient */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: config.gradient,
      }} />
      {/* Animated particles layer */}
      {renderParticles()}
    </>
  );
});

export default AnimatedBackground;
