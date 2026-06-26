import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, Calendar, CheckCircle } from 'lucide-react';

interface CertificationStepProps {
  form: UseFormReturn<any>;
  formData: any;
  setFormData: (data: any) => void;
}

export const CertificationStep: React.FC<CertificationStepProps> = ({ form }) => {
  const [signatureDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Application Certification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Certification Statement</h4>
            <p className="text-sm text-green-700">
              I certify that all information provided in this application is true, complete, and accurate 
              to the best of my knowledge. I understand that any false or misleading information may result 
              in rejection of my application or termination of employment if discovered after hire.
            </p>
          </div>

          <div className="prose prose-sm">
            <p className="text-gray-600">
              I acknowledge that I have read and understand the following:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Employment is contingent upon successful completion of background checks</li>
              <li>All credentials and references provided will be verified</li>
              <li>I authorize the school to contact my previous employers and references</li>
              <li>I understand that this application does not guarantee employment</li>
              <li>I agree to comply with all school policies and procedures if hired</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="digitalSignature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Digital Signature *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Type your full legal name as signature" 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    By typing your name, you are providing your digital signature
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="signatureDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      value={signatureDate}
                      readOnly
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What happens next?</strong> After submitting your application, you will receive 
              a confirmation email. Our HR team will review your application and contact you within 
              5-10 business days regarding the next steps in the hiring process.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};