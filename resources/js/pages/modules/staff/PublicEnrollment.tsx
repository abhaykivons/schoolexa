import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { StaffEnrollmentForm } from '@/components/staff-enrollment/StaffEnrollmentForm';

const PublicEnrollment = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    axios.get('/get-staff-enrollment-settings').then(response => {
      setSettings(response.data);
    });
  }, []);

  if (!settings || !settings.config || !settings.documents || !settings.config.public_access_enabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Hiring Closed</h1>
          <p className="text-gray-600 mt-2">We are not accepting applications at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{settings.config.title}</h1>
          <p className="text-gray-600 mt-2">{settings.config.description}</p>
        </div>
        <StaffEnrollmentForm 
          documents={settings.documents}
          config={settings.config}
        />
      </div>
    </div>
  );
};

export default PublicEnrollment;