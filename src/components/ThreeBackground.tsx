import React, { useEffect, useRef } from 'react';

const ThreeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    
    let cx = width / 2;
    let cy = height / 2;
    
    // 3D Engine parameters
    const focus = 380;
    let pitch = 0.05; // Pitch rotation (look down slightly)
    let yaw = 0;      // Yaw rotation (pan left/right)
    
    let targetPitch = 0.05;
    let targetYaw = 0;
    
    let gridZOffset = 0;
    const scrollSpeed = 0.6; // Scroll speed of floor grid lines
    
    // Mouse movement listener
    const handleMouseMove = (e: MouseEvent) => {
      // Scale mouse displacement to max +/- 0.12 radians for a refined parallax
      targetYaw = ((e.clientX / width) - 0.5) * 0.16;
      targetPitch = (((e.clientY / height) - 0.5) * 0.12) + 0.05; // Offset baseline pitch down
    };
    
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cx = width / 2;
      cy = height / 2;
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // 3D Particles (floating space dust/stars in the top half)
    const numStars = 45;
    const stars: { x: number; y: number; z: number; size: number; speed: number }[] = [];
    
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 1200,
        y: -(Math.random() * 250) - 50, // Floating upper-half
        z: Math.random() * 700 + 100,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.2 + 0.1
      });
    }
    
    // Helper to project 3D coordinates onto 2D screen
    const project = (x3d: number, y3d: number, z3d: number) => {
      // 1. Rotation around X-axis (pitch)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y1 = y3d * cosP - z3d * sinP;
      const z1 = y3d * sinP + z3d * cosP;
      
      // 2. Rotation around Y-axis (yaw)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x2 = x3d * cosY - z1 * sinY;
      const z2 = x3d * sinY + z1 * cosY;
      
      // 3. Perspective mapping
      const scale = focus / (focus + z2);
      const screenX = cx + x2 * scale;
      const screenY = cy + y1 * scale;
      
      return { x: screenX, y: screenY, scale, zDepth: z2 };
    };
    
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Smooth interpolation for spring-like camera lag
      pitch += (targetPitch - pitch) * 0.05;
      yaw += (targetYaw - yaw) * 0.05;
      
      // Increment floor grid scrolling
      gridZOffset -= scrollSpeed;
      if (gridZOffset < -100) {
        gridZOffset += 100;
      }
      
      // Draw 3D Perspective Floor Grid
      const floorY = 160; // Height coordinates of floor plane
      const gridMinX = -800;
      const gridMaxX = 800;
      const gridStepX = 80;
      const gridMinZ = 50;
      const gridMaxZ = 750;
      const gridStepZ = 60;
      
      ctx.lineWidth = 0.7;
      
      // Render Z depth lines (radiating outwards in perspective)
      for (let x3d = gridMinX; x3d <= gridMaxX; x3d += gridStepX) {
        ctx.beginPath();
        const pStart = project(x3d, floorY, gridMinZ);
        const pEnd = project(x3d, floorY, gridMaxZ);
        
        if (pStart.scale > 0 && pEnd.scale > 0) {
          ctx.moveTo(pStart.x, pStart.y);
          ctx.lineTo(pEnd.x, pEnd.y);
          
          // Gradient fade to horizon
          const grad = ctx.createLinearGradient(pStart.x, pStart.y, pEnd.x, pEnd.y);
          grad.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
          grad.addColorStop(0.6, 'rgba(6, 182, 212, 0.03)');
          grad.addColorStop(1, 'transparent');
          
          ctx.strokeStyle = grad;
          ctx.stroke();
        }
      }
      
      // Render X lines (moving grid segments)
      for (let zVal = gridMinZ; zVal <= gridMaxZ; zVal += gridStepZ) {
        // Offset Z values to create scroll flow
        let z3d = zVal + gridZOffset;
        if (z3d < gridMinZ) continue;
        
        ctx.beginPath();
        const pStart = project(gridMinX, floorY, z3d);
        const pEnd = project(gridMaxX, floorY, z3d);
        
        if (pStart.scale > 0 && pEnd.scale > 0) {
          ctx.moveTo(pStart.x, pStart.y);
          ctx.lineTo(pEnd.x, pEnd.y);
          
          // Horizon fade multiplier
          const opacity = Math.max(0, 0.08 * (1 - (z3d - gridMinZ) / (gridMaxZ - gridMinZ)));
          ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
          ctx.stroke();
        }
      }
      
      // Update and Draw 3D Floating Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      stars.forEach((star) => {
        // Drift forward slightly
        star.z -= star.speed;
        if (star.z < 20) {
          star.z = 700; // Reset depth
          star.x = (Math.random() - 0.5) * 1200;
          star.y = -(Math.random() * 250) - 50;
        }
        
        const p = project(star.x, star.y, star.z);
        if (p.scale > 0 && p.zDepth > 0) {
          const r = star.size * p.scale;
          // Fade opacity based on depth
          const opacity = Math.max(0, 0.25 * (1 - p.zDepth / 700));
          ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
      
      // Connect close stars to make a 3D neural net layout
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length; i++) {
        const starA = stars[i];
        const pA = project(starA.x, starA.y, starA.z);
        if (pA.scale <= 0 || pA.zDepth <= 0) continue;
        
        let connections = 0;
        for (let j = i + 1; j < stars.length; j++) {
          if (connections >= 2) break; // Limit lines to keep it clean and minimal
          
          const starB = stars[j];
          const dx = starA.x - starB.x;
          const dy = starA.y - starB.y;
          const dz = starA.z - starB.z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          // Connect if distance is within range
          if (dist3D < 140) {
            const pB = project(starB.x, starB.y, starB.z);
            if (pB.scale > 0 && pB.zDepth > 0) {
              const depthAvg = (pA.zDepth + pB.zDepth) / 2;
              const opacity = Math.max(0, 0.12 * (1 - depthAvg / 700) * (1 - dist3D / 140));
              
              ctx.beginPath();
              ctx.moveTo(pA.x, pA.y);
              ctx.lineTo(pB.x, pB.y);
              ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
              ctx.stroke();
              connections++;
            }
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    // Start animation loop
    render();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#09090b'
      }}
    />
  );
};

export default ThreeBackground;
