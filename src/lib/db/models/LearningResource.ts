/**
 * Learning Resource Model
 * MongoDB schema for learning materials with JSON fallback
 */

import mongoose from 'mongoose';

export interface ILearningResource {
  id: string;
  title: string;
  description: string;
  category:
    | 'basics'
    | 'intermediate'
    | 'advanced'
    | 'patterns'
    | 'applications';
  type: 'article' | 'video' | 'course' | 'tutorial' | 'guide' | 'interactive';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration?: string; // e.g., "15 min", "2 hours"
  url?: string;
  content?: string;
  tags: string[];
  author?: string;
  source?: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const LearningResourceSchema = new mongoose.Schema<ILearningResource>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['basics', 'intermediate', 'advanced', 'patterns', 'applications'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['article', 'video', 'course', 'tutorial', 'guide', 'interactive'],
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      index: true,
    },
    duration: String,
    url: String,
    content: String,
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    author: String,
    source: String,
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
LearningResourceSchema.index({ category: 1, level: 1 });
LearningResourceSchema.index({ featured: 1, order: 1 });
LearningResourceSchema.index({ tags: 1 });

export const LearningResource =
  mongoose.models.LearningResource ||
  mongoose.model<ILearningResource>('LearningResource', LearningResourceSchema);
