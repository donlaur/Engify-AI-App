'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/lib/icons';

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    yearsExperience: '',
    aiExperienceLevel: '',
    companySize: '',
    industry: '',
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Icons.sparkles className="h-12 w-12 text-purple-600" />
            </div>
            <CardTitle className="text-3xl text-center">Welcome to Engify.ai!</CardTitle>
            <CardDescription className="text-center text-lg">
              Let&apos;s personalize your experience (takes 30 seconds)
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-16 rounded-full ${
                    s <= step ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <Label htmlFor="role">What&apos;s your role?</Label>
                  <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineer">Software Engineer</SelectItem>
                      <SelectItem value="manager">Engineering Manager</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="pm">Product Manager</SelectItem>
                      <SelectItem value="qa">QA Engineer</SelectItem>
                      <SelectItem value="executive">Executive/C-Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="yearsExperience">Years of experience in tech?</Label>
                  <Select value={formData.yearsExperience} onValueChange={(v) => setFormData({ ...formData, yearsExperience: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years (Junior)</SelectItem>
                      <SelectItem value="3-5">3-5 years (Mid-level)</SelectItem>
                      <SelectItem value="6-10">6-10 years (Senior)</SelectItem>
                      <SelectItem value="10+">10+ years (Staff+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={() => setStep(2)}
                  disabled={!formData.role || !formData.yearsExperience}
                >
                  Next
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <Label htmlFor="aiExperienceLevel">How much have you used AI tools?</Label>
                  <Select value={formData.aiExperienceLevel} onValueChange={(v) => setFormData({ ...formData, aiExperienceLevel: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (Just starting)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (Use ChatGPT occasionally)</SelectItem>
                      <SelectItem value="advanced">Advanced (Use AI daily)</SelectItem>
                      <SelectItem value="expert">Expert (Build with AI APIs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="companySize">Company size? (Optional)</Label>
                  <Select value={formData.companySize} onValueChange={(v) => setFormData({ ...formData, companySize: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 (Startup)</SelectItem>
                      <SelectItem value="11-50">11-50 (Small)</SelectItem>
                      <SelectItem value="51-200">51-200 (Medium)</SelectItem>
                      <SelectItem value="201-1000">201-1000 (Large)</SelectItem>
                      <SelectItem value="1000+">1000+ (Enterprise)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                    <Icons.arrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => setStep(3)}
                    disabled={!formData.aiExperienceLevel}
                  >
                    Next
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in text-center">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-8">
                  <Icons.trophy className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-2xl font-bold mb-2">You&apos;re all set!</h3>
                  <p className="text-gray-600 mb-4">
                    Based on your profile, we&apos;ve personalized your experience:
                  </p>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <div className="flex items-center gap-2">
                      <Icons.check className="h-5 w-5 text-green-600" />
                      <span>Recommended prompts for {formData.role}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="h-5 w-5 text-green-600" />
                      <span>Learning path for {formData.aiExperienceLevel} users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.check className="h-5 w-5 text-green-600" />
                      <span>Track your progress and earn achievements</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                    <Icons.arrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Start Learning
                        <Icons.sparkles className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
