import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';


interface EducationStepProps {
  form: UseFormReturn<any>;
}

export const EducationStep: React.FC<EducationStepProps> = ({ form }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'teachingCertifications',
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="highestDegree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Highest Degree Obtained *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="high-school">High School Diploma</SelectItem>
                  <SelectItem value="associate">Associate Degree</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="doctorate">Doctorate</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="majorAreaOfStudy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Major/Area of Study *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Elementary Education" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Teaching Certifications</h3>
          <Button type="button" onClick={() => append({ certificationType: '', certificationArea: '', issuingState: '', expirationDate: '' })} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Certification
          </Button>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id} className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                Teaching Certification {index + 1}
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
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`teachingCertifications.${index}.certificationType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certification Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Teaching License" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`teachingCertifications.${index}.certificationArea`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certification Area</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Elementary Education" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`teachingCertifications.${index}.issuingState`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuing State</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., California" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`teachingCertifications.${index}.expirationDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="otherRelevantCertifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Other Relevant Certifications</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="List any other relevant certifications..."
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
          name="relevantCoursework"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relevant Coursework</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe relevant coursework or professional development..."
                  className="min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};