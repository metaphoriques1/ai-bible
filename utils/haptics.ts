// Haptic feedback utility

/**
 * Triggers haptic feedback if the browser supports it.
 * @param pattern - A VibratePattern (e.g., a number for milliseconds, or an array like [100, 50, 100])
 *                  Defaults to a short vibration.
 *                  Common patterns:
 *                  - 'light': 20ms (for quick confirmations)
 *                  - 'medium': 50ms
 *                  - 'heavy': 100ms
 *                  - 'success': [100, 30, 100, 30, 100] (example complex pattern)
 *                  - 'error': [75, 50, 75, 50, 75] (example complex pattern)
 */
export const triggerHapticFeedback = (pattern?: VibratePattern | 'light' | 'medium' | 'heavy' | 'success' | 'error'): void => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    let vibratePattern: VibratePattern = 50; // Default medium

    if (typeof pattern === 'string') {
      switch (pattern) {
        case 'light':
          vibratePattern = 20;
          break;
        case 'medium':
          vibratePattern = 50;
          break;
        case 'heavy':
          vibratePattern = 100;
          break;
        case 'success':
          vibratePattern = [80, 40, 80];
          break;
        case 'error':
          vibratePattern = [60, 30, 60, 30, 60];
          break;
        default:
          vibratePattern = 50; 
      }
    } else if (pattern !== undefined) {
      vibratePattern = pattern;
    }
    
    try {
      window.navigator.vibrate(vibratePattern);
    } catch (e) {
      // Vibration might be disabled by user settings or other reasons
      console.warn("Haptic feedback trigger failed:", e);
    }
  }
};
