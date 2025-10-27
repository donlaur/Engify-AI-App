'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/lib/icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Role,
  ExperienceLevel,
  Persona,
  ROLE_DEFINITIONS,
  EXPERIENCE_LEVELS,
  getPersonaDescription,
} from '@/types/persona';

interface PersonaSelectorProps {
  onSave: (persona: Persona) => void;
  initialPersona?: Persona;
  mode?: 'setup' | 'impersonate';
}

export function PersonaSelector({ onSave, initialPersona, mode = 'setup' }: PersonaSelectorProps) {
  const [role, setRole] = useState<Role>(initialPersona?.role || 'engineer');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    initialPersona?.experienceLevel || 'intermediate'
  );
  const [yearsOfExperience, setYearsOfExperience] = useState(
    initialPersona?.yearsOfExperience || 3
  );
  const [industry, setIndustry] = useState(initialPersona?.industry || '');
  const [bio, setBio] = useState(initialPersona?.bio || '');

  const roleDef = ROLE_DEFINITIONS[role];
  const expDef = EXPERIENCE_LEVELS[experienceLevel];

  const handleSave = () => {
    const persona: Persona = {
      role,
      experienceLevel,
      yearsOfExperience,
      industry: industry || undefined,
      bio: bio || undefined,
      isPublic: true,
    };
    onSave(persona);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent || Icons.user;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {mode === 'setup' ? 'Set Up Your Profile' : 'Impersonate a Role'}
        </h2>
        <p className="text-muted-foreground">
          {mode === 'setup'
            ? 'Tell us about yourself to get personalized prompts and recommendations'
            : 'Experience the platform from another perspective to build empathy'}
        </p>
      </div>

      {/* Role Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Your Role</CardTitle>
          <CardDescription>What do you do?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_DEFINITIONS).map(([key, def]) => {
                  const Icon = getIcon(def.icon);
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {def.title}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Role Description */}
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              {(() => {
                const Icon = getIcon(roleDef.icon);
                return <Icon className="h-5 w-5 text-primary mt-0.5" />;
              })()}
              <div className="flex-1">
                <p className="font-semibold mb-1">{roleDef.title}</p>
                <p className="text-sm text-muted-foreground mb-3">{roleDef.description}</p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold">Typical Challenges:</p>
                  <ul className="space-y-1">
                    {roleDef.typicalChallenges.slice(0, 3).map((challenge, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-primary">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Level */}
      <Card>
        <CardHeader>
          <CardTitle>Experience Level</CardTitle>
          <CardDescription>How long have you been in this role?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select
              value={experienceLevel}
              onValueChange={(value) => setExperienceLevel(value as ExperienceLevel)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXPERIENCE_LEVELS).map(([key, def]) => (
                  <SelectItem key={key} value={key}>
                    {def.label} ({def.yearsRange})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Years of Experience</Label>
            <input
              type="number"
              min="0"
              max="50"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* Experience Description */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-semibold mb-2">{expDef.label}</p>
            <p className="text-sm text-muted-foreground mb-3">{expDef.description}</p>
            <div className="space-y-1">
              {expDef.characteristics.map((char, idx) => (
                <p key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                  <Icons.check className="h-3 w-3 text-primary mt-0.5" />
                  {char}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Industry</Label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., FinTech, Healthcare, E-commerce"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recommended Patterns */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Recommended for You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Based on your role, we recommend these prompt patterns:
          </p>
          <div className="flex flex-wrap gap-2">
            {roleDef.recommendedPatterns.map((pattern) => (
              <Badge key={pattern} variant="secondary">
                {pattern}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {getPersonaDescription({ role, experienceLevel, yearsOfExperience })}
            {industry && ` in ${industry}`}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} size="lg" className="flex-1">
          <Icons.check className="mr-2 h-4 w-4" />
          {mode === 'setup' ? 'Save Profile' : 'Start Impersonating'}
        </Button>
      </div>

      {mode === 'impersonate' && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icons.info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-1">Why Impersonate?</p>
                <p>
                  Impersonation helps you understand different perspectives, build empathy, and
                  create better prompts for your team. You can switch back anytime.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
