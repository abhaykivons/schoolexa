export interface StaffEnrollmentFormData {
  // Personal Information
  fullLegalName: string;
  preferredName?: string;
  phoneNumber: string;
  emailAddress: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  workAuthorized: boolean;
  dateOfBirth: string;
  maritalStatus?: string;
  dependents?: string;

  // Position Applied For
  positionTitle: string;
  subjectGradeLevel?: string;

  // Education & Qualifications
  highestDegree: string;
  majorAreaOfStudy: string;
  teachingCertifications: TeachingCertification[];
  otherRelevantCertifications?: string;
  relevantCoursework?: string;

  // Work Experience
  employmentHistory: EmploymentHistory[];
  totalYearsExperience?: string;
  administrativeExperience?: string;

  // Skills & Strengths
  relevantSkills: string[];
  areasOfExpertise?: string;
  coCurricularQualifications?: string;
  hobbiesInterests?: string;

  // Professional References
  references: Reference[];

  // Review & Accept Documents
  documentsAccepted: { [documentId: string]: boolean };

  // Background Check Consent
  backgroundCheckConsent: boolean;

  // Additional Information
  coverLetter?: string;
  resumeUpload?: File;
  teachingPortfolio?: File;
  availability: string;
  salaryExpectations?: string;
  otherInformation?: string;

  // Application Certification
  digitalSignature: string;
  signatureDate: string;
}

export interface TeachingCertification {
  id: string;
  certificationType: string;
  certificationArea: string;
  issuingState: string;
  expirationDate: string;
}

export interface EmploymentHistory {
  id: string;
  institutionName: string;
  institutionAddress: string;
  positionHeld: string;
  classesSubjectsTaught: string;
  startDate: string;
  endDate: string;
  keyResponsibilities: string;
  reasonForLeaving?: string;
}

export interface Reference {
  id: string;
  fullName: string;
  titlePosition: string;
  emailAddress: string;
  phoneNumber: string;
  relationshipToYou: string;
  durationOfRelationship: string;
}

export interface EnrollmentDocument {
  id: string;
  name: string;
  description: string;
  type: string;
  file_path: string;
  text_content: string;
  is_required: boolean;
  is_visible: boolean;
}

export interface EnrollmentFormConfig {
  id?: number;
  formTitle?: string;
  notificationEmail?: string;
  formDescription?: string;
  publicAccessEnabled?: boolean;
  school_logo?: string; 
}

export interface EnrollmentStep {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  required: boolean;
  order: number;
}