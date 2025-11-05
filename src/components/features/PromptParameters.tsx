'use client';

/**
 * Prompt Parameters Component
 * Displays interactive leading questions/parameters that users need to provide
 * before using the prompt. Helps users understand what inputs are needed and
 * allows them to copy a fully-parameterized prompt.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';

interface PromptParameter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'checkbox' | 'multiselect';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  description?: string;
  example?: string;
  defaultValue?: string;
}

interface PromptParametersProps {
  parameters: PromptParameter[];
  promptContent: string;
  onCopy?: (parameterizedPrompt: string) => void;
}

export function PromptParameters({ parameters, promptContent, onCopy }: PromptParametersProps) {
  const [values, setValues] = useState<Record<string, string | string[]>>(() => {
    // Initialize with default values
    const initial: Record<string, string | string[]> = {};
    parameters.forEach(param => {
      if (param.defaultValue) {
        initial[param.id] = param.defaultValue;
      } else if (param.type === 'multiselect' || param.type === 'checkbox') {
        initial[param.id] = [];
      }
    });
    return initial;
  });

  const [copied, setCopied] = useState(false);

  if (!parameters || parameters.length === 0) {
    return null;
  }

  const handleChange = (id: string, value: string | string[]) => {
    setValues(prev => ({ ...prev, [id]: value }));
  };

  const handleMultiSelectChange = (id: string, option: string, checked: boolean) => {
    setValues(prev => {
      const current = (prev[id] as string[]) || [];
      if (checked) {
        return { ...prev, [id]: [...current, option] };
      } else {
        return { ...prev, [id]: current.filter(item => item !== option) };
      }
    });
  };

  const buildParameterizedPrompt = (): string => {
    let result = promptContent;
    
    // Replace placeholders in prompt content with actual values
    parameters.forEach(param => {
      const value = values[param.id];
      if (value !== undefined && value !== '') {
        const placeholder = `{{${param.id}}}`;
        const replacement = Array.isArray(value) ? value.join(', ') : value;
        result = result.replace(new RegExp(placeholder, 'g'), replacement);
      } else if (param.required && param.example) {
        // Use example if required but not filled
        const placeholder = `{{${param.id}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), param.example);
      }
    });

    return result;
  };

  const handleCopy = () => {
    const parameterizedPrompt = buildParameterizedPrompt();
    navigator.clipboard.writeText(parameterizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    if (onCopy) {
      onCopy(parameterizedPrompt);
    }
  };

  const allRequiredFilled = parameters
    .filter(p => p.required)
    .every(p => {
      const value = values[p.id];
      return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
    });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.helpCircle className="h-5 w-5" />
          Configure Your Prompt
        </CardTitle>
        <CardDescription>
          Answer these questions to customize the prompt for your needs. Then copy the fully-configured prompt below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {parameters.map((param) => (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id} className="flex items-center gap-2">
              {param.label}
              {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </Label>
            
            {param.description && (
              <p className="text-sm text-muted-foreground">{param.description}</p>
            )}

            {param.type === 'text' && (
              <Input
                id={param.id}
                placeholder={param.placeholder || param.example || `Enter ${param.label.toLowerCase()}`}
                value={(values[param.id] as string) || ''}
                onChange={(e) => handleChange(param.id, e.target.value)}
                required={param.required}
              />
            )}

            {param.type === 'textarea' && (
              <Textarea
                id={param.id}
                placeholder={param.placeholder || param.example || `Enter ${param.label.toLowerCase()}`}
                value={(values[param.id] as string) || ''}
                onChange={(e) => handleChange(param.id, e.target.value)}
                required={param.required}
                rows={4}
              />
            )}

            {param.type === 'select' && param.options && (
              <Select
                value={(values[param.id] as string) || ''}
                onValueChange={(value) => handleChange(param.id, value)}
              >
                <SelectTrigger id={param.id}>
                  <SelectValue placeholder={param.placeholder || `Select ${param.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {param.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {param.type === 'multiselect' && param.options && (
              <div className="space-y-2">
                {param.options.map((option) => {
                  const currentValues = (values[param.id] as string[]) || [];
                  const checked = currentValues.includes(option);
                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${param.id}-${option}`}
                        checked={checked}
                        onCheckedChange={(checked) => handleMultiSelectChange(param.id, option, checked as boolean)}
                      />
                      <Label htmlFor={`${param.id}-${option}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {param.type === 'checkbox' && param.options && (
              <div className="space-y-2">
                {param.options.map((option) => {
                  const currentValues = (values[param.id] as string[]) || [];
                  const checked = currentValues.includes(option);
                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${param.id}-${option}`}
                        checked={checked}
                        onCheckedChange={(checked) => handleMultiSelectChange(param.id, option, checked as boolean)}
                      />
                      <Label htmlFor={`${param.id}-${option}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {param.example && (
              <p className="text-xs text-muted-foreground">
                Example: <code className="bg-muted px-1 rounded">{param.example}</code>
              </p>
            )}
          </div>
        ))}

        <div className="pt-4 border-t">
          <Button
            onClick={handleCopy}
            disabled={!allRequiredFilled}
            className="w-full"
            size="lg"
          >
            {copied ? (
              <>
                <Icons.check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Configured Prompt
              </>
            )}
          </Button>
          {!allRequiredFilled && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Please fill in all required fields to copy the prompt.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

