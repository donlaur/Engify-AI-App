/**
 * Career Recommendations Component
 * Shows personalized pattern/prompt recommendations based on career goals
 */

'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/lib/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Recommendation {
  type: 'pattern' | 'prompt' | 'project' | 'learning';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  skillsAddressed: string[];
}

interface CareerRecommendationsProps {
  userId: string;
}

export function CareerRecommendations({ userId }: CareerRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      // Call real API endpoint
      const response = await fetch(`/api/career/recommendations`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <Icons.sparkles className="h-4 w-4" />;
      case 'prompt':
        return <Icons.zap className="h-4 w-4" />;
      case 'project':
        return <Icons.code className="h-4 w-4" />;
      case 'learning':
        return <Icons.bookOpen className="h-4 w-4" />;
      default:
        return <Icons.target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.lightbulb className="h-5 w-5" />
          Recommended for You
        </CardTitle>
        <CardDescription>Based on your career level and goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(rec.type)}
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  {rec.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icons.info className="h-3 w-3" />
                  <span>{rec.reason}</span>
                </div>

                {rec.skillsAddressed.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rec.skillsAddressed.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button size="sm">
                {rec.type === 'pattern' && 'Try Pattern'}
                {rec.type === 'prompt' && 'Use Prompt'}
                {rec.type === 'project' && 'Start Project'}
                {rec.type === 'learning' && 'Learn More'}
              </Button>
            </div>
          </div>
        ))}

        {recommendations.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <Icons.target className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>
              Complete your career assessment to get personalized
              recommendations
            </p>
            <Button className="mt-4">Start Assessment</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
