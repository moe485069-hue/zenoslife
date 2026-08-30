import useAppStore from '../store/appStore';

export const XP_REWARDS = {
  completeHabit: 10,
  meditation: 20,
  journal: 15,
  flashcard: 5,
  completeTask: 10,
  addContent: 5
};

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 5000];

export default function useGamification() {
  const { addXP: storeAddXP, xp, level, awardBadge, badges } = useAppStore();

  const awardXP = (amount, action) => {
    storeAddXP(amount);
  };

  const getCurrentLevel = (currentXp) => {
    let lvl = 1;
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      if (currentXp >= LEVEL_THRESHOLDS[i]) lvl = i + 1;
      else break;
    }
    return lvl;
  };

  const getLevelProgress = (currentXp) => {
    const lvl = getCurrentLevel(currentXp);
    const currentThreshold = LEVEL_THRESHOLDS[lvl - 1];
    const nextThreshold = LEVEL_THRESHOLDS[lvl] || currentThreshold * 2;
    const progress = ((currentXp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const checkBadges = (stats) => {
    // mock logic
  };

  return { awardXP, getCurrentLevel, getLevelProgress, checkBadges };
}
