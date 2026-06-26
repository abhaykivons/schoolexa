import AppLayout from '@/layouts/app-layout';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { FileText, Clock, CheckCircle, AlertCircle, Loader2, XCircle, Eye, MessageCircle, ExternalLink, GraduationCap, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from '@/components/header';
import { Button } from "@/components/ui/button";
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Students', href: '/parent/students' },
];

export default function FormsList({ onFormSelect, onBack }: any) {
  const { auth, forms, student, admissionForms } = usePage().props as any;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendApprovalRequest = () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    router.post(route('parent.admission.send-approval', { student: student.id }), {}, {
      onFinish: () => setIsSubmitting(false),
    });
  };

  const getStatusIcon = (status: string, size: string = "h-4 w-4") => ({
    completed: <CheckCircle className={`${size} text-green-600`} />,
    "in-progress": <Clock className={`${size} text-orange-500`} />,
    required: <AlertCircle className={`${size} text-destructive`} />,
  }[status] || <FileText className={`${size} text-muted-foreground`} />);

  const getStatusColor = (status: string) => ({
    completed: "bg-green-100 text-green-700",
    "in-progress": "bg-orange-100 text-orange-700",
    required: "bg-red-100 text-red-700",
  }[status] || "bg-gray-100 text-gray-600");

  const getStatusText = (status: string) => ({
    completed: "Completed",
    "in-progress": "In Progress",
    required: "Required",
  }[status] || "Not Started");

  const getPriorityColor = (p: string) => ({
    high: "bg-red-100 text-red-700",
    medium: "bg-orange-100 text-orange-700",
  }[p] || "bg-green-100 text-green-700");

  // Approval status helpers
  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-3.5 w-3.5 text-red-600" />;
      case 'submitted':
      case 'pending':
        return <Eye className="h-3.5 w-3.5 text-blue-600" />;
      case 'draft':
      default:
        return <Clock className="h-3.5 w-3.5 text-gray-500" />;
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-700 border-green-300";
      case 'rejected':
        return "bg-red-100 text-red-700 border-red-300";
      case 'submitted':
      case 'pending':
        return "bg-blue-100 text-blue-700 border-blue-300";
      case 'draft':
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getApprovalStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return "Approved";
      case 'rejected':
        return "Rejected";
      case 'submitted':
      case 'pending':
        return "In Review";
      case 'draft':
        return "Draft";
      default:
        return "Not Submitted";
    }
  };

  // admissionForms is already an object keyed by form_id from the backend
  // Handle both array and object formats for safety
  const admissionFormsMap: Record<number, any> = Array.isArray(admissionForms) 
    ? (admissionForms as any[]).reduce((acc, af) => {
        acc[af.form_id] = af;
        return acc;
      }, {} as Record<number, any>)
    : (admissionForms || {}) as Record<number, any>;

  const completedForms = (forms as any[]).filter((f: any) => admissionFormsMap[f.id]).length;
  const totalForms = (forms as any[]).length;
  const progressPercentage = totalForms > 0 ? (completedForms / totalForms) * 100 : 0;

  const requiredForms = (forms as any[]).filter((f: any) => f.required == 1);
  const otherForms = (forms as any[]).filter((f: any) => f.required != 1);
  const allFormsSubmitted = totalForms > 0 && completedForms === totalForms;
  
  // Check if any form has 'draft' status - only show "Send Approval Request" if there are draft forms
  const hasDraftForms = Object.values(admissionFormsMap).some((af: any) => af.status === 'draft');
  const showApprovalButton = allFormsSubmitted && hasDraftForms;

  // Render table row for a form
  const renderFormRow = (form: any, isRequired: boolean = false) => {
    const admissionForm = admissionFormsMap[form.id];
    const submitted = !!admissionForm;
    const approvalStatus = admissionForm?.status || 'not_submitted';
    const commentsCount = admissionForm?.comments_count || 0;
    const unresolvedCommentsCount = admissionForm?.unresolved_comments_count || 0;

    return (
      <TableRow 
        key={form.id} 
        className={`hover:bg-gray-50 ${
          submitted 
            ? "border-l-4 border-l-green-500" 
            : isRequired 
              ? "border-l-4 border-l-red-400" 
              : "border-l-4 border-l-amber-400"
        }`}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-3">
            {getStatusIcon(submitted ? 'completed' : form.status)}
            <div>
              <div className="font-semibold text-gray-900">{form.name}</div>
              <div className="text-xs text-gray-500 mt-0.5 max-w-md truncate">{form.description}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge className={`${getStatusColor(submitted ? 'completed' : form.status)} text-xs`}>
            {getStatusText(submitted ? 'completed' : form.status)}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge className={`${getPriorityColor(form.priority)} text-xs`}>
            {form.priority.toUpperCase()}
          </Badge>
        </TableCell>
        <TableCell>
          {submitted ? (
            <Badge variant="outline" className={`text-xs flex items-center gap-1 w-fit ${getApprovalStatusColor(approvalStatus)}`}>
              {getApprovalStatusIcon(approvalStatus)}
              {getApprovalStatusText(approvalStatus)}
            </Badge>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </TableCell>
        <TableCell>
          {commentsCount > 0 ? (
            <Badge 
              variant="outline" 
              className={`text-xs flex items-center gap-1 w-fit ${
                unresolvedCommentsCount > 0 
                  ? "bg-orange-100 text-orange-700 border-orange-300" 
                  : "bg-gray-100 text-gray-600 border-gray-300"
              }`}
              title={unresolvedCommentsCount > 0 ? `${unresolvedCommentsCount} unresolved comment(s)` : `${commentsCount} comment(s)`}
            >
              <MessageCircle className="h-3 w-3" />
              {unresolvedCommentsCount > 0 ? unresolvedCommentsCount : commentsCount}
            </Badge>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </TableCell>
        <TableCell>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {form.duration}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <Link
            href={route('parent.admission.forms', { student: student.id, forms: form.slug })}
            className={`inline-flex items-center justify-center gap-1.5 h-8 rounded-md px-3 text-sm font-medium transition-colors
              ${submitted 
                ? "bg-green-600 text-white hover:bg-green-700" 
                : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
          >
            {submitted ? "View" : "Start"}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <AppLayout>
      <Head title="My Students" />

      <div className="flex flex-col min-h-screen">
        <Header user={auth.user} breadcrumbs={breadcrumbs} />

        <div className="p-6 pt-0 mb-12">
          <div className="space-y-4">

            <Card>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-red-500">Note:</span> After all forms are submitted, the school will review and verify the details. You will receive an email notification regarding enrollment status. If any changes are required, the school will add comments on the form for your review. All data is protected with end-to-end encryption and accessible only to school staff and the submitting user.
                  </p>
                  {showApprovalButton && (
                    <Button 
                      onClick={handleSendApprovalRequest} 
                      disabled={isSubmitting}
                      className="whitespace-nowrap bg-black text-white hover:bg-gray-800"
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? 'Sending...' : 'Send Approval Request'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-soft">
              <CardContent>
                {/* Student Info & Progress Section */}
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Left Side - Student Info */}
                    <div className="flex items-center gap-4">
                      {student?.photo ? (
                        <img 
                          src={student.photo} 
                          alt={student?.name || 'Student'}
                          className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 shadow-md"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                          {student?.first_name?.charAt(0)?.toUpperCase() || student?.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <h2 className="text-xl font-bold text-gray-900">{student?.name || student?.full_name || `${student?.first_name} ${student?.last_name}` || 'Student'}</h2>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <GraduationCap className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{student?.grade?.name || 'Grade not assigned'}</span>
                        </div>
                        {student?.student_id && (
                          <div className="text-xs text-gray-400 mt-1">ID: {student.student_id}</div>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Progress */}
                    <div className="flex-1 max-w-md">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">Enrollment Progress</h3>
                          <p className="text-sm text-muted-foreground">
                            {completedForms} of {totalForms} forms completed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</div>
                          <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                    </div>
                  </div>
                </div>

                {/* Required Forms Table */}
                {requiredForms.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <h2 className="text-lg font-semibold">Required Forms</h2>
                      <Badge variant="destructive" className="text-xs">Action Needed</Badge>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">Form Name</TableHead>
                            <TableHead className="font-semibold w-28">Status</TableHead>
                            <TableHead className="font-semibold w-24">Priority</TableHead>
                            <TableHead className="font-semibold w-28">Review</TableHead>
                            <TableHead className="font-semibold w-24">Comments</TableHead>
                            <TableHead className="font-semibold w-24">Duration</TableHead>
                            <TableHead className="font-semibold w-24 text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requiredForms.map((form: any) => renderFormRow(form, true))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Additional Forms Table */}
                {otherForms.length > 0 && (
                  <div className="space-y-4 mt-8">
                    <h2 className="text-lg font-semibold">Additional Forms</h2>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">Form Name</TableHead>
                            <TableHead className="font-semibold w-28">Status</TableHead>
                            <TableHead className="font-semibold w-24">Priority</TableHead>
                            <TableHead className="font-semibold w-28">Review</TableHead>
                            <TableHead className="font-semibold w-24">Comments</TableHead>
                            <TableHead className="font-semibold w-24">Duration</TableHead>
                            <TableHead className="font-semibold w-24 text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {otherForms.map((form: any) => renderFormRow(form, false))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
