import React, { useEffect, useRef } from 'react';
import { PixelPetState } from '../../types';

interface PixelPetCanvasProps {
  pet: PixelPetState;
  state: 'studying' | 'break' | 'idle';
  width?: number;
  height?: number;
}

export const PixelPetCanvas: React.FC<PixelPetCanvasProps> = ({
  pet,
  state,
  width = 240,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let frame = 0;
    let animationId: number;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Background room colors based on theme
      const themeColors: Record<string, { wall: string; floor: string; desk: string }> = {
        'cozy-loft': { wall: '#2d2438', floor: '#433454', desk: '#c28553' },
        'cyberpunk-study': { wall: '#131124', floor: '#201a40', desk: '#ff007f' },
        'forest-cabin': { wall: '#1f2e23', floor: '#2d4233', desk: '#8c593b' },
        'matcha-cafe': { wall: '#263328', floor: '#3d4d3f', desk: '#d4a373' },
      };

      const theme = themeColors[pet.currentRoomTheme] || themeColors['cozy-loft'];

      // Draw Room Background
      ctx.fillStyle = theme.wall;
      ctx.fillRect(0, 0, width, 140);
      ctx.fillStyle = theme.floor;
      ctx.fillRect(0, 140, width, 60);

      // Window with stars / rain
      ctx.fillStyle = '#100e19';
      ctx.fillRect(20, 20, 50, 60);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#6d597a';
      ctx.strokeRect(20, 20, 50, 60);

      // Window moon & stars
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(52, 28, 10, 10);
      if (Math.floor(frame / 20) % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(28, 40, 3, 3);
        ctx.fillRect(40, 65, 3, 3);
      }

      // Desk
      ctx.fillStyle = theme.desk;
      ctx.fillRect(50, 130, 150, 45);
      ctx.fillStyle = '#3a2618'; // desk legs
      ctx.fillRect(60, 175, 12, 25);
      ctx.fillRect(178, 175, 12, 25);

      // Chair back
      ctx.fillStyle = '#b5838d';
      ctx.fillRect(95, 110, 42, 35);

      // Draw the Pet (Cat / Bear / Bunny)
      const bob = state === 'studying' ? Math.sin(frame * 0.15) * 2 : Math.sin(frame * 0.05) * 1.5;
      const petX = 100;
      const petY = 88 + bob;

      // Pet Body
      const petColor = pet.species === 'cat' ? '#f59e0b' : pet.species === 'bear' ? '#b45309' : '#e0e7ff';
      ctx.fillStyle = petColor;
      ctx.fillRect(petX, petY, 32, 30);

      // Ears
      if (pet.species === 'cat') {
        ctx.fillRect(petX + 2, petY - 8, 8, 8);
        ctx.fillRect(petX + 22, petY - 8, 8, 8);
        ctx.fillStyle = '#f472b6'; // pink inner ear
        ctx.fillRect(petX + 4, petY - 5, 4, 5);
        ctx.fillRect(petX + 24, petY - 5, 4, 5);
      } else if (pet.species === 'bunny') {
        ctx.fillRect(petX + 4, petY - 16, 6, 16);
        ctx.fillRect(petX + 22, petY - 16, 6, 16);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(petX + 6, petY - 12, 3, 10);
        ctx.fillRect(petX + 24, petY - 12, 3, 10);
      } else {
        // Bear round ears
        ctx.fillRect(petX + 2, petY - 6, 7, 7);
        ctx.fillRect(petX + 23, petY - 6, 7, 7);
      }

      // Eyes & Expression
      ctx.fillStyle = '#1e1b2e';
      if (state === 'studying') {
        // Concentrated eyes
        const blink = frame % 90 > 85;
        if (blink) {
          ctx.fillRect(petX + 6, petY + 12, 6, 2);
          ctx.fillRect(petX + 20, petY + 12, 6, 2);
        } else {
          ctx.fillRect(petX + 7, petY + 10, 5, 5);
          ctx.fillRect(petX + 20, petY + 10, 5, 5);
          // Sparkle
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(petX + 8, petY + 10, 2, 2);
          ctx.fillRect(petX + 21, petY + 10, 2, 2);
        }
      } else if (state === 'break') {
        // Sleeping / cozy curved eyes ( - . - )
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1e1b2e';
        ctx.beginPath();
        ctx.moveTo(petX + 6, petY + 12);
        ctx.lineTo(petX + 11, petY + 14);
        ctx.moveTo(petX + 21, petY + 14);
        ctx.lineTo(petX + 26, petY + 12);
        ctx.stroke();

        // "z Z" floaters
        const zOffset = (frame * 0.5) % 30;
        ctx.font = '10px "VT323", monospace';
        ctx.fillStyle = '#a5b4fc';
        ctx.fillText('z', petX + 34, petY - zOffset + 5);
        ctx.font = '14px "VT323", monospace';
        ctx.fillText('Z', petX + 42, petY - zOffset - 5);
      } else {
        // Idle happy face
        ctx.fillRect(petX + 8, petY + 11, 4, 4);
        ctx.fillRect(petX + 20, petY + 11, 4, 4);
      }

      // Cute blush cheeks
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(petX + 4, petY + 16, 4, 3);
      ctx.fillRect(petX + 24, petY + 16, 4, 3);

      // Nose & Mouth
      ctx.fillStyle = '#4c0519';
      ctx.fillRect(petX + 15, petY + 15, 3, 2);

      // Equipped Hat
      if (pet.equippedHat === 'graduate-cap') {
        ctx.fillStyle = '#1e1b2e';
        ctx.fillRect(petX + 4, petY - 14, 24, 6);
        ctx.fillRect(petX + 13, petY - 19, 6, 5);
        ctx.fillStyle = '#f59e0b'; // golden tassel
        ctx.fillRect(petX + 22, petY - 12, 3, 8);
      } else if (pet.equippedHat === 'headphones') {
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(petX - 2, petY + 6, 4, 12); // left ear cup
        ctx.fillRect(petX + 30, petY + 6, 4, 12); // right ear cup
        ctx.fillRect(petX + 2, petY - 4, 28, 4); // band
      } else if (pet.equippedHat === 'sprout') {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(petX + 15, petY - 10, 2, 7);
        ctx.fillRect(petX + 11, petY - 12, 5, 3);
        ctx.fillRect(petX + 16, petY - 14, 5, 3);
      } else if (pet.equippedHat === 'wizard-hat') {
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(petX + 2, petY - 8, 28, 4);
        ctx.fillRect(petX + 7, petY - 15, 18, 7);
        ctx.fillRect(petX + 11, petY - 22, 10, 7);
        ctx.fillRect(petX + 14, petY - 27, 4, 5);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(petX + 15, petY - 28, 2, 2);
      }

      // Laptop on Desk
      const laptopX = 104;
      const laptopY = 124;
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(laptopX - 10, laptopY + 6, 36, 4); // base
      ctx.fillStyle = '#475569';
      ctx.fillRect(laptopX - 8, laptopY - 14, 32, 20); // screen back
      // Screen glow
      ctx.fillStyle = state === 'studying' ? (frame % 30 > 15 ? '#38bdf8' : '#60a5fa') : '#334155';
      ctx.fillRect(laptopX - 6, laptopY - 12, 28, 16);

      // Typing paws when studying
      if (state === 'studying') {
        const pawOffset = Math.sin(frame * 0.4) > 0 ? 2 : 0;
        ctx.fillStyle = petColor;
        ctx.fillRect(laptopX - 4, laptopY + 3 - pawOffset, 6, 5);
        ctx.fillRect(laptopX + 14, laptopY + 3 + pawOffset, 6, 5);
      }

      // Steaming Mug of Coffee/Matcha
      const mugX = 158;
      const mugY = 122;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(mugX, mugY, 12, 14);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(mugX + 10, mugY + 3, 4, 8); // handle
      // Steam
      const steamY = (frame * 0.3) % 15;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(mugX + 4 + Math.sin(frame * 0.1) * 2, mugY - 4 - steamY, 2, 4);

      // Desk Lamp
      const lampX = 64;
      const lampY = 96;
      ctx.fillStyle = '#64748b';
      ctx.fillRect(lampX, lampY + 28, 14, 4); // base
      ctx.fillRect(lampX + 6, lampY + 12, 3, 16); // stem
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(lampX - 2, lampY, 18, 12); // shade
      // Lamp light cone
      ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
      ctx.beginPath();
      ctx.moveTo(lampX + 7, lampY + 12);
      ctx.lineTo(lampX - 20, 140);
      ctx.lineTo(lampX + 50, 140);
      ctx.closePath();
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [pet, state, width, height]);

  return (
    <div className="relative inline-block rounded-xl overflow-hidden border-4 border-slate-900 shadow-pixel bg-slate-950">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ imageRendering: 'pixelated' }}
        className="block"
      />
      {/* Whimsical mood badge */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/85 backdrop-blur-sm border-2 border-slate-700 rounded text-[10px] font-pixel text-yellow-300">
        {state === 'studying' ? '🔥 STUDY MODE' : state === 'break' ? '☕ COZY BREAK' : '✨ READY'}
      </div>
    </div>
  );
};
