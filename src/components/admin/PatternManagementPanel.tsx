'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function PatternManagementPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pattern Management</CardTitle>
          <CardDescription>
            Manage prompt engineering patterns (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This panel will allow you to manage prompt engineering patterns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
