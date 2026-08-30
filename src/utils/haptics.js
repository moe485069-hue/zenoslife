// Haptic Feedback API Utility for Life OS
// Safely triggers tactile vibrations on supported mobile devices (Android, PWA, Chrome Mobile)
// Gracefully no-ops on desktop / unsupported platforms.

class Haptics {
  constructor() {
    this.isEnabled = true;
  }

  isSupported() {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  vibrate(pattern) {
    if (!this.isEnabled || !this.isSupported()) return;
    try {
      navigator.vibrate(pattern);
    } catch (_) {
      // Ignore vibration errors
    }
  }

  // 1. Subtle Button Tap / Toggle (12ms)
  tap() {
    this.vibrate(12);
  }

  // 2. Habit / Task Checkmark Success (satisfying double-pulse)
  success() {
    this.vibrate([25, 35, 25]);
  }

  // 3. Level Up / Mythic Badge / Quest Conquered (triumphant rhythm)
  levelUp() {
    this.vibrate([40, 40, 40, 40, 80]);
  }

  // 4. Burning / Dissolving Thoughts in Non-Judgment / Perspective
  dissolve() {
    this.vibrate([15, 30, 45, 60]);
  }

  // 5. Coin Spending / Reward Unlocked
  rewardClaimed() {
    this.vibrate([30, 40, 50]);
  }

  // 6. Flow State Timer Tick / Start / End
  flowTick() {
    this.vibrate(8);
  }

  flowComplete() {
    this.vibrate([60, 60, 60, 60, 120]);
  }

  // 7. Danger / Reset Alert
  warning() {
    this.vibrate([50, 40, 50]);
  }
}

export const haptics = new Haptics();
export default haptics;
