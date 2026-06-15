import React, { useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ children, style, className }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [coords, setCoords] = useState({ rx: 0, ry: 0, x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Cursor position relative to card boundaries
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalize coordinates centered at (0, 0) ranging from -0.5 to 0.5
    const normalizedX = mouseX / width - 0.5;
    const normalizedY = mouseY / height - 0.5;

    // Compute rotational tilt: 8 degrees max to keep it precise and clean
    const maxTilt = 8;
    const rx = -normalizedY * maxTilt;
    const ry = normalizedX * maxTilt;

    // Specular highlight coordinate percentage
    const x = (mouseX / width) * 100;
    const y = (mouseY / height) * 100;

    setIsHovering(true);
    setCoords({ rx, ry, x, y });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Smooth reset back to baseline
    setCoords({ rx: 0, ry: 0, x: 50, y: 50 });
  };

  // High-fidelity responsive transitions
  const transitionStyle = isHovering 
    ? 'transform 0.1s ease-out, box-shadow 0.1s ease-out, background 0.1s ease-out' 
    : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className || "glass-panel"}
      style={{
        ...style,
        transform: `perspective(1000px) rotateX(${coords.rx}deg) rotateY(${coords.ry}deg) scale(${isHovering ? 1.015 : 1})`,
        transition: transitionStyle,
        position: 'relative',
        transformStyle: 'preserve-3d',
        overflow: 'hidden',
        // Specular gloss mapping
        background: isHovering
          ? `radial-gradient(circle at ${coords.x}% ${coords.y}%, rgba(255, 255, 255, 0.04) 0%, transparent 65%), hsl(var(--bg-card))`
          : 'hsl(var(--bg-card))',
        boxShadow: isHovering
          ? `rgba(0, 0, 0, 0.35) 0px 15px 35px -5px, rgba(16, 185, 129, 0.08) 0px 0px 20px 0px`
          : 'rgba(0, 0, 0, 0.25) 0px 4px 12px 0px',
        borderColor: isHovering 
          ? 'hsl(var(--primary) / 0.3)' 
          : 'hsl(var(--border-color))'
      }}
    >
      {/* Parallax depth container */}
      <div style={{ transform: 'translateZ(12px)', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
