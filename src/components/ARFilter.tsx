'use client';

import { useEffect, useRef } from 'react';

interface ARFilterProps {
  filterId: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
}

export default function ARFilter({ filterId, videoRef, canvasRef, isActive }: ARFilterProps) {
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isActive || !videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (videoRef.current && canvasRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return null;
}