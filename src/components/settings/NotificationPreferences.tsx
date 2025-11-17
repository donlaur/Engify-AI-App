'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferencesProps {
  userId: string;
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  thresholds: {
    fifty: boolean;
    eighty: boolean;
    ninety: boolean;
    hundred: boolean;
  };
  alertTypes: {
    usageLimit: boolean;
    costThreshold: boolean;
    rateLimit: boolean;
    errorRate: boolean;
  };
  phoneNumber?: string;
}

const defaultSettings: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: false,
  thresholds: {
    fifty: false,
    eighty: true,
    ninety: true,
    hundred: true,
  },
  alertTypes: {
    usageLimit: true,
    costThreshold: true,
    rateLimit: true,
    errorRate: true,
  },
  phoneNumber: '',
};

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/user/notification-preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.preferences) {
            setSettings(data.preferences);
          }
        }
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: settings }),
      });

      if (response.ok) {
        toast({
          title: 'Preferences saved',
          description: 'Your notification preferences have been updated.',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Failed to save preferences',
          description: errorData.error || 'An error occurred while saving your preferences.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Usage Notifications</CardTitle>
          <CardDescription>Configure alerts for API key usage thresholds</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Usage Notifications</CardTitle>
        <CardDescription>
          Configure alerts for API key usage thresholds. Get notified when your usage reaches specific levels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Notification Channels</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">SMS Notifications (Coming Soon)</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via SMS text message
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={settings.smsEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, smsEnabled: checked })
                }
                disabled
              />
            </div>

            {settings.smsEnabled && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={settings.phoneNumber || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, phoneNumber: e.target.value })
                  }
                  disabled
                />
              </div>
            )}
          </div>
        </div>

        {/* Usage Thresholds */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">Usage Thresholds</h3>
            <p className="text-sm text-muted-foreground">
              Select which usage levels trigger notifications
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="threshold-50" className="font-medium">
                  50% Usage
                </Label>
                <p className="text-xs text-muted-foreground">
                  Early warning when halfway to quota
                </p>
              </div>
              <Switch
                id="threshold-50"
                checked={settings.thresholds.fifty}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    thresholds: { ...settings.thresholds, fifty: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="threshold-80" className="font-medium">
                  80% Usage
                </Label>
                <p className="text-xs text-muted-foreground">
                  High usage alert - time to monitor closely
                </p>
              </div>
              <Switch
                id="threshold-80"
                checked={settings.thresholds.eighty}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    thresholds: { ...settings.thresholds, eighty: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="threshold-90" className="font-medium">
                  90% Usage
                </Label>
                <p className="text-xs text-muted-foreground">
                  Critical alert - approaching quota limit
                </p>
              </div>
              <Switch
                id="threshold-90"
                checked={settings.thresholds.ninety}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    thresholds: { ...settings.thresholds, ninety: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-red-300 bg-red-100 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="threshold-100" className="font-medium">
                  100% Exceeded
                </Label>
                <p className="text-xs text-muted-foreground">
                  Quota exceeded - immediate action required
                </p>
              </div>
              <Switch
                id="threshold-100"
                checked={settings.thresholds.hundred}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    thresholds: { ...settings.thresholds, hundred: checked },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Alert Types */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">Alert Types</h3>
            <p className="text-sm text-muted-foreground">
              Choose which metrics trigger notifications
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="alert-usage">Token Usage</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when token consumption reaches thresholds
                </p>
              </div>
              <Switch
                id="alert-usage"
                checked={settings.alertTypes.usageLimit}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    alertTypes: { ...settings.alertTypes, usageLimit: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="alert-cost">Cost Threshold</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when API costs reach thresholds
                </p>
              </div>
              <Switch
                id="alert-cost"
                checked={settings.alertTypes.costThreshold}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    alertTypes: { ...settings.alertTypes, costThreshold: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="alert-rate">Rate Limiting</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when hitting rate limits frequently
                </p>
              </div>
              <Switch
                id="alert-rate"
                checked={settings.alertTypes.rateLimit}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    alertTypes: { ...settings.alertTypes, rateLimit: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="alert-error">Error Rate</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when error rates are high
                </p>
              </div>
              <Switch
                id="alert-error"
                checked={settings.alertTypes.errorRate}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    alertTypes: { ...settings.alertTypes, errorRate: checked },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Rate Limiting Info */}
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-start gap-2">
            <Icons.info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Rate Limiting</p>
              <p className="text-xs text-muted-foreground">
                To prevent notification spam, you will receive a maximum of one notification
                per threshold level per day. Notifications are sent when your usage first
                crosses each threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icons.check className="mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
