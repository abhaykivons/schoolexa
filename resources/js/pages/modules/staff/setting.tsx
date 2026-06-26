import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnrollmentDocument, EnrollmentFormConfig, EnrollmentStep } from '@/types/staff-enrollment';
import DocumentsTab from '@/components/staff-enrollment/tabs/DocumentsTab';
import ConfigurationTab from '@/components/staff-enrollment/tabs/ConfigurationTab';
import ApproversTab from '@/components/staff-enrollment/tabs/ApproverTab';
import axios from 'axios';
import { toast } from 'sonner';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import { type BreadcrumbItem } from '@/types';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Onboarding Settings',
        href: '/new-applicant-staff',
    },
];
interface Approver {
  id: number | string;
  user_id: number;
  name: string;
  email: string;
  is_active: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: {
    name: string;
  }[];
}

const EnrollmentSettings = () => {
  const [documents, setDocuments] = useState<EnrollmentDocument[]>([]);
  const [config, setConfig] = useState<EnrollmentFormConfig>({});
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = usePage().props;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/get-staff-enrollment-settings');
        setDocuments(response.data.documents);
        setConfig(response.data.config);
        setApprovers(response.data.approvers || []);
        setUsers(response.data.users || []); // Add this line to store users
      } catch (error) {
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
        <AppLayout>
            <Head title="Staff Management" />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className='p-2 pt-0 mb-12 lg:mb-0 md:mb-0'>
                      <div className="max-w-4xl mx-auto">
                      <Tabs defaultValue="documents">
                        <TabsList>
                          <TabsTrigger value="documents">Documents</TabsTrigger>
                          <TabsTrigger value="approvers">Approvers</TabsTrigger>
                          <TabsTrigger value="configuration">Configuration</TabsTrigger>
                        </TabsList>

                        <TabsContent value="documents">
                          <DocumentsTab documents={documents} setDocuments={setDocuments} />
                        </TabsContent>
                        <TabsContent value="approvers">
                          <ApproversTab  moduleType="staff_enrollment" approvers={approvers} setApprovers={setApprovers} users={users}  />
                        </TabsContent>
                        <TabsContent value="configuration">
                          <ConfigurationTab config={config} setConfig={setConfig} />
                        </TabsContent>
                      </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
  );
};

export default EnrollmentSettings;