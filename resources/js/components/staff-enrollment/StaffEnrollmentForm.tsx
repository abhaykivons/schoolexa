import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Form } from '@/components/ui/form';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PersonalInformationStep } from './steps/PersonalInformationStep';
import { PositionStep } from './steps/PositionStep';
import { EducationStep } from './steps/EducationStep';
import { WorkExperienceStep } from './steps/WorkExperienceStep';
import { SkillsStep } from './steps/SkillsStep';
import { ReferencesStep } from './steps/ReferencesStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { BackgroundCheckStep } from './steps/BackgroundCheckStep';
import { AdditionalInfoStep } from './steps/AdditionalInfoStep';
import { CertificationStep } from './steps/CertificationStep';
import axios from 'axios';
import { toast } from 'sonner';

interface Props {
  documents: any[];
  config?: {
    form_title: string;
    form_description: string;
    school_logo: string;
    public_access_enabled: boolean;
  };
}

const enrollmentSchema = z.object({
  fullLegalName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  emailAddress: z.string().email('Valid email is required'),
  streetAddress: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  workAuthorized: z.boolean().refine(val => val === true, 'Authorized check is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine(date => { const dob = new Date(date); const age = new Date().getFullYear() - dob.getFullYear(); return age >= 18; }, 'You must be at least 18 years old'),
  positionTitle: z.string().min(1, 'Position title is required'),
  subjectGradeLevel: z.string().optional(),
  highestDegree: z.string().min(1, 'Highest degree is required'),
  majorAreaOfStudy: z.string().min(1, 'Major/area of study is required'),
  availability: z.string().min(1, 'Availability is required'),
  resumeFile: z.any().optional(),
  portfolioFile: z
  .instanceof(File)
  .refine(
    (file) => file && file.type.startsWith('image/'),
    'Portfolio must be an image file'
  ),
  teachingCertifications: z.array(z.object({
    certificationType: z.string().min(1, 'Certification type is required'),
    certificationArea: z.string().min(1, 'Certification area is required'),
    issuingState: z.string().min(1, 'Issuing state is required'),
    expirationDate: z.string().min(1, 'Expiration date is required'),
  })).optional(),
  otherRelevantCertifications: z.string().optional(),
  relevantCoursework: z.string().optional(),
  employmentHistory: z.array(z.object({
    institutionName: z.string().min(1, 'Institution name is required'),
    institutionAddress: z.string().min(1, 'Institution address is required'),
    positionHeld: z.string().min(1, 'Position held is required'),
    classesSubjectsTaught: z.string().min(1, 'Classes/subjects taught is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    keyResponsibilities: z.string().min(1, 'Key responsibilities are required'),
    reasonForLeaving: z.string().optional(),
  })).optional(),
  totalYearsExperience: z
    .string()
    .refine(val => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 48;
    }, 'Total years of experience must be a number between 0 and 48'),
  administrativeExperience: z.string().optional(),
  relevantSkills: z.array(z.object({ value: z.string() })).optional(),
  areasOfExpertise: z.string().optional(),
  coCurricularQualifications: z.string().optional(),
  hobbiesInterests: z.string().optional(),
  references: z.array(z.object({
    fullName: z.string().min(1, 'Full name is required'),
    titlePosition: z.string().min(1, 'Title/position is required'),
    emailAddress: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    relationshipToYou: z.string().min(1, 'Relationship is required'),
    durationOfRelationship: z.string().optional(),
  })).optional(),
  documentsAccepted: z.record(z.boolean()).optional(),
  digitalSignature: z.string().min(1, 'Digital signature is required'),
  backgroundCheckConsent: z.boolean().refine(val => val === true, 'Background check consent is required'),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

export const StaffEnrollmentForm: React.FC<Props> = ({ documents, config }) => {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);

  const safeConfig = config || {
    form_title: '',
    form_description: '',
    school_logo: '',
    public_access_enabled: false,
  };

  const steps: { id: number; title: string; component: React.FC<any>; fields?: (keyof EnrollmentFormData)[] }[] = [
    { id: 1, title: 'Personal Information', component: PersonalInformationStep, fields: ['fullLegalName', 'phoneNumber', 'emailAddress', 'streetAddress', 'city', 'state', 'zipCode', 'dateOfBirth', 'workAuthorized'] },
    { id: 2, title: 'Position Applied For', component: PositionStep, fields: ['positionTitle', 'availability', 'subjectGradeLevel'] },
    { id: 3, title: 'Education & Qualifications', component: EducationStep, fields: ['highestDegree', 'majorAreaOfStudy', 'teachingCertifications', 'otherRelevantCertifications', 'relevantCoursework'] },
    { id: 4, title: 'Work Experience', component: WorkExperienceStep, fields: ['employmentHistory', 'totalYearsExperience', 'administrativeExperience'] },
    { id: 5, title: 'Skills & Strengths', component: SkillsStep, fields: ['relevantSkills', 'areasOfExpertise', 'coCurricularQualifications', 'hobbiesInterests'] },
    { id: 6, title: 'Professional References', component: ReferencesStep, fields: ['references'] },
    { id: 7, title: 'Review & Accept Documents', component: (props) => <DocumentsStep {...props} documents={documents} />, fields: ['documentsAccepted'] },
    { id: 8, title: 'Background Check Consent', component: BackgroundCheckStep, fields: ['backgroundCheckConsent'] },
    { id: 9, title: 'Additional Information', component: AdditionalInfoStep, fields: [] },
    { id: 10, title: 'Application Certification', component: CertificationStep, fields: ['digitalSignature'] },
  ];

  const [currentStep, setCurrentStep] = useState(1);


  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      fullLegalName: '',
      phoneNumber: '',
      emailAddress: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      workAuthorized: false,
      dateOfBirth: '',
      positionTitle: '',
      subjectGradeLevel: '',
      highestDegree: '',
      majorAreaOfStudy: '',
      availability: '',
      teachingCertifications: [],
      otherRelevantCertifications: '',
      relevantCoursework: '',
      employmentHistory: [],
      totalYearsExperience: '',
      administrativeExperience: '',
      relevantSkills: [],
      areasOfExpertise: '',
      coCurricularQualifications: '',
      hobbiesInterests: '',
      references: [],
      documentsAccepted: {},
      digitalSignature: '',
      resumeFile: undefined,
      portfolioFile: undefined,
      backgroundCheckConsent: false,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const draft = localStorage.getItem('staffEnrollmentDraft');
    if (draft) {
      form.reset(JSON.parse(draft));
    }
  }, []);

  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep - 1]?.component;

  const handleNext = async () => {
    const fields = steps[currentStep - 1].fields;
    const isValid = await form.trigger(fields);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    const currentData = form.getValues();
    localStorage.setItem('staffEnrollmentDraft', JSON.stringify(currentData));
  };

  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      const formData = new FormData();

      // Append all fields from data object to formData
      for (const [key, value] of Object.entries(data)) {
        if ((key === 'resumeFile' || key === 'portfolioFile') && !(value instanceof File)) {
          continue; // Skip appending if not a valid file
        }

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              Object.entries(item).forEach(([subKey, subValue]) => {
                formData.append(`${key}[${index}][${subKey}]`, subValue as any);
              });
            } else {
              formData.append(`${key}[${index}]`, item);
            }
          });
        } else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            formData.append(`${key}[${subKey}]`, subValue as any);
          });
        } else {
          formData.append(key, value as any);
        }
      }

      const response = await axios.post(route('staff-enrollment.store'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Success: show modal or toast
      toast.success('Form submitted successfully!');
      setResponseData(response.data); // store if needed
      setIsSuccessModalOpen(true);

      form.reset();
      localStorage.removeItem('staffEnrollmentDraft');
    } catch (error: any) {
      console.error('Form submission error:', error);

      // Handle validation errors (422 status)
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;

        // Set form field errors for react-hook-form
        Object.entries(backendErrors).forEach(([field, messages]) => {
          form.setError(field as keyof EnrollmentFormData, {
            type: 'manual',
            message: Array.isArray(messages) ? messages[0] : messages,
          });
        });

        // Extract the first error message for the toast
        const errorMessages = Object.values(backendErrors).flat() as string[];
        const errorMessage = errorMessages[0] || 'Please check the form for errors.';

        toast.error('Submission failed', {
          description: errorMessage,
        });
      } else {
        // Handle other errors (e.g., network errors, 500 status)
        toast.error('Submission failed', {
          description: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        });
      }
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Submitted Successfully!</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-gray-700">
              Thank you for submitting your application. We will review it and get back to you shortly.
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => {
                setIsSuccessModalOpen(false);
                router.visit('/dashboard');
              }}
            >
              Return to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className='max-w-4xl mx-auto dark:bg-neutral-900'>
        <CardHeader>
          {safeConfig.school_logo && (
            <img src={new URL('storage/' + safeConfig.school_logo, window.location.origin).toString()} alt="School Logo" className="mx-auto mb-4 h-16 w-auto" />
          )}
          <CardTitle className="text-center">{safeConfig.form_title}</CardTitle>
          <span className='text-center text-sm text-gray-600 mb-3'>{safeConfig.form_description}</span>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{steps[currentStep - 1]?.title}</h2>
              </div>

              {CurrentStepComponent && (
                <CurrentStepComponent form={form} />
              )}

              <div className="flex justify-between pt-6 border-t">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Draft
                  </Button>
                </div>

                <div>
                  {currentStep < steps.length ? (
                    <Button type="button" onClick={handleNext}>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button type="submit">
                      Submit Application
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};