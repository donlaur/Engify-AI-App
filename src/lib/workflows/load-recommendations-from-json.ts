/**
 * Load Recommendations from JSON
 * 
 * Loads recommendations from public/data/recommendations.json
 * Falls back to backup file if primary file fails
 */

import fs from 'fs';
import path from 'path';
import { validateRecommendationsJson, type RecommendationsJsonData } from './recommendation-schema';

const recommendationsPath = path.join(process.cwd(), 'public', 'data', 'recommendations.json');
const backupRecommendationsPath = path.join(process.cwd(), 'public', 'data', 'recommendations-backup.json');

export async function loadRecommendationsFromJson(): Promise<RecommendationsJsonData['recommendations']> {
  try {
    // Try primary file first
    const fileContents = fs.readFileSync(recommendationsPath, 'utf-8');
    const data = JSON.parse(fileContents);
    const validated = validateRecommendationsJson(data);
    return validated.recommendations;
  } catch (primaryError) {
    console.warn('Failed to load recommendations.json, trying backup:', primaryError);
    
    try {
      // Fallback to backup file
      const backupContents = fs.readFileSync(backupRecommendationsPath, 'utf-8');
      const backupData = JSON.parse(backupContents);
      const validated = validateRecommendationsJson(backupData);
      return validated.recommendations;
    } catch (backupError) {
      console.error('Failed to load both primary and backup recommendations files:', backupError);
      return []; // Return empty array if both fail
    }
  }
}

export async function getRecommendationBySlug(slug: string) {
  const recommendations = await loadRecommendationsFromJson();
  return recommendations.find((rec) => rec.slug === slug && rec.status === 'published');
}

export async function getPublishedRecommendations() {
  const recommendations = await loadRecommendationsFromJson();
  return recommendations.filter((rec) => rec.status === 'published');
}

