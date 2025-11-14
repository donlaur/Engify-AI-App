/**
 * Load Pain Points from JSON
 * 
 * Loads pain point data from public/data/pain-points.json
 * Falls back to pain-points-backup.json if main file doesn't exist
 */

import { validatePainPointsJson, type PainPoint } from './pain-point-schema';
import fs from 'fs/promises';
import path from 'path';

const MAIN_JSON_PATH = path.join(process.cwd(), 'public', 'data', 'pain-points.json');
const BACKUP_JSON_PATH = path.join(process.cwd(), 'public', 'data', 'pain-points-backup.json');

export async function loadPainPointsFromJson(): Promise<PainPoint[]> {
  try {
    // Try main file first
    const jsonContent = await fs.readFile(MAIN_JSON_PATH, 'utf-8');
    const jsonData = JSON.parse(jsonContent);
    const validated = validatePainPointsJson(jsonData);
    return validated.painPoints;
  } catch (error) {
    // Fallback to backup
    try {
      const backupContent = await fs.readFile(BACKUP_JSON_PATH, 'utf-8');
      const backupData = JSON.parse(backupContent);
      const validated = validatePainPointsJson(backupData);
      return validated.painPoints;
    } catch (backupError) {
      console.error('Failed to load pain points from JSON:', error);
      return [];
    }
  }
}

export async function getPainPointBySlug(slug: string): Promise<PainPoint | null> {
  const painPoints = await loadPainPointsFromJson();
  return painPoints.find(pp => pp.slug === slug) || null;
}

export async function getPainPointById(id: string): Promise<PainPoint | null> {
  const painPoints = await loadPainPointsFromJson();
  return painPoints.find(pp => pp.id === id) || null;
}

export async function getPainPointsMetadata() {
  const painPoints = await loadPainPointsFromJson();
  return {
    totalPainPoints: painPoints.length,
    publishedPainPoints: painPoints.filter(pp => pp.status === 'published').length,
  };
}

