import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

interface BackgroundCheckStepProps {
  form: UseFormReturn<any>;
  formData: any;
  setFormData: (data: any) => void;
}

export const BackgroundCheckStep: React.FC<BackgroundCheckStepProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Background Check Consent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-2">Important Information</p>
              <p>
                As part of our hiring process, all staff members are required to undergo a comprehensive 
                background check. This includes verification of:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Criminal history check</li>
                <li>Employment verification</li>
                <li>Educational credentials verification</li>
                <li>Professional references</li>
                <li>Child abuse clearances (where applicable)</li>
              </ul>
            </div>
          </div>

          <div className="prose prose-sm">
            <h4 className="font-medium text-gray-900">Background Check Process</h4>
            <p className="text-gray-600">
              The background check will be conducted by our authorized third-party screening company. 
              You will receive instructions via email on how to complete this process if your application 
              moves forward. The background check typically takes 3-5 business days to complete.
            </p>
            
            <h4 className="font-medium text-gray-900 mt-4">Your Rights</h4>
            <p className="text-gray-600">
              You have the right to receive a copy of your background check report and to dispute any 
              information you believe to be inaccurate. Any adverse action taken based on the background 
              check will be communicated to you in writing with information about your rights under the 
              Fair Credit Reporting Act.
            </p>
          </div>

          <FormField
            control={form.control}
            name="backgroundCheckConsent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Background Check Consent *
                  </label>
                  <p className="text-sm text-muted-foreground">
                    I hereby authorize the school to conduct a comprehensive background check as described above. 
                    I understand that this background check is a condition of employment and that any offer of 
                    employment is contingent upon the successful completion of this process.
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};