import { useMemo } from 'react';
import Matrix from '../../../utils/matrix';

const N_POLYGONS = 10;
const AMBIENT = 0.4;
const GLOSS = 0.6;

function computeLighting(rot: number, dRotate: number) {
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
}

export function usePolygons(
  viewWidth: number,
  viewHeight: number,
  currentPage: number,
  flipDirection: 'left' | 'right' | null,
  totalPages: number
) {
  return useMemo(() => {
    if (!flipDirection || !viewWidth || !viewHeight) return [];

    const makePolygons = (face: 'front' | 'back') => {
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

      const theta = Math.PI / 2;
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
    };

    return [...makePolygons('front'), ...makePolygons('back')];
  }, [viewWidth, viewHeight, currentPage, flipDirection, totalPages]);
}