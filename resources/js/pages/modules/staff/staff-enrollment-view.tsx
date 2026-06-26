import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User, CalendarDays, MapPin, Phone, Mail,
  GraduationCap, Briefcase, Award, BookOpen,
  FileText, FileSignature, ShieldCheck, ChevronRight,
  ClipboardList, Star, Bookmark, Users,
  Paperclip,
  UserCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';

interface StaffEnrollment {
  id: number;
  full_legal_name: string;
  phone_number: string;
  email_address: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  work_authorized: boolean;
  date_of_birth: string;
  position_title: string;
  subject_grade_level: string;
  highest_degree: string;
  major_area_of_study: string;
  availability: string;
  teaching_certifications?: Array<{
    certificationType: string;
    certificationArea: string;
    issuingState: string;
    expirationDate: string;
  }>;
  other_relevant_certifications: string;
  relevant_coursework: string;
  employment_history?: Array<{
    institutionName: string;
    institutionAddress: string;
    positionHeld: string;
    classesSubjectsTaught: string;
    startDate: string;
    endDate: string;
    keyResponsibilities: string;
    reasonForLeaving: string;
  }>;
  total_years_experience: number;
  administrative_experience: string;
  relevant_skills?: Array<{ value: string }>;
  areas_of_expertise: string;
  co_curricular_qualifications: string;
  hobbies_interests: string;
  references?: Array<{
    fullName: string;
    titlePosition: string;
    emailAddress: string;
    phoneNumber: string;
    relationshipToYou: string;
    durationOfRelationship: string;
  }>;
  documents_accepted?: Record<string, boolean>;
  digital_signature: string;
  background_check_consent: boolean;
  formatted_application_date: string;
  portfolio_file_url: string;
  portfolio_file_path: string;
  resume_file_path: string;
  resume_file_url: string;
  approval_status: number;
  enrollment_documents?: Array<{
    id: number;
    name: string;
    file_path: string;
  }>;
  can_approve: boolean;
  approvers: Array<{
    id: number | string;
    user_id: number;
    name: string;
    email: string;
    is_active: boolean;
  }>;
  approval_histories: Array<{
    id: number;
    user_id: number;
    user_name: string;
    status: number;
    comments: string | null;
    created_at: string;
  }>;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'New Applicants Staff',
    href: '/new-applicant-staff',
  },
  {
    title: 'View Application',
    href: '/new-applicant-staff',
  },
];
interface StaffEnrollmentViewProps {
  enrollment: StaffEnrollment;
}

const StaffEnrollmentView: React.FC<StaffEnrollmentViewProps> = ({ enrollment }) => {

  const [comment, setComment] = React.useState('');
  const { auth } = usePage().props;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    const totalMonths = years * 12 + months;

    if (totalMonths < 12) {
      return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;
      return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
    }
  };

  const getApprovalStatus = (status: number) => {
    switch (status) {
      case 0: return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 1: return { text: 'Approved', color: 'bg-green-100 text-green-800' };
      case 2: return { text: 'Rejected', color: 'bg-red-100 text-red-800' };
      default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleApprove = async () => {
    try {
      await axios.post(`/staff-enrollment/${enrollment.id}/approve`, {
        comments: comment
      });
      window.location.reload();
    } catch (error) {
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async () => {
    try {
      await axios.post(`/staff-enrollment/${enrollment.id}/reject`, {
        comments: comment
      });
      window.location.reload();
    } catch (error) {
      toast.error('Failed to reject application');
    }
  };

  const status = getApprovalStatus(enrollment.approval_status);

  return (
    <AppLayout>
      <Head title="Staff Management" />
      <div className="flex flex-col min-h-screen">
        <Header user={auth.user} breadcrumbs={breadcrumbs} />
        <div className='p-2 pt-0 mb-12 lg:mb-0 md:mb-0'>
          <div className="p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
              {/* Header Section */}
              <div className="p-8 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{enrollment.full_legal_name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <h2 className="text-xl text-blue-600 uppercase">{enrollment.position_title}</h2>
                      <Badge className={status.color}>
                        {status.text}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Badge className={enrollment.work_authorized ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'}>
                        {enrollment.work_authorized ? 'Work Authorized' : 'Authorization Needed'}
                      </Badge>
                      {enrollment.background_check_consent && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Background Check Consent
                        </Badge>
                      )}
                      <Badge variant="outline">
                        Applied: {enrollment.formatted_application_date}
                      </Badge>
                    </div>
                  </div>

                  {enrollment.portfolio_file_url ? (
                    <div className="h-40 w-40 rounded-full overflow-hidden border-2 border-gray-200">
                      <img src={enrollment.portfolio_file_url} alt={`${enrollment.full_legal_name}'s photo`}
                        className="h-full w-full object-cover" onError={(e) => {
                          // Fallback to avatar if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <Avatar className="h-40 w-40">
                      <AvatarFallback className="text-2xl">
                        {getInitials(enrollment.full_legal_name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{enrollment.email_address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{enrollment.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <span>DOB: {formatDate(enrollment.date_of_birth)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{enrollment.street_address}, {enrollment.city}, {enrollment.state} {enrollment.zip_code}</span>
                  </div>
                </div>
              </div>

              {/* Position Information */}
              <div className="p-8 border-b">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Position Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700">Subject/Grade Level</h4>
                    <p className="mt-1 text-gray-600">{enrollment.subject_grade_level}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Availability</h4>
                    <p className="mt-1 text-gray-600">{enrollment.availability}</p>
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div className="p-8 border-b">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education Background
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700">Highest Degree</h4>
                    <p className="mt-1 text-gray-600">{enrollment.highest_degree} in {enrollment.major_area_of_study}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Relevant Coursework</h4>
                    <p className="mt-1 text-gray-600">{enrollment.relevant_coursework}</p>
                  </div>
                </div>
              </div>

              {/* Certifications Section */}
              <div className="p-8 border-b">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700">Teaching Certifications</h4>
                    {enrollment.teaching_certifications && enrollment.teaching_certifications.length > 0 ? (
                      <ul className="mt-2 space-y-3">
                        {enrollment.teaching_certifications.map((cert, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{cert.certificationArea}</p>
                              <p className="text-gray-600 text-sm">
                                {cert.certificationType} - {cert.issuingState} | Expires: {formatDate(cert.expirationDate)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mt-2">No teaching certifications provided</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Other Certifications</h4>
                    <p className="mt-1 text-gray-600">{enrollment.other_relevant_certifications}</p>
                  </div>
                </div>
              </div>

              {/* Experience Section */}
              <div className="p-8 border-b">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Professional Experience
                </h3>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Total Years Experience</h4>
                  <p className="text-gray-600">{enrollment.total_years_experience} years</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Administrative Experience</h4>
                  <p className="text-gray-600">{enrollment.administrative_experience}</p>
                </div>

                {enrollment.employment_history && enrollment.employment_history.length > 0 ? (
                  <div className="space-y-6">
                    {enrollment.employment_history.map((job, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{job.positionHeld}</h4>
                            <p className="text-gray-700">{job.institutionName}</p>
                            <p className="text-gray-500 text-sm">{job.institutionAddress}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-600">
                              {formatDate(job.startDate)} - {formatDate(job.endDate)}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {getDuration(job.startDate, job.endDate)}
                            </p>
                          </div>
                        </div>

                        {job.classesSubjectsTaught && (
                          <div className="mt-2">
                            <h5 className="font-medium text-gray-700">Subjects Taught:</h5>
                            <p className="text-gray-600">{job.classesSubjectsTaught}</p>
                          </div>
                        )}

                        {job.keyResponsibilities && (
                          <div className="mt-2">
                            <h5 className="font-medium text-gray-700">Key Responsibilities:</h5>
                            <p className="text-gray-600">{job.keyResponsibilities}</p>
                          </div>
                        )}

                        {job.reasonForLeaving && (
                          <div className="mt-2">
                            <h5 className="font-medium text-gray-700">Reason for Leaving:</h5>
                            <p className="text-gray-600">{job.reasonForLeaving}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No employment history provided</p>
                )}
              </div>

              {/* Skills Section */}
              <div className="p-8 border-b">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Skills & Qualifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700">Relevant Skills</h4>
                    {enrollment.relevant_skills && enrollment.relevant_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {enrollment.relevant_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="bg-gray-50">
                            {skill.value}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 mt-2">No skills listed</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Areas of Expertise</h4>
                    <p className="mt-1 text-gray-600">{enrollment.areas_of_expertise}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Co-Curricular Qualifications</h4>
                    <p className="mt-1 text-gray-600">{enrollment.co_curricular_qualifications}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700">Hobbies & Interests</h4>
                    <p className="mt-1 text-gray-600">{enrollment.hobbies_interests}</p>
                  </div>
                </div>
              </div>

              {/* References Section */}
              {enrollment.references && enrollment.references.length > 0 && (
                <div className="p-8 border-b">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Professional References
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {enrollment.references.map((ref, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">{ref.fullName}</h4>
                          <p className="text-gray-600">{ref.titlePosition}</p>
                          <div className="text-sm text-gray-500 mt-2">
                            <p className="font-medium">Relationship:</p>
                            <p>{ref.relationshipToYou} ({ref.durationOfRelationship})</p>
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            <p className="font-medium">Contact:</p>
                            <p>{ref.emailAddress}</p>
                            <p>{ref.phoneNumber}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents & Signature Section */}
              <div className="p-8 border-b">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Documents & Compliance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700">Submitted Documents</h4>
                    {enrollment.enrollment_documents && enrollment.enrollment_documents.length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {enrollment.enrollment_documents.map((doc, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <a href={new URL('storage/' + doc.file_path, window.location.origin).toString()} target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-muted border-input">
                                <span className="text-gray-600">{doc.name}</span>
                              </a>
                            </div>
                            {enrollment.documents_accepted?.[doc.id] ? (
                              <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                            ) : (
                              <Badge variant="outline">Pending Review</Badge>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mt-2">No documents submitted</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-start gap-2">
                      <FileSignature className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-700">Digital Signature</h4>
                        <p className="text-gray-600">{enrollment.digital_signature || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mt-4">
                      <ShieldCheck className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-700">Background Check</h4>
                        <p className="text-gray-600">
                          {enrollment.background_check_consent ? 'Consent Given' : 'No Consent'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attach Document */}
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Attach Document
                </h3>

                <div className="flex gap-4">
                  <h4 className="font-medium text-gray-700">Resume/CV</h4>
                  <p className="text-gray-600">
                    {enrollment.resume_file_url ? (
                      <a href={enrollment.resume_file_url} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 underline">
                        View Resume
                      </a>
                    ) : (
                      <span className="text-gray-400">Not uploaded</span>
                    )}
                  </p>
                </div>

              </div>

            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm mt-6 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Approval Section <span className="text-muted-foreground text-sm">(Only use for staff)</span>
              </h3>

              {/* Approvers List */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Approvers</h4>
                <div className="space-y-2">
                  {enrollment.approvers.map(approver => (
                    <div key={approver.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${approver.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>{approver.name}</span>
                        <span className="text-gray-500 text-sm">{approver.email}</span>
                      </div>
                      {enrollment.approval_histories.some(h => h.user_id == approver.user_id) ? (
                        <Badge variant="outline" className="capitalize">
                          {enrollment.approval_histories.find(h => h.user_id == approver.user_id)?.status == 'approved' ? 'Approved' :
                            'Rejected'}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval History */}
              {enrollment.approval_histories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Approval History</h4>
                  <div className="space-y-3">
                    {enrollment.approval_histories.map(history => (
                      <div key={history.id} className="p-3 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{history.user_name}</p>
                            <p className="text-sm text-gray-500">{history.created_at}</p>
                            {history.comments && (
                              <p className="mt-1 text-sm text-gray-600">Comments: {history.comments}</p>
                            )}
                          </div>
                          <Badge className={history.status == 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {history.status == 'approved' ? 'Approved' : 'Rejected'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {enrollment.can_approve && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="approval-comment" className="block text-sm font-medium text-gray-700 mb-1">
                      Comments (Optional)
                    </label>
                    <Textarea id="approval-comment" rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Add any comments about your decision..." value={comment} onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                    >
                      Reject Application
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                    >
                      Approve Application
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StaffEnrollmentView;