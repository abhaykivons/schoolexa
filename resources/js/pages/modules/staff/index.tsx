import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Play, UserCheck, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Staff Management',
    href: '/staff',
  },
];
interface Staff {
  id: number;
  user: {
    name: string;
    user_id: string;
    email: string;
    status: boolean;
    is_login: boolean;
  } | null;
  designation: {
    name: string;
  } | null;
  department: {
    name: string;
  } | null;
  status: number;
  status_label: string;
  formatted_enrollment_date: string;
}

interface ExistingStaffPageProps {
  enrolledStaff: Staff[];
  tenantDomain: string;
  modules?: Record<string, boolean>;
  roles?: Array<{ id: string; name: string }>;
}

const STATUS_LABELS: Record<number, string> = {
  1: 'Active',
  0: 'Inactive',
  2: 'Terminated',
  3: 'Resigned',
  4: 'Retired',
  5: 'Deceased',
  6: 'Suspended',
  7: 'On Leave',
};

const ExistingStaffPage: React.FC<ExistingStaffPageProps> = ({
  enrolledStaff = [],
  tenantDomain = '',
  roles = [],
  modules = {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { auth } = usePage().props;

  // Map enrolled staff to match table format with null checks
  const existingStaffs = enrolledStaff.map(staff => ({
    id: staff.id,
    name: staff.user?.name || 'N/A',
    user_id: staff.user?.user_id || 'N/A',
    position: staff.designation?.name || 'N/A',
    department: staff.department?.name || 'N/A',
    email: staff.user?.email || 'N/A',
    hireDate: staff.formatted_enrollment_date || 'N/A',
    status: STATUS_LABELS[staff.status] || 'Unknown',
    statusValue: staff.status,
    isActive: staff.user?.is_login || false,
  }));

  // Filter staff based on search query and status with proper null checks
  const filterStaff = (staffList: any[], query: string, status: string) => {
    if (!staffList || !Array.isArray(staffList)) return [];

    return staffList.filter((staff) => {
      // Safely handle potentially undefined/null values
      const name = (staff.name || '').toString().toLowerCase();
      const email = (staff.email || '').toString().toLowerCase();
      const staffStatus = staff.status || '';

      const searchTerm = (query || '').toString().toLowerCase();

      const matchesSearch = searchTerm === '' ||
        name.includes(searchTerm) ||
        email.includes(searchTerm);

      const matchesStatus = status === 'All' ||
        staffStatus === status ||
        (status === 'Active' && staff.statusValue === 1) ||
        (status === 'On Leave' && staff.statusValue === 7);

      return matchesSearch && matchesStatus;
    });
  };

  const filteredExistingStaffs = filterStaff(existingStaffs, searchQuery, statusFilter);

  return (

    <AppLayout>
      <Head title="Staff Management" />
      <div className="flex flex-col min-h-screen">
        <Header user={auth.user} breadcrumbs={breadcrumbs}/>
        <div className='p-2 pt-0 mb-12 lg:mb-0 md:mb-0'>
          <Card className='dark:bg-neutral-900'>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Staff Management</CardTitle>
                  <CardDescription>View and manage all existing staff members</CardDescription>
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
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* <Button variant="outline" asChild>
                    <Link href={route('staff-enrollment.create')} className="flex items-center gap-2">
                      + Add Staff
                    </Link>
                  </Button> */}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Is Login?</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExistingStaffs.length > 0 ? (
                    filteredExistingStaffs.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>{staff.user_id}</TableCell>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>{staff.position}</TableCell>
                        <TableCell>{staff.department}</TableCell>
                        <TableCell>{staff.email}</TableCell>
                        <TableCell>{staff.hireDate}</TableCell>
                        <TableCell>
                          <Badge variant={
                            staff.statusValue === 1 ? 'default' : // Active
                              staff.statusValue === 7 ? 'secondary' : // On Leave
                                staff.statusValue === 0 ? 'secondary' : // Inactive
                                  'destructive' // All other statuses
                          }>
                            {staff.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={staff.isActive ? 'default' : 'destructive'}>
                            {staff.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                        No staff members found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>

  );
};

export default ExistingStaffPage;