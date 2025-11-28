import React, { useRef } from 'react';

// Reusable strum zone component with velocity-based gain
// Strums trigger when crossing the horizontal center line
// Props:
//   - notes: array of note strings (e.g., ['C3', 'E3', 'G3'])
//   - onStrum: callback (notes, direction, velocity) => void
//   - onClick: callback () => void - called when user taps without strumming
//   - isActive: boolean for visual feedback
//   - children: content to render inside the zone
//   - className: additional CSS classes

export function StrumZone({
  notes,
  onStrum,
  onClick,
  isActive,
  children,
  className = '',
}) {
  const zoneRef = useRef(null);
  const strumState = useRef({
    isActive: false,
    centerY: 0,
    lastHalf: null, // 'upper' or 'lower'
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    didStrum: false, // Track if a strum happened during this gesture
  });

  // Calculate linear velocity (pixels per ms) based on pointer movement
  const calculateVelocity = (clientX, clientY) => {
    const now = performance.now();
    const dt = now - strumState.current.lastTime;
    if (dt === 0 || strumState.current.lastX === 0) return 0;

    const dx = clientX - strumState.current.lastX;
    const dy = clientY - strumState.current.lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist / dt; // pixels per ms
  };

  // Map linear velocity to gain (0.05 to 1.0)
  // ~0.5 px/ms = slow, ~5 px/ms = fast
  const velocityToGain = (velocity) => {
    const gain = Math.min(1.0, 0.05 + (velocity / 5) * 0.95);
    return gain;
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (!zoneRef.current) return;
    zoneRef.current.setPointerCapture(e.pointerId);

    const rect = zoneRef.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const currentHalf = e.clientY < centerY ? 'upper' : 'lower';

    strumState.current = {
      isActive: true,
      centerY,
      lastHalf: currentHalf,
      lastX: e.clientX,
      lastY: e.clientY,
      lastTime: performance.now(),
      didStrum: false,
    };
  };

  const handlePointerMove = (e) => {
    if (!strumState.current.isActive) return;
    e.preventDefault();

    const { centerY, lastHalf } = strumState.current;
    const currentHalf = e.clientY < centerY ? 'upper' : 'lower';

    // Calculate linear velocity for gain
    const velocity = calculateVelocity(e.clientX, e.clientY);

    // Trigger strum when crossing the center line
    if (currentHalf !== lastHalf) {
      const gain = velocityToGain(velocity);
      // Moving down (upper -> lower) = downstrum, moving up (lower -> upper) = upstrum
      const audioDirection = currentHalf === 'lower' ? 'down' : 'up';

      onStrum(notes, audioDirection, gain);
      strumState.current.lastHalf = currentHalf;
      strumState.current.didStrum = true;
    }

    // Update tracking
    strumState.current.lastX = e.clientX;
    strumState.current.lastY = e.clientY;
    strumState.current.lastTime = performance.now();
  };

  const handlePointerUp = (e) => {
    if (zoneRef.current) {
      zoneRef.current.releasePointerCapture(e.pointerId);
    }
    // If no strum happened, this was a click/tap - call onClick
    if (!strumState.current.didStrum && onClick) {
      onClick();
    }
    strumState.current.isActive = false;
    strumState.current.lastHalf = null;
    strumState.current.lastX = 0;
    strumState.current.lastY = 0;
    strumState.current.didStrum = false;
  };

  return (
    <div
      ref={zoneRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`select-none touch-none cursor-grab active:cursor-grabbing relative ${className}`}
    >
      {/* Subtle center line indicator */}
      <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-px bg-white/10 pointer-events-none" />
      {children}
    </div>
  );
}
