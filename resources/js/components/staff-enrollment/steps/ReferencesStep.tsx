import React from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface ReferencesStepProps {
  form: UseFormReturn<any>;
}

export const ReferencesStep: React.FC<ReferencesStepProps> = ({ form }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'references',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Professional References</h3>
        <Button 
          type="button" 
          onClick={() => append({ 
            fullName: '', 
            titlePosition: '', 
            emailAddress: '', 
            phoneNumber: '', 
            relationshipToYou: '', 
            durationOfRelationship: '' 
          })} 
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Reference
        </Button>
      </div>

      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Reference {index + 1}
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
                name={`references.${index}.fullName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`references.${index}.titlePosition`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Title/Position</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., Principal, Department Head" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`references.${index}.emailAddress`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="j.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`references.${index}.phoneNumber`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`references.${index}.relationshipToYou`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship to You</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Former Supervisor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`references.${index}.durationOfRelationship`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration of Relationship</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5 years" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No references added yet. Click "Add Reference" to get started.</p>
        </div>
      )}
    </div>
  );
};