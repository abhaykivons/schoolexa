import React, { useState } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface SkillsStepProps {
  form: UseFormReturn<any>;
}

export const SkillsStep: React.FC<SkillsStepProps> = ({ form }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'relevantSkills',
  });
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      append({ value: newSkill.trim() });
      setNewSkill('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <FormLabel className="text-base font-medium">Relevant Skills</FormLabel>
        <div className="mt-2 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill (e.g., Classroom Management)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
            />
            <Button type="button" onClick={handleAddSkill} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {fields.map((field, index) => (
              <Badge key={field.id} variant="secondary" className="flex items-center gap-1">
                {/* @ts-ignore */}
                {field.value}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <FormField
        control={form.control}
        name="areasOfExpertise"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Areas of Expertise/Specialization</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your areas of expertise and specialization..."
                className="min-h-20"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="coCurricularQualifications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Co-curricular Qualifications</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Coaching, club supervision, extracurricular activities..."
                className="min-h-20"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hobbiesInterests"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hobbies and Special Interests (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Personal interests that might benefit students or school community..."
                className="min-h-20"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};