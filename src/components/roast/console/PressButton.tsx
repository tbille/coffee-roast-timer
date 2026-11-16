import { forwardRef, useRef, type ButtonHTMLAttributes, type PointerEvent, type MouseEvent } from 'react';

export interface PressButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onPointerDown'> {
  /** Fires once per press: at pointer-down for touch/mouse/pen, on click for keyboard and assistive tech. */
  onPress: () => void;
}

/** A pointer click that follows a pointer-down within this window is the same press. */
const SAME_PRESS_MS = 1000;

/**
 * Button that acts at pointer-down, so a roast event is stamped when the finger
 * lands, not when it lifts. Keyboard activation (Enter/Space) still works through
 * click, and the follow-up click of a pointer press is ignored (no double fire).
 */
export const PressButton = forwardRef<HTMLButtonElement, PressButtonProps>(function PressButton(
  { onPress, disabled, ...props },
  ref,
) {
  const lastPointer = useRef(0);

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    lastPointer.current = performance.now();
    onPress();
  };

  const handleClick = (_e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (performance.now() - lastPointer.current < SAME_PRESS_MS) return;
    onPress();
  };

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      {...props}
    />
  );
});
