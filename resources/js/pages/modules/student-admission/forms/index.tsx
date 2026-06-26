import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import PreEnrollmentForm from '@/pages/modules/student-admission/forms/pre-enrollment';
import HealthSummaryForm from '@/pages/modules/student-admission/forms/health-summary';
import EnrollmentForm from '@/pages/modules/student-admission/forms/enrollment-document';
import EmergencyContactForm from '@/pages/modules/student-admission/forms/emergency-contact-information';
import DietaryAndAllergiesForm from '@/pages/modules/student-admission/forms/dietary-requirements-and-allergies';
import OnlineServicesForm from '@/pages/modules/student-admission/forms/online-services-permissions';
import TransportationServiceForm from '@/pages/modules/student-admission/forms/transportation-and-bus-services';
import ActivitiesForm from '@/pages/modules/student-admission/forms/extracurricular-activities-interest';

const AdmissionForms: React.FC = ({
}) => {

  const { auth, student, form, admissionForm, formData, grades } = usePage().props;

    const renderForm = () => {
      switch (form.id) {
        case 1:
          return <PreEnrollmentForm student={student} form={form} admissionForm={admissionForm} formData={formData} grades={grades} />;
        case 2:
          return <HealthSummaryForm student={student} form={form} admissionForm={admissionForm} formData={formData} />;
        case 3:
          return <OnlineServicesForm student={student} form={form} admissionForm={admissionForm} formData={formData} />;
        case 4:
          return <EnrollmentForm student={student} form={form} admissionForm={admissionForm} formData={formData} />;
        case 5:
          return <EmergencyContactForm student={student} form={form} admissionForm={admissionForm} formData={formData} />;
        case 6:
          return <TransportationServiceForm student={student} form={form} admissionForm={admissionForm} formData={formData} />;
        case 7:
          return <DietaryAndAllergiesForm student={student} form={form} admissionForm={admissionForm} formData={formData} />;
        case 8:
          return <ActivitiesForm student={student} form={form} admissionForm={admissionForm} formData={formData} />;
        default:
          return <div className="text-red-500 font-semibold">Form component not found</div>;
      }
    };

  return (
      <AppLayout>
          <Head title="Admission Settings" />
          <div className="flex flex-col min-h-screen">
              <Header user={auth.user} />
              <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                  {renderForm()}
              </div>
          </div>
      </AppLayout>
  );
};

export default AdmissionForms;