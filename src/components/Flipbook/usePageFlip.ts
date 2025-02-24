import { useState, useCallback } from 'react';
import Matrix from '../../utils/matrix';

const FLIP_DURATION = 1000;
const N_POLYGONS = 10;
const AMBIENT = 0.4;
const GLOSS = 0.6;

interface PageFlipState {
  currentPage: number;
  flipProgress: number;
  flipDirection: 'left' | 'right' | null;
  isAnimating: boolean;
  opacity: number;
}

interface UsePageFlipReturn extends PageFlipState {
  handleFlip: (direction: 'left' | 'right') => void;
  makePolygons: (face: 'front' | 'back', viewWidth: number, viewHeight: number) => Array<{
    key: string;
    pageIndex: number;
    lighting: string;
    bgPos: string;
    transform: string;
    z: number;
  }>;
}

export function usePageFlip(totalPages: number): UsePageFlipReturn {
  const [state, setState] = useState<PageFlipState>({
    currentPage: 0,
    flipProgress: 0,
    flipDirection: null,
    isAnimating: false,
    opacity: 1
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

  const handleFlip = useCallback((direction: 'left' | 'right') => {
    if (state.isAnimating) return;
    if (direction === 'left' && state.currentPage <= 0) return;
    if (direction === 'right' && state.currentPage >= totalPages - 2) return;

    setState(prev => ({
      ...prev,
      isAnimating: true,
      flipDirection: direction,
      flipProgress: 0,
      opacity: 1
    }));

    const animate = (start: number) => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / FLIP_DURATION);

      setState(prev => ({
        ...prev,
        flipProgress: progress,
        opacity: progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1
      }));

      if (progress < 1) {
        requestAnimationFrame(() => animate(start));
      } else {
        setState(prev => ({
          ...prev,
          currentPage: direction === 'left' ? prev.currentPage - 2 : prev.currentPage + 2,
          flipDirection: null,
          flipProgress: 0,
          opacity: 1,
          isAnimating: false
        }));
      }
    };

    requestAnimationFrame(() => animate(Date.now()));
  }, [state.isAnimating, state.currentPage, totalPages]);

  const makePolygons = useCallback((face: 'front' | 'back', viewWidth: number, viewHeight: number) => {
    if (!state.flipDirection) return [];

    const { flipProgress, flipDirection, currentPage } = state;
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
    pageMatrix.perspective(2400);
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

    const theta = flipProgress < 0.5 ? flipProgress * 2 * Math.PI : (1 - (flipProgress - 0.5) * 2) * Math.PI;
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

      matrix.translate3d(originRight ? viewWidth - x : x, 0, face === 'back' ? -z : z);
      matrix.rotateY(-rotate);

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
        z: Math.abs(Math.round(z))
      });

      radian += dRadian;
      rotate += dRotate;
    }

    return result;
  }, [state, computeLighting]);

  return {
    ...state,
    handleFlip,
    makePolygons
  };
}