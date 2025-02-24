import React from 'react';
import type { LineHeight, Visual, SizeRatio } from '../types';

interface LineSegment {
  x: number;
  width: number;
}

interface TextLinesProps { 
  wordCount: number;
  availableSpace: number;
  columns: number;
  lineHeight: LineHeight;
  visuals: Visual[];
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const getLineHeightPercent = (lineHeight: LineHeight): number => {
  const [num, den] = lineHeight.split('/').map(Number);
  return (num / den) * 100;
};

export function TextLines({ 
  columns,
  lineHeight,
  availableSpace,
  visuals,
  margins = { top: 0, right: 0, bottom: 0, left: 0 }
}: TextLinesProps) {
  const lineHeightPercent = getLineHeightPercent(lineHeight);

  const getVisualWidth = (ratio: SizeRatio): number => {
    if (ratio === 'full') return 100;
    const [num, den] = ratio.split('/').map(Number);
    return (num / den) * 100;
  };

  const getLineSegments = (columnIndex: number, y: number): LineSegment[] => {
    const columnWidth = 100 / columns;
    const columnStart = columnIndex * columnWidth;
    const columnEnd = columnStart + columnWidth;

    // Find visuals that intersect with this line
    const intersectingVisuals = visuals.filter(visual => {
      const visualWidth = getVisualWidth(visual.width);
      const visualEnd = visual.x + visualWidth;
      const visualHeight = getVisualWidth(visual.height);
      const visualBottom = visual.y + visualHeight;

      return (
        y >= visual.y && y <= visualBottom && // Vertical intersection
        ((visual.x >= columnStart && visual.x < columnEnd) || // Visual starts in column
        (visualEnd > columnStart && visualEnd <= columnEnd) || // Visual ends in column
        (visual.x <= columnStart && visualEnd >= columnEnd)) // Visual spans column
      );
    });

    if (intersectingVisuals.length === 0) {
      return [{ x: 0, width: 100 }];
    }

    // Sort visuals by x position
    const sortedVisuals = [...intersectingVisuals].sort((a, b) => a.x - b.x);
    
    const segments: LineSegment[] = [];
    let currentX = 0;

    sortedVisuals.forEach(visual => {
      const visualWidth = getVisualWidth(visual.width);
      const visualStart = (visual.x - columnStart) / columnWidth * 100;
      const visualEnd = visualStart + (visualWidth / columnWidth * 100);

      // Add segment before visual if there's space
      if (visualStart > currentX) {
        segments.push({
          x: currentX,
          width: visualStart - currentX
        });
      }

      currentX = visualEnd;
    });

    // Add final segment if there's space after last visual
    if (currentX < 100) {
      segments.push({
        x: currentX,
        width: 100 - currentX
      });
    }

    return segments;
  };

  const generateLines = () => {
    const lines = [];
    let y = 0;

    while (y < 100) {
      for (let col = 0; col < columns; col++) {
        const segments = getLineSegments(col, y);
        segments.forEach(segment => {
          if (segment.width > 0) {
            lines.push({ y, col, ...segment });
          }
        });
      }
      y += lineHeightPercent + (lineHeightPercent * 0.3); // Add margin between lines
    }

    return lines;
  };

  const lines = generateLines();

  return (
    <div 
      className="absolute inset-0"
      style={{ 
        height: '100%',
        padding: `${margins.top}% ${margins.right}% ${margins.bottom}% ${margins.left}%`
      }}
    >
      <div 
        className="h-full relative" 
        style={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`, 
          gap: columns > 1 ? '2rem' : '0',
          columnRule: columns > 1 ? '1px solid #e5e7eb' : 'none',
          columnGap: columns > 1 ? '2rem' : '0',
        }}
      >
        {lines.map(({ y, col, x, width }, index) => (
          <div
            key={`line-${index}`}
            className="bg-gray-300 rounded absolute"
            style={{
              height: `${lineHeightPercent}%`,
              width: `${width}%`,
              left: `${(col * (100 / columns)) + x}%`,
              top: `${y}%`
            }}
          />
        ))}
      </div>
    </div>
  );
}