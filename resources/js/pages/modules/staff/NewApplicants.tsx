'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Eye, Download, UserCheck, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'New Applicants Staff',
        href: '/new-applicant-staff',
    },
];
interface Applicant {
    id: number;
    full_legal_name: string;
    email_address: string;
    phone_number: string;
    position_title: string;
    formatted_application_date: string;
    approval_status: number;
}

interface NewApplicantsPageProps {
    appliedStaff: Applicant[];
    tenantDomain: string;
    modules?: Record<string, boolean>;
    roles?: Array<{ id: string; name: string }>;
    departments?: Array<{ id: string; name: string }>;
}

const APPROVAL_STATUS_LABELS: Record<number, string> = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected',
};

const NewApplicantsPage: React.FC<NewApplicantsPageProps> = ({
    appliedStaff = [],
    tenantDomain = '',
    roles = [],
    departments = [],
    modules = {},
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { auth } = usePage().props;

    // Form for creating user
    const { data, setData, post, processing, errors, reset } = useForm({
        role_id: '',
        department_id: '',
        create_login: false,
        send_credentials: false,
        email: '',
        application_id: '',
    });

    const handleEnrollClick = (applicant: Applicant) => {
        setSelectedApplicant(applicant);
        reset();
        setData('application_id', applicant.id.toString());
        setIsModalOpen(true);
    };

    const handleEnrollSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const fullEmail = data.send_credentials && modules?.Email
            ? `${data.email}@${tenantDomain}`
            : data.email;

        post(route('staff.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                toast.success('Staff enrolled successfully');
            },
            onError: () => {
                toast.error('Failed to enroll staff');
            },
            data: {
                ...data,
                email: fullEmail
            }
        });
    };

    // Map applied staff to match table format with null checks
    const newApplicants = appliedStaff.map(applicant => ({
        id: applicant.id,
        name: applicant.full_legal_name || 'N/A',
        email: applicant.email_address || 'N/A',
        position: applicant.position_title || 'N/A',
        phone: applicant.phone_number || 'N/A',
        applicationDate: applicant.formatted_application_date || 'N/A',
        status: APPROVAL_STATUS_LABELS[applicant.approval_status] || 'Unknown',
        statusValue: applicant.approval_status,
    }));

    // Filter applicants based on search query and status with proper null checks
    const filterApplicants = (applicantList: any[], query: string, status: string) => {
        if (!applicantList || !Array.isArray(applicantList)) return [];

        return applicantList.filter((applicant) => {
            // Safely handle potentially undefined/null values
            const name = (applicant.name || '').toString().toLowerCase();
            const email = (applicant.email || '').toString().toLowerCase();
            const applicantStatus = applicant.status || '';

            const searchTerm = (query || '').toString().toLowerCase();

            const matchesSearch = searchTerm === '' ||
                name.includes(searchTerm) ||
                email.includes(searchTerm);

            const matchesStatus = status === 'All' ||
                applicantStatus === status ||
                (status === 'Pending' && applicant.statusValue === 0) ||
                (status === 'Under Review' && applicant.statusValue === 0) ||
                (status === 'Approved' && applicant.statusValue === 1) ||
                (status === 'Rejected' && applicant.statusValue === 2);

            return matchesSearch && matchesStatus;
        });
    };

    const filteredNewApplicants = filterApplicants(newApplicants, searchQuery, statusFilter);

    return (
        <AppLayout>
            <Head title="Staff Management" />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className='p-2 pt-0 mb-12 lg:mb-0 md:mb-0'>
                    <Card className='dark:bg-neutral-900'>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Applicant Management</CardTitle>
                                    <CardDescription>Review and manage new job applications</CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                    <Input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className=""
                                    />
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Statuses</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Under Review">Under Review</SelectItem>
                                            <SelectItem value="Approved">Approved</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" asChild>
                                        <Link href={route('staff-enrollment.create')} className="flex items-center gap-2">+ Add Staff</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Application Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredNewApplicants.length > 0 ? (
                                        filteredNewApplicants.map((applicant) => (
                                            <TableRow key={applicant.id}>
                                                <TableCell className="font-medium">{applicant.name}</TableCell>
                                                <TableCell>{applicant.position}</TableCell>
                                                <TableCell>{applicant.email}</TableCell>
                                                <TableCell>{applicant.phone}</TableCell>
                                                <TableCell>{applicant.applicationDate}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        applicant.statusValue === 1 ? 'default' : // Approved
                                                            applicant.statusValue === 0 ? 'secondary' : // Pending
                                                                'destructive' // Rejected
                                                    }>
                                                        {applicant.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {applicant.statusValue === 1 && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleEnrollClick(applicant)}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="left" sideOffset={10} className="dark:bg-stone-950 dark:text-white dark:border-gray-700">
                                                                    <p>Enroll Staff</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link href={route('staff-enrollment.show', { id: applicant.id })}>
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="left" sideOffset={10} className="dark:bg-stone-950 dark:text-white dark:border-gray-700">
                                                                <p>View Application</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="left" sideOffset={10} className="dark:bg-stone-950 dark:text-white dark:border-gray-700">
                                                                <p>Download Application</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                                                No applicants found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Enrollment Modal */}
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Enroll {selectedApplicant?.name}</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleEnrollSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="staff-role">Assign Designation to Staff</Label>
                                    <Select
                                        value={data.role_id}
                                        onValueChange={(value) => setData('role_id', value)}
                                        required
                                    >
                                        <SelectTrigger id="staff-role">
                                            <SelectValue placeholder="Select a Designation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="staff-department">Select Department</Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(value) => setData('department_id', value)}
                                        required
                                    >
                                        <SelectTrigger id="staff-department">
                                            <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((department) => (
                                                <SelectItem key={department.id} value={department.id.toString()}>
                                                    {department.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.department_id} />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="create-login"
                                        checked={data.create_login}
                                        onCheckedChange={(checked) => setData('create_login', checked as boolean)}
                                    />
                                    <Label htmlFor="create-login">Create Login for this staff member</Label>
                                </div>

                                {data.create_login && (
                                    <>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="send-credentials"
                                                checked={data.send_credentials}
                                                onCheckedChange={(checked) => setData('send_credentials', checked as boolean)}
                                            />
                                            <Label htmlFor="send-credentials">Send credentials via email</Label>
                                        </div>

                                        {data.send_credentials && (modules?.Email ? (
                                            <div className="space-y-2">
                                                <Label>Email Address:</Label>
                                                <div className="flex items-center">
                                                    <Input
                                                        type="text"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        placeholder="Username"
                                                        className="rounded-r-none"
                                                        required={data.send_credentials}
                                                    />
                                                    <div className="flex items-center px-3 h-10 border border-l-0 rounded-r-md bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                                        @{tenantDomain}
                                                    </div>
                                                </div>
                                                <InputError message={errors.email} />
                                            </div>
                                        ) : 
                                            <div className="space-y-2">
                                                <Label>Email Address:</Label>
                                                <Input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="email@example.com"
                                                    required={data.send_credentials}
                                                />
                                                <InputError message={errors.email} />
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="flex justify-end space-x-2 mt-4">
                                    <Button 
                                        variant="outline" 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                    >
                                        {processing ? 'Enrolling...' : 'Enroll Staff'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
};

export default NewApplicantsPage;