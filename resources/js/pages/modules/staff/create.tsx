import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { StaffEnrollmentForm } from '@/components/staff-enrollment/StaffEnrollmentForm';
import React, { useState, useEffect } from 'react';
import Header from '@/components/header';
import { Head, usePage } from '@inertiajs/react';

const EnrollmentPage = () => {

  const [settings, setSettings] = useState<any>(null);
  const { auth } = usePage().props;

  useEffect(() => {
    axios.get('/get-staff-enrollment-settings').then(response => {
      setSettings(response.data);
    });
  }, []);

  if (!settings) return <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>;

  return (
    <AppLayout>
        <Head title="Staff Management" />
        <div className="flex flex-col min-h-screen">
          <Header user={auth.user} />
          <div className="min-h-screen flex w-full">
            <main className="flex-1 flex flex-col">

              <div className="p-6">
                <div className="max-w-4xl mx-auto">
                  <StaffEnrollmentForm documents={settings.documents} config={settings.config}
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      </AppLayout>
  );
};

export default EnrollmentPage;