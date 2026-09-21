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
  width = 280,
  height = 230,
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
        'cyberpunk-study': { wall: '#131124', floor: '#201a40', desk: '#06b6d4' },
        'forest-cabin': { wall: '#1f2e23', floor: '#2d4233', desk: '#8c593b' },
        'matcha-cafe': { wall: '#263328', floor: '#3d4d3f', desk: '#d4a373' },
        'starlight-observatory': { wall: '#09081a', floor: '#14122b', desk: '#475569' },
      };

      const theme = themeColors[pet.currentRoomTheme] || themeColors['cozy-loft'];

      // Draw Room Background
      ctx.fillStyle = theme.wall;
      ctx.fillRect(0, 0, width, 160);
      ctx.fillStyle = theme.floor;
      ctx.fillRect(0, 160, width, 70);

      // Special Starlight Observatory constellations
      if (pet.currentRoomTheme === 'starlight-observatory') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(40, 30, 2, 2);
        ctx.fillRect(80, 50, 2, 2);
        ctx.fillRect(200, 35, 2, 2);
        ctx.fillRect(240, 60, 2, 2);
        ctx.strokeStyle = 'rgba(165, 180, 252, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 30);
        ctx.lineTo(80, 50);
        ctx.lineTo(120, 25);
        ctx.stroke();
      }

      // Window
      ctx.fillStyle = '#100e19';
      ctx.fillRect(20, 25, 54, 65);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#6d597a';
      ctx.strokeRect(20, 25, 54, 65);

      // Window Moon & Stars
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(54, 34, 12, 12);
      if (Math.floor(frame / 25) % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(28, 48, 3, 3);
        ctx.fillRect(42, 72, 3, 3);
      }

      // Desk
      ctx.fillStyle = theme.desk;
      ctx.fillRect(50, 145, 180, 50);
      ctx.fillStyle = '#3a2618'; // legs
      ctx.fillRect(60, 195, 12, 35);
      ctx.fillRect(208, 195, 12, 35);

      // Chair back
      ctx.fillStyle = '#b5838d';
      ctx.fillRect(115, 125, 48, 40);

      // Draw the Pet
      const bob = state === 'studying' ? Math.sin(frame * 0.15) * 2 : Math.sin(frame * 0.05) * 1.5;
      const petX = 120;
      const petY = 100 + bob;

      // Pet Colors
      let petColor = '#f59e0b'; // cat
      if (pet.species === 'bear') petColor = '#b45309';
      if (pet.species === 'bunny') petColor = '#e0e7ff';
      if (pet.species === 'frog') petColor = '#22c55e';
      if (pet.species === 'duck') petColor = '#facc15';

      // Body
      ctx.fillStyle = petColor;
      ctx.fillRect(petX, petY, 36, 34);

      // Ears / Features
      if (pet.species === 'cat') {
        ctx.fillRect(petX + 3, petY - 9, 9, 9);
        ctx.fillRect(petX + 24, petY - 9, 9, 9);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(petX + 5, petY - 6, 5, 6);
        ctx.fillRect(petX + 26, petY - 6, 5, 6);
      } else if (pet.species === 'bunny') {
        ctx.fillRect(petX + 5, petY - 18, 7, 18);
        ctx.fillRect(petX + 24, petY - 18, 7, 18);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(petX + 7, petY - 14, 3, 12);
        ctx.fillRect(petX + 26, petY - 14, 3, 12);
      } else if (pet.species === 'bear') {
        ctx.fillRect(petX + 2, petY - 7, 9, 9);
        ctx.fillRect(petX + 25, petY - 7, 9, 9);
      } else if (pet.species === 'frog') {
        // Frog big round eyes
        ctx.fillRect(petX + 3, petY - 6, 10, 8);
        ctx.fillRect(petX + 23, petY - 6, 10, 8);
      } else if (pet.species === 'duck') {
        // Orange bill
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(petX + 13, petY + 16, 10, 6);
      }

      // Eyes & Expression
      ctx.fillStyle = '#1e1b2e';
      if (state === 'studying') {
        const blink = frame % 90 > 85;
        if (blink) {
          ctx.fillRect(petX + 8, petY + 14, 6, 2);
          ctx.fillRect(petX + 22, petY + 14, 6, 2);
        } else {
          ctx.fillRect(petX + 9, petY + 12, 5, 5);
          ctx.fillRect(petX + 22, petY + 12, 5, 5);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(petX + 10, petY + 12, 2, 2);
          ctx.fillRect(petX + 23, petY + 12, 2, 2);
        }
      } else if (state === 'break') {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1e1b2e';
        ctx.beginPath();
        ctx.moveTo(petX + 8, petY + 14);
        ctx.lineTo(petX + 13, petY + 16);
        ctx.moveTo(petX + 23, petY + 16);
        ctx.lineTo(petX + 28, petY + 14);
        ctx.stroke();

        const zOffset = (frame * 0.5) % 30;
        ctx.font = '12px "VT323", monospace';
        ctx.fillStyle = '#a5b4fc';
        ctx.fillText('z', petX + 38, petY - zOffset + 5);
        ctx.font = '16px "VT323", monospace';
        ctx.fillText('Z', petX + 46, petY - zOffset - 5);
      } else {
        ctx.fillRect(petX + 10, petY + 13, 4, 4);
        ctx.fillRect(petX + 22, petY + 13, 4, 4);
      }

      // Blush
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(petX + 5, petY + 18, 5, 3);
      ctx.fillRect(petX + 26, petY + 18, 5, 3);

      // Hats
      if (pet.equippedHat === 'graduate-cap') {
        ctx.fillStyle = '#1e1b2e';
        ctx.fillRect(petX + 5, petY - 14, 26, 6);
        ctx.fillRect(petX + 15, petY - 20, 7, 6);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(petX + 25, petY - 12, 3, 9);
      } else if (pet.equippedHat === 'headphones') {
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(petX - 3, petY + 8, 5, 14);
        ctx.fillRect(petX + 34, petY + 8, 5, 14);
        ctx.fillRect(petX + 2, petY - 4, 32, 4);
      } else if (pet.equippedHat === 'sprout') {
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(petX + 17, petY - 12, 3, 9);
        ctx.fillRect(petX + 12, petY - 14, 6, 4);
        ctx.fillRect(petX + 19, petY - 16, 6, 4);
      } else if (pet.equippedHat === 'wizard-hat') {
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(petX + 3, petY - 8, 30, 5);
        ctx.fillRect(petX + 8, petY - 16, 20, 8);
        ctx.fillRect(petX + 13, petY - 24, 11, 8);
        ctx.fillRect(petX + 16, petY - 30, 5, 6);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(petX + 17, petY - 31, 3, 3);
      } else if (pet.equippedHat === 'golden-crown') {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(petX + 6, petY - 12, 24, 8);
        // Spikes
        ctx.fillRect(petX + 6, petY - 16, 4, 4);
        ctx.fillRect(petX + 16, petY - 18, 4, 6);
        ctx.fillRect(petX + 26, petY - 16, 4, 4);
        // Ruby gem
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(petX + 17, petY - 10, 2, 3);
      } else if (pet.equippedHat === 'strawberry-beret') {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(petX + 4, petY - 12, 28, 9);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(petX + 17, petY - 15, 3, 3); // stem
      } else if (pet.equippedHat === 'viking-helm') {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(petX + 4, petY - 10, 28, 7);
        // Horns
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(petX, petY - 16, 5, 10);
        ctx.fillRect(petX + 31, petY - 16, 5, 10);
      }

      // Laptop
      const laptopX = 126;
      const laptopY = 138;
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(laptopX - 12, laptopY + 6, 44, 5);
      ctx.fillStyle = '#475569';
      ctx.fillRect(laptopX - 9, laptopY - 16, 38, 22);
      ctx.fillStyle = state === 'studying' ? (frame % 30 > 15 ? '#38bdf8' : '#60a5fa') : '#334155';
      ctx.fillRect(laptopX - 7, laptopY - 14, 34, 18);

      if (state === 'studying') {
        const pawOffset = Math.sin(frame * 0.4) > 0 ? 2 : 0;
        ctx.fillStyle = petColor;
        ctx.fillRect(laptopX - 5, laptopY + 3 - pawOffset, 7, 6);
        ctx.fillRect(laptopX + 18, laptopY + 3 + pawOffset, 7, 6);
      }

      // Desk Trinket
      const trinketX = 190;
      const trinketY = 132;
      if (pet.deskTrinket === 'matcha-latte' || !pet.deskTrinket || pet.deskTrinket === 'none') {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(trinketX, trinketY + 2, 14, 16);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(trinketX + 2, trinketY + 3, 10, 3); // matcha green
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(trinketX + 12, trinketY + 6, 4, 8);
        const steamY = (frame * 0.3) % 15;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(trinketX + 5 + Math.sin(frame * 0.1) * 2, trinketY - steamY, 2, 4);
      } else if (pet.deskTrinket === 'bonsai') {
        ctx.fillStyle = '#78350f'; // pot
        ctx.fillRect(trinketX, trinketY + 10, 16, 8);
        ctx.fillStyle = '#15803d'; // foliage
        ctx.fillRect(trinketX - 3, trinketY - 2, 22, 12);
        ctx.fillRect(trinketX + 2, trinketY - 8, 12, 6);
      } else if (pet.deskTrinket === 'lava-lamp') {
        ctx.fillStyle = '#475569'; // base & top
        ctx.fillRect(trinketX + 3, trinketY + 14, 10, 4);
        ctx.fillRect(trinketX + 4, trinketY - 4, 8, 3);
        ctx.fillStyle = '#ec4899'; // glass
        ctx.fillRect(trinketX + 4, trinketY, 8, 14);
        // glowing blob
        ctx.fillStyle = '#facc15';
        const blobY = (frame * 0.2) % 10;
        ctx.fillRect(trinketX + 6, trinketY + 2 + blobY, 4, 4);
      } else if (pet.deskTrinket === 'golden-trophy') {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(trinketX + 1, trinketY - 4, 14, 12);
        ctx.fillRect(trinketX + 6, trinketY + 8, 4, 6);
        ctx.fillRect(trinketX + 3, trinketY + 14, 10, 4);
      }

      // Desk Lamp
      const lampX = 66;
      const lampY = 105;
      ctx.fillStyle = '#64748b';
      ctx.fillRect(lampX, lampY + 36, 16, 4);
      ctx.fillRect(lampX + 7, lampY + 16, 3, 20);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(lampX - 2, lampY, 22, 16);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
      ctx.beginPath();
      ctx.moveTo(lampX + 9, lampY + 16);
      ctx.lineTo(lampX - 25, 155);
      ctx.lineTo(lampX + 60, 155);
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
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/85 backdrop-blur-sm border-2 border-slate-700 rounded text-[10px] font-pixel text-yellow-300">
        {state === 'studying' ? '🔥 STUDY MODE' : state === 'break' ? '☕ COZY BREAK' : '✨ READY'}
      </div>
    </div>
  );
};
