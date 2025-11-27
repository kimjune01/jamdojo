import React, { useRef } from 'react';

// Reusable strum zone component with velocity-based gain
// Props:
//   - notes: array of note strings (e.g., ['C3', 'E3', 'G3'])
//   - onStrum: callback (notes, direction, velocity) => void
//   - isActive: boolean for visual feedback
//   - children: content to render inside the zone
//   - className: additional CSS classes
//   - threshold: pixels from center needed to trigger strum (default 15)

export function StrumZone({
  notes,
  onStrum,
  isActive,
  children,
  className = '',
  threshold = 15,
}) {
  const zoneRef = useRef(null);
  const strumState = useRef({
    isActive: false,
    centerX: 0,
    centerY: 0,
    lastDirection: null,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  });

  const getDirectionFromAngle = (angle) => {
    const deg = angle * (180 / Math.PI);
    if (deg >= -45 && deg < 45) return 'right';
    if (deg >= 45 && deg < 135) return 'down';
    if (deg >= -135 && deg < -45) return 'up';
    return 'left';
  };

  // Calculate velocity from pointer speed (pixels per ms)
  // Returns 0-1 value, where faster = higher velocity
  const calculateVelocity = (e) => {
    const now = performance.now();
    const dt = now - strumState.current.lastTime;
    if (dt === 0) return 0.8;

    const dx = e.clientX - strumState.current.lastX;
    const dy = e.clientY - strumState.current.lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = dist / dt; // pixels per ms

    // Map speed to velocity: slow (~0.5 px/ms) = 0.4, fast (~5 px/ms) = 1.0
    const velocity = Math.min(1.0, 0.4 + (speed / 5) * 0.6);
    return velocity;
  };

  const handlePointerDown = (e) => {
    if (!zoneRef.current) return;
    zoneRef.current.setPointerCapture(e.pointerId);

    const rect = zoneRef.current.getBoundingClientRect();
    strumState.current = {
      isActive: true,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      lastDirection: null,
      lastTime: performance.now(),
      lastX: e.clientX,
      lastY: e.clientY,
    };
  };

  const handlePointerMove = (e) => {
    if (!strumState.current.isActive) return;

    const { centerX, centerY } = strumState.current;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > threshold) {
      const angle = Math.atan2(deltaY, deltaX);
      const direction = getDirectionFromAngle(angle);

      if (strumState.current.lastDirection !== direction) {
        const audioDirection = (direction === 'up' || direction === 'left') ? 'up' : 'down';
        const velocity = calculateVelocity(e);
        onStrum(notes, audioDirection, velocity);
        strumState.current.lastDirection = direction;
      }
    }

    // Update tracking for velocity calculation
    strumState.current.lastTime = performance.now();
    strumState.current.lastX = e.clientX;
    strumState.current.lastY = e.clientY;
  };

  const handlePointerUp = (e) => {
    if (zoneRef.current) {
      zoneRef.current.releasePointerCapture(e.pointerId);
    }
    strumState.current.isActive = false;
    strumState.current.lastDirection = null;
  };

  return (
    <div
      ref={zoneRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`select-none touch-none cursor-grab active:cursor-grabbing ${className}`}
    >
      {children}
    </div>
  );
}
