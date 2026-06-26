import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface StudentInfo {
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  preferredName: string;
  gradeEntering: string;
  gender: string;
  dateOfBirth: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  homeLanguageFirst: string;
  homeLanguagePrimary: string;
  ethnicity: string[];
  race: string[];
  homeAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  mailingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    isDifferent: boolean;
  };
  lastSchool: {
    name: string;
    city: string;
    state: string;
    lastDateAttended: string;
    hasHistory: boolean;
  };
  firstUSEnrollment: string;
  militaryFamily: boolean;
  militaryParentActiveDuty: boolean;
}

export interface ParentGuardian {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  preferredName: string;
  relationship: string;
  livesWithStudent: boolean;
  contactPermissions: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    isDifferent: boolean;
  };
  phones: {
    cell: string;
    home: string;
    work: string;
  };
  email: string;
  employer: string;
  workPhone: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPickupAuthorized: boolean;
}

export interface HealthInfo {
  doctor: {
    name: string;
    address: string;
  };
  lastPhysicalDate: string;
  immunizationProvided: boolean;
  lastDentalDate: string;
  lastVisionDate: string;
  visionReportProvided: boolean;
  medications: Array<{
    name: string;
    dosage: string;
    schoolAuthorized: boolean;
  }>;
  conditions: string[];
  allergies: string[];
  medicationAuthSignature: boolean;
}

export interface MedicalHistory {
  pastIllnesses: string[];
  currentIssues: {
    skin: string;
    respiratory: string;
    cardiovascular: string;
    gastrointestinal: string;
    urinary: string;
    skeletal: string;
    neuromuscular: string;
  };
  leadExposure: {
    hasExposure: boolean;
    details: string;
  };
  psychoSocialFactors: {
    bedwetting: boolean;
    moodiness: boolean;
    behavioralIssues: string;
  };
}

export interface AcademicInfo {
  ferpaUnderstanding: boolean;
  recordsReleaseAuth: boolean;
  hasIEP: boolean;
  hasTranscripts: boolean;
  standardizedTesting: string[];
  specialServices: string[];
}

export interface ResidencyInfo {
  livingSituation: string;
  isPermanent: boolean;
  mcKinneyVentoDeclaration: boolean;
  needsReferral: boolean;
}

export interface AcknowledgmentInfo {
  parentSignature: boolean;
  informationAccuracy: boolean;
  directoryInfoConsent: boolean;
  directoryInfoWithhold: string[];
  additionalConsents: {
    medical: boolean;
    survey: boolean;
    bmiReporting: boolean;
  };
}

export interface SchoolConfig {
  id: string;
  name: string;
  requiredSections: string[];
  optionalSections: string[];
  customFields: Record<string, any>;
}

export interface FormData {
  studentInfo: StudentInfo;
  parentsGuardians: ParentGuardian[];
  emergencyContacts: EmergencyContact[];
  healthInfo: HealthInfo;
  medicalHistory: MedicalHistory;
  academicInfo: AcademicInfo;
  residencyInfo: ResidencyInfo;
  acknowledgments: AcknowledgmentInfo;
}

interface AdmissionFormContextType {
  formData: FormData;
  updateFormData: (section: keyof FormData, data: any) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  schoolConfig: SchoolConfig | null;
  setSchoolConfig: (config: SchoolConfig) => void;
  isStepValid: (step: number) => boolean;
  getVisibleSteps: () => number[];
}

const defaultFormData: FormData = {
  studentInfo: {
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    preferredName: '',
    gradeEntering: '',
    gender: '',
    dateOfBirth: '',
    birthCity: '',
    birthState: '',
    birthCountry: '',
    homeLanguageFirst: '',
    homeLanguagePrimary: '',
    ethnicity: [],
    race: [],
    homeAddress: { street: '', city: '', state: '', zip: '' },
    mailingAddress: { street: '', city: '', state: '', zip: '', isDifferent: false },
    lastSchool: { name: '', city: '', state: '', lastDateAttended: '', hasHistory: false },
    firstUSEnrollment: '',
    militaryFamily: false,
    militaryParentActiveDuty: false,
  },
  parentsGuardians: [],
  emergencyContacts: [],
  healthInfo: {
    doctor: { name: '', address: '' },
    lastPhysicalDate: '',
    immunizationProvided: false,
    lastDentalDate: '',
    lastVisionDate: '',
    visionReportProvided: false,
    medications: [],
    conditions: [],
    allergies: [],
    medicationAuthSignature: false,
  },
  medicalHistory: {
    pastIllnesses: [],
    currentIssues: {
      skin: '',
      respiratory: '',
      cardiovascular: '',
      gastrointestinal: '',
      urinary: '',
      skeletal: '',
      neuromuscular: '',
    },
    leadExposure: { hasExposure: false, details: '' },
    psychoSocialFactors: {
      bedwetting: false,
      moodiness: false,
      behavioralIssues: '',
    },
  },
  academicInfo: {
    ferpaUnderstanding: false,
    recordsReleaseAuth: false,
    hasIEP: false,
    hasTranscripts: false,
    standardizedTesting: [],
    specialServices: [],
  },
  residencyInfo: {
    livingSituation: '',
    isPermanent: true,
    mcKinneyVentoDeclaration: false,
    needsReferral: false,
  },
  acknowledgments: {
    parentSignature: false,
    informationAccuracy: false,
    directoryInfoConsent: false,
    directoryInfoWithhold: [],
    additionalConsents: {
      medical: false,
      survey: false,
      bmiReporting: false,
    },
  },
};

const AdmissionFormContext = createContext<AdmissionFormContextType | undefined>(undefined);

export const AdmissionFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);

  const updateFormData = (section: keyof FormData, data: any) => {
    setFormData(prev => {
      // For arrays (parentsGuardians, emergencyContacts), replace completely
      if (Array.isArray(data)) {
        return {
          ...prev,
          [section]: data
        };
      }
      
      // For objects, merge with existing data
      return {
        ...prev,
        [section]: { ...prev[section], ...data }
      };
    });
  };

  const isStepValid = (step: number): boolean => {
    // Basic validation logic - can be expanded
    switch (step) {
      case 1:
        return !!(formData.studentInfo.firstName && formData.studentInfo.lastName);
      case 2:
        return formData.parentsGuardians.length > 0;
      case 3:
        return formData.emergencyContacts.length >= 1;
      default:
        return true;
    }
  };

  const getVisibleSteps = (): number[] => {
    const allSteps = [1, 2, 3, 4, 5, 6, 7, 8];
    
    // Hide academic records step if student has no school history
    if (!formData.studentInfo.lastSchool?.hasHistory) {
      return allSteps.filter(step => step !== 6);
    }
    
    return allSteps;
  };

  return (
    <AdmissionFormContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        setCurrentStep,
        schoolConfig,
        setSchoolConfig,
        isStepValid,
        getVisibleSteps,
      }}
    >
      {children}
    </AdmissionFormContext.Provider>
  );
};

export const useAdmissionForm = () => {
  const context = useContext(AdmissionFormContext);
  if (context === undefined) {
    throw new Error('useAdmissionForm must be used within an AdmissionFormProvider');
  }
  return context;
};