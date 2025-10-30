/**
 * Career Integration
 * Ties together all career-related features across the platform
 */

import { userService } from '@/lib/services/UserService';
import { skillTrackingService } from '@/lib/services/SkillTrackingService';
import { careerRecommendationService } from '@/lib/services/CareerRecommendationService';
import { activityService } from '@/lib/services/ActivityService';
import { notificationService } from '@/lib/services/NotificationService';

/**
 * Track prompt usage and update career progress
 * Called after every prompt execution
 */
export async function trackCareerProgress(
  userId: string,
  promptCategory: string,
  patternId?: string
): Promise<void> {
  try {
    // Track skills from prompt
    await skillTrackingService.trackPromptSkills(userId, promptCategory);

    // Track skills from pattern if used
    if (patternId) {
      await skillTrackingService.trackPatternSkills(userId, patternId);
    }

    // Update skill improvements
    await skillTrackingService.updateSkillImprovements(userId);

    // Check for milestones and send notifications
    await checkCareerMilestones(userId);
  } catch (error) {
    console.error('Failed to track career progress:', error);
  }
}

/**
 * Check for career milestones and send notifications
 */
async function checkCareerMilestones(userId: string): Promise<void> {
  const user = await userService.getUserById(userId);
  const careerContext = (user as { careerContext?: unknown })?.careerContext;
  if (!careerContext) return;

  const skills = await skillTrackingService.getUserSkills(userId);
  const stats = await skillTrackingService.getSkillStats(userId);

  // Milestone: First skill improvement
  if (stats.totalSkills === 1 && skills[0].count === 1) {
    await notificationService.sendAchievement(
      userId,
      'First Skill Tracked! 🎯',
      `You're developing ${skills[0].skill.replace('-', ' ')} skills`,
      '🎯'
    );
  }

  // Milestone: 10 prompts used
  const activities = await activityService.getUserActivity(userId, 100, 0);
  const promptsUsed = activities.filter((a) => a.type === 'use').length;

  if (promptsUsed === 10) {
    await notificationService.sendAchievement(
      userId,
      '10 Prompts Milestone! 🚀',
      "You're building momentum in your AI journey",
      '🚀'
    );
  }

  // Milestone: Promotion readiness threshold
  const userCareerContext = (
    user as { careerContext?: { careerGoal?: string; targetLevel?: string } }
  )?.careerContext;
  if (
    userCareerContext?.careerGoal === 'promotion' &&
    stats.averageImprovement >= 70
  ) {
    await notificationService.createNotification(
      userId,
      'success',
      'Ready for Promotion Discussion! 🎉',
      `You're ${stats.averageImprovement}% ready for ${userCareerContext.targetLevel}. Time to talk to your manager!`,
      '/dashboard/career'
    );
  }

  // Milestone: Skill mastery (80%+)
  const masteredSkills = skills.filter((s) => s.improvement >= 80);
  if (masteredSkills.length > 0 && masteredSkills[0].count % 10 === 0) {
    await notificationService.sendAchievement(
      userId,
      'Skill Mastery! ⭐',
      `You've mastered ${masteredSkills[0].skill.replace('-', ' ')}`,
      '⭐'
    );
  }
}

/**
 * Get enhanced dashboard data with career context
 */
export async function getCareerDashboardData(userId: string) {
  const [user, skills, recommendations, activities, stats] = await Promise.all([
    userService.getUserById(userId),
    skillTrackingService.getUserSkills(userId),
    careerRecommendationService.getRecommendations(userId),
    activityService.getUserActivity(userId, 50, 0),
    skillTrackingService.getSkillStats(userId),
  ]);

  const promptsUsed = activities.filter(
    (a: { type: string }) => a.type === 'use'
  ).length;
  const timeSaved = (promptsUsed * 2) / 60; // 2 min per prompt, convert to hours

  // Calculate promotion readiness
  let promotionReadiness = 0;
  const userCareerContext = (
    user as { careerContext?: { careerGoal?: string; targetLevel?: string } }
  )?.careerContext;
  if (userCareerContext?.careerGoal === 'promotion') {
    promotionReadiness = Math.min(100, stats.averageImprovement);
  }

  // Get next milestone
  let nextMilestone = '';
  if (promptsUsed < 10) {
    nextMilestone = `Use ${10 - promptsUsed} more prompts to unlock achievement`;
  } else if (promotionReadiness < 70) {
    nextMilestone = `Reach ${70 - promotionReadiness}% more readiness for promotion`;
  } else if (stats.totalSkills < 5) {
    nextMilestone = `Develop ${5 - stats.totalSkills} more skills`;
  }
  return {
    user,
    careerContext: userCareerContext,
    skills: skills.slice(0, 5), // Top 5 skills
    recommendations: recommendations.slice(0, 3), // Top 3 recommendations
    stats: {
      promptsUsed,
      timeSaved: Math.round(timeSaved * 10) / 10,
      skillsActive: stats.activeSkills,
      promotionReadiness,
    },
    nextMilestone,
  };
}

/**
 * Generate career progress report for email
 */
export async function generateCareerProgressReport(userId: string): Promise<{
  subject: string;
  body: string;
}> {
  const data = await getCareerDashboardData(userId);
  const weeklySkills = await skillTrackingService.getWeeklySkills(userId);

  const subject = `Your Weekly Career Progress - ${data.stats.promptsUsed} prompts, ${data.stats.timeSaved}h saved`;

  const body = `
Hi ${data.user?.name || 'there'}!

Here's your career progress this week:

📊 ACTIVITY
- Prompts used: ${data.stats.promptsUsed}
- Time saved: ${data.stats.timeSaved} hours
- Skills active: ${data.stats.skillsActive}

🎯 SKILLS DEVELOPED
${weeklySkills
  .slice(0, 3)
  .map(
    (s: { skill: string; count: number; improvement: number }) =>
      `- ${s.skill.replace('-', ' ')}: ${s.count} uses (+${s.improvement}%)`
  )
  .join('\n')}

${
  (data.careerContext as { careerGoal?: string; targetLevel?: string })
    ?.careerGoal === 'promotion'
    ? `
🚀 PROMOTION READINESS
You're ${data.stats.promotionReadiness}% ready for ${(data.careerContext as { targetLevel?: string })?.targetLevel || 'your target level'}!
${data.stats.promotionReadiness >= 70 ? '✅ Ready to discuss with your manager!' : `Keep developing these skills to reach 70%`}
`
    : ''
}

💡 RECOMMENDED FOR YOU
${data.recommendations
  .slice(0, 2)
  .map(
    (r: { title: string; description: string }) =>
      `- ${r.title}: ${r.description}`
  )
  .join('\n')}

${data.nextMilestone ? `🎯 NEXT MILESTONE\n${data.nextMilestone}\n` : ''}

Keep up the great work!

View your full dashboard: [Dashboard Link]
  `.trim();

  return { subject, body };
}

/**
 * Add career context to notification messages
 */
export function enhanceNotificationWithCareer(
  message: string,
  careerContext?: {
    level: string;
    targetLevel?: string;
    careerGoal?: string;
  }
): string {
  if (!careerContext) return message;

  let enhancement = '';

  if (careerContext.careerGoal === 'promotion' && careerContext.targetLevel) {
    enhancement = ` (Building ${careerContext.targetLevel} skills)`;
  } else if (careerContext.careerGoal === 'skill-building') {
    enhancement = ` (Strengthening ${careerContext.level} skills)`;
  }

  return message + enhancement;
}

/**
 * Calculate ROI with career impact
 */
export async function calculateCareerROI(userId: string): Promise<{
  timeSaved: number;
  costSavings: number;
  careerImpact: {
    skillsImproved: number;
    promotionReadiness: number;
    estimatedSalaryImpact: number;
  };
}> {
  const activities = await activityService.getUserActivity(userId, 1000, 0);
  const stats = await skillTrackingService.getSkillStats(userId);
  const user = await userService.getUserById(userId);

  const promptsUsed = activities.filter(
    (a: { type: string }) => a.type === 'use'
  ).length;
  const timeSaved = (promptsUsed * 2) / 60; // hours
  const costSavings = timeSaved * 100; // $100/hour

  // Career impact
  const userCareerContext = (
    user as { careerContext?: { careerGoal?: string } }
  )?.careerContext;
  const promotionReadiness =
    userCareerContext?.careerGoal === 'promotion'
      ? Math.min(100, stats.averageImprovement)
      : 0;

  // Estimate salary impact based on promotion readiness
  // Assume average promotion = $15K salary increase
  const estimatedSalaryImpact = Math.round((promotionReadiness / 100) * 15000);

  return {
    timeSaved: Math.round(timeSaved * 10) / 10,
    costSavings: Math.round(costSavings),
    careerImpact: {
      skillsImproved: stats.totalSkills,
      promotionReadiness,
      estimatedSalaryImpact,
    },
  };
}

/**
 * Integration hook for prompt execution
 * Call this after every prompt is executed
 */
export async function onPromptExecuted(
  userId: string,
  promptCategory: string,
  patternId?: string,
  metadata?: {
    success: boolean;
    tokensUsed: number;
  }
): Promise<void> {
  // Track activity
  await activityService.trackActivity(
    userId,
    'use',
    'prompt',
    promptCategory,
    metadata
  );

  // Track career progress
  await trackCareerProgress(userId, promptCategory, patternId);

  // Update user's last active
  await userService.updateLastLogin(userId);
}

/**
 * Integration hook for pattern completion
 * Call this when user completes a pattern
 */
export async function onPatternCompleted(
  userId: string,
  patternId: string
): Promise<void> {
  // Track pattern skills
  await skillTrackingService.trackPatternSkills(userId, patternId);

  // Send achievement
  await notificationService.sendPatternUnlock(userId, patternId);

  // Track activity
  await activityService.trackActivity(userId, 'complete', 'pattern', patternId);
}
