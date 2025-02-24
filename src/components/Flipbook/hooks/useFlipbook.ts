import { useState, useCallback } from 'react';
import Matrix from '../../../utils/matrix';
import html2canvas from 'html2canvas';

const N_POLYGONS = 10;
const AMBIENT = 0.4;
const GLOSS = 0.6;
const SWIPE_MIN = 30;

interface TouchState {
  startX: number | null;
  startY: number | null;
  maxMove: number;
}

export function useFlipbook(
  viewWidth: number,
  viewHeight: number,
  currentPage: number,
  totalPages: number,
  onFlip: (direction: 'left' | 'right') => void,
  updateDebugInfo?: (info: any) => void
) {
  const [flipDirection, setFlipDirection] = useState<'left' | 'right' | null>(null);
  const [flipProgress, setFlipProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [touch, setTouch] = useState<TouchState>({
    startX: null,
    startY: null,
    maxMove: 0
  });

  const computeLighting = useCallback((rot: number, dRotate: number) => {
    const gradients = [];
    const lightingPoints = [-0.5, -0.25, 0, 0.25, 0.5];

    if (AMBIENT < 1) {
      const blackness = 1 - AMBIENT;
      const diffuse = lightingPoints.map(d => 
        (1 - Math.cos((rot - dRotate * d) / 180 * Math.PI)) * blackness
      );
      gradients.push(`linear-gradient(to right,
        rgba(0, 0, 0, ${diffuse[0]}),
        rgba(0, 0, 0, ${diffuse[1]}) 25%,
        rgba(0, 0, 0, ${diffuse[2]}) 50%,
        rgba(0, 0, 0, ${diffuse[3]}) 75%,
        rgba(0, 0, 0, ${diffuse[4]}))`
      );
    }

    if (GLOSS > 0) {
      const DEG = 30;
      const POW = 200;
      const specular = lightingPoints.map(d =>
        Math.max(
          Math.pow(Math.cos((rot + DEG - dRotate * d) / 180 * Math.PI), POW),
          Math.pow(Math.cos((rot - DEG - dRotate * d) / 180 * Math.PI), POW)
        )
      );
      gradients.push(`linear-gradient(to right,
        rgba(255, 255, 255, ${specular[0] * GLOSS}),
        rgba(255, 255, 255, ${specular[1] * GLOSS}) 25%,
        rgba(255, 255, 255, ${specular[2] * GLOSS}) 50%,
        rgba(255, 255, 255, ${specular[3] * GLOSS}) 75%,
        rgba(255, 255, 255, ${specular[4] * GLOSS}))`
      );
    }

    return gradients.join(',');
  }, []);

  const makePolygons = useCallback((face: 'front' | 'back') => {
    if (!flipDirection || !viewWidth || !viewHeight) return [];

    const polygonWidth = viewWidth / N_POLYGONS;
    let pageX = 0;
    let originRight = false;

    if (flipDirection === 'left') {
      if (face === 'back') {
        pageX = viewWidth / 2;
      } else {
        originRight = true;
      }
    } else {
      if (face === 'front') {
        pageX = viewWidth / 2;
      } else {
        originRight = true;
      }
    }

    const pageMatrix = new Matrix();
    pageMatrix.translate(viewWidth / 2);
    pageMatrix.perspective(2000);
    pageMatrix.translate(-viewWidth / 2);
    pageMatrix.translate(pageX, 0);

    let pageRotation = 0;
    if (flipProgress > 0.5) {
      pageRotation = -(flipProgress - 0.5) * 2 * 180;
    }
    if (flipDirection === 'left') {
      pageRotation = -pageRotation;
    }
    if (face === 'back') {
      pageRotation += 180;
    }

    if (pageRotation) {
      if (originRight) pageMatrix.translate(viewWidth);
      pageMatrix.rotateY(pageRotation);
      if (originRight) pageMatrix.translate(-viewWidth);
    }

    const theta = flipProgress < 0.5 
      ? flipProgress * 2 * Math.PI 
      : (1 - (flipProgress - 0.5) * 2) * Math.PI;
    const radius = viewWidth / (theta || 1e-9);

    let radian = 0;
    const dRadian = theta / N_POLYGONS;
    let rotate = (dRadian / 2 / Math.PI) * 180;
    const dRotate = (dRadian / Math.PI) * 180;

    if (originRight) {
      rotate = (-theta / Math.PI) * 180 + dRotate / 2;
    }

    if (face === 'back') {
      rotate = -rotate;
    }

    const result = [];
    for (let i = 0; i < N_POLYGONS; i++) {
      const bgPos = `${(i / (N_POLYGONS - 1)) * 100}% 0px`;

      const matrix = pageMatrix.clone();
      const rad = originRight ? theta - radian : radian;
      const x = Math.sin(rad) * radius;
      const z = (1 - Math.cos(rad)) * radius;
      const depth = face === 'back' ? -z * 1.001 : z; // Slight offset to prevent z-fighting

      matrix.translate3d(originRight ? viewWidth - x : x, 0, depth);
      matrix.rotateY(-rotate);

      // Update debug info
      if (updateDebugInfo && i === Math.floor(N_POLYGONS / 2)) {
        updateDebugInfo({
          transform: matrix.toString(),
          perspective: 2000,
          rotation: pageRotation,
          progress: flipProgress,
          polygons: N_POLYGONS
        });
      }

      const lighting = computeLighting(pageRotation - rotate, dRotate);
      const pageIndex = flipDirection === 'left'
        ? face === 'front' ? currentPage - 2 : currentPage - 1
        : face === 'front' ? currentPage + 1 : currentPage + 2;

      result.push({
        key: `${face}${i}`,
        pageIndex,
        lighting,
        bgPos,
        transform: matrix.toString(),
        z: Math.abs(Math.round(depth))
      });

      radian += dRadian;
      rotate += dRotate;
    }

    return result;
  }, [flipDirection, flipProgress, viewWidth, viewHeight, currentPage, computeLighting, updateDebugInfo]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouch({
      startX: e.touches[0].pageX,
      startY: e.touches[0].pageY,
      maxMove: 0
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touch.startX) return;

    const x = e.touches[0].pageX - touch.startX;
    const y = e.touches[0].pageY - touch.startY!;
    const maxMove = Math.max(touch.maxMove, Math.abs(x));

    if (Math.abs(y) > Math.abs(x)) return;

    setTouch(prev => ({ ...prev, maxMove }));

    if (x > 0 && currentPage > 0) {
      if (!flipDirection && x >= SWIPE_MIN) {
        setFlipDirection('left');
      }
      if (flipDirection === 'left') {
        setFlipProgress(Math.min(x / viewWidth, 1));
        setOpacity(x / viewWidth > 0.7 ? 1 - (x / viewWidth - 0.7) / 0.3 : 1);
      }
    } else if (x < 0 && currentPage < totalPages - 2) {
      if (!flipDirection && x <= -SWIPE_MIN) {
        setFlipDirection('right');
      }
      if (flipDirection === 'right') {
        setFlipProgress(Math.min(-x / viewWidth, 1));
        setOpacity(-x / viewWidth > 0.7 ? 1 - (-x / viewWidth - 0.7) / 0.3 : 1);
      }
    }
  }, [touch, flipDirection, currentPage, totalPages, viewWidth]);

  const handleTouchEnd = useCallback(() => {
    if (flipDirection) {
      if (flipProgress > 0.25) {
        onFlip(flipDirection);
      }
      setFlipDirection(null);
      setFlipProgress(0);
      setOpacity(1);
    }
    setTouch({ startX: null, startY: null, maxMove: 0 });
  }, [flipDirection, flipProgress, onFlip]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click
    handleTouchStart({ touches: [{ pageX: e.pageX, pageY: e.pageY }] } as any);
  }, [handleTouchStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!touch.startX) return;
    handleTouchMove({
      touches: [{ pageX: e.pageX, pageY: e.pageY }]
    } as any);
  }, [touch.startX, handleTouchMove]);

  const handleMouseUp = useCallback(() => {
    handleTouchEnd();
  }, [handleTouchEnd]);

  const polygons = [...makePolygons('front'), ...makePolygons('back')];

  return {
    polygons,
    flipDirection,
    opacity,
    touchStartX: touch.startX,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}