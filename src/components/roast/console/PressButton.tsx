import { forwardRef, useRef, type ButtonHTMLAttributes, type PointerEvent, type MouseEvent } from 'react';

export interface PressButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onPointerDown'> {
  /** Fires once per press: at pointer-down for touch/mouse/pen, on click for keyboard and assistive tech. */
  onPress: () => void;
}

/**
 * Button that acts at pointer-down, so a roast event is stamped when the finger
 * lands, not when it lifts. Keyboard activation (Enter/Space) still works through
 * click, and the follow-up click of a pointer press is ignored however long the
 * press was held (no double fire). Rapid repeat presses are the caller's concern.
 */
export const PressButton = forwardRef<HTMLButtonElement, PressButtonProps>(function PressButton(
  { onPress, disabled, ...props },
  ref,
) {
  /** A pointer press fired at pointer-down and its click has not arrived yet. */
  const pointerPress = useRef(false);

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    pointerPress.current = true;
    onPress();
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    // detail 0: keyboard or assistive tech, always its own press.
    if (e.detail > 0 && pointerPress.current) {
      pointerPress.current = false;
      return;
    }
    onPress();
  };

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerCancel={() => {
        pointerPress.current = false;
      }}
      onClick={handleClick}
      {...props}
    />
  );
});
