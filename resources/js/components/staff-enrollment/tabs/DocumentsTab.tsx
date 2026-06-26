import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { EnrollmentDocument } from '@/types/staff-enrollment';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { FileText, Trash2, Edit } from 'lucide-react';
import DocumentEditModal from '../modals/DocumentEditModal';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';

const DocumentsTab = ({ documents, setDocuments }: {
  documents: EnrollmentDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<EnrollmentDocument[]>>;
}) => {
    const [editDoc, setEditDoc] = useState<EnrollmentDocument | null>(null);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this document. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            router.delete(route('staff-enrollment-settings.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDocuments(docs => docs.filter(doc => doc.id !== id));
                    toast.success('Document deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete document - it may have associated users or designations');
                }
            });
        }
    };

    const updateDocumentToggle = async (id: number, field: 'is_required' | 'is_visible', value: boolean) => {
      try {
        const formData = new FormData();
        formData.append('id', id.toString());
        formData.append('form_type', 'staff-enrollment-setting-document');
        formData.append(field, value ? '1' : '0');

        const response = await axios.post('/staff-enrollment-settings', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        toast.success(`${field === 'is_required' ? 'Required' : 'Visible'} status updated`);

        // update state
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.id === id ? { ...doc, [field]: value } : doc
          )
        );
      } catch (error: any) {
        console.error('Error updating field:', error);
        toast.error('Update failed', {
          description: error.response?.data?.message || error.message,
        });
      }
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Documents
          <Button size="sm" onClick={() => setEditDoc({
            id: '',
            name: '',
            description: '',
            type: 'staff-enrollment',
            is_required: 0,
            is_visible: 1
          })}>
            <FileText className="mr-1 h-4 w-4" /> Add Document
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!documents || documents.length === 0 ? (
          <div className="rounded-md border overflow-x-auto text-center py-10">
            <p className="text-gray-500 mb-4">No documents found. Please create a new record.</p>
            <Button onClick={() => setEditDoc({
              id: '',
              name: '',
              description: '',
              type: 'staff-enrollment',
              is_required: 0,
              is_visible: 1
            })}>
              <FileText className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </div>
        ) : (
          <div className='rounded-md border overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{doc.description}</TableCell>
                    <TableCell>
                      <Switch
                        checked={!!doc.is_required}
                        onCheckedChange={(checked) => updateDocumentToggle(doc.id, 'is_required', checked)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={!!doc.is_visible}
                        onCheckedChange={(checked) => updateDocumentToggle(doc.id, 'is_visible', checked)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </TableCell>

                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setEditDoc(doc)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {editDoc && (
          <DocumentEditModal
            document={editDoc}
            onSave={(updatedDoc) => {
              if (editDoc.id) {
                setDocuments(docs => docs.map(d => d.id === updatedDoc.id ? updatedDoc : d));
              } else {
                setDocuments(docs => [...docs, updatedDoc]);
              }
              setEditDoc(null);
            }}
            onClose={() => setEditDoc(null)}
          />
        )}
      </CardContent>

    </Card>
  );
};

export default DocumentsTab;