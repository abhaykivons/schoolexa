import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ChevronLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  AlertCircle,
  MessageSquare,
  GraduationCap,
  Eye,
  Send,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Trash2,
  Download,
  Users,
  BookOpen,
  Loader2
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
import { toast } from 'sonner';

interface StudentInfo {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  grade: string;
  parent_name: string;
  parent_email: string;
  status: number;
  status_label: string;
}

interface FormTemplate {
  id: number;
  name: string;
  slug: string;
  description: string;
  priority: string;
  required: boolean;
  duration: string;
}

interface Comment {
  id: number;
  field_name: string | null;
  comment: string;
  is_resolved: boolean;
  user_name: string;
  created_at: string;
}

interface AdmissionFormData {
  id: number;
  form_id: number;
  form_type: string;
  status: string;
  version: number;
  submitted_by: string;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  has_pending_changes: boolean;
  comments: Comment[];
  unresolved_comments_count: number;
}

interface Stats {
  total_forms: number;
  required_forms: number;
  submitted_forms: number;
  approved_forms: number;
  pending_forms: number;
  required_approved: number;
}

interface AvailableClass {
  id: number;
  name: string;
  grade_id: number;
  grade_name: string;
  capacity: number;
  current_strength: number;
  available_seats: number;
  is_full: boolean;
  class_teacher_id: number | null;
  class_teacher_name: string;
}

interface AcademicYear {
  id: number;
  name: string;
}

const StudentAdmissionShow: React.FC = () => {
  const { 
    auth, 
    student, 
    formTemplates = [], 
    admissionForms = {}, 
    allRequiredApproved,
    availableClasses = [],
    currentAcademicYear,
    stats 
  } = usePage().props as any;
  
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<{ template: FormTemplate; admission: AdmissionFormData | null } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalComment, setGlobalComment] = useState('');
  const [commentingFormId, setCommentingFormId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  
  // Enrollment form state
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [createLogin, setCreateLogin] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Admission', href: '/school-admission' },
    { title: student?.name || 'Student', href: '#' },
  ];

  // Toggle row expansion
  const toggleRow = (formId: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [formId]: !prev[formId]
    }));
  };

  // Get admission form data for a template
  const getAdmissionForm = (formId: number): AdmissionFormData | null => {
    return admissionForms[formId] || null;
  };

  // Get status badge
  const getStatusBadge = (af: AdmissionFormData | null) => {
    if (!af) {
      return <Badge variant="secondary" className="text-xs">Not Submitted</Badge>;
    }
    switch (af.status) {
      case 'draft':
        return <Badge variant="secondary" className="text-xs">Draft</Badge>;
      case 'submitted':
        return (
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="text-xs bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs">{af.status}</Badge>;
    }
  };

  // Get row background color based on status
  const getRowBgClass = (form: FormTemplate, af: AdmissionFormData | null) => {
    if (!af) {
      return form.required ? 'bg-red-50/30' : '';
    }
    switch (af.status) {
      case 'approved':
        return 'bg-green-50/30';
      case 'submitted':
        return 'bg-blue-50/30';
      case 'rejected':
        return 'bg-red-50/30';
      default:
        return '';
    }
  };

  // Handle approve
  const handleApprove = (form: FormTemplate) => {
    const af = getAdmissionForm(form.id);
    if (!af) return;
    setSelectedForm({ template: form, admission: af });
    setShowApproveDialog(true);
  };

  const confirmApprove = () => {
    if (!selectedForm?.admission) return;
    setIsProcessing(true);
    
    router.post(route('school-admission.approve', selectedForm.admission.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Form approved successfully');
        setShowApproveDialog(false);
        setSelectedForm(null);
        setIsProcessing(false);
      },
      onError: () => {
        toast.error('Failed to approve form');
        setIsProcessing(false);
      }
    });
  };

  // Handle reject
  const handleReject = (form: FormTemplate) => {
    const af = getAdmissionForm(form.id);
    if (!af) return;
    setSelectedForm({ template: form, admission: af });
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (!selectedForm?.admission) return;
    setIsProcessing(true);
    
    router.post(route('school-admission.reject', selectedForm.admission.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Form rejected');
        setShowRejectDialog(false);
        setSelectedForm(null);
        setIsProcessing(false);
      },
      onError: () => {
        toast.error('Failed to reject form');
        setIsProcessing(false);
      }
    });
  };

  // Handle add global comment
  const handleAddComment = (admissionFormId: number) => {
    if (!globalComment.trim()) return;
    setIsProcessing(true);

    router.post(route('school-admission.add-comment', admissionFormId), {
      comment: globalComment,
      field_name: null,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Comment added');
        setGlobalComment('');
        setCommentingFormId(null);
        setIsProcessing(false);
      },
      onError: () => {
        toast.error('Failed to add comment');
        setIsProcessing(false);
      }
    });
  };

  // Progress calculation
  const progressPercentage = stats?.required_forms > 0 
    ? Math.round((stats.required_approved / stats.required_forms) * 100) 
    : 0;

  // All forms combined
  const allForms = formTemplates as FormTemplate[];

  // Get selected class details
  const selectedClass = (availableClasses as AvailableClass[]).find(
    (c) => c.id.toString() === selectedClassId
  );

  // Handle enrollment
  const handleEnroll = () => {
    if (!selectedClassId) {
      toast.error('Please select a class');
      return;
    }
    
    setIsEnrolling(true);
    router.post(route('school-admission.enroll', student.id), {
      class_id: parseInt(selectedClassId),
      create_login: createLogin,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Student enrolled successfully!');
        setShowEnrollDialog(false);
        setSelectedClassId('');
        setIsEnrolling(false);
      },
      onError: (errors) => {
        toast.error(Object.values(errors)[0] as string || 'Failed to enroll student');
        setIsEnrolling(false);
      },
      onFinish: () => {
        setIsEnrolling(false);
      }
    });
  };

  // Render table row for a form
  const renderFormRow = (form: FormTemplate) => {
    const af = getAdmissionForm(form.id);
    const isExpanded = expandedRows[form.id];
    const hasComments = af && af.comments.length > 0;
    const hasUnresolved = af && af.unresolved_comments_count > 0;

    return (
      <React.Fragment key={form.id}>
        {/* Main Row */}
        <TableRow 
          className={`cursor-pointer hover:bg-muted/50 ${getRowBgClass(form, af)}`}
          onClick={() => toggleRow(form.id)}
        >
          {/* Expand Icon */}
          <TableCell className="w-10 px-2">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </TableCell>

          {/* Form Name */}
          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              <span>{form.name}</span>
              {form.required && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-red-50 text-red-700 border-red-300">
                  Required
                </Badge>
              )}
            </div>
          </TableCell>

          {/* Status */}
          <TableCell>
            {getStatusBadge(af)}
          </TableCell>

          {/* Version */}
          <TableCell className="text-center">
            {af ? `v${af.version}` : '-'}
          </TableCell>

          {/* Submitted Date */}
          <TableCell className="text-sm text-muted-foreground">
            {af?.submitted_at || '-'}
          </TableCell>

          {/* Approved Date */}
          <TableCell className="text-sm text-muted-foreground">
            {af?.approved_at || '-'}
          </TableCell>

          {/* Comments Count */}
          <TableCell className="text-center">
            {hasComments ? (
              <div className="flex items-center justify-center gap-1">
                <MessageSquare className={`h-3.5 w-3.5 ${hasUnresolved ? 'text-amber-600' : 'text-green-600'}`} />
                <span className={`text-xs ${hasUnresolved ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                  {af.comments.length}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </TableCell>

          {/* Indicators */}
          <TableCell>
            <div className="flex items-center gap-1">
              {af?.has_pending_changes && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-amber-50 text-amber-700 border-amber-300">
                  Changes
                </Badge>
              )}
              {hasUnresolved && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-50 text-blue-700 border-blue-300">
                  {af.unresolved_comments_count} pending
                </Badge>
              )}
            </div>
          </TableCell>

          {/* Actions */}
          <TableCell onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1">
              {af ? (
                <>
                  <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                    <Link href={route('school-admission.view-form', { student: student.id, form: form.slug })}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  
                  {af.status === 'submitted' && (
                    <>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                        onClick={() => handleApprove(form)}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => handleReject(form)}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Waiting</span>
              )}
            </div>
          </TableCell>
        </TableRow>

        {/* Expanded Details Row */}
        {isExpanded && (
          <TableRow className="bg-muted/20">
            <TableCell colSpan={9} className="p-0">
              <div className="p-4 space-y-4">
                {/* Form Description */}
                <div className="flex gap-6">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{form.description || 'No description available'}</p>
                  </div>
                  
                  {af && (
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-1">Submission Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Submitted by:</span>
                          <span className="ml-2 font-medium">{af.submitted_by}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Form Type:</span>
                          <span className="ml-2">{af.form_type}</span>
                        </div>
                        {af.approved_by && (
                          <div>
                            <span className="text-muted-foreground">Approved by:</span>
                            <span className="ml-2">{af.approved_by}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                {af && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Comments ({af.comments.length})
                      </h4>
                      {commentingFormId !== af.id && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => setCommentingFormId(af.id)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Add Comment
                        </Button>
                      )}
                    </div>

                    {/* Add Comment Form */}
                    {commentingFormId === af.id && (
                      <div className="mb-4 p-3 bg-white rounded border">
                        <Textarea
                          placeholder="Add a comment for the parent..."
                          value={globalComment}
                          onChange={(e) => setGlobalComment(e.target.value)}
                          className="min-h-16 text-sm mb-2"
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => handleAddComment(af.id)}
                            disabled={!globalComment.trim() || isProcessing}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Send Comment
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setCommentingFormId(null);
                              setGlobalComment('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    {hasComments ? (
                      <div className="grid gap-2 max-h-48 overflow-y-auto">
                        {af.comments.map((comment) => (
                          <div 
                            key={comment.id} 
                            className={`p-3 rounded border text-sm ${comment.is_resolved ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{comment.user_name}</span>
                                  <span className="text-xs text-muted-foreground">{comment.created_at}</span>
                                  {comment.is_resolved && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-100 text-green-700">
                                      <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                                      Resolved
                                    </Badge>
                                  )}
                                  {comment.field_name && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                      Field: {comment.field_name}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm">{comment.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No comments yet</p>
                    )}
                  </div>
                )}

                {/* Quick Actions for expanded row */}
                {af && af.status === 'submitted' && (
                  <div className="border-t pt-4 flex gap-2">
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(form)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Form
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleReject(form)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Form
                    </Button>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  return (
    <AppLayout>
      <Head title={`${student?.name} - Admission Forms`} />
      <div className="flex flex-col min-h-screen">
        <Header user={auth.user} breadcrumbs={breadcrumbs} />
        <div className="p-4 pt-0 mb-12 lg:mb-0 md:mb-0 space-y-4">
          
          {/* Student Info & Progress Header */}
          <Card className="dark:bg-neutral-900 shadow-none">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Student Info */}
                <div className="flex items-start gap-4">
                  <Button variant="outline" size="icon" asChild className="shrink-0">
                    <Link href={route('school-admission.index')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <h1 className="text-xl font-bold">{student?.name}</h1>
                      <Badge variant="outline">{student?.status_label}</Badge>
                      <Badge variant="secondary">{student?.grade}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {student?.parent_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {student?.parent_email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress & Enroll */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold">{progressPercentage}%</div>
                    <div className="text-xs text-muted-foreground">
                      {stats?.required_approved || 0}/{stats?.required_forms || 0} required approved
                    </div>
                  </div>
                  <div className="w-32">
                    <Progress value={progressPercentage} className="h-3" />
                  </div>
                  
                </div>
              </div>

              {/* Ready to Enroll Alert */}
              {allRequiredApproved && student?.status !== 3 && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800 flex items-center justify-between">
                    <span>Ready for Enrollment</span>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setShowEnrollDialog(true)}
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Enroll Student
                    </Button>
                  </AlertTitle>
                  <AlertDescription className="text-green-700">
                    All required forms have been approved. This student can now be enrolled.
                    {currentAcademicYear && (
                      <span className="block mt-1 text-sm">
                        Academic Year: <strong>{currentAcademicYear.name}</strong>
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Already Enrolled Badge */}
              {student?.status === 3 && (
                <Alert className="mt-4 bg-blue-50 border-blue-200">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Student Enrolled</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    This student has been successfully enrolled.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Forms Table */}
          <Card className="shadow-sm border-none bg-white py-0">
            <CardContent className="p-0">
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="font-semibold">Form Name</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-center">Version</TableHead>
                      <TableHead className="font-semibold">Submitted</TableHead>
                      <TableHead className="font-semibold">Approved</TableHead>
                      <TableHead className="font-semibold text-center">Comments</TableHead>
                      <TableHead className="font-semibold">Flags</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allForms.map(renderFormRow)}
                  </TableBody>
                </Table>
              </div>

              {/* Summary Footer */}
              <div className="p-3 bg-muted/30 border-t flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{stats?.total_forms || 0}</span> forms
                  </span>
                  <span className="text-muted-foreground">
                    Submitted: <span className="font-medium text-foreground">{stats?.submitted_forms || 0}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Approved: <span className="font-medium text-green-600">{stats?.approved_forms || 0}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Pending: <span className="font-medium text-blue-600">{stats?.pending_forms || 0}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
                    {stats?.required_forms || 0} Required
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
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
          {selectedForm && (
            <div className="p-3 bg-muted rounded-md">
              <p><strong>Student:</strong> {student?.name}</p>
              <p><strong>Form:</strong> {selectedForm.template.name}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={confirmApprove} disabled={isProcessing}>
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
              Are you sure you want to reject this form? Consider adding a comment first to let the parent know what needs to be changed.
            </DialogDescription>
          </DialogHeader>
          {selectedForm && (
            <div className="p-3 bg-muted rounded-md">
              <p><strong>Student:</strong> {student?.name}</p>
              <p><strong>Form:</strong> {selectedForm.template.name}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={isProcessing}>
              {isProcessing ? 'Rejecting...' : 'Reject Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Enroll Student
            </DialogTitle>
            <DialogDescription>
              Complete the enrollment process by selecting a class for the student.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Student Info */}
            <div className="p-3 bg-muted rounded-md space-y-1">
              <p className="text-sm"><strong>Student:</strong> {student?.name}</p>
              <p className="text-sm"><strong>Grade:</strong> {student?.grade}</p>
              {currentAcademicYear && (
                <p className="text-sm"><strong>Academic Year:</strong> {currentAcademicYear.name}</p>
              )}
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
              <Label htmlFor="class_id" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Select Class *
              </Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger id="class_id">
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {(availableClasses as AvailableClass[]).map((cls) => (
                    <SelectItem 
                      key={cls.id} 
                      value={cls.id.toString()}
                      disabled={cls.is_full}
                    >
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{cls.name}</span>
                        <span className={`text-xs ${cls.is_full ? 'text-red-500' : 'text-muted-foreground'}`}>
                          ({cls.current_strength}/{cls.capacity})
                          {cls.is_full && ' - Full'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="null" disabled={true}>No classes available</SelectItem>
                </SelectContent>
              </Select>
              {availableClasses.length === 0 && (
                <p className="text-sm text-amber-600">
                  No classes available for this grade. Please create a class first.
                </p>
              )}
            </div>

            {/* Selected Class Details */}
            {selectedClass && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md space-y-2">
                <h4 className="font-medium text-blue-800 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Class Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Class:</span>
                    <span className="ml-2 font-medium">{selectedClass.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="ml-2">{selectedClass.current_strength}/{selectedClass.capacity}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Class Teacher:</span>
                    <span className="ml-2 font-medium">{selectedClass.class_teacher_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available Seats:</span>
                    <span className={`ml-2 font-medium ${selectedClass.available_seats > 5 ? 'text-green-600' : 'text-amber-600'}`}>
                      {selectedClass.available_seats}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Create Login Option */}
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
              <Checkbox 
                id="create_login" 
                checked={createLogin}
                onCheckedChange={(checked) => setCreateLogin(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="create_login" className="text-sm font-medium cursor-pointer">
                  Create student login account
                </Label>
                <p className="text-xs text-muted-foreground">
                  A temporary password will be generated and shared with the parent.
                </p>
              </div>
            </div>

            {/* What will happen */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Upon enrollment:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>A unique Student ID will be generated</li>
                <li>Student will be assigned to the selected class</li>
                <li>Class teacher will be automatically assigned</li>
                <li>Roll number will be generated</li>
                {createLogin && <li>Student login credentials will be created</li>}
                <li>Parent will receive a notification email</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEnrollDialog(false);
                setSelectedClassId('');
              }} 
              disabled={isEnrolling}
            >
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleEnroll} 
              disabled={isEnrolling || !selectedClassId}
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Complete Enrollment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </AppLayout>
  );
};

export default StudentAdmissionShow;
