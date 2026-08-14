import { useEffect, useRef } from "react";

type ParticleType = "dot" | "star" | "diamond";

interface Particle {
  x: number;
  y: number;
  speed: number;
  amplitude: number;
  offset: number;
  type: ParticleType;
  size: number;
  color: string;
  rotation: number;
}

const TOTAL = 120;

function createParticle(width: number, height: number, initial: boolean): Particle {
  const roll = Math.random();
  const type: ParticleType = roll < 0.6 ? "dot" : roll < 0.82 ? "star" : "diamond";

  const color =
    type === "dot"
      ? "rgba(168, 85, 247, 0.6)"
      : type === "star"
        ? "rgba(255, 255, 255, 0.3)"
        : "rgba(192, 132, 252, 0.4)";

  const size = type === "dot" ? 1 + Math.random() : type === "star" ? 2 + Math.random() * 2 : 2 + Math.random() * 2;

  return {
    x: Math.random() * width,
    y: initial ? Math.random() * height : -10,
    speed: 0.3 + Math.random() * 0.5,
    amplitude: 0.3 + Math.random() * 0.2,
    offset: Math.random() * Math.PI * 2,
    type,
    size,
    color,
    rotation: Math.random() * Math.PI,
  };
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let particles: Particle[] = Array.from({ length: TOTAL }, () => createParticle(width, height, true));

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    const drawDot = (p: Particle) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    };

    const drawStar = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-p.size, 0);
      ctx.lineTo(p.size, 0);
      ctx.moveTo(0, -p.size);
      ctx.lineTo(0, p.size);
      ctx.stroke();
      ctx.restore();
    };

    const drawDiamond = (p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
      ctx.restore();
    };

    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const t = Date.now() / 1000;

      for (const p of particles) {
        p.y += p.speed;
        p.x += Math.sin(t + p.offset) * p.amplitude;

        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        if (p.type === "dot") drawDot(p);
        else if (p.type === "star") drawStar(p);
        else drawDiamond(p);
      }

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      particles = [];
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />;
}
