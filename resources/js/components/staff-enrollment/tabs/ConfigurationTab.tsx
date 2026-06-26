import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { EnrollmentFormConfig } from '@/types/staff-enrollment';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Upload, X, Link, Code } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface ConfigurationTabProps {
  config: EnrollmentFormConfig;
  setConfig: React.Dispatch<React.SetStateAction<EnrollmentFormConfig>>;
}

const ConfigurationTab: React.FC<ConfigurationTabProps> = ({ config, setConfig }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const safeConfig = config || {
    form_title: '',
    form_description: '',
    school_logo: '',
    public_access_enabled: false,
  };

  const [logoPreview, setLogoPreview] = useState<string | null>(() => {
    if (safeConfig.school_logo?.startsWith('http') || safeConfig.school_logo?.startsWith('blob:')) {
      return safeConfig.school_logo;
    } else if (safeConfig.school_logo) {
      return `/storage/${safeConfig.school_logo}`;
    }
    return null;
  });

  const form = useForm<EnrollmentFormConfig>({
    defaultValues: config,
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('form_title', data.form_title || '');
      formData.append('notification_email', data.notification_email || '');
      formData.append('form_description', data.form_description || '');
      formData.append('public_access_enabled', data.public_access_enabled ? '1' : '0');
      formData.append('form_type', 'staff-enrollment-setting-configuration');
      if (data.id) formData.append('id', String(data.id));
      if (logoFile) formData.append('school_logo', logoFile);

      const response = await axios.post('/staff-enrollment-settings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updated = response.data.data;
      setConfig(updated);

      // ✅ Update preview to actual stored path
      if (updated.school_logo) {
        setLogoPreview(
          updated.school_logo.startsWith('http') || updated.school_logo.startsWith('blob:')
            ? updated.school_logo
            : `/storage/${updated.school_logo}`
        );
      }

      toast.success(response.data.message || 'Configuration saved!');
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsLoading(false);
    }
  });

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${type} copied to clipboard`),
      () => toast.error(`Failed to copy ${type}`)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Form Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="form_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="form_title">Form Title</FormLabel>
                    <FormControl>
                      <Input id="form_title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notification_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="notification_email">Notification Email</FormLabel>
                    <FormControl>
                      <Input id="notification_email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="form_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="form_description">Description</FormLabel>
                  <FormControl>
                    <Textarea id="form_description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ Updated School Logo Upload */}
            <div className="grid gap-2">
              <Label>School Logo</Label>
              {logoPreview ? (
                <div className="relative w-48 h-48 border border-gray-200 rounded-md overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="School Logo"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Click to upload logo image</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    Choose Logo
                  </label>
                </div>
              )}
            </div>

            {/* Public Access */}
            <div>
              <FormField
                control={form.control}
                name="public_access_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 mb-3">
                    <FormControl>
                      <Checkbox
                        id="public_access_enabled"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel htmlFor="public_access_enabled" className="font-medium">
                      Public Access
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch('public_access_enabled') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-neutral-900 rounded-md">
                      <Link className="h-4 w-4" />
                      <span className="font-mono text-sm break-all">{route('enrollment.public')}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => handleCopy(route('enrollment.public'), 'Link')}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Share this link to allow public access to the enrollment form
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-md font-mono text-sm break-all">
                      <Code className="h-4 w-4 inline mr-2" />
                      {`<iframe src="${route('enrollment.public')}" width="100%" height="800px"></iframe>`}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `<iframe src="${route('enrollment.public')}" width="100%" height="800px"></iframe>`,
                          'Embed Code'
                        )
                      }
                    >
                      Copy Code
                    </Button>
                    <p className="text-sm text-gray-600">
                      Embed this form on external websites
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ConfigurationTab;
