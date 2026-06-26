import React, { useState, useEffect } from 'react';
import { EnrollmentDocument } from '@/types/staff-enrollment';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { File, FileImage, FileText, Upload, X } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Switch } from '@/components/ui/switch';
import axios from 'axios';
import { toast } from 'sonner';

interface DocumentEditModalProps {
  document: EnrollmentDocument;
  onSave: (document: EnrollmentDocument) => void;
  onClose: () => void;
}

const DocumentEditModal = ({ document, onSave, onClose }: DocumentEditModalProps) => {
  const [doc, setDoc] = useState<EnrollmentDocument & { file?: File | null }>({
    id: '',
    name: '',
    description: '',
    is_required: 0,
    is_visible: true,
    file_path: undefined,
    file: null,
    ...document,
  });

  useEffect(() => {
    setDoc({
      id: '',
      name: '',
      description: '',
      is_required: 1,
      is_visible: true,
      file_path: undefined,
      file: null,
      ...document,
    });
  }, [document]);
  const [isLoading, setIsLoading] = useState(false);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDoc((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleRemoveFile = () => {
    setDoc((prev) => ({
      ...prev,
      file: null,
      file_path: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('id', doc.id || '');
      formData.append('name', doc.name);
      formData.append('description', doc.description || '');
      formData.append('is_required', doc.is_required ? '1' : '0');
      formData.append('is_visible', doc.is_visible ? '1' : '0');
      formData.append('form_type', 'staff-enrollment-setting-document');

      if (doc.file) {
        formData.append('file', doc.file);
      }

      let response;
      response = await axios.post('/staff-enrollment-settings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(response.data.message);
      onSave(response.data.document);
    } catch (error: any) {
      console.error('Error saving document:', error);
      toast.error(`Failed to ${doc.id ? 'update' : 'create'} document`, {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!doc.file_path && !doc.file) return <File className="h-4 w-4" />;

    const fileType = doc.file?.type || '';
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (fileType.includes('image')) return <FileImage className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getFileName = () => {
    if (doc.file) return doc.file.name;
    if (doc.file_path) return doc.file_path.split('/').pop();
    return '';
  };

  const truncateFileName = (fileName: string, maxLength: number = 30) => {
    if (fileName.length <= maxLength) {
      return fileName;
    }
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedBaseName = baseName.substring(0, maxLength - extension.length - 3); // -3 for "..."
    return `${truncatedBaseName}...${extension}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{doc.id ? 'Edit' : 'Add'} Document</DialogTitle>
            <DialogDescription>
              {doc.id ? 'Update' : 'Create'} document details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={doc.name}
                onChange={(e) => setDoc({ ...doc, name: e.target.value })}
                placeholder="Document name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={doc.description || ''}
                onChange={(e) => setDoc({ ...doc, description: e.target.value })}
                placeholder="Document description"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_required">Required</Label>
              <Switch
                id="is_required"
                checked={doc.is_required}
                onCheckedChange={(checked) => setDoc({ ...doc, is_required: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_visible">Visible</Label>
              <Switch
                id="is_visible"
                checked={doc.is_visible}
                onCheckedChange={(checked) => setDoc({ ...doc, is_visible: checked })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Document File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {!doc.file_path && !doc.file ? (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, Images up to 20MB</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      Choose File
                    </label>
                  </>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">
                      <TooltipProvider> {/* Wrap with TooltipProvider */}
                        <div className="">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">
                                {getFileIcon()}
                                <span className="truncate">{truncateFileName(getFileName())}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getFileName()}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isLoading}
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentEditModal;