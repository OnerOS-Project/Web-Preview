import React from 'react';
import type { ScreenEdge } from '../layout';

export interface BottomBarProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  edge?: ScreenEdge;
}

/**
 * BottomBar — Fluent Valley bottom system bar.
 *
 * Layout: Widgets (left) | Applications (center) | System (right)
 *
 * The center zone uses absolute positioning to remain
 * optically centered regardless of left/right content width.
 */
const BottomBar: React.FC<BottomBarProps> = ({
  left,
  center,
  right,
  className = '',
}) => {
  return (
    <div
      id="os-bottombar"
      className={`fv-bottombar ${className}`}
      role="navigation"
      aria-label="System bottom bar"
    >
      <div className="fv-bottombar-left">
        {left}
      </div>

      <div className="fv-bottombar-center">
        {center}
      </div>

      <div className="fv-bottombar-right">
        {right}
      </div>
    </div>
  );
};

export default BottomBar;
