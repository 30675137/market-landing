import { useEffect, useRef } from "react";

/** Canvas "AI 星座网格" ambient background. Ported from the prototype's landing.js. */
export function AmbientCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const body = document.body;

    const motionOn = () =>
      body.getAttribute("data-motion") !== "off" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ambient = () => body.getAttribute("data-ambient") || "constellation";
    const violet = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--violet").trim() || "#7C5CFF";

    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    let raf = 0;
    let t = 0;

    function sizeCanvas() {
      W = canvas!.offsetWidth;
      H = canvas!.offsetHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function build() {
      sizeCanvas();
      const n = Math.round((W * H) / 16000);
      nodes = [];
      for (let i = 0; i < n; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.4 + 0.6,
        });
      }
    }
    function hex2rgb(h: string): [number, number, number] {
      h = h.replace("#", "");
      if (h.length === 3) h = h.split("").map((c) => c + c).join("");
      const n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function draw() {
      t += 0.005;
      ctx!.clearRect(0, 0, W, H);
      const mode = ambient();
      if (mode === "off") {
        if (motionOn()) raf = requestAnimationFrame(draw);
        return;
      }
      const [r, g, b] = hex2rgb(violet());
      const gx = W * (0.5 + Math.sin(t * 0.7) * 0.18);
      const gy = H * (0.22 + Math.cos(t * 0.5) * 0.1);
      const grd = ctx!.createRadialGradient(gx, gy, 0, gx, gy, W * 0.7);
      grd.addColorStop(0, `rgba(${r},${g},${b},0.12)`);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = grd;
      ctx!.fillRect(0, 0, W, H);

      if (mode === "glow") {
        if (motionOn()) raf = requestAnimationFrame(draw);
        return;
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const c = nodes[j];
          const dx = a.x - c.x;
          const dy = a.y - c.y;
          const d = Math.hypot(dx, dy);
          if (d < 78) {
            const al = (1 - d / 78) * 0.22;
            ctx!.strokeStyle = `rgba(${r},${g},${b},${al})`;
            ctx!.lineWidth = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(c.x, c.y);
            ctx!.stroke();
          }
        }
      }
      for (const a of nodes) {
        ctx!.fillStyle = `rgba(${r},${g},${b},0.6)`;
        ctx!.beginPath();
        ctx!.arc(a.x, a.y, a.r, 0, 6.283);
        ctx!.fill();
      }
      if (motionOn()) raf = requestAnimationFrame(draw);
    }
    function drawStatic() {
      sizeCanvas();
      ctx!.clearRect(0, 0, W, H);
      const mode = ambient();
      if (mode === "off") return;
      const [r, g, b] = hex2rgb(violet());
      const grd = ctx!.createRadialGradient(W * 0.5, H * 0.2, 0, W * 0.5, H * 0.2, W * 0.7);
      grd.addColorStop(0, `rgba(${r},${g},${b},0.12)`);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = grd;
      ctx!.fillRect(0, 0, W, H);
      if (mode === "glow") return;
      for (const a of nodes) {
        ctx!.fillStyle = `rgba(${r},${g},${b},0.5)`;
        ctx!.beginPath();
        ctx!.arc(a.x, a.y, a.r, 0, 6.283);
        ctx!.fill();
      }
    }
    function start() {
      cancelAnimationFrame(raf);
      if (motionOn()) draw();
      else drawStatic();
    }

    build();
    start();
    const onResize = () => {
      build();
      start();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas id="aiCanvas" ref={ref} />;
}
