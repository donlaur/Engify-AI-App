/**
 * Career Recommendation Service
 * Provides smart recommendations based on user's career level and goals
 */

import { userService } from './UserService';
import { skillTrackingService } from './SkillTrackingService';
import { CareerLevel, CareerGoal } from '@/lib/types/user';
import { getRequiredSkills, getDevelopingSkills, LEVEL_SKILL_REQUIREMENTS } from '@/lib/constants/skills';

export interface CareerRecommendation {
  type: 'pattern' | 'prompt' | 'project' | 'learning';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  skillsAddressed: string[];
}

export class CareerRecommendationService {
  /**
   * Get personalized recommendations based on career context
   */
  async getRecommendations(userId: string): Promise<CareerRecommendation[]> {
    const user = await userService.findById(userId);
    if (!user?.careerContext) {
      return this.getDefaultRecommendations();
    }

    const { level, careerGoal, targetLevel } = user.careerContext;
    const userSkills = await skillTrackingService.getUserSkills(userId);

    const recommendations: CareerRecommendation[] = [];

    // If aiming for promotion, focus on target level skills
    if (careerGoal === 'promotion' && targetLevel) {
      recommendations.push(...this.getPromotionRecommendations(level, targetLevel, userSkills));
    }

    // If skill-building, focus on current level mastery
    if (careerGoal === 'skill-building') {
      recommendations.push(...this.getSkillBuildingRecommendations(level, userSkills));
    }

    // If job-search, focus on marketable skills
    if (careerGoal === 'job-search') {
      recommendations.push(...this.getJobSearchRecommendations(level, userSkills));
    }

    // General recommendations based on level
    recommendations.push(...this.getLevelBasedRecommendations(level));

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get recommendations for promotion path
   */
  private getPromotionRecommendations(
    currentLevel: CareerLevel,
    targetLevel: CareerLevel,
    userSkills: any[]
  ): CareerRecommendation[] {
    const targetSkills = getRequiredSkills(targetLevel);
    const currentSkills = getRequiredSkills(currentLevel);
    
    // Skills needed for next level
    const gapSkills = targetSkills.filter(s => !currentSkills.includes(s));
    
    // Skills user hasn't developed yet
    const userSkillSet = new Set(userSkills.map(s => s.skill));
    const missingSkills = gapSkills.filter(s => !userSkillSet.has(s));

    const recommendations: CareerRecommendation[] = [];

    // System Design (for Senior → Staff)
    if (missingSkills.includes('system-design')) {
      recommendations.push({
        type: 'pattern',
        title: 'Master System Design Patterns',
        description: 'Use Tree of Thoughts and RAG patterns to design scalable systems',
        reason: `Required for ${targetLevel} level`,
        priority: 'high',
        skillsAddressed: ['system-design', 'architecture'],
      });
    }

    // Technical Leadership
    if (missingSkills.includes('technical-leadership')) {
      recommendations.push({
        type: 'prompt',
        title: 'Lead Technical Decisions',
        description: 'Use prompts for RFC writing, design docs, and technical proposals',
        reason: `Key skill for ${targetLevel}`,
        priority: 'high',
        skillsAddressed: ['technical-leadership', 'communication'],
      });
    }

    // Mentoring
    if (missingSkills.includes('mentoring')) {
      recommendations.push({
        type: 'project',
        title: 'Mentor Junior Engineers',
        description: 'Use code explanation and teaching prompts to mentor team members',
        reason: `Expected at ${targetLevel} level`,
        priority: 'medium',
        skillsAddressed: ['mentoring', 'communication'],
      });
    }

    return recommendations;
  }

  /**
   * Get recommendations for skill building
   */
  private getSkillBuildingRecommendations(
    level: CareerLevel,
    userSkills: any[]
  ): CareerRecommendation[] {
    const requiredSkills = getRequiredSkills(level);
    const userSkillSet = new Set(userSkills.map(s => s.skill));
    const weakSkills = requiredSkills.filter(s => {
      const skill = userSkills.find(us => us.skill === s);
      return !skill || skill.improvement < 50;
    });

    const recommendations: CareerRecommendation[] = [];

    if (weakSkills.includes('communication')) {
      recommendations.push({
        type: 'pattern',
        title: 'Improve Technical Communication',
        description: 'Practice Persona and Template patterns for clear documentation',
        reason: 'Strengthen core skill at your level',
        priority: 'high',
        skillsAddressed: ['communication'],
      });
    }

    if (weakSkills.includes('code-quality')) {
      recommendations.push({
        type: 'prompt',
        title: 'Master Code Review',
        description: 'Use code review prompts to improve code quality standards',
        reason: 'Essential skill for your level',
        priority: 'high',
        skillsAddressed: ['code-quality', 'technical-leadership'],
      });
    }

    return recommendations;
  }

  /**
   * Get recommendations for job search
   */
  private getJobSearchRecommendations(
    level: CareerLevel,
    userSkills: any[]
  ): CareerRecommendation[] {
    return [
      {
        type: 'project',
        title: 'Build Portfolio Projects',
        description: 'Use AI to accelerate building impressive portfolio projects',
        reason: 'Demonstrate skills to potential employers',
        priority: 'high',
        skillsAddressed: ['code-quality', 'system-design'],
      },
      {
        type: 'learning',
        title: 'Prepare for Interviews',
        description: 'Use prompts for system design practice and behavioral questions',
        reason: 'Stand out in interviews',
        priority: 'high',
        skillsAddressed: ['communication', 'system-design'],
      },
    ];
  }

  /**
   * Get level-based recommendations
   */
  private getLevelBasedRecommendations(level: CareerLevel): CareerRecommendation[] {
    const recommendations: CareerRecommendation[] = [];

    switch (level) {
      case 'junior':
        recommendations.push({
          type: 'pattern',
          title: 'Start with Few-Shot Learning',
          description: 'Learn by example - the easiest pattern for beginners',
          reason: 'Perfect for junior engineers',
          priority: 'medium',
          skillsAddressed: ['code-quality'],
        });
        break;

      case 'mid':
        recommendations.push({
          type: 'pattern',
          title: 'Master Chain of Thought',
          description: 'Break down complex problems step-by-step',
          reason: 'Level up your problem-solving',
          priority: 'medium',
          skillsAddressed: ['technical-leadership'],
        });
        break;

      case 'senior':
        recommendations.push({
          type: 'pattern',
          title: 'Use Tree of Thoughts for Architecture',
          description: 'Explore multiple solution paths for system design',
          reason: 'Senior engineers design systems',
          priority: 'medium',
          skillsAddressed: ['system-design', 'architecture'],
        });
        break;

      case 'staff':
      case 'principal':
        recommendations.push({
          type: 'pattern',
          title: 'Leverage RAG for Technical Strategy',
          description: 'Use retrieval-augmented generation for informed decisions',
          reason: 'Strategic thinking at scale',
          priority: 'medium',
          skillsAddressed: ['architecture', 'technical-leadership'],
        });
        break;
    }

    return recommendations;
  }

  /**
   * Get default recommendations (no career context)
   */
  private getDefaultRecommendations(): CareerRecommendation[] {
    return [
      {
        type: 'pattern',
        title: 'Start with Persona Pattern',
        description: 'Define AI role for better, more focused responses',
        reason: 'Most popular pattern for beginners',
        priority: 'high',
        skillsAddressed: ['communication'],
      },
      {
        type: 'pattern',
        title: 'Try Few-Shot Learning',
        description: 'Provide examples to guide AI responses',
        reason: 'Easy to learn, powerful results',
        priority: 'high',
        skillsAddressed: ['communication'],
      },
      {
        type: 'learning',
        title: 'Complete Career Assessment',
        description: 'Tell us about your career goals for personalized recommendations',
        reason: 'Get tailored learning path',
        priority: 'medium',
        skillsAddressed: [],
      },
    ];
  }

  /**
   * Get pattern recommendations for specific skill gap
   */
  getPatternForSkill(skill: string): string[] {
    const skillPatternMap: Record<string, string[]> = {
      'communication': ['Persona', 'Template', 'Output Formatting'],
      'technical-leadership': ['Chain of Thought', 'Cognitive Verifier', 'Meta-Prompting'],
      'system-design': ['Tree of Thoughts', 'RAG', 'Context Control'],
      'architecture': ['Tree of Thoughts', 'RAG'],
      'mentoring': ['Persona', 'Few-Shot', 'Question Refinement'],
      'collaboration': ['Persona', 'Template'],
      'project-management': ['Template', 'Constraint'],
      'code-quality': ['Self-Consistency', 'Cognitive Verifier'],
    };

    return skillPatternMap[skill] || ['Persona', 'Chain of Thought'];
  }
}

export const careerRecommendationService = new CareerRecommendationService();
