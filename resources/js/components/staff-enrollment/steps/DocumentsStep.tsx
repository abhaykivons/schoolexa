import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface DocumentsStepProps {
  form: UseFormReturn<any>;
  documents: {
    id: string;
    name: string;
    description: string;
    type: string;
    file_path: string;
    text_content: string;
    is_required: boolean;
    is_visible: boolean;
  }[];
}

export const DocumentsStep: React.FC<DocumentsStepProps> = ({ form, documents }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Review & Accept Documents</h3>
        <p className="text-gray-600 mb-4">
          Please review the following documents and check the boxes to acknowledge that you have read and understand them.
        </p>
      </div>

      <div className="space-y-4">
        {documents.map((document) => (
          <Card key={document.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {document.name}
                  {!!document.is_required && <span className="text-red-500">*</span>}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={new URL('storage/'+ document.file_path, window.location.origin).toString()}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-muted border-input"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                  <a
                    href={new URL('storage/'+ document.file_path, window.location.origin).toString()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-muted border-input"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </a>
                </div>


              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-600 mb-4">{document.description}</p>
              <FormField
                control={form.control}
                name={`documentsAccepted.${document.id}`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id={`doc-${document.id}`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor={`doc-${document.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I have read and understand this document
                      {!!document.is_required && <span className="text-red-500">*</span>}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> All required documents must be acknowledged before you can proceed to the next step.
        </p>
      </div>
    </div>
  );
};