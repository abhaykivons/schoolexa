import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Upload, FileText, Image as ImageIcon, File, X,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface AdditionalInfoStepProps {
  form: UseFormReturn<any>;
  formData: any;
  setFormData: (data: any) => void;
}

// Helper functions
const getFileIcon = (file?: File | null) => {
  if (!file) return <File className="h-4 w-4" />;
  const type = file.type;
  if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
  if (type.includes('image')) return <ImageIcon className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
};

const truncateFileName = (fileName: string, maxLength: number = 30) => {
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.substring(fileName.lastIndexOf('.'));
  const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
  const truncatedBaseName = baseName.substring(0, maxLength - extension.length - 3); // for "..."
  return `${truncatedBaseName}...${extension}`;
};

export const AdditionalInfoStep: React.FC<AdditionalInfoStepProps> = ({ form }) => {


  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);

  useEffect(() => {
    form.setValue('resumeFile', resumeFile);
  }, [resumeFile]);

  useEffect(() => {
    form.setValue('portfolioFile', portfolioFile);
  }, [portfolioFile]);

  const handleFileUpload = (field: 'resume' | 'portfolio', file: File | null) => {
    if (field === 'resume') {
      setResumeFile(file);
    } else {
      setPortfolioFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="coverLetter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cover Letter (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Write your cover letter here..."
                className="min-h-32"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resume/CV Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              {!resumeFile ? (
                <>
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('resume', e.target.files?.[0] || null)}
                    className="hidden"
                    name="resumeFile"
                    id="resumeFile"
                  />
                  <label
                    htmlFor="resumeFile"
                    className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    Choose File
                  </label>
                </>
              ) : (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">
                          {getFileIcon(resumeFile)}
                          <span className="truncate">{truncateFileName(resumeFile.name)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{resumeFile.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setResumeFile(null)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Passport Size Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              {!portfolioFile ? (
                <>
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">Images up to 20MB</p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('portfolio', e.target.files?.[0] || null)}
                    className="hidden"
                    name="portfolioFile"
                    id="portfolioFile"
                  />
                  <label
                    htmlFor="portfolioFile"
                    className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    Choose File
                  </label>
                </>
              ) : (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">
                          {getFileIcon(portfolioFile)}
                          <span className="truncate">{truncateFileName(portfolioFile.name)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{portfolioFile.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPortfolioFile(null)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Immediately, June 2024, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salaryExpectations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Expectations (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., $45,000 - $55,000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="otherInformation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Any Other Information (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Include any additional information you'd like us to know..."
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
