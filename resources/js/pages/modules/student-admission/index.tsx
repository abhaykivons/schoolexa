import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Users, 
  AlertCircle,
  Search,
  MessageSquare,
  GraduationCap,
  UserCheck,
  Download,
  BookText
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Student Admission',
    href: '/school-admission',
  },
];

interface StudentData {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  grade: string;
  parent_name: string;
  parent_email: string;
  status: number;
  status_label: string;
  overall_status: string;
  forms_submitted: number;
  forms_approved: number;
  forms_pending: number;
  forms_draft: number;
  forms_rejected: number;
  required_forms_submitted: number;
  required_forms_approved: number;
  unresolved_comments: number;
  progress_percentage: number;
  updated_at: string | null;
}

interface Stats {
  total_students: number;
  pending_count: number;
  in_progress_count: number;
  ready_to_enroll_count: number;
  enrolled_count: number;
  required_forms_count: number;
  total_forms_count: number;
}

const OVERALL_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: <FileText className="w-3 h-3" /> },
  in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-300', icon: <Clock className="w-3 h-3" /> },
  pending_approval: { label: 'Pending Approval', color: 'bg-blue-50 text-blue-700 border-blue-300', icon: <Clock className="w-3 h-3" /> },
  has_rejections: { label: 'Has Rejections', color: 'bg-red-50 text-red-700 border-red-300', icon: <XCircle className="w-3 h-3" /> },
  ready_to_enroll: { label: 'Ready to Enroll', color: 'bg-green-50 text-green-700 border-green-300', icon: <CheckCircle className="w-3 h-3" /> },
  enrolled: { label: 'Enrolled', color: 'bg-green-600 text-white', icon: <GraduationCap className="w-3 h-3" /> },
};

const StudentAdmissionIndex: React.FC = () => {
  const { 
    auth, 
    pendingStudents = [], 
    inProgressStudents = [], 
    readyToEnrollStudents = [], 
    enrolledStudents = [],
    notStartedStudents = [],
    stats 
  } = usePage().props as any;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle enroll
  const handleEnroll = () => {
    if (!selectedStudent) return;
    setIsProcessing(true);
    
    router.post(route('school-admission.enroll', selectedStudent.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Student enrolled successfully!');
        setShowEnrollDialog(false);
        setSelectedStudent(null);
        setIsProcessing(false);
      },
      onError: (errors: any) => {
        toast.error(errors.message || 'Failed to enroll student');
        setIsProcessing(false);
      }
    });
  };

  const openEnrollDialog = (student: StudentData) => {
    setSelectedStudent(student);
    setShowEnrollDialog(true);
  };

  // Filter students based on search
  const filterStudents = (students: StudentData[]) => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter((student) => 
      student.name.toLowerCase().includes(query) ||
      student.parent_name.toLowerCase().includes(query) ||
      student.parent_email.toLowerCase().includes(query) ||
      student.grade.toLowerCase().includes(query)
    );
  };

  const filteredPending = filterStudents(pendingStudents);
  const filteredInProgress = filterStudents(inProgressStudents);
  const filteredReadyToEnroll = filterStudents(readyToEnrollStudents);
  const filteredEnrolled = filterStudents(enrolledStudents);
  const filteredNotStarted = filterStudents(notStartedStudents);

  // Get status badge
  const getStatusBadge = (overallStatus: string) => {
    const config = OVERALL_STATUS_CONFIG[overallStatus] || OVERALL_STATUS_CONFIG.not_started;
    return (
      <Badge variant="outline" className={config.color}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  // Render student table
  const renderStudentTable = (students: StudentData[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Parent</TableHead>
          <TableHead>Forms Progress</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Comments</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length > 0 ? (
          students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.grade}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{student.parent_name}</div>
                  <div className="text-xs text-muted-foreground">{student.parent_email}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Progress value={student.progress_percentage} className="h-2 w-24" />
                    <span className="text-sm font-medium">{student.progress_percentage}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {student.required_forms_approved}/{stats?.required_forms_count || 0} required forms approved
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {student.forms_approved > 0 && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        {student.forms_approved} approved
                      </Badge>
                    )}
                    {student.forms_pending > 0 && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        {student.forms_pending} pending
                      </Badge>
                    )}
                    {student.forms_rejected > 0 && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                        {student.forms_rejected} rejected
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(student.overall_status)}</TableCell>
              <TableCell>
                {student.unresolved_comments > 0 ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {student.unresolved_comments} unresolved
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {student.updated_at || '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={route('school-admission.show', student.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View all admission forms for this student</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(route('school-admission.download-all-forms', student.id), '_blank')}
                      >
                        <BookText className="h-4 w-4 mr-1" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download all forms as PDF</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              No students found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <AppLayout>
      <Head title="Student Admission" />
      <div className="flex flex-col min-h-screen">
        <Header user={auth.user} breadcrumbs={breadcrumbs} />
        <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0 space-y-4">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="dark:bg-neutral-900">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{stats?.total_students || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-neutral-900 border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                    <p className="text-2xl font-bold">{stats?.pending_count || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-neutral-900 border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{stats?.in_progress_count || 0}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-amber-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-neutral-900 border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ready to Enroll</p>
                    <p className="text-2xl font-bold">{stats?.ready_to_enroll_count || 0}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-neutral-900 border-l-4 border-l-emerald-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Enrolled</p>
                    <p className="text-2xl font-bold">{stats?.enrolled_count || 0}</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-emerald-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Card */}
          <Card className="dark:bg-neutral-900">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Student Admissions</CardTitle>
                  <CardDescription>
                    Review and manage student admission forms. 
                    {stats?.required_forms_count > 0 && (
                      <span className="ml-1">({stats.required_forms_count} required forms per student)</span>
                    )}
                  </CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending Approval
                    {filteredPending.length > 0 && (
                      <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700">{filteredPending.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="in_progress" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    In Progress
                    {filteredInProgress.length > 0 && (
                      <Badge variant="secondary" className="ml-1">{filteredInProgress.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="ready" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Ready to Enroll
                    {filteredReadyToEnroll.length > 0 && (
                      <Badge variant="default" className="ml-1 bg-green-600">{filteredReadyToEnroll.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="enrolled" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Enrolled
                    {filteredEnrolled.length > 0 && (
                      <Badge variant="default" className="ml-1 bg-emerald-600">{filteredEnrolled.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="not_started" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Not Started
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  {renderStudentTable(filteredPending)}
                </TabsContent>
                
                <TabsContent value="in_progress">
                  {renderStudentTable(filteredInProgress)}
                </TabsContent>
                
                <TabsContent value="ready">
                  {renderStudentTable(filteredReadyToEnroll)}
                </TabsContent>
                
                <TabsContent value="enrolled">
                  {renderStudentTable(filteredEnrolled)}
                </TabsContent>

                <TabsContent value="not_started">
                  {renderStudentTable(filteredNotStarted)}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enroll Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Enroll Student
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to enroll this student? All required forms have been approved.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p><strong>Student:</strong> {selectedStudent.name}</p>
              <p><strong>Grade:</strong> {selectedStudent.grade}</p>
              <p><strong>Parent:</strong> {selectedStudent.parent_name}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleEnroll} disabled={isProcessing}>
              {isProcessing ? 'Enrolling...' : 'Confirm Enrollment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default StudentAdmissionIndex;
