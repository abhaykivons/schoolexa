import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface WorkExperienceStepProps {
  form: UseFormReturn<any>;
}

export const WorkExperienceStep: React.FC<WorkExperienceStepProps> = ({ form }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'employmentHistory',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Employment History</h3>
        <Button 
          type="button" 
          onClick={() => append({ 
            institutionName: '', 
            institutionAddress: '', 
            positionHeld: '', 
            classesSubjectsTaught: '', 
            startDate: '', 
            endDate: '', 
            keyResponsibilities: '', 
            reasonForLeaving: '' 
          })} 
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Employment
        </Button>
      </div>

      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Employment {index + 1}
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`employmentHistory.${index}.institutionName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution/Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="School or organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`employmentHistory.${index}.institutionAddress`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`employmentHistory.${index}.positionHeld`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Held</FormLabel>
                    <FormControl>
                      <Input placeholder="Job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`employmentHistory.${index}.classesSubjectsTaught`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classes/Subjects Taught</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5th Grade Math, High School English" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`employmentHistory.${index}.startDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`employmentHistory.${index}.endDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name={`employmentHistory.${index}.keyResponsibilities`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Responsibilities and Accomplishments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your key responsibilities and accomplishments..."
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
              name={`employmentHistory.${index}.reasonForLeaving`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Leaving (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Career advancement, relocation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="totalYearsExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Years of Relevant Experience</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 5 years" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="administrativeExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Administrative Experience</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2 years as department head" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};