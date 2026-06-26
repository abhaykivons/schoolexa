import React, { useState, useEffect, useMemo, useRef } from "react";
import { Head, usePage, router, Link } from "@inertiajs/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm as useRHF } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, Pencil, Save, X, Upload, File, Check, XCircle, MessageSquare, AlertCircle, Eye, Download, Loader2 } from "lucide-react";
import { useFormValidation } from "@/hooks/use-form-validation";
import axios from "axios";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

// Shared comment components
import { 
    Comment,
    GlobalCommentsSection,
    FieldCommentsList,
    useCommentHandlers,
    hasUnresolvedComments as checkUnresolvedComments,
    getFieldComments as getComments 
} from "@/components/admission/CommentComponents";

// Signature component
import { SignatureInput } from "@/components/admission/SignatureInput";

// Validation schema
const schema = z.object({
    form_id: z.number().min(1),

    // Document Upload Status
    birth_certificate_uploaded: z.boolean().default(false),
    birth_certificate_notes: z.string().optional().or(z.literal("")),
    
    immunization_records_uploaded: z.boolean().default(false),
    immunization_records_notes: z.string().optional().or(z.literal("")),
    
    previous_transcripts_uploaded: z.boolean().default(false),
    previous_transcripts_notes: z.string().optional().or(z.literal("")),
    
    proof_of_residency_uploaded: z.boolean().default(false),
    proof_of_residency_notes: z.string().optional().or(z.literal("")),
    
    parent_guardian_id_uploaded: z.boolean().default(false),
    parent_guardian_id_notes: z.string().optional().or(z.literal("")),
    
    physical_exam_form_uploaded: z.boolean().default(false),
    physical_exam_form_notes: z.string().optional().or(z.literal("")),
    
    dental_exam_form_uploaded: z.boolean().default(false),
    dental_exam_form_notes: z.string().optional().or(z.literal("")),
    
    emergency_contact_form_uploaded: z.boolean().default(false),
    emergency_contact_form_notes: z.string().optional().or(z.literal("")),
    
    custody_documents_uploaded: z.boolean().default(false),
    custody_documents_notes: z.string().optional().or(z.literal("")),

    // Additional Documents
    iep_504_plan_uploaded: z.boolean().default(false),
    iep_504_plan_notes: z.string().optional().or(z.literal("")),
    
    special_services_docs_uploaded: z.boolean().default(false),
    special_services_docs_notes: z.string().optional().or(z.literal("")),

    // Certification
    documents_certification: z.boolean().refine(val => val === true, "You must certify that all uploaded documents are authentic"),
    signature: z.string().min(1, "Signature is required"),
    signature_date: z.string().min(1, "Signature date is required"),
});

type FormValues = z.infer<typeof schema>;
type UploadedDocument = {
    id: string | number;
    type: string;
    file_name: string;
    file_size: number;
    formatted_size?: string;
    upload_date: string;
    status: "pending" | "approved" | "rejected";
    is_watermarked?: boolean;
    file_url?: string;
    review_notes?: string;
};

export default function EnrollmentDocumentsForm() {
    const { student, form, admissionForm, formData, approvedData, latestData, commentsByField = {}, globalComments = [], documents: initialDocuments = [] } = usePage().props as any;
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>(initialDocuments);
    const [uploadingFile, setUploadingFile] = useState<string | null>(null);
    
    // Form is submitted if it's not in draft status
    const isSubmitted = admissionForm?.status && admissionForm.status !== 'draft';
    
    // Use shared comment handlers
    const { isSubmitting: isCommentSubmitting, handleReply, handleResolve } = useCommentHandlers();
    
    // Use form validation hook for error handling
    const { onFormInvalid } = useFormValidation();
    
    // Get comments for a specific field using shared helper
    const getFieldCommentsForField = (fieldName: string): Comment[] => {
        return getComments(commentsByField, fieldName);
    };

    // Check if there are unresolved comments using shared helper
    const hasUnresolvedCommentsOnForm = useMemo(() => {
        return checkUnresolvedComments(commentsByField, globalComments);
    }, [commentsByField, globalComments]);

    // Use formData for display (approved if available, otherwise latest)
    const formDataObject = useMemo(() => formData || {}, [formData]);
    
    // Check if there are pending changes (latest_data differs from approved_data)
    const hasPendingChanges = useMemo(() => {
        if (!approvedData || !latestData) return false;
        return JSON.stringify(approvedData) !== JSON.stringify(latestData);
    }, [approvedData, latestData]);
    
    // Check if form is approved
    const isApproved = admissionForm?.status === 'approved';

    // Update documents when props change (after page reload)
    useEffect(() => {
        if (initialDocuments) {
            setUploadedDocuments(initialDocuments);
            
            // Update checkbox states based on uploaded documents
            const documentTypes = [
                { type: 'birth_certificate', field: 'birth_certificate_uploaded' },
                { type: 'immunization_records', field: 'immunization_records_uploaded' },
                { type: 'previous_transcripts', field: 'previous_transcripts_uploaded' },
                { type: 'proof_of_residency', field: 'proof_of_residency_uploaded' },
                { type: 'parent_guardian_id', field: 'parent_guardian_id_uploaded' },
                { type: 'physical_exam_form', field: 'physical_exam_form_uploaded' },
                { type: 'dental_exam_form', field: 'dental_exam_form_uploaded' },
                { type: 'emergency_contact_form', field: 'emergency_contact_form_uploaded' },
                { type: 'custody_documents', field: 'custody_documents_uploaded' },
                { type: 'iep_504_plan', field: 'iep_504_plan_uploaded' },
                { type: 'special_services_docs', field: 'special_services_docs_uploaded' },
            ];
            
            documentTypes.forEach(({ type, field }) => {
                const hasDocument = initialDocuments.some((doc: UploadedDocument) => doc.type === type);
                if (hasDocument) {
                    rhForm.setValue(field as keyof FormValues, true);
                }
            });
        }
    }, [initialDocuments]);

    // Set form values when component mounts or form data changes
    useEffect(() => {
        const defaultValues = getDefaultValues();
        Object.keys(defaultValues).forEach(key => {
            rhForm.setValue(key as keyof FormValues, defaultValues[key as keyof FormValues]);
        });
    }, [formDataObject]);

    // Get default values for the form
    const getDefaultValues = (): FormValues => {
        const hasData = Object.keys(formDataObject).length > 0;
        
        if (hasData) {
            return {
                form_id: form.id,
                ...formDataObject,
            } as FormValues;
        }
        
        return {
            form_id: form.id,
            birth_certificate_uploaded: false,
            birth_certificate_notes: "",
            immunization_records_uploaded: false,
            immunization_records_notes: "",
            previous_transcripts_uploaded: false,
            previous_transcripts_notes: "",
            proof_of_residency_uploaded: false,
            proof_of_residency_notes: "",
            parent_guardian_id_uploaded: false,
            parent_guardian_id_notes: "",
            physical_exam_form_uploaded: false,
            physical_exam_form_notes: "",
            dental_exam_form_uploaded: false,
            dental_exam_form_notes: "",
            emergency_contact_form_uploaded: false,
            emergency_contact_form_notes: "",
            custody_documents_uploaded: false,
            custody_documents_notes: "",
            iep_504_plan_uploaded: false,
            iep_504_plan_notes: "",
            special_services_docs_uploaded: false,
            special_services_docs_notes: "",
            documents_certification: false,
            signature: "",
            signature_date: ""
        };
    };

    const rhForm = useRHF<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: getDefaultValues()
    });

    // Convert document type to field name
    const getCheckboxFieldName = (documentType: string): keyof FormValues => {
        const mapping: Record<string, keyof FormValues> = {
            'Birth Certificate': 'birth_certificate_uploaded',
            'Immunization Records': 'immunization_records_uploaded',
            'Previous Transcripts': 'previous_transcripts_uploaded',
            'Proof of Residency': 'proof_of_residency_uploaded',
            'Parent/Guardian ID': 'parent_guardian_id_uploaded',
            'Physical Exam Form': 'physical_exam_form_uploaded',
            'Dental Exam Form': 'dental_exam_form_uploaded',
            'Emergency Contact Form': 'emergency_contact_form_uploaded',
            'Custody Documents': 'custody_documents_uploaded',
            'IEP/504 Plan': 'iep_504_plan_uploaded',
            'Special Services Documents': 'special_services_docs_uploaded',
        };
        return mapping[documentType] || 'birth_certificate_uploaded';
    };

    // Handle actual file upload to server
    const handleFileUpload = async (documentType: string, file: File) => {
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File too large. Maximum size is 10MB');
            return;
        }

        // Validate file type - only allow types that support watermarking
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Only PDF, JPEG, and PNG files are allowed (watermarking required).');
            return;
        }

        // Make sure we have admission form ID
        if (!admissionForm?.id) {
            toast.error('Form not ready. Please refresh the page and try again.');
            return;
        }

        setUploadingFile(documentType);
        
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('document_type', documentType.toLowerCase().replace(/[\s\/]+/g, '_'));
            uploadFormData.append('admission_form_id', admissionForm.id.toString());
            uploadFormData.append('student_id', student.id.toString());

            const response = await axios.post(route('parent.admission.document.upload'), uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                // Add new document to list
                setUploadedDocuments(prev => [...prev, response.data.document]);
                
                // Update checkbox
                const checkboxField = getCheckboxFieldName(documentType);
                rhForm.setValue(checkboxField, true);
                
                toast.success(`${documentType} uploaded successfully!`, {
                    description: response.data.document.is_watermarked 
                        ? 'Document has been watermarked with school name.'
                        : undefined
                });
                
                // Reload page data to ensure everything is in sync
                router.reload({ only: ['admissionForm', 'documents'] });
            } else {
                toast.error(response.data.message || 'Failed to upload document');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload document. Please try again.');
        } finally {
            setUploadingFile(null);
        }
    };

    // Handle document removal
    const removeDocument = async (documentId: string | number) => {
        const document = uploadedDocuments.find(doc => doc.id === documentId);
        if (!document) return;

        // Don't allow deletion of approved documents
        if (document.status === 'approved') {
            toast.error('Cannot delete approved documents');
            return;
        }

        try {
            const response = await axios.delete(route('parent.admission.document.delete', { document: documentId }));

            if (response.data.success) {
                // Remove from list
                const updatedDocs = uploadedDocuments.filter(doc => doc.id !== documentId);
                setUploadedDocuments(updatedDocs);
                
                // If no more documents of this type, uncheck the checkbox
                const documentsOfType = updatedDocs.filter(doc => doc.type === document.type);
                if (documentsOfType.length === 0) {
                    // Find the checkbox field for this document type - map back from snake_case
                    const typeLabels: Record<string, string> = {
                        'birth_certificate': 'Birth Certificate',
                        'immunization_records': 'Immunization Records',
                        'previous_transcripts': 'Previous Transcripts',
                        'proof_of_residency': 'Proof of Residency',
                        'parent_guardian_id': 'Parent/Guardian ID',
                        'physical_exam_form': 'Physical Exam Form',
                        'dental_exam_form': 'Dental Exam Form',
                        'emergency_contact_form': 'Emergency Contact Form',
                        'custody_documents': 'Custody Documents',
                        'iep_504_plan': 'IEP/504 Plan',
                        'special_services_docs': 'Special Services Documents',
                    };
                    const docTypeLabel = typeLabels[document.type] || document.type;
                    const checkboxField = getCheckboxFieldName(docTypeLabel);
                    rhForm.setValue(checkboxField, false);
                }
                
                toast.success('Document removed successfully');
                
                // Reload page data to ensure everything is in sync
                router.reload({ only: ['admissionForm', 'documents'] });
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete document');
        }
    };

    const handleInitialSubmit = async (values: FormValues) => {
        setIsFormSubmitting(true);

        try {
            const submitData = {
                ...values,
                student_id: student.id,
            };

            await router.post(route("parent.forms.submit"), submitData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsFormSubmitting(false);
                    toast.success("Enrollment Documents submitted successfully!");
                },
                onError: (errors) => {
                    setIsFormSubmitting(false);
                    console.error("Submission errors:", errors);
                    toast.error("Failed to submit form. Please check the errors.");
                }
            });
        } catch (error) {
            setIsFormSubmitting(false);
            console.error("Submission error:", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    };

    const handleFieldUpdate = async (fieldName: keyof FormValues, value: any) => {
        setIsFormSubmitting(true);

        try {
            const updateData = {
                form_id: form.id,
                student_id: student.id,
                key: fieldName,
                value: value
            };

            await router.post(route("parent.forms.submit"), updateData, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['admissionForm', 'formData', 'approvedData', 'latestData'] });
                    setIsFormSubmitting(false);
                    setEditingField(null);
                    rhForm.setValue(fieldName, value);
                },
                onError: (errors) => {
                    setIsFormSubmitting(false);
                    console.error("Field update error:", errors);
                    toast.error("Failed to update field. Please check the errors.");
                }
            });
        } catch (error) {
            setIsFormSubmitting(false);
            console.error("Field update error:", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    };

    const startEditing = (fieldName: string) => {
        setEditingField(fieldName);
    };

    const cancelEditing = () => {
        setEditingField(null);
        if (editingField) {
            rhForm.resetField(editingField as any);
        }
    };

    const saveField = (fieldName: keyof FormValues) => {
        const value = rhForm.getValues(fieldName);
        handleFieldUpdate(fieldName, value);
    };

    // Helper functions
    const getFieldValue = (data: any, fieldName: string): any => {
        if (!data) return null;
        return data[fieldName] ?? null;
    };

    const fieldHasPendingChanges = (fieldName: string): boolean => {
        if (!approvedData || !latestData) return false;
        const approvedValue = getFieldValue(approvedData, fieldName);
        const latestValue = getFieldValue(latestData, fieldName);
        return JSON.stringify(approvedValue) !== JSON.stringify(latestValue);
    };

    const formatValueForDisplay = (value: any): string => {
        if (value === null || value === undefined) return "Not set";
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'string' && value.trim() === '') return "Not set";
        return String(value);
    };

    // FieldWrapper component
    const FieldWrapper: React.FC<{ 
        htmlFor: string; 
        label: string; 
        required?: boolean;
        children: React.ReactNode;
        fieldName: string;
        isEditing: boolean;
        onStartEdit: () => void;
        onSave: () => void;
        onCancel: () => void;
    }> = ({ htmlFor, label, required = false, children, fieldName, isEditing, onStartEdit, onSave, onCancel }) => {
        const hasPending = fieldHasPendingChanges(fieldName);
        const approvedValue = getFieldValue(approvedData, fieldName);
        const fieldComments = getFieldCommentsForField(fieldName);
        const hasUnresolvedFieldComments = fieldComments.some((c: Comment) => !c.is_resolved && !c.reply);
        
        return (
            <div className="w-full relative">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor={htmlFor} className="text-sm font-medium">
                            {label} {required && <span className="text-red-500">*</span>}
                        </Label>
                        {hasPending && !isEditing && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                                Pending Approval
                            </Badge>
                        )}
                        {isApproved && !hasPending && !isEditing && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                Approved
                            </Badge>
                        )}
                        {hasUnresolvedFieldComments && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                School Comment
                            </Badge>
                        )}
                    </div>
                    {!isEditing && isSubmitted && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onStartEdit}
                            className="h-6 w-6 p-0"
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                    )}
                </div>
                
                {hasPending && !isEditing && approvedValue !== null && approvedValue !== undefined && (
                    <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-600">Previous Approved Value:</span>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                Approved
                            </Badge>
                        </div>
                        <div className="text-gray-700">{formatValueForDisplay(approvedValue)}</div>
                    </div>
                )}
                
                <div className={hasPending && !isEditing ? "p-2 bg-yellow-50 border border-yellow-200 rounded" : ""}>
                    {children}
                    {hasPending && !isEditing && (
                        <div className="mt-1 text-xs text-yellow-700 font-medium">
                            ⏳ Pending Approval
                        </div>
                    )}
                </div>
                
                {isEditing && (
                    <div className="flex gap-2 mt-2">
                        <Button
                            type="button"
                            size="sm"
                            onClick={onSave}
                            disabled={isFormSubmitting}
                            className="h-7 text-xs"
                        >
                            <Save className="h-3 w-3 mr-1" />
                            {isFormSubmitting ? "Saving..." : "Save"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onCancel}
                            disabled={isFormSubmitting}
                            className="h-7 text-xs"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                        </Button>
                    </div>
                )}

                <FieldCommentsList 
                    comments={fieldComments}
                    onReply={handleReply}
                    onResolve={handleResolve}
                    isSubmitting={isCommentSubmitting}
                />
            </div>
        );
    };

    // Checkbox Field component - Allow editing even after submission
    const CheckboxField: React.FC<{
        name: keyof FormValues;
        label: string;
        required?: boolean;
        disabled?: boolean;
    }> = ({ name, label, required = false, disabled = false }) => (
        <FormField
            control={rhForm.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                        <Checkbox
                            checked={field.value as boolean}
                            onCheckedChange={field.onChange}
                            disabled={disabled}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <Label>
                            {label} {required && <span className="text-red-500">*</span>}
                        </Label>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    // Document Upload Field component - Updated to allow uploads after submission
    const DocumentUploadField: React.FC<{
        documentType: string;
        checkboxName: keyof FormValues;
        notesName: keyof FormValues;
        description: string;
        required?: boolean;
    }> = ({ documentType, checkboxName, notesName, description, required = false }) => {
        const fileInputRef = useRef<HTMLInputElement>(null);
        const isUploaded = rhForm.watch(checkboxName) as boolean;
        const documentTypeKey = documentType.toLowerCase().replace(/[\s\/]+/g, '_');
        const documentsOfType = uploadedDocuments.filter(doc => doc.type === documentTypeKey);
        const isEditing = editingField === notesName;
        const isReadOnly = isSubmitted && !isEditing;
        const isUploading = uploadingFile === documentType;

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                handleFileUpload(documentType, file);
            }
            // Reset the input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        // Check if any document of this type is rejected
        const hasRejectedDoc = documentsOfType.some(doc => doc.status === 'rejected');

        return (
            <Card className={`border-l-4 ${hasRejectedDoc ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckboxField 
                                    name={checkboxName} 
                                    label={documentType} 
                                    required={required}
                                    disabled={true} // Checkbox is controlled by uploads
                                />
                                {isUploaded && documentsOfType.some(d => d.status === 'approved') && (
                                    <Check className="h-5 w-5 text-green-500" />
                                )}
                                {documentsOfType.length > 0 && (
                                    <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                            documentsOfType.some(d => d.status === 'approved') 
                                                ? 'bg-green-50 text-green-700' 
                                                : documentsOfType.some(d => d.status === 'rejected')
                                                    ? 'bg-red-50 text-red-700'
                                                    : 'bg-yellow-50 text-yellow-700'
                                        }`}
                                    >
                                        {documentsOfType.length} file{documentsOfType.length > 1 ? 's' : ''}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 ml-6">{description}</p>
                        </div>
                        
                        {/* Always show upload button (even after submission) */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor={`upload-${documentType}`} className="cursor-pointer">
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                                    isUploading 
                                        ? 'bg-blue-100 text-blue-700 cursor-wait' 
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}>
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4" />
                                            Upload
                                        </>
                                    )}
                                </div>
                            </Label>
                            <Input
                                ref={fileInputRef}
                                id={`upload-${documentType}`}
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                disabled={isUploading}
                            />
                        </div>
                    </div>

                    {/* Uploaded Files List */}
                    {documentsOfType.length > 0 ? (
                        <div className="ml-6 mb-3">
                            <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
                            <div className="space-y-2">
                                {documentsOfType.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-sm truncate">{doc.file_name}</span>
                                            <span className="text-xs text-gray-500 flex-shrink-0">
                                                ({doc.formatted_size || Math.round(doc.file_size / 1024) + ' KB'})
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                                                doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {doc.status}
                                            </span>
                                            {doc.is_watermarked && (
                                                <span className="text-xs text-blue-600 flex-shrink-0">
                                                    (watermarked)
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                            {doc.file_url && (
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(doc.file_url, '_blank')}
                                                        title="View document"
                                                    >
                                                        <Eye className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(doc.file_url?.replace('/view', '/download'), '_blank')}
                                                        title="Download document"
                                                    >
                                                        <Download className="h-4 w-4 text-green-500" />
                                                    </Button>
                                                </>
                                            )}
                                            {doc.status !== 'approved' && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeDocument(doc.id)}
                                                    title="Delete document"
                                                >
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Show rejection notes if any */}
                            {documentsOfType.filter(d => d.status === 'rejected' && d.review_notes).map(doc => (
                                <Alert key={`reject-${doc.id}`} className="mt-2 bg-red-50 border-red-200">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertTitle className="text-red-800">Document Rejected</AlertTitle>
                                    <AlertDescription className="text-red-700">
                                        {doc.review_notes}
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </div>
                    ) : null}

                    {/* Notes Field */}
                    <div className="ml-6">
                        <FieldWrapper 
                            htmlFor={notesName as string} 
                            label="Additional Notes" 
                            fieldName={notesName as string}
                            isEditing={isEditing}
                            onStartEdit={() => startEditing(notesName as string)}
                            onSave={() => saveField(notesName)}
                            onCancel={cancelEditing}
                        >
                            <Input 
                                id={notesName as string}
                                placeholder="Any notes about this document..."
                                {...rhForm.register(notesName)}
                                readOnly={isReadOnly}
                                className={isReadOnly ? "bg-gray-50" : ""}
                            />
                        </FieldWrapper>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Render form field for signature
    const renderFormField = (name: keyof FormValues, label: string, required: boolean = false) => {
        const isEditing = editingField === name;
        const isReadOnly = isSubmitted && !isEditing;

        return (
            <FormField
                control={rhForm.control}
                name={name}
                render={({ field }) => (
                    <FormItem>
                        <FieldWrapper 
                            htmlFor={name as string} 
                            label={label} 
                            required={required}
                            fieldName={name as string}
                            isEditing={isEditing}
                            onStartEdit={() => startEditing(name as string)}
                            onSave={() => saveField(name)}
                            onCancel={cancelEditing}
                        >
                            <FormControl>
                                {name === 'signature' ? (
                                    <SignatureInput
                                        value={field.value as string || ''}
                                        onChange={field.onChange}
                                        onSignatureSaved={() => {
                                            const today = new Date().toISOString().split('T')[0];
                                            rhForm.setValue('signature_date', today);
                                        }}
                                        disabled={isReadOnly}
                                        required={required}
                                    />
                                ) : (
                                    <Input 
                                        id={name as string}
                                        placeholder={label}
                                        {...field}
                                        readOnly={isReadOnly}
                                        className={isReadOnly ? "bg-gray-50" : ""}
                                        type={name.includes('date') ? 'date' : 'text'}
                                        value={field.value as string}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                        </FieldWrapper>
                    </FormItem>
                )}
            />
        );
    };

    // Calculate upload statistics
    const uploadStats = useMemo(() => {
        return {
            total: uploadedDocuments.length,
            approved: uploadedDocuments.filter(d => d.status === 'approved').length,
            pending: uploadedDocuments.filter(d => d.status === 'pending').length,
            rejected: uploadedDocuments.filter(d => d.status === 'rejected').length,
        };
    }, [uploadedDocuments]);

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <Head title={`${form.name}`} />
            
            <Form {...rhForm}>
                <form onSubmit={rhForm.handleSubmit(handleInitialSubmit, onFormInvalid)} className="w-full mx-auto bg-white p-6 md:p-8 rounded-lg shadow-sm space-y-6">
                    <input type="hidden" {...rhForm.register("form_id")} />

                    <div className="flex gap-3">
                        <div className="px-2">
                            <div className="flex gap-2">
                                <Link href={route('parent.admission.show', student.id)} className="justify-center items-center inline-flex">
                                    <ChevronLeft />
                                </Link>
                                <h1 className="text-2xl font-bold">{form.name}</h1>
                            </div>
                            <p className={`text-sm px-8 mt-1 ${isSubmitted ? 'text-green-900 font-semibold' : 'text-muted-foreground'}`}>
                                {isSubmitted ? (
                                    isApproved ? (
                                        "Your enrollment documents have been approved. You can still upload additional documents if needed."
                                    ) : hasPendingChanges ? (
                                        "Your documents have pending changes awaiting approval. You can upload additional documents or replace rejected ones."
                                    ) : (
                                        "Your documents have been submitted. You can still upload additional documents or replace rejected ones."
                                    )
                                ) : (
                                    "Please upload all required documents (PDF, JPEG, PNG only). All documents will be watermarked with 'CONFIDENTIAL' and school name. Required documents are marked with *."
                                )}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            {!isSubmitted && (
                                <Button 
                                    type="submit" 
                                    disabled={isFormSubmitting}
                                >
                                    {isFormSubmitting ? "Submitting..." : "Submit Documents"}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Global Comments Alert */}
                    {hasUnresolvedCommentsOnForm && (
                        <Alert className="bg-blue-50 border-blue-200">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-800">School Feedback</AlertTitle>
                            <AlertDescription className="text-blue-700">
                                The school has added comments that need your attention. Please review and respond to them below.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Rejected Documents Alert */}
                    {uploadStats.rejected > 0 && (
                        <Alert className="bg-red-50 border-red-200">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <AlertTitle className="text-red-800">Documents Need Attention</AlertTitle>
                            <AlertDescription className="text-red-700">
                                {uploadStats.rejected} document(s) have been rejected. Please review the notes and upload corrected versions.
                            </AlertDescription>
                        </Alert>
                    )}

                    <GlobalCommentsSection 
                        comments={globalComments}
                        onReply={handleReply}
                        onResolve={handleResolve}
                        isSubmitting={isCommentSubmitting}
                    />

                    <hr />

                    {/* Required Documents */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle className="text-red-600">Required Documents</CardTitle>
                            <p className="text-sm text-gray-600">
                                These documents are required for enrollment. Only <strong>PDF, JPEG, and PNG</strong> files are accepted. 
                                All documents are automatically watermarked with "CONFIDENTIAL" and school name for security.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DocumentUploadField
                                documentType="Birth Certificate"
                                checkboxName="birth_certificate_uploaded"
                                notesName="birth_certificate_notes"
                                description="Official birth certificate or passport to verify age and identity"
                                required={true}
                            />

                            <DocumentUploadField
                                documentType="Immunization Records"
                                checkboxName="immunization_records_uploaded"
                                notesName="immunization_records_notes"
                                description="Current immunization records from healthcare provider"
                                required={true}
                            />

                            <DocumentUploadField
                                documentType="Previous Transcripts"
                                checkboxName="previous_transcripts_uploaded"
                                notesName="previous_transcripts_notes"
                                description="Report cards or transcripts from previous school"
                                required={true}
                            />

                            <DocumentUploadField
                                documentType="Proof of Residency"
                                checkboxName="proof_of_residency_uploaded"
                                notesName="proof_of_residency_notes"
                                description="Utility bill, lease agreement, or other proof of residency"
                                required={true}
                            />

                            <DocumentUploadField
                                documentType="Parent/Guardian ID"
                                checkboxName="parent_guardian_id_uploaded"
                                notesName="parent_guardian_id_notes"
                                description="Driver's license, state ID, or passport"
                                required={true}
                            />
                        </CardContent>
                    </Card>

                    {/* Health Documents */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle className="text-orange-600">Health Documents</CardTitle>
                            <p className="text-sm text-gray-600">Required health forms</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DocumentUploadField
                                documentType="Physical Exam Form"
                                checkboxName="physical_exam_form_uploaded"
                                notesName="physical_exam_form_notes"
                                description="Completed physical examination form (within last year)"
                                required={true}
                            />

                            <DocumentUploadField
                                documentType="Dental Exam Form"
                                checkboxName="dental_exam_form_uploaded"
                                notesName="dental_exam_form_notes"
                                description="Completed dental examination form (within last year)"
                                required={true}
                            />

                            <DocumentUploadField
                                documentType="Emergency Contact Form"
                                checkboxName="emergency_contact_form_uploaded"
                                notesName="emergency_contact_form_notes"
                                description="Completed emergency contact information"
                                required={true}
                            />
                        </CardContent>
                    </Card>

                    {/* Additional Documents */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle className="text-blue-600">Additional Documents</CardTitle>
                            <p className="text-sm text-gray-600">If applicable</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DocumentUploadField
                                documentType="Custody Documents"
                                checkboxName="custody_documents_uploaded"
                                notesName="custody_documents_notes"
                                description="Court orders, custody agreements, or guardianship papers"
                                required={false}
                            />

                            <DocumentUploadField
                                documentType="IEP/504 Plan"
                                checkboxName="iep_504_plan_uploaded"
                                notesName="iep_504_plan_notes"
                                description="Individualized Education Program or 504 Plan if applicable"
                                required={false}
                            />

                            <DocumentUploadField
                                documentType="Special Services Documents"
                                checkboxName="special_services_docs_uploaded"
                                notesName="special_services_docs_notes"
                                description="Any other special services or accommodation documents"
                                required={false}
                            />
                        </CardContent>
                    </Card>

                    {/* Upload Summary */}
                    {uploadedDocuments.length > 0 && (
                        <Card className="shadow-none border-0 bg-blue-50">
                            <CardHeader>
                                <CardTitle>Upload Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-white rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {uploadStats.total}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Files</div>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {uploadStats.approved}
                                        </div>
                                        <div className="text-sm text-gray-600">Approved</div>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {uploadStats.pending}
                                        </div>
                                        <div className="text-sm text-gray-600">Pending Review</div>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">
                                            {uploadStats.rejected}
                                        </div>
                                        <div className="text-sm text-gray-600">Rejected</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <hr />

                    {/* Certification & Signature */}
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <CardTitle>Certification</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <CheckboxField 
                                    name="documents_certification" 
                                    label="I certify that all documents uploaded are authentic, unaltered, and accurately represent the information provided. I understand that providing false documentation may result in enrollment denial or withdrawal." 
                                    required 
                                    disabled={isSubmitted}
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFormField("signature", "Parent/Guardian Signature", true)}
                                {renderFormField("signature_date", "Date", true)}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
