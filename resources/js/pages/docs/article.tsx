import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  ChevronRight,
  GraduationCap,
  Users,
  Bell,
  Home,
  Zap,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '@/components/main-pages/PageHeader';

interface PageProps {
  section: string;
  article: string;
}

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  articles: { id: string; title: string }[];
}

const sections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-amber-600 bg-amber-100',
    articles: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'quick-start', title: 'Quick Start Guide' },
    ],
  },
  {
    id: 'student-management',
    title: 'Student Management',
    icon: <GraduationCap className="w-4 h-4" />,
    color: 'text-blue-600 bg-blue-100',
    articles: [
      { id: 'student-admission', title: 'Student Admission' },
      { id: 'enrollment-management', title: 'Managing Enrollments' },
    ],
  },
  {
    id: 'staff-management',
    title: 'Staff Management',
    icon: <Users className="w-4 h-4" />,
    color: 'text-violet-600 bg-violet-100',
    articles: [
      { id: 'staff-onboarding', title: 'Staff Onboarding' },
      { id: 'roles-permissions', title: 'Roles & Permissions' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <Bell className="w-4 h-4" />,
    color: 'text-rose-600 bg-rose-100',
    articles: [
      { id: 'email-templates', title: 'Email Templates' },
      { id: 'notification-flows', title: 'Notification Flows' },
    ],
  },
  {
    id: 'parent-portal',
    title: 'Parent Portal',
    icon: <Home className="w-4 h-4" />,
    color: 'text-sky-600 bg-sky-100',
    articles: [
      { id: 'parent-registration', title: 'Parent Registration' },
      { id: 'submitting-forms', title: 'Submitting Forms' },
    ],
  },
];

const articleContent: Record<string, {
  title: string;
  toc: { id: string; title: string }[];
  content: React.ReactNode;
}> = {
  'getting-started/introduction': {
    title: 'Introduction',
    toc: [
      { id: 'meet-schoolexa', title: 'Meet SchoolExa' },
      { id: 'why-schoolexa', title: 'Why SchoolExa?' },
      { id: 'core-features', title: 'Core Features' },
      { id: 'getting-help', title: 'Getting Help' },
    ],
    content: (
      <>
        <section id="meet-schoolexa">
          <h2>Meet SchoolExa</h2>
          <p>
            SchoolExa is a comprehensive school management system designed to simplify 
            and streamline educational administration. Built with modern technology, 
            it provides an intuitive interface for managing students, staff, academics, 
            and communications all in one place.
          </p>
          <p>
            Whether you're a small school or a large institution, SchoolExa scales with 
            your needs while maintaining simplicity and ease of use.
          </p>
        </section>

        <section id="why-schoolexa">
          <h2>Why SchoolExa?</h2>
          <p>
            There are various school management solutions available. However, we believe 
            SchoolExa offers the best combination of features, usability, and value.
          </p>
          
          <h3>User-Friendly Interface</h3>
          <p>
            SchoolExa features a clean, intuitive interface that requires minimal training. 
            Staff members can quickly learn the system and become productive within hours, 
            not weeks.
          </p>

          <h3>Comprehensive Solution</h3>
          <p>
            From student admissions to staff management, from academic setup to parent 
            communications - SchoolExa handles it all. No need for multiple disconnected 
            systems.
          </p>

          <h3>Secure & Reliable</h3>
          <p>
            Built with security in mind, SchoolExa protects sensitive student and staff 
            data with encryption and access controls. Regular backups ensure your data 
            is always safe.
          </p>
        </section>

        <section id="core-features">
          <h2>Core Features</h2>
          <ul>
            <li><strong>Student Management:</strong> Complete admission and enrollment workflows</li>
            <li><strong>Staff Management:</strong> Staff profiles, assignments, and role management</li>
            <li><strong>Academic Setup:</strong> Configure academic years, grades, classes, and subjects</li>
            <li><strong>Parent Portal:</strong> Dedicated portal for parents to track their child's progress</li>
            <li><strong>Notifications:</strong> Automated email notifications for important events</li>
            <li><strong>Multi-tenant:</strong> Support for multiple schools within one installation</li>
          </ul>
        </section>

        <section id="getting-help">
          <h2>Getting Help</h2>
          <p>
            If you encounter any issues or have questions while using SchoolExa, there 
            are several resources available:
          </p>
          <ul>
            <li><strong>This Documentation:</strong> Browse through our comprehensive guides</li>
            <li><strong>Email Support:</strong> Contact our support team for assistance</li>
            <li><strong>Training Sessions:</strong> Request a training session for your team</li>
          </ul>
        </section>
      </>
    ),
  },
  'getting-started/quick-start': {
    title: 'Quick Start Guide',
    toc: [
      { id: 'overview', title: 'Overview' },
      { id: 'step-1', title: 'Step 1: Login & Profile Setup' },
      { id: 'step-2', title: 'Step 2: Academic Years' },
      { id: 'step-3', title: 'Step 3: Grades & Classes' },
      { id: 'step-4', title: 'Step 4: Subjects' },
      { id: 'step-5', title: 'Step 5: Users & Departments' },
      { id: 'step-6', title: 'Step 6: Class Assignments' },
      { id: 'step-7', title: 'Step 7: Approval Flows' },
      { id: 'step-8', title: 'Step 8: Appearance' },
      { id: 'next-steps', title: 'Next Steps' },
    ],
    content: (
      <>
        <section id="overview">
          <h2>Overview</h2>
          <p>
            This comprehensive guide will walk you through setting up your school in SchoolExa. 
            By following these steps, you'll configure all essential settings and have a fully 
            functional school management system ready to use.
          </p>
          <div className="note note-info">
            <strong>Note:</strong> You'll need administrator access to complete these steps. 
            All settings are found under <strong>Settings</strong> in the main navigation.
          </div>
        </section>

        <section id="step-1">
          <h2>Step 1: Login & Profile Setup</h2>
          <p>First, log in and set up your profile:</p>
          <ol>
            <li>Open your web browser and go to your SchoolExa URL</li>
            <li>Enter your email address and password</li>
            <li>Click the <strong>Login</strong> button</li>
          </ol>
          <h3>Update Your Profile</h3>
          <ol>
            <li>Go to <strong>Settings → Profile</strong></li>
            <li>Update your name, email, and phone number</li>
            <li>Upload a profile photo (optional)</li>
            <li>Click <strong>Save Changes</strong></li>
          </ol>
          <h3>Change Your Password</h3>
          <ol>
            <li>Go to <strong>Settings → Password</strong></li>
            <li>Enter your current password</li>
            <li>Enter and confirm your new password</li>
            <li>Click <strong>Update Password</strong></li>
          </ol>
          <div className="note note-tip">
            <strong>Security Tip:</strong> Use a strong password with at least 8 characters, 
            including uppercase, lowercase, and numbers.
          </div>
        </section>

        <section id="step-2">
          <h2>Step 2: Academic Years</h2>
          <p>Set up your academic calendar periods:</p>
          <ol>
            <li>Go to <strong>Settings → Academic Years</strong></li>
            <li>Click <strong>Add Academic Year</strong></li>
            <li>Enter the year name (e.g., "2024-2025")</li>
            <li>Set the start and end dates</li>
            <li>Click <strong>Save</strong></li>
            <li>Click <strong>Set as Current</strong> to make it active</li>
          </ol>
          <div className="note note-warning">
            <strong>Important:</strong> Only one academic year can be "current" at a time. 
            All new enrollments will use the current year by default.
          </div>
        </section>

        <section id="step-3">
          <h2>Step 3: Grades & Classes</h2>
          <h3>Creating Grades</h3>
          <p>Grades represent academic levels (e.g., Kindergarten, Grade 1, Grade 2):</p>
          <ol>
            <li>Go to <strong>Settings → Grades</strong></li>
            <li>Click <strong>Add Grade</strong></li>
            <li>Enter the grade name</li>
            <li>Click <strong>Save</strong></li>
            <li>Drag and drop to reorder grades from lowest to highest</li>
          </ol>
          <h3>Creating Classes</h3>
          <p>Classes are sections within grades (e.g., Grade 1-A, Grade 1-B):</p>
          <ol>
            <li>Go to <strong>Settings → Classes</strong></li>
            <li>Click <strong>Add Class</strong></li>
            <li>Select the <strong>Grade</strong></li>
            <li>Enter the <strong>Section Name</strong> (e.g., "A", "B", "Blue")</li>
            <li>Set the <strong>Capacity</strong> (optional)</li>
            <li>Assign a <strong>Class Teacher</strong> (optional)</li>
            <li>Click <strong>Save</strong></li>
          </ol>
        </section>

        <section id="step-4">
          <h2>Step 4: Subjects</h2>
          <p>Define the subjects taught at your school:</p>
          <ol>
            <li>Go to <strong>Settings → Subjects</strong></li>
            <li>Click <strong>Add Subject</strong></li>
            <li>Enter the <strong>Subject Name</strong> (e.g., "Mathematics")</li>
            <li>Enter a <strong>Subject Code</strong> (e.g., "MATH")</li>
            <li>Add a description (optional)</li>
            <li>Click <strong>Save</strong></li>
          </ol>
          <p>Repeat for all subjects: English, Science, Social Studies, Art, Music, PE, etc.</p>
        </section>

        <section id="step-5">
          <h2>Step 5: Users & Departments</h2>
          <h3>Setting Up Departments</h3>
          <p>Organize staff into departments:</p>
          <ol>
            <li>Go to <strong>Settings → Departments</strong></li>
            <li>Click <strong>Add Department</strong></li>
            <li>Enter department name (e.g., "Science Department", "Administration")</li>
            <li>Click <strong>Save</strong></li>
          </ol>
          <h3>Setting Up Designations</h3>
          <p>Define job titles for staff:</p>
          <ol>
            <li>Go to <strong>Settings → Designations</strong></li>
            <li>Click <strong>Add Designation</strong></li>
            <li>Enter designation title (e.g., "Principal", "Teacher", "Accountant")</li>
            <li>Click <strong>Save</strong></li>
          </ol>
          <h3>Managing Users</h3>
          <p>View and manage all system users:</p>
          <ol>
            <li>Go to <strong>Settings → Users</strong></li>
            <li>View all users with their roles and status</li>
            <li>Click <strong>Edit</strong> to update user details</li>
            <li>Toggle the status to activate or deactivate users</li>
          </ol>
          <div className="note note-danger">
            <strong>Warning:</strong> Deactivating a user immediately prevents them from 
            accessing the system.
          </div>
        </section>

        <section id="step-6">
          <h2>Step 6: Class Assignments</h2>
          <p>Connect teachers to classes and subjects they teach:</p>
          <ol>
            <li>Go to <strong>Settings → Class Assignments</strong></li>
            <li>Click <strong>Add Assignment</strong></li>
            <li>Select the <strong>Class</strong></li>
            <li>Select the <strong>Subject</strong></li>
            <li>Select the <strong>Teacher</strong></li>
            <li>Click <strong>Save</strong></li>
          </ol>
          <div className="note note-tip">
            <strong>Tip:</strong> Use <strong>Bulk Assign</strong> to quickly assign a teacher 
            to multiple classes and subjects at once.
          </div>
        </section>

        <section id="step-7">
          <h2>Step 7: Approval Flows</h2>
          <p>Configure multi-step approval processes for admissions:</p>
          <ol>
            <li>Go to <strong>Settings → Approval Flows</strong></li>
            <li>Click <strong>Create Flow</strong></li>
            <li>Enter a name (e.g., "Student Admission Approval")</li>
            <li>Select the flow type (Admission, Leave, etc.)</li>
            <li>Add approval stages:
              <ul>
                <li>Stage 1: Class Teacher Review</li>
                <li>Stage 2: Head of Department</li>
                <li>Stage 3: Principal Approval</li>
              </ul>
            </li>
            <li>Assign approvers to each stage</li>
            <li>Click <strong>Save</strong></li>
            <li>Toggle <strong>Active</strong> to enable the flow</li>
          </ol>
        </section>

        <section id="step-8">
          <h2>Step 8: Appearance</h2>
          <p>Customize the look of your SchoolExa interface:</p>
          <ol>
            <li>Go to <strong>Settings → Appearance</strong></li>
            <li>Choose your preferred theme:
              <ul>
                <li><strong>Light:</strong> Clean white background (best for well-lit environments)</li>
                <li><strong>Dark:</strong> Dark background (reduces eye strain in low light)</li>
                <li><strong>System:</strong> Automatically matches your device setting</li>
              </ul>
            </li>
            <li>Theme changes are applied immediately and saved automatically</li>
          </ol>
        </section>

        <section id="next-steps">
          <h2>Next Steps</h2>
          <p>
            Congratulations! Your school is now fully configured. Here's what to do next:
          </p>
          <ul>
            <li><Link href="/docs/staff-management/staff-onboarding" className="text-green-600 hover:underline">Onboard your staff members</Link></li>
            <li><Link href="/docs/student-management/student-admission" className="text-green-600 hover:underline">Set up student admissions</Link></li>
            <li><Link href="/docs/notifications/email-templates" className="text-green-600 hover:underline">Configure email notifications</Link></li>
            <li><Link href="/docs/parent-portal/parent-registration" className="text-green-600 hover:underline">Set up the parent portal</Link></li>
          </ul>
          <div className="note note-info">
            <strong>Need Help?</strong> Contact our support team for personalized assistance 
            or request a training session for your staff.
          </div>
        </section>
      </>
    ),
  },
  'student-management/student-admission': {
    title: 'Student Admission',
    toc: [
      { id: 'overview', title: 'Overview' },
      { id: 'admission-workflow', title: 'Admission Workflow' },
      { id: 'creating-form', title: 'Creating Admission Forms' },
      { id: 'form-fields', title: 'Configuring Form Fields' },
      { id: 'approval-flow', title: 'Setting Up Approval Flow' },
      { id: 'processing', title: 'Processing Applications' },
    ],
    content: (
      <>
        <section id="overview">
          <h2>Overview</h2>
          <p>
            The student admission module allows you to create custom admission forms, 
            collect applications from parents, and process admissions through a 
            configurable approval workflow.
          </p>
        </section>

        <section id="admission-workflow">
          <h2>Admission Workflow</h2>
          <p>The typical admission process in SchoolExa follows these steps:</p>
          <ol>
            <li><strong>Form Creation:</strong> Administrator creates an admission form with required fields</li>
            <li><strong>Form Publication:</strong> The form is made available to parents</li>
            <li><strong>Application Submission:</strong> Parents fill out and submit the form</li>
            <li><strong>Document Verification:</strong> Staff verifies submitted documents</li>
            <li><strong>Approval Process:</strong> Application moves through the approval workflow</li>
            <li><strong>Enrollment:</strong> Approved students are enrolled in their class</li>
          </ol>
        </section>

        <section id="creating-form">
          <h2>Creating Admission Forms</h2>
          <p>To create a new admission form:</p>
          <ol>
            <li>Navigate to <strong>Admissions → Forms</strong></li>
            <li>Click <strong>Create New Form</strong></li>
            <li>Enter the form name and description</li>
            <li>Select the academic year and applicable grades</li>
            <li>Set application deadlines</li>
            <li>Configure required documents</li>
          </ol>
        </section>

        <section id="form-fields">
          <h2>Configuring Form Fields</h2>
          <p>SchoolExa admission forms support various field types:</p>
          <ul>
            <li><strong>Text Fields:</strong> For names, addresses, and other text input</li>
            <li><strong>Date Fields:</strong> For birth dates, joining dates, etc.</li>
            <li><strong>Dropdown:</strong> For selecting from predefined options</li>
            <li><strong>File Upload:</strong> For documents and photos</li>
            <li><strong>Guardian Section:</strong> Dedicated fields for parent/guardian information</li>
          </ul>
          <p>
            Each field can be marked as required or optional, and you can set validation 
            rules to ensure data quality.
          </p>
        </section>

        <section id="approval-flow">
          <h2>Setting Up Approval Flow</h2>
          <p>
            Configure who needs to approve admission applications and in what order:
          </p>
          <ol>
            <li>Go to <strong>Settings → Approval Flows</strong></li>
            <li>Create a new flow for "Student Admission"</li>
            <li>Add approval stages (e.g., Class Teacher → Head of Department → Principal)</li>
            <li>Assign users or roles to each stage</li>
            <li>Save the flow</li>
          </ol>
        </section>

        <section id="processing">
          <h2>Processing Applications</h2>
          <p>When applications come in, staff can review and process them:</p>
          <ol>
            <li>Go to <strong>Admissions → Applications</strong></li>
            <li>Click on an application to view details</li>
            <li>Review submitted information and documents</li>
            <li>Add comments if needed</li>
            <li>Click <strong>Approve</strong> or <strong>Reject</strong></li>
          </ol>
          <div className="note note-warning">
            <strong>Important:</strong> Rejected applications should include a reason 
            so parents understand what needs to be corrected.
          </div>
        </section>
      </>
    ),
  },
  'student-management/enrollment-management': {
    title: 'Managing Enrollments',
    toc: [
      { id: 'overview', title: 'Overview' },
      { id: 'viewing-enrollments', title: 'Viewing Enrollments' },
      { id: 'class-assignment', title: 'Class Assignment' },
      { id: 'transfers', title: 'Student Transfers' },
      { id: 'status-updates', title: 'Status Updates' },
    ],
    content: (
      <>
        <section id="overview">
          <h2>Overview</h2>
          <p>
            Once students are admitted, they need to be enrolled in specific classes. 
            The enrollment management system helps you track student placements and 
            manage transfers throughout the academic year.
          </p>
        </section>

        <section id="viewing-enrollments">
          <h2>Viewing Enrollments</h2>
          <p>To view all current enrollments:</p>
          <ol>
            <li>Go to <strong>Students → Enrollments</strong></li>
            <li>Use filters to narrow down by grade, class, or status</li>
            <li>Click on a student to view their full enrollment history</li>
          </ol>
        </section>

        <section id="class-assignment">
          <h2>Class Assignment</h2>
          <p>Assign a student to a class:</p>
          <ol>
            <li>Select the student from the enrollment list</li>
            <li>Click <strong>Change Class</strong></li>
            <li>Select the new class and section</li>
            <li>Set the effective date</li>
            <li>Add a reason for the change (optional)</li>
            <li>Save the assignment</li>
          </ol>
        </section>

        <section id="transfers">
          <h2>Student Transfers</h2>
          <p>
            When a student needs to transfer to a different section or grade:
          </p>
          <ol>
            <li>Open the student's profile</li>
            <li>Go to the <strong>Enrollment</strong> tab</li>
            <li>Click <strong>Transfer Student</strong></li>
            <li>Select the destination class</li>
            <li>Provide a transfer reason</li>
            <li>Submit for approval (if required)</li>
          </ol>
        </section>

        <section id="status-updates">
          <h2>Status Updates</h2>
          <p>Student enrollment statuses include:</p>
          <ul>
            <li><strong>Active:</strong> Currently enrolled and attending</li>
            <li><strong>Inactive:</strong> Temporarily not attending</li>
            <li><strong>Transferred:</strong> Moved to another school</li>
            <li><strong>Graduated:</strong> Completed their program</li>
            <li><strong>Withdrawn:</strong> Left the school</li>
          </ul>
        </section>
      </>
    ),
  },
  'staff-management/staff-onboarding': {
    title: 'Staff Onboarding',
    toc: [
      { id: 'overview', title: 'Overview' },
      { id: 'adding-staff', title: 'Adding Staff Members' },
      { id: 'required-info', title: 'Required Information' },
      { id: 'account-setup', title: 'Account Setup' },
      { id: 'assignments', title: 'Staff Assignments' },
    ],
    content: (
      <>
        <section id="overview">
          <h2>Overview</h2>
          <p>
            Staff onboarding in SchoolExa covers the entire process of adding new 
            teachers and administrative staff, setting up their accounts, and 
            assigning them to appropriate roles and classes.
          </p>
        </section>

        <section id="adding-staff">
          <h2>Adding Staff Members</h2>
          <p>To add a new staff member:</p>
          <ol>
            <li>Navigate to <strong>Staff → Add Staff</strong></li>
            <li>Select the staff type (Teaching/Non-Teaching)</li>
            <li>Fill in personal details</li>
            <li>Add employment information</li>
            <li>Upload required documents</li>
            <li>Click <strong>Save</strong></li>
          </ol>
        </section>

        <section id="required-info">
          <h2>Required Information</h2>
          <p>The following information is typically required for staff registration:</p>
          <ul>
            <li>Full name and contact details</li>
            <li>Date of birth and gender</li>
            <li>Qualifications and certifications</li>
            <li>Employment start date</li>
            <li>Department and designation</li>
            <li>Emergency contact information</li>
          </ul>
        </section>

        <section id="account-setup">
          <h2>Account Setup</h2>
          <p>
            When you save a new staff member, the system can automatically create a 
            user account:
          </p>
          <ol>
            <li>Check the "Create user account" option</li>
            <li>The system generates login credentials</li>
            <li>An email is sent to the staff member with their login details</li>
            <li>On first login, they'll be prompted to change their password</li>
          </ol>
        </section>

        <section id="assignments">
          <h2>Staff Assignments</h2>
          <p>After creating a staff profile, assign them to their responsibilities:</p>
          <ul>
            <li><strong>Class Teacher:</strong> Assign as homeroom teacher for a class</li>
            <li><strong>Subject Teacher:</strong> Assign subjects and classes they teach</li>
            <li><strong>Department Head:</strong> Assign leadership of a department</li>
          </ul>
        </section>
      </>
    ),
  },
  'staff-management/roles-permissions': {
    title: 'Roles & Permissions',
    toc: [
      { id: 'overview', title: 'Overview' },
      { id: 'default-roles', title: 'Default Roles' },
      { id: 'custom-roles', title: 'Creating Custom Roles' },
      { id: 'permission-types', title: 'Permission Types' },
      { id: 'assigning-roles', title: 'Assigning Roles' },
    ],
    content: (
      <>
        <section id="overview">
          <h2>Overview</h2>
          <p>
            SchoolExa uses a role-based access control (RBAC) system. Each user is 
            assigned one or more roles, and each role has specific permissions that 
            determine what the user can see and do in the system.
          </p>
        </section>

        <section id="default-roles">
          <h2>Default Roles</h2>
          <p>SchoolExa comes with predefined roles:</p>
          <ul>
            <li><strong>Super Admin:</strong> Full access to all features and settings</li>
            <li><strong>Admin:</strong> Manage users, settings, and most operations</li>
            <li><strong>Principal:</strong> School-wide view and approval permissions</li>
            <li><strong>Teacher:</strong> Access to classes and students they teach</li>
            <li><strong>Staff:</strong> Basic access for non-teaching staff</li>
            <li><strong>Parent:</strong> Access to their child's information only</li>
          </ul>
        </section>

        <section id="custom-roles">
          <h2>Creating Custom Roles</h2>
          <p>To create a custom role:</p>
          <ol>
            <li>Go to <strong>Settings → Roles</strong></li>
            <li>Click <strong>Create Role</strong></li>
            <li>Enter the role name and description</li>
            <li>Select the permissions for this role</li>
            <li>Save the role</li>
          </ol>
        </section>

        <section id="permission-types">
          <h2>Permission Types</h2>
          <p>Permissions are organized by module:</p>
          <ul>
            <li><strong>View:</strong> Can see the data</li>
            <li><strong>Create:</strong> Can add new records</li>
            <li><strong>Edit:</strong> Can modify existing records</li>
            <li><strong>Delete:</strong> Can remove records</li>
            <li><strong>Approve:</strong> Can approve workflows</li>
            <li><strong>Export:</strong> Can download data</li>
          </ul>
        </section>

        <section id="assigning-roles">
          <h2>Assigning Roles</h2>
          <p>Assign roles to users:</p>
          <ol>
            <li>Go to the user's profile</li>
            <li>Click <strong>Edit Roles</strong></li>
            <li>Select the appropriate roles</li>
            <li>Save changes</li>
          </ol>
          <div className="note note-danger">
            <strong>Warning:</strong> Be careful when assigning Admin or Super Admin 
            roles. These provide extensive system access.
          </div>
        </section>
      </>
    ),
  },
  'notifications/email-templates': {
    title: 'Email Templates',
    toc: [
      { id: 'overview', title: 'Overview' },
      { id: 'default-templates', title: 'Default Templates' },
      { id: 'customizing', title: 'Customizing Templates' },
      { id: 'variables', title: 'Template Variables' },
    ],
    content: (
      <>
        <section id="overview">
          <h2>Overview</h2>
          <p>
            Email templates in SchoolExa allow you to customize the content of 
            automated emails sent by the system. This ensures all communications 
            match your school's branding and tone.
          </p>
        </section>

        <section id="default-templates">
          <h2>Default Templates</h2>
          <p>SchoolExa includes templates for common communications:</p>
          <ul>
            <li>Welcome emails for new users</li>
            <li>Password reset emails</li>
            <li>Admission application confirmations</li>
            <li>Enrollment notifications</li>
            <li>Approval request notifications</li>
          </ul>
        </section>

        <section id="customizing">
          <h2>Customizing Templates</h2>
          <p>To customize an email template:</p>
          <ol>
            <li>Go to <strong>Settings → Email Templates</strong></li>
            <li>Click on the template you want to edit</li>
            <li>Modify the subject line and body content</li>
            <li>Preview your changes</li>
            <li>Save the template</li>
          </ol>
        </section>

        <section id="variables">
          <h2>Template Variables</h2>
          <p>
            Use variables to personalize emails. Common variables include:
          </p>
          <ul>
            <li><code>{'{{name}}'}</code> - Recipient's name</li>
            <li><code>{'{{school_name}}'}</code> - Your school's name</li>
            <li><code>{'{{student_name}}'}</code> - Student's name</li>
            <li><code>{'{{class_name}}'}</code> - Class name</li>
            <li><code>{'{{date}}'}</code> - Current date</li>
          </ul>
          <p>
            Variables are automatically replaced with actual values when the email is sent.
          </p>
        </section>
      </>
    ),
  },
  'notifications/notification-flows': {
    title: 'Notification Flows',
    toc: [
      { id: 'overview', title: 'Overview' },
      { id: 'flow-types', title: 'Flow Types' },
      { id: 'configuring', title: 'Configuring Flows' },
      { id: 'triggers', title: 'Notification Triggers' },
    ],
    content: (
      <>
        <section id="overview">
          <h2>Overview</h2>
          <p>
            Notification flows define when and to whom notifications are sent. 
            Configure these flows to ensure the right people are informed at the 
            right time.
          </p>
        </section>

        <section id="flow-types">
          <h2>Flow Types</h2>
          <p>SchoolExa supports different notification flow types:</p>
          <ul>
            <li><strong>Email:</strong> Sends an email notification</li>
            <li><strong>In-App:</strong> Shows a notification in the user's dashboard</li>
            <li><strong>Both:</strong> Sends both email and in-app notifications</li>
          </ul>
        </section>

        <section id="configuring">
          <h2>Configuring Flows</h2>
          <p>To set up a notification flow:</p>
          <ol>
            <li>Go to <strong>Settings → Notification Flows</strong></li>
            <li>Click <strong>Create Flow</strong></li>
            <li>Select the event type that triggers this notification</li>
            <li>Choose the notification method (email, in-app, or both)</li>
            <li>Define the recipients (specific users, roles, or dynamic)</li>
            <li>Select the email template (if applicable)</li>
            <li>Save the flow</li>
          </ol>
        </section>

        <section id="triggers">
          <h2>Notification Triggers</h2>
          <p>Notifications can be triggered by various events:</p>
          <ul>
            <li>New admission application submitted</li>
            <li>Application status changed</li>
            <li>Student enrolled in class</li>
            <li>Approval requested</li>
            <li>Approval granted or rejected</li>
            <li>New staff member added</li>
          </ul>
        </section>
      </>
    ),
  },
  'parent-portal/parent-registration': {
    title: 'Parent Registration',
    toc: [
      { id: 'overview', title: 'Overview' },
      { id: 'registration-process', title: 'Registration Process' },
      { id: 'linking-students', title: 'Linking to Students' },
      { id: 'account-management', title: 'Account Management' },
    ],
    content: (
      <>
        <section id="overview">
          <h2>Overview</h2>
          <p>
            The parent portal provides parents with access to their child's 
            information, admission forms, and school communications. Parents 
            must register to access the portal.
          </p>
        </section>

        <section id="registration-process">
          <h2>Registration Process</h2>
          <p>Parents can register through the public portal:</p>
          <ol>
            <li>Click on <strong>Parent Registration</strong> on the login page</li>
            <li>Fill in personal details (name, email, phone)</li>
            <li>Create a password</li>
            <li>Verify their email address</li>
            <li>Complete the registration</li>
          </ol>
          <p>
            Once registered, parents can log in and start using the portal.
          </p>
        </section>

        <section id="linking-students">
          <h2>Linking to Students</h2>
          <p>
            Parents need to be linked to their children to see their information:
          </p>
          <ul>
            <li><strong>During Admission:</strong> The link is created automatically when parents submit an admission form</li>
            <li><strong>Manual Linking:</strong> Staff can manually link a parent to a student from the student's profile</li>
            <li><strong>Request Link:</strong> Parents can request to be linked to an existing student</li>
          </ul>
        </section>

        <section id="account-management">
          <h2>Account Management</h2>
          <p>Parents can manage their accounts:</p>
          <ul>
            <li>Update personal information</li>
            <li>Change password</li>
            <li>Manage notification preferences</li>
            <li>View linked students</li>
          </ul>
        </section>
      </>
    ),
  },
  'parent-portal/submitting-forms': {
    title: 'Submitting Forms',
    toc: [
      { id: 'overview', title: 'Overview' },
      { id: 'finding-forms', title: 'Finding Available Forms' },
      { id: 'filling-form', title: 'Filling Out the Form' },
      { id: 'uploading-documents', title: 'Uploading Documents' },
      { id: 'tracking-status', title: 'Tracking Status' },
    ],
    content: (
      <>
        <section id="overview">
          <h2>Overview</h2>
          <p>
            Parents can submit admission and other forms through the parent portal. 
            This guide explains how to find, fill out, and submit forms.
          </p>
        </section>

        <section id="finding-forms">
          <h2>Finding Available Forms</h2>
          <p>To see available forms:</p>
          <ol>
            <li>Log in to the parent portal</li>
            <li>Go to <strong>Forms</strong> from the navigation</li>
            <li>Browse the list of available admission forms</li>
            <li>Click on a form to view details and requirements</li>
          </ol>
        </section>

        <section id="filling-form">
          <h2>Filling Out the Form</h2>
          <p>When completing a form:</p>
          <ol>
            <li>Click <strong>Start Application</strong></li>
            <li>Fill in all required fields (marked with *)</li>
            <li>Use the <strong>Save Draft</strong> button to save your progress</li>
            <li>You can return later to continue from where you left off</li>
            <li>Review all information before final submission</li>
          </ol>
          <div className="note note-tip">
            <strong>Tip:</strong> Keep all required documents ready before starting. 
            This makes the process smoother.
          </div>
        </section>

        <section id="uploading-documents">
          <h2>Uploading Documents</h2>
          <p>Most forms require supporting documents:</p>
          <ul>
            <li>Click the upload button next to each document field</li>
            <li>Select the file from your device</li>
            <li>Accepted formats: PDF, JPG, PNG</li>
            <li>Maximum file size is usually 5MB per document</li>
            <li>Ensure documents are clear and readable</li>
          </ul>
        </section>

        <section id="tracking-status">
          <h2>Tracking Status</h2>
          <p>After submission, track your application:</p>
          <ol>
            <li>Go to <strong>My Applications</strong></li>
            <li>View the status of each submitted form</li>
            <li>Statuses include: Submitted, Under Review, Approved, Rejected</li>
            <li>You'll receive email notifications for status changes</li>
          </ol>
        </section>
      </>
    ),
  },
};

export default function DocsArticle() {
  const { section, article } = usePage<{ props: PageProps }>().props as unknown as PageProps;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [freeTrialOpen, setFreeTrialOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const freeTrialForm = useForm({
    name: '',
    email: '',
    school_name: '',
  });

  const handleFreeTrialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    freeTrialForm.post('/leads/free-trial', {
      onSuccess: () => {
        setFreeTrialOpen(false);
        setSuccessMessage('Your free trial is being set up! Check your email for login details.');
        freeTrialForm.reset();
        setTimeout(() => setSuccessMessage(null), 5000);
      },
    });
  };

  const currentSection = sections.find((s) => s.id === section);
  const currentArticle = currentSection?.articles.find((a) => a.id === article);
  const content = articleContent[`${section}/${article}`];

  if (!content || !currentSection || !currentArticle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Article Not Found</h1>
          <p className="text-slate-600 mb-4">The requested documentation page doesn't exist.</p>
          <Link href="/docs" className="text-green-600 hover:underline">
            ← Back to Documentation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Head title={`${content.title} - SchoolExa Documentation`} />

      {/* Main Header */}
      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      <div className="max-w-7xl mx-auto flex pt-24">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:bg-transparent lg:border-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="sticky top-24 p-6 space-y-6 h-[calc(100vh-6rem)] overflow-y-auto">
            {sections.map((sec) => (
              <div key={sec.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`p-1.5 rounded-lg ${sec.color}`}>
                    {sec.icon}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{sec.title}</span>
                </div>
                <ul className="space-y-1 ml-8">
                  {sec.articles.map((art) => (
                    <li key={art.id}>
                      <Link
                        href={`/docs/${sec.id}/${art.id}`}
                        onClick={() => setSidebarOpen(false)}
                        className={`block py-2 px-3 rounded-lg text-sm transition-all ${
                          sec.id === section && art.id === article
                            ? 'bg-green-100 text-green-700 font-medium'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {art.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-6 lg:px-12 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8">
            <Link href="/docs" className="text-slate-500 hover:text-slate-900">Docs</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${currentSection.color}`}>
              {currentSection.title}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium">{content.title}</span>
          </nav>

          {/* Title */}
          <h1 className="text-4xl font-bold text-slate-900 mb-6">{content.title}</h1>

          {/* On This Page */}
          <div className="mb-10 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">On this page</h4>
            <div className="flex flex-wrap gap-2">
              {content.toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="px-3 py-1.5 bg-white rounded-lg text-sm text-slate-600 hover:text-green-600 hover:bg-green-50 border border-slate-200 transition-colors"
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>

          {/* Content */}
          <article className="doc-content">
            {content.content}
          </article>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-slate-200">
            <div className="flex justify-between gap-4">
              {getPreviousArticle(section, article) && (
                <Link
                  href={`/docs/${getPreviousArticle(section, article)!.section}/${getPreviousArticle(section, article)!.article}`}
                  className="flex-1 group p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </div>
                  <p className="font-semibold text-slate-900 group-hover:text-green-600">
                    {getPreviousArticle(section, article)!.title}
                  </p>
                </Link>
              )}
              {!getPreviousArticle(section, article) && <div className="flex-1" />}
              {getNextArticle(section, article) && (
                <Link
                  href={`/docs/${getNextArticle(section, article)!.section}/${getNextArticle(section, article)!.article}`}
                  className="flex-1 group p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-sm text-slate-500 mb-1">
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <p className="font-semibold text-slate-900 group-hover:text-green-600">
                    {getNextArticle(section, article)!.title}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Custom styles for content */}
      <style>{`
        .doc-content {
          color: #334155;
          line-height: 1.75;
        }
        
        .doc-content section {
          margin-bottom: 2.5rem;
        }
        
        .doc-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .doc-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .doc-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        .doc-content p {
          margin-bottom: 1rem;
          color: #475569;
        }
        
        .doc-content ul,
        .doc-content ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        
        .doc-content li {
          margin-bottom: 0.5rem;
          color: #475569;
        }
        
        .doc-content li strong {
          color: #1e293b;
        }
        
        .doc-content code {
          background: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          color: #0f172a;
        }
        
        .doc-content a {
          color: #16a34a;
          text-decoration: none;
        }
        
        .doc-content a:hover {
          text-decoration: underline;
        }
        
        .note {
          padding: 1rem 1.25rem;
          border-radius: 0.5rem;
          margin: 1.25rem 0;
          border-left: 4px solid;
        }
        
        .note-info {
          background: #f0fdf4;
          border-color: #22c55e;
          color: #166534;
        }
        
        .note-tip {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1e40af;
        }
        
        .note-warning {
          background: #fefce8;
          border-color: #eab308;
          color: #854d0e;
        }
        
        .note-danger {
          background: #fef2f2;
          border-color: #ef4444;
          color: #991b1b;
        }
      `}</style>

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="ml-2 hover:bg-white/20 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Free Trial Modal */}
      <Dialog open={freeTrialOpen} onOpenChange={setFreeTrialOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Start Your Free Trial</DialogTitle>
            <DialogDescription>
              Get full access to SchoolExa for 14 days. No credit card required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFreeTrialSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trial-name">Full Name *</Label>
                <Input
                  id="trial-name"
                  placeholder="John Smith"
                  value={freeTrialForm.data.name}
                  onChange={(e) => freeTrialForm.setData('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trial-email">Work Email *</Label>
                <Input
                  id="trial-email"
                  type="email"
                  placeholder="john@school.edu"
                  value={freeTrialForm.data.email}
                  onChange={(e) => freeTrialForm.setData('email', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trial-school">School Name *</Label>
              <Input
                id="trial-school"
                placeholder="Springfield Elementary School"
                value={freeTrialForm.data.school_name}
                onChange={(e) => freeTrialForm.setData('school_name', e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#116B11] hover:bg-[#0d5a0d]"
              disabled={freeTrialForm.processing}
            >
              {freeTrialForm.processing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...</>
              ) : (
                <>Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions
function getPreviousArticle(currentSection: string, currentArticle: string) {
  const allArticles: { section: string; article: string; title: string }[] = [];
  sections.forEach((sec) => {
    sec.articles.forEach((art) => {
      allArticles.push({ section: sec.id, article: art.id, title: art.title });
    });
  });
  const currentIndex = allArticles.findIndex(
    (a) => a.section === currentSection && a.article === currentArticle
  );
  return currentIndex > 0 ? allArticles[currentIndex - 1] : null;
}

function getNextArticle(currentSection: string, currentArticle: string) {
  const allArticles: { section: string; article: string; title: string }[] = [];
  sections.forEach((sec) => {
    sec.articles.forEach((art) => {
      allArticles.push({ section: sec.id, article: art.id, title: art.title });
    });
  });
  const currentIndex = allArticles.findIndex(
    (a) => a.section === currentSection && a.article === currentArticle
  );
  return currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
}
