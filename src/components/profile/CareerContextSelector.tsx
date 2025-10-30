/**
 * Career Context Selector
 * Allows users to set their career level, company size, and goals
 */

'use client';

import { useState } from 'react';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CareerLevel,
  CompanySize,
  CareerGoal,
  UserCareerContext,
} from '@/lib/types/user';

interface CareerContextSelectorProps {
  initialContext?: Partial<UserCareerContext>;
  onSave: (context: UserCareerContext) => void;
  onSkip?: () => void;
}

export function CareerContextSelector({
  initialContext,
  onSave,
  onSkip,
}: CareerContextSelectorProps) {
  const [level, setLevel] = useState<CareerLevel>(
    initialContext?.level || 'mid'
  );
  const [companySize, setCompanySize] = useState<CompanySize>(
    initialContext?.companySize || 'mid'
  );
  const [careerGoal, setCareerGoal] = useState<CareerGoal | undefined>(
    initialContext?.careerGoal
  );
  const [targetLevel, setTargetLevel] = useState<CareerLevel | undefined>(
    initialContext?.targetLevel
  );

  const handleSave = () => {
    onSave({
      level,
      companySize,
      careerGoal,
      targetLevel,
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.target className="h-5 w-5" />
          Tell us about your career
        </CardTitle>
        <CardDescription>
          This helps us personalize your learning experience and recommend the
          right patterns for your level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Career Level */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            What&apos;s your current level?
          </Label>
          <RadioGroup
            value={level}
            onValueChange={(value: string) => setLevel(value as CareerLevel)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="junior" id="junior" />
              <Label htmlFor="junior" className="cursor-pointer font-normal">
                <div>
                  <div className="font-medium">Junior (L1-L2)</div>
                  <div className="text-sm text-muted-foreground">
                    0-2 years experience
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mid" id="mid" />
              <Label htmlFor="mid" className="cursor-pointer font-normal">
                <div>
                  <div className="font-medium">Mid-Level (L3)</div>
                  <div className="text-sm text-muted-foreground">
                    2-5 years experience
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="senior" id="senior" />
              <Label htmlFor="senior" className="cursor-pointer font-normal">
                <div>
                  <div className="font-medium">Senior (L4)</div>
                  <div className="text-sm text-muted-foreground">
                    5-8 years experience
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="staff" id="staff" />
              <Label htmlFor="staff" className="cursor-pointer font-normal">
                <div>
                  <div className="font-medium">Staff (L5)</div>
                  <div className="text-sm text-muted-foreground">
                    8-12 years experience
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="principal" id="principal" />
              <Label htmlFor="principal" className="cursor-pointer font-normal">
                <div>
                  <div className="font-medium">Principal+ (L6+)</div>
                  <div className="text-sm text-muted-foreground">
                    12+ years experience
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Company Size */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Company size?</Label>
          <RadioGroup
            value={companySize}
            onValueChange={(value: string) =>
              setCompanySize(value as CompanySize)
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="startup" id="startup" />
              <Label htmlFor="startup" className="cursor-pointer font-normal">
                <div>
                  <div className="font-medium">Startup</div>
                  <div className="text-sm text-muted-foreground">
                    1-50 employees
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mid" id="mid-size" />
              <Label htmlFor="mid-size" className="cursor-pointer font-normal">
                <div>
                  <div className="font-medium">Mid-size</div>
                  <div className="text-sm text-muted-foreground">
                    51-500 employees
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="enterprise" id="enterprise" />
              <Label
                htmlFor="enterprise"
                className="cursor-pointer font-normal"
              >
                <div>
                  <div className="font-medium">Enterprise</div>
                  <div className="text-sm text-muted-foreground">
                    500+ employees
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Career Goal */}
        <div className="space-y-3">
          <Label htmlFor="goal" className="text-base font-semibold">
            What&apos;s your main goal? (optional)
          </Label>
          <Select
            value={careerGoal}
            onValueChange={(value) => setCareerGoal(value as CareerGoal)}
          >
            <SelectTrigger id="goal">
              <SelectValue placeholder="Select your goal..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="promotion">
                <div className="flex items-center gap-2">
                  <Icons.trendingUp className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Get promoted</div>
                    <div className="text-xs text-muted-foreground">
                      Level up in my career
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="skill-building">
                <div className="flex items-center gap-2">
                  <Icons.bookOpen className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Build skills</div>
                    <div className="text-xs text-muted-foreground">
                      Improve at my current level
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="job-search">
                <div className="flex items-center gap-2">
                  <Icons.search className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Find new role</div>
                    <div className="text-xs text-muted-foreground">
                      Looking for new opportunities
                    </div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Target Level (if goal is promotion) */}
        {careerGoal === 'promotion' && (
          <div className="space-y-3">
            <Label htmlFor="target" className="text-base font-semibold">
              What level are you targeting?
            </Label>
            <Select
              value={targetLevel}
              onValueChange={(value) => setTargetLevel(value as CareerLevel)}
            >
              <SelectTrigger id="target">
                <SelectValue placeholder="Select target level..." />
              </SelectTrigger>
              <SelectContent>
                {level !== 'mid' && (
                  <SelectItem value="mid">Mid-Level (L3)</SelectItem>
                )}
                {level !== 'senior' && level !== 'mid' && (
                  <SelectItem value="senior">Senior (L4)</SelectItem>
                )}
                {level !== 'staff' && level !== 'senior' && level !== 'mid' && (
                  <SelectItem value="staff">Staff (L5)</SelectItem>
                )}
                {level !== 'principal' && (
                  <SelectItem value="principal">Principal+ (L6+)</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} className="flex-1">
            <Icons.check className="mr-2 h-4 w-4" />
            Save & Continue
          </Button>
          {onSkip && (
            <Button variant="outline" onClick={onSkip}>
              Skip for now
            </Button>
          )}
        </div>

        {/* Value Proposition */}
        <div className="space-y-2 rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
          <div className="flex items-start gap-2">
            <Icons.sparkles className="mt-0.5 h-5 w-5 text-blue-600" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Why we ask this:
              </p>
              <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
                <li>• Get patterns recommended for your level</li>
                <li>• See how others at your level use AI</li>
                <li>• Track skills needed for promotion</li>
                <li>• Show progress to your manager</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
