import React, { useState, useMemo } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  Send,
  Trash2,
  AlertCircle,
  File,
  Eye,
  Download,
  Check,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';

interface Comment {
  id: number;
  field_name: string | null;
  comment: string;
  reply: string | null;
  reply_by_name: string | null;
  reply_at: string | null;
  is_resolved: boolean;
  user_name: string;
  created_at: string;
}

interface UploadedDocument {
  id: number;
  type: string;
  type_label: string;
  file_name: string;
  file_size: number;
  formatted_size: string;
  upload_date: string;
  uploaded_at: string;
  status: 'pending' | 'approved' | 'rejected';
  is_watermarked: boolean;
  file_url: string;
  download_url: string;
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  is_pdf: boolean;
  is_image: boolean;
}

// Separate component for adding field comments to prevent re-render issues
const AddFieldCommentPopover: React.FC<{
  fieldName: string;
  label: string;
  admissionFormId: number;
  onCommentAdded: () => void;
}> = ({ fieldName, label, admissionFormId, onCommentAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);

    router.post(route('school-admission.add-comment', admissionFormId), {
      comment: commentText,
      field_name: fieldName,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Comment added');
        setCommentText('');
        setIsOpen(false);
        setIsSubmitting(false);
        onCommentAdded();
      },
      onError: () => {
        toast.error('Failed to add comment');
        setIsSubmitting(false);
      }
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MessageSquare className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="font-medium text-sm">Add comment for "{label}"</div>
          <Textarea
            placeholder="Enter feedback for parent..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-20"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={!commentText.trim() || isSubmitting}>
              <Send className="h-3 w-3 mr-1" />{isSubmitting ? 'Sending...' : 'Send'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setIsOpen(false); setCommentText(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Separate component for global comments input
const GlobalCommentInput: React.FC<{
  admissionFormId: number;
  onCommentAdded: () => void;
}> = ({ admissionFormId, onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);

    router.post(route('school-admission.add-comment', admissionFormId), {
      comment: commentText,
      field_name: null,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Comment added');
        setCommentText('');
        setIsSubmitting(false);
        onCommentAdded();
      },
      onError: () => {
        toast.error('Failed to add comment');
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Textarea
        placeholder="Add a general comment for the parent..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        className="min-h-16 bg-white"
      />
      <Button onClick={handleSubmit} disabled={!commentText.trim() || isSubmitting} className="self-end">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

const SchoolFormView: React.FC = () => {
  const { 
    auth, 
    student, 
    form, 
    admissionForm, 
    formData, 
    approvedData, 
    latestData, 
    grades,
    commentsByField = {},
    globalComments = [],
    documents = []
  } = usePage().props as any;

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDocDialog, setShowRejectDocDialog] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Admission', href: '/school-admission' },
    { title: student?.first_name + ' ' + student?.last_name, href: route('school-admission.show', student?.id) },
    { title: form?.name || 'Form', href: '#' },
  ];

  const formDataObject = useMemo(() => formData || {}, [formData]);
  
  const hasPendingChanges = useMemo(() => {
    if (!approvedData || !latestData) return false;
    return JSON.stringify(approvedData) !== JSON.stringify(latestData);
  }, [approvedData, latestData]);

  const isApproved = admissionForm?.status === 'approved';
  const isSubmitted = !!admissionForm?.id;

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

  const getFieldComments = (fieldName: string): Comment[] => {
    return commentsByField[fieldName] || [];
  };

  // Handlers
  const handleApprove = () => {
    if (!admissionForm) return;
    setIsProcessing(true);
    
    router.post(route('school-admission.approve', admissionForm.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Form approved successfully');
        setShowApproveDialog(false);
        setIsProcessing(false);
      },
      onError: () => {
        toast.error('Failed to approve form');
        setIsProcessing(false);
      }
    });
  };

  const handleReject = () => {
    if (!admissionForm) return;
    setIsProcessing(true);
    
    router.post(route('school-admission.reject', admissionForm.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Form rejected');
        setShowRejectDialog(false);
        setIsProcessing(false);
      },
      onError: () => {
        toast.error('Failed to reject form');
        setIsProcessing(false);
      }
    });
  };

  // Comment handlers moved to separate components to prevent re-render issues
  const handleCommentAdded = () => {
    // Page will auto-refresh via Inertia
  };

  const handleDeleteComment = (commentId: number) => {
    router.delete(route('school-admission.delete-comment', commentId), {
      preserveScroll: true,
      onSuccess: () => toast.success('Comment deleted'),
      onError: () => toast.error('Failed to delete comment')
    });
  };

  // Document handlers
  const handleApproveDocument = (documentId: number) => {
    setIsProcessing(true);
    router.post(route('school-admission.document.approve', documentId), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Document approved');
        setIsProcessing(false);
      },
      onError: () => {
        toast.error('Failed to approve document');
        setIsProcessing(false);
      }
    });
  };

  const handleRejectDocument = () => {
    if (!showRejectDocDialog || !rejectNotes.trim()) return;
    setIsProcessing(true);
    router.post(route('school-admission.document.reject', showRejectDocDialog), {
      notes: rejectNotes
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Document rejected');
        setShowRejectDocDialog(null);
        setRejectNotes('');
        setIsProcessing(false);
      },
      onError: () => {
        toast.error('Failed to reject document');
        setIsProcessing(false);
      }
    });
  };

  // Status Badge
  const getStatusBadge = () => {
    if (!admissionForm) return <Badge variant="secondary">Not Submitted</Badge>;
    switch (admissionForm.status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300"><Clock className="w-3 h-3 mr-1" />Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{admissionForm.status}</Badge>;
    }
  };

  // Field Wrapper with Comment Support - EXACTLY like parent but read-only with comment button
  const FieldWrapper: React.FC<{ 
    htmlFor: string; 
    label: string; 
    required?: boolean;
    children: React.ReactNode;
    fieldName: string;
  }> = ({ htmlFor, label, required = false, children, fieldName }) => {
    const hasPending = fieldHasPendingChanges(fieldName);
    const approvedValue = getFieldValue(approvedData, fieldName);
    const fieldComments = getFieldComments(fieldName);
    const hasUnresolvedComments = fieldComments.some(c => !c.is_resolved);
    
    return (
      <div className="w-full relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={htmlFor} className="text-sm font-medium">
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {hasPending && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                Pending Approval
              </Badge>
            )}
            {isApproved && !hasPending && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                Approved
              </Badge>
            )}
            {hasUnresolvedComments && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                <MessageSquare className="w-3 h-3 mr-1" />
                {fieldComments.filter(c => !c.is_resolved).length}
              </Badge>
            )}
          </div>
          
          {/* Comment Button */}
          {admissionForm && (
            <AddFieldCommentPopover
              fieldName={fieldName}
              label={label}
              admissionFormId={admissionForm.id}
              onCommentAdded={handleCommentAdded}
            />
          )}
        </div>
        
        {/* Show old approved value if there are pending changes */}
        {hasPending && approvedValue !== null && approvedValue !== undefined && (
          <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-600">Previous Approved Value:</span>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">Approved</Badge>
            </div>
            <div className="text-gray-700">{formatValueForDisplay(approvedValue)}</div>
          </div>
        )}
        
        {/* Show current/pending value */}
        <div className={hasPending ? "p-2 bg-yellow-50 border border-yellow-200 rounded" : ""}>
          {children}
          {hasPending && (
            <div className="mt-1 text-xs text-yellow-700 font-medium">⏳ Pending Approval</div>
          )}
        </div>

        {/* Field Comments */}
        {fieldComments.length > 0 && (
          <div className="mt-2 space-y-2">
            {fieldComments.map((comment) => (
              <div key={comment.id} className={`text-sm p-2 rounded ${comment.is_resolved || comment.reply ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs">{comment.user_name}</span>
                      <span className="text-xs text-muted-foreground">{comment.created_at}</span>
                      {(comment.is_resolved || comment.reply) && <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Responded</Badge>}
                    </div>
                    <p className="mt-1 text-sm">{comment.comment}</p>
                    
                    {/* Show parent reply */}
                    {comment.reply && (
                      <div className="mt-2 p-2 bg-white rounded border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-green-700">Parent Reply ({comment.reply_by_name}):</span>
                          <span className="text-xs text-muted-foreground">{comment.reply_at}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.reply}</p>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-red-600" onClick={() => handleDeleteComment(comment.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // List of fields that are explicitly boolean (checkbox) fields
  const BOOLEAN_FIELDS = [
    'has_chronic_illnesses', 'has_hospitalizations', 'has_surgeries', 'has_physical_limitations',
    'immunization_up_to_date', 'has_drug_allergies', 'has_food_allergies', 'has_environmental_allergies',
    'has_insect_allergies', 'takes_regular_medications', 'uses_emergency_meds',
    'consent_medical_treatment', 'consent_share_info', 'consent_photo', 'consent_social_media',
    'consent_online_learning', 'consent_communication', 'consent_data_sharing',
    'photo_consent', 'social_media_consent', 'online_learning_consent', 'communication_consent', 'data_sharing_consent',
    'authorized_pickup', 'is_vegetarian', 'is_vegan', 'has_dietary_restrictions',
  ];

  // Render Read-Only Field - SAME layout as parent form
  const renderField = (name: string, label: string, required: boolean = false) => {
    const value = formDataObject[name] ?? '';
    
    // FIRST: Check specific field names (select boxes, etc.)
    if (name === 'sex') {
      return (
        <FieldWrapper htmlFor={name} label={label} required={required} fieldName={name}>
          <Select value={String(value)} disabled>
            <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non_binary">Non-Binary</SelectItem>
              <SelectItem value="prefer_not">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </FieldWrapper>
      );
    }

    if (name === 'grade_entering') {
      return (
        <FieldWrapper htmlFor={name} label={label} required={required} fieldName={name}>
          <Select value={String(value)} disabled>
            <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Select Grade" /></SelectTrigger>
            <SelectContent>
              {!grades || grades.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No grades found
                </div>
              ) : (
                grades.map((grade: { id: number; name: string }) => (
                  <SelectItem key={grade.id} value={String(grade.id)}>{grade.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </FieldWrapper>
      );
    }

    if (name === 'allergy_severity') {
      return (
        <FieldWrapper htmlFor={name} label={label} required={required} fieldName={name}>
          <Select value={String(value)} disabled>
            <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
              <SelectItem value="anaphylactic">Anaphylactic</SelectItem>
            </SelectContent>
          </Select>
        </FieldWrapper>
      );
    }

    if (name === 'primary_household') {
      return (
        <FieldWrapper htmlFor={name} label={label} required={required} fieldName={name}>
          <Select value={String(value)} disabled>
            <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="both_parents">Both Parents</SelectItem>
              <SelectItem value="mother">Mother</SelectItem>
              <SelectItem value="father">Father</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FieldWrapper>
      );
    }

    // Handle signature fields - show image if it's a base64 image
    if (name === 'signature' || name === 'residency_signature') {
      const isImageSignature = typeof value === 'string' && value.startsWith('data:image');
      return (
        <FieldWrapper htmlFor={name} label={label} required={required} fieldName={name}>
          <div className="p-4 bg-gray-50 rounded border">
            {isImageSignature ? (
              <div className="flex flex-col items-center">
                <img 
                  src={value} 
                  alt="Signature" 
                  className="max-h-24 border border-gray-200 rounded bg-white p-2"
                />
                <span className="text-xs text-muted-foreground mt-2">Saved Signature</span>
              </div>
            ) : value ? (
              <div className="text-center">
                <p className="font-signature text-2xl italic text-gray-700">{value}</p>
                <span className="text-xs text-muted-foreground">Text Signature</span>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center">No signature provided</p>
            )}
          </div>
        </FieldWrapper>
      );
    }

    // SECOND: Handle explicitly defined boolean fields (checkboxes)
    if (BOOLEAN_FIELDS.includes(name)) {
      const isChecked = value === true || value === '1' || value === 'true' || value === 1;
      return (
        <FieldWrapper htmlFor={name} label={label} required={required} fieldName={name}>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isChecked ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}>
              {isChecked && <CheckCircle className="w-4 h-4 text-white" />}
            </div>
            <span className="text-sm font-medium">{isChecked ? 'Yes' : 'No'}</span>
          </div>
        </FieldWrapper>
      );
    }

    // THIRD: Long text fields (textarea)
    if (name.includes('notes') || name.includes('details') || name.includes('additional') || name.includes('plan') || name.includes('restrictions') || name.includes('exemptions')) {
      return (
        <FieldWrapper htmlFor={name} label={label} required={required} fieldName={name}>
          <Textarea id={name} value={String(value)} readOnly className="bg-gray-50 min-h-20" />
        </FieldWrapper>
      );
    }

    // FOURTH: Default - regular input field
    return (
      <FieldWrapper htmlFor={name} label={label} required={required} fieldName={name}>
        <Input 
          id={name} 
          value={String(value)} 
          readOnly 
          className="bg-gray-50"
          type={name.includes('date') ? 'date' : 'text'}
        />
      </FieldWrapper>
    );
  };

  // Form-specific layouts to match parent forms exactly
  const renderFormContent = () => {
    // Pre-Enrollment Form (ID: 1)
    if (form?.id === 1) {
      return (
        <>
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {renderField("student_last_name", "Last Name", true)}
                  {renderField("student_first_name", "First Name", true)}
                  {renderField("student_middle_name", "Middle Name")}
                  {renderField("legal_last_name", "Legal Last Name")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {renderField("birthdate", "Birthdate", true)}
                  {renderField("sex", "Sex", true)}
                  {renderField("present_grade", "Present Grade", true)}
                  {renderField("grade_entering", "Which Grade Will the Student be Entering?", true)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField("home_phone", "Home Phone", true)}
                  {renderField("home_language", "Home Language")}
                </div>
              </div>
            </CardContent>
          </Card>
          <hr />
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Parent / Guardian Information</CardTitle></CardHeader>
            <CardContent className="space-y-10">
              <div className="space-y-4">
                <h6 className="text-sm font-bold">Parent / Guardian 1</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderField("parent1_last", "Last Name", true)}
                  {renderField("parent1_first", "First Name", true)}
                  {renderField("parent1_workplace", "Workplace")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField("parent1_business_phone", "Business Phone")}
                  {renderField("parent1_cell_email", "Cell / Email", true)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField("parent1_address", "Address", true)}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderField("parent1_city", "City", true)}
                    {renderField("parent1_state", "State", true)}
                    {renderField("parent1_zip", "ZIP", true)}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h6 className="text-sm font-bold">Parent / Guardian 2</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderField("parent2_last", "Last Name")}
                  {renderField("parent2_first", "First Name")}
                  {renderField("parent2_workplace", "Workplace")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField("parent2_business_phone", "Business Phone")}
                  {renderField("parent2_cell_email", "Cell / Email")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField("parent2_address", "Address")}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderField("parent2_city", "City")}
                    {renderField("parent2_state", "State")}
                    {renderField("parent2_zip", "ZIP")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <hr />
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Emergency Contacts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <h6 className="text-sm font-bold">Emergency Contact 1</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField("emergency1_name", "Name", true)}
                {renderField("emergency1_relationship", "Relationship", true)}
                {renderField("emergency1_phone", "Phone", true)}
              </div>
              <h6 className="text-sm font-bold">Emergency Contact 2</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField("emergency2_name", "Name")}
                {renderField("emergency2_relationship", "Relationship")}
                {renderField("emergency2_phone", "Phone")}
              </div>
            </CardContent>
          </Card>
          <hr />
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Medical Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("family_doctor", "Family Doctor", true)}
                {renderField("family_dentist", "Family Dentist")}
              </div>
              {renderField("medical_notes", "Medical Notes / Allergies", true)}
            </CardContent>
          </Card>
          <hr />
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Signature</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {renderField("residency_signature", "Signature", true)}
              {renderField("residency_signature_date", "Signature Date", true)}
            </CardContent>
          </Card>
        </>
      );
    }

    // Enrollment Document Checklist Form (ID: 4)
    if (form?.id === 4 || form?.slug === 'document-checklist-form') {
      // Group documents by type
      const documentsByType: Record<string, UploadedDocument[]> = {};
      (documents as UploadedDocument[]).forEach(doc => {
        if (!documentsByType[doc.type]) {
          documentsByType[doc.type] = [];
        }
        documentsByType[doc.type].push(doc);
      });

      // Document field renderer for this form
      const renderDocumentField = (
        documentType: string,
        documentTypeKey: string,
        checkboxName: string,
        notesName: string,
        description: string,
        required: boolean = false
      ) => {
        const isUploaded = formDataObject[checkboxName] === true || formDataObject[checkboxName] === '1' || formDataObject[checkboxName] === 'true';
        const notes = formDataObject[notesName] || '';
        const docsOfType = documentsByType[documentTypeKey] || [];
        const hasApproved = docsOfType.some(d => d.status === 'approved');
        const hasRejected = docsOfType.some(d => d.status === 'rejected');
        const hasPending = docsOfType.some(d => d.status === 'pending');

        return (
          <Card className={`border-l-4 ${hasRejected ? 'border-l-red-500' : hasApproved ? 'border-l-green-500' : hasPending ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isUploaded ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}>
                      {isUploaded && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="font-medium">{documentType} {required && <span className="text-red-500">*</span>}</span>
                    {docsOfType.length > 0 && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          hasApproved ? 'bg-green-50 text-green-700' : 
                          hasRejected ? 'bg-red-50 text-red-700' : 
                          'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {docsOfType.length} file{docsOfType.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 ml-7">{description}</p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {docsOfType.length > 0 && (
                <div className="ml-7 mb-3">
                  <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
                  <div className="space-y-2">
                    {docsOfType.map((doc) => (
                      <div key={doc.id} className={`flex items-center justify-between p-2 rounded ${
                        doc.status === 'approved' ? 'bg-green-50' :
                        doc.status === 'rejected' ? 'bg-red-50' :
                        'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <File className={`h-4 w-4 flex-shrink-0 ${
                            doc.status === 'approved' ? 'text-green-500' :
                            doc.status === 'rejected' ? 'text-red-500' :
                            'text-gray-500'
                          }`} />
                          <span className="text-sm truncate">{doc.file_name}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            ({doc.formatted_size})
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs flex-shrink-0 ${
                              doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                              doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {doc.status}
                          </Badge>
                          {doc.is_watermarked && (
                            <span className="text-xs text-blue-600 flex-shrink-0">(watermarked)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
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
                            onClick={() => window.open(doc.download_url, '_blank')}
                            title="Download document"
                          >
                            <Download className="h-4 w-4 text-green-500" />
                          </Button>
                          {doc.status === 'pending' && (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveDocument(doc.id)}
                                disabled={isProcessing}
                                title="Approve document"
                                className="text-green-600 hover:text-green-700 hover:bg-green-100"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowRejectDocDialog(doc.id)}
                                disabled={isProcessing}
                                title="Reject document"
                                className="text-red-600 hover:text-red-700 hover:bg-red-100"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Show rejection notes */}
                  {docsOfType.filter(d => d.status === 'rejected' && d.review_notes).map(doc => (
                    <Alert key={`reject-${doc.id}`} className="mt-2 bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-800 text-sm">Rejection Reason</AlertTitle>
                      <AlertDescription className="text-red-700 text-sm">
                        {doc.review_notes}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Notes Field */}
              <div className="ml-7">
                <FieldWrapper 
                  htmlFor={notesName} 
                  label="Additional Notes" 
                  fieldName={notesName}
                >
                  <Textarea 
                    id={notesName}
                    value={notes}
                    readOnly
                    className="bg-gray-50 min-h-16"
                    placeholder="No notes provided"
                  />
                </FieldWrapper>
              </div>
            </CardContent>
          </Card>
        );
      };

      return (
        <>
          {/* Required Documents */}
          <Card className="shadow-none border-0">
            <CardHeader>
              <CardTitle className="text-red-600">Required Documents</CardTitle>
              <p className="text-sm text-gray-600">These documents are required for enrollment</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderDocumentField(
                "Birth Certificate",
                "birth_certificate",
                "birth_certificate_uploaded",
                "birth_certificate_notes",
                "Official birth certificate or passport to verify age and identity",
                true
              )}
              {renderDocumentField(
                "Immunization Records",
                "immunization_records",
                "immunization_records_uploaded",
                "immunization_records_notes",
                "Current immunization records from healthcare provider",
                true
              )}
              {renderDocumentField(
                "Previous Transcripts",
                "previous_transcripts",
                "previous_transcripts_uploaded",
                "previous_transcripts_notes",
                "Report cards or transcripts from previous school",
                true
              )}
              {renderDocumentField(
                "Proof of Residency",
                "proof_of_residency",
                "proof_of_residency_uploaded",
                "proof_of_residency_notes",
                "Utility bill, lease agreement, or other proof of residency",
                true
              )}
              {renderDocumentField(
                "Parent/Guardian ID",
                "parent_guardian_id",
                "parent_guardian_id_uploaded",
                "parent_guardian_id_notes",
                "Driver's license, state ID, or passport",
                true
              )}
            </CardContent>
          </Card>
          <hr />

          {/* Health Documents */}
          <Card className="shadow-none border-0">
            <CardHeader>
              <CardTitle className="text-orange-600">Health Documents</CardTitle>
              <p className="text-sm text-gray-600">Required health forms</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderDocumentField(
                "Physical Exam Form",
                "physical_exam_form",
                "physical_exam_form_uploaded",
                "physical_exam_form_notes",
                "Completed physical examination form (within last year)",
                true
              )}
              {renderDocumentField(
                "Dental Exam Form",
                "dental_exam_form",
                "dental_exam_form_uploaded",
                "dental_exam_form_notes",
                "Completed dental examination form (within last year)",
                true
              )}
              {renderDocumentField(
                "Emergency Contact Form",
                "emergency_contact_form",
                "emergency_contact_form_uploaded",
                "emergency_contact_form_notes",
                "Completed emergency contact information",
                true
              )}
            </CardContent>
          </Card>
          <hr />

          {/* Additional Documents */}
          <Card className="shadow-none border-0">
            <CardHeader>
              <CardTitle className="text-blue-600">Additional Documents</CardTitle>
              <p className="text-sm text-gray-600">If applicable</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderDocumentField(
                "Custody Documents",
                "custody_documents",
                "custody_documents_uploaded",
                "custody_documents_notes",
                "Court orders, custody agreements, or guardianship papers",
                false
              )}
              {renderDocumentField(
                "IEP/504 Plan",
                "iep_504_plan",
                "iep_504_plan_uploaded",
                "iep_504_plan_notes",
                "Individualized Education Program or 504 Plan if applicable",
                false
              )}
              {renderDocumentField(
                "Special Services Documents",
                "special_services_docs",
                "special_services_docs_uploaded",
                "special_services_docs_notes",
                "Any other special services or accommodation documents",
                false
              )}
            </CardContent>
          </Card>
          <hr />

          {/* Upload Summary */}
          {documents && documents.length > 0 && (
            <>
              <Card className="shadow-none border-0 bg-blue-50">
                <CardHeader>
                  <CardTitle>Document Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(documents as UploadedDocument[]).length}
                      </div>
                      <div className="text-sm text-gray-600">Total Files</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {(documents as UploadedDocument[]).filter(d => d.status === 'approved').length}
                      </div>
                      <div className="text-sm text-gray-600">Approved</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {(documents as UploadedDocument[]).filter(d => d.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-600">Pending Review</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {(documents as UploadedDocument[]).filter(d => d.status === 'rejected').length}
                      </div>
                      <div className="text-sm text-gray-600">Rejected</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <hr />
            </>
          )}

          {/* Certification & Signature */}
          <Card className="shadow-none border-0">
            <CardHeader>
              <CardTitle>Certification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <FieldWrapper 
                  htmlFor="documents_certification" 
                  label="Document Certification" 
                  required={true}
                  fieldName="documents_certification"
                >
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded border">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      formDataObject.documents_certification === true || 
                      formDataObject.documents_certification === '1' || 
                      formDataObject.documents_certification === 'true' 
                        ? 'bg-green-500 border-green-500' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {(formDataObject.documents_certification === true || 
                        formDataObject.documents_certification === '1' || 
                        formDataObject.documents_certification === 'true') && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm">
                      I certify that all documents uploaded are authentic, unaltered, and accurately represent the information provided. I understand that providing false documentation may result in enrollment denial or withdrawal.
                    </span>
                  </div>
                </FieldWrapper>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("signature", "Parent/Guardian Signature", true)}
                {renderField("signature_date", "Signature Date", true)}
              </div>
            </CardContent>
          </Card>
        </>
      );
    }

    // Health Summary Form (ID: 2)
    if (form?.id === 2) {
      return (
        <>
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Medical History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("has_chronic_illnesses", "Does the student have any chronic illnesses?")}
                {formDataObject.has_chronic_illnesses && renderField("chronic_illnesses_details", "Chronic Illnesses Details")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("has_hospitalizations", "Has the student been hospitalized?")}
                {formDataObject.has_hospitalizations && renderField("hospitalizations_details", "Hospitalization Details")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("has_surgeries", "Has the student had any surgeries?")}
                {formDataObject.has_surgeries && renderField("surgeries_details", "Surgery Details")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("has_physical_limitations", "Does the student have physical limitations?")}
                {formDataObject.has_physical_limitations && renderField("physical_limitations_details", "Physical Limitations Details")}
              </div>
            </CardContent>
          </Card>
          <hr />
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Immunizations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {renderField("immunization_up_to_date", "Are immunizations up to date?")}
              {renderField("immunization_exemptions", "Immunization Exemptions")}
            </CardContent>
          </Card>
          <hr />
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Allergies</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("has_drug_allergies", "Drug Allergies")}
                {formDataObject.has_drug_allergies && renderField("drug_allergies_details", "Drug Allergies Details")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("has_food_allergies", "Food Allergies")}
                {formDataObject.has_food_allergies && renderField("food_allergies_details", "Food Allergies Details")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("has_environmental_allergies", "Environmental Allergies")}
                {formDataObject.has_environmental_allergies && renderField("environmental_allergies_details", "Environmental Allergies Details")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("has_insect_allergies", "Insect Allergies")}
                {formDataObject.has_insect_allergies && renderField("insect_allergies_details", "Insect Allergies Details")}
              </div>
              {renderField("allergy_severity", "Allergy Severity")}
              {renderField("allergy_emergency_plan", "Allergy Emergency Plan")}
            </CardContent>
          </Card>
          <hr />
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Medications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {renderField("takes_regular_medications", "Takes Regular Medications")}
              {renderField("uses_emergency_meds", "Uses Emergency Medications")}
              {formDataObject.uses_emergency_meds && renderField("emergency_medications", "Emergency Medications Details")}
            </CardContent>
          </Card>
          <hr />
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Healthcare Provider & Insurance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("primary_care_physician", "Primary Care Physician", true)}
                {renderField("physician_phone", "Physician Phone", true)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderField("insurance_company", "Insurance Company", true)}
                {renderField("policy_number", "Policy Number", true)}
                {renderField("group_number", "Group Number")}
              </div>
            </CardContent>
          </Card>
          <hr />
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {renderField("special_dietary_needs", "Special Dietary Needs")}
              {renderField("activity_restrictions", "Activity Restrictions")}
              {renderField("additional_notes", "Additional Notes")}
            </CardContent>
          </Card>
          <hr />
          <Card className="shadow-none border-0">
            <CardHeader><CardTitle>Consent & Signature</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {renderField("consent_medical_treatment", "Consent for Emergency Medical Treatment", true)}
              {renderField("consent_share_info", "Consent to Share Information")}
              {renderField("signature", "Signature", true)}
              {renderField("signature_date", "Signature Date", true)}
            </CardContent>
          </Card>
        </>
      );
    }

    // Generic form display for other form types
    // Groups fields intelligently
    const groupedFields = useMemo(() => {
      const groups: Record<string, string[]> = {
        'General Information': [],
        'Contact Information': [],
        'Consent & Signature': [],
        'Other': [],
      };

      Object.keys(formDataObject).forEach(key => {
        if (key === 'form_id') return;
        if (key.includes('signature') || key.includes('consent') || key.includes('agree')) {
          groups['Consent & Signature'].push(key);
        } else if (key.includes('phone') || key.includes('email') || key.includes('address') || key.includes('contact')) {
          groups['Contact Information'].push(key);
        } else if (key.includes('name') || key.includes('date') || key.includes('type')) {
          groups['General Information'].push(key);
        } else {
          groups['Other'].push(key);
        }
      });

      return Object.fromEntries(
        Object.entries(groups).filter(([_, fields]) => fields.length > 0)
      );
    }, [formDataObject]);

    return (
      <>
        {Object.entries(groupedFields).map(([groupName, fields]) => (
          <React.Fragment key={groupName}>
            <Card className="shadow-none border-0">
              <CardHeader><CardTitle>{groupName}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(fields as string[]).map((key) => (
                    <div key={key}>
                      {renderField(key, key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <hr />
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <AppLayout>
      <Head title={`${form?.name} - ${student?.first_name} ${student?.last_name}`} />
      <div className="flex flex-col min-h-screen">
        <Header user={auth.user} breadcrumbs={breadcrumbs} />
        <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
          <div className="w-full min-h-screen bg-gray-50">
            <div className="w-full mx-auto bg-white p-6 md:p-8 rounded-lg shadow-sm space-y-4">
              
              {/* Header - SAME layout as parent */}
              <div className="flex gap-3">
                <div className="px-2 flex-1">
                  <div className="flex gap-2 items-center">
                    <Link href={route('school-admission.show', student?.id)} className="justify-center items-center inline-flex">
                      <ChevronLeft />
                    </Link>
                    <h1 className="text-2xl font-bold">{form?.name}</h1>
                    {getStatusBadge()}
                  </div>
                  <p className="text-sm px-8 mt-1 text-muted-foreground">
                    Student: <span className="font-semibold">{student?.first_name} {student?.last_name}</span>
                    {admissionForm && (
                      <span className="ml-4">Version: v{admissionForm.version}</span>
                    )}
                  </p>
                </div>
                
                {/* School Actions */}
                <div className="flex items-center gap-2">
                  {admissionForm?.status === 'submitted' && (
                    <>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowApproveDialog(true)}>
                        <CheckCircle className="h-4 w-4 mr-2" />Approve
                      </Button>
                      <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
                        <XCircle className="h-4 w-4 mr-2" />Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Pending Changes Alert */}
              {hasPendingChanges && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Pending Changes</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    This form has been updated since the last approval. Changed fields are highlighted.
                  </AlertDescription>
                </Alert>
              )}

              {/* Global Comments Section */}
              {admissionForm && (
                <Card className="shadow-none border bg-blue-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Global Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {globalComments.length > 0 && (
                      <div className="space-y-2">
                        {globalComments.map((comment: Comment) => (
                          <div key={comment.id} className={`p-3 rounded-md ${comment.is_resolved || comment.reply ? 'bg-green-50 border border-green-200' : 'bg-white border border-blue-200'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{comment.user_name}</span>
                                  <span className="text-xs text-muted-foreground">{comment.created_at}</span>
                                  {(comment.is_resolved || comment.reply) && <Badge variant="outline" className="text-xs bg-green-100 text-green-700">Responded</Badge>}
                                </div>
                                <p className="mt-1">{comment.comment}</p>
                                
                                {/* Show parent reply */}
                                {comment.reply && (
                                  <div className="mt-2 p-2 bg-white rounded border border-green-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-green-700">Parent Reply ({comment.reply_by_name}):</span>
                                      <span className="text-xs text-muted-foreground">{comment.reply_at}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{comment.reply}</p>
                                  </div>
                                )}
                              </div>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600" onClick={() => handleDeleteComment(comment.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <GlobalCommentInput 
                      admissionFormId={admissionForm.id} 
                      onCommentAdded={handleCommentAdded} 
                    />
                  </CardContent>
                </Card>
              )}

              <hr />

              {/* Uploaded Documents Section - only show for non-enrollment-document forms */}
              {documents && documents.length > 0 && form?.id !== 4 && form?.slug !== 'document-checklist-form' && (
                <Card className="shadow-none border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <File className="h-5 w-5" />
                      Uploaded Documents ({documents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(documents as UploadedDocument[]).map((doc) => (
                        <div 
                          key={doc.id} 
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            doc.status === 'approved' ? 'bg-green-50 border-green-200' :
                            doc.status === 'rejected' ? 'bg-red-50 border-red-200' :
                            'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <File className={`h-8 w-8 flex-shrink-0 ${
                              doc.status === 'approved' ? 'text-green-500' :
                              doc.status === 'rejected' ? 'text-red-500' :
                              'text-gray-400'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{doc.type_label}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    doc.status === 'approved' ? 'bg-green-100 text-green-700 border-green-300' :
                                    doc.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-300' :
                                    'bg-yellow-100 text-yellow-700 border-yellow-300'
                                  }`}
                                >
                                  {doc.status}
                                </Badge>
                                {doc.is_watermarked && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                                    Watermarked
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{doc.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.formatted_size} • Uploaded {doc.uploaded_at}
                              </p>
                              {doc.status === 'rejected' && doc.review_notes && (
                                <p className="text-xs text-red-600 mt-1">
                                  <strong>Rejection reason:</strong> {doc.review_notes}
                                </p>
                              )}
                              {doc.reviewed_by && (
                                <p className="text-xs text-muted-foreground">
                                  Reviewed by {doc.reviewed_by} on {doc.reviewed_at}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {/* View/Download buttons */}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => window.open(doc.file_url, '_blank')}
                              title="View document"
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => window.open(doc.download_url, '_blank')}
                              title="Download document"
                            >
                              <Download className="h-4 w-4 text-green-500" />
                            </Button>
                            
                            {/* Approve/Reject buttons for pending documents */}
                            {doc.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleApproveDocument(doc.id)}
                                  disabled={isProcessing}
                                  title="Approve document"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-100"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setShowRejectDocDialog(doc.id)}
                                  disabled={isProcessing}
                                  title="Reject document"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Document statistics */}
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {(documents as UploadedDocument[]).filter(d => d.status === 'approved').length}
                        </div>
                        <div className="text-xs text-green-700">Approved</div>
                      </div>
                      <div className="p-2 bg-yellow-50 rounded">
                        <div className="text-lg font-bold text-yellow-600">
                          {(documents as UploadedDocument[]).filter(d => d.status === 'pending').length}
                        </div>
                        <div className="text-xs text-yellow-700">Pending</div>
                      </div>
                      <div className="p-2 bg-red-50 rounded">
                        <div className="text-lg font-bold text-red-600">
                          {(documents as UploadedDocument[]).filter(d => d.status === 'rejected').length}
                        </div>
                        <div className="text-xs text-red-700">Rejected</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <hr />

              {/* Form Content - Render based on form type */}
              {renderFormContent()}

              {/* Not Submitted Message */}
              {!isSubmitted && (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Form Not Submitted</p>
                  <p>Waiting for parent to submit this form.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this form?
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-muted rounded-md">
            <p><strong>Student:</strong> {student?.first_name} {student?.last_name}</p>
            <p><strong>Form:</strong> {form?.name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={isProcessing}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? 'Approving...' : 'Approve Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this form? Consider adding comments first to let the parent know what needs to be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-muted rounded-md">
            <p><strong>Student:</strong> {student?.first_name} {student?.last_name}</p>
            <p><strong>Form:</strong> {form?.name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? 'Rejecting...' : 'Reject Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Document Dialog */}
      <Dialog open={!!showRejectDocDialog} onOpenChange={() => { setShowRejectDocDialog(null); setRejectNotes(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document. The parent will see this message and can upload a new document.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-notes">Rejection Reason</Label>
            <Textarea
              id="reject-notes"
              placeholder="e.g., Document is unclear, expired, or doesn't match requirements..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRejectDocDialog(null); setRejectNotes(''); }} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectDocument} disabled={isProcessing || !rejectNotes.trim()}>
              {isProcessing ? 'Rejecting...' : 'Reject Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SchoolFormView;
