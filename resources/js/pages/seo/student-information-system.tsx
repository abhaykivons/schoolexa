import { useForm } from '@inertiajs/react';
import SEOHead from '@/components/SEOHead';
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
  ArrowRight,
  CheckCircle2,
  Users,
  FileText,
  ClipboardList,
  Calendar,
  GraduationCap,
  Bell,
  Shield,
  Download,
  Upload,
  Search,
  BarChart3,
  Phone,
  Loader2,
  X,
  Star,
  Award,
  BookOpen,
  Clock,
  Cloud,
  Server,
  Building2,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';
import { DeploymentOptions } from '@/components/DeploymentOptions';

// SIS Features
const sisFeatures = [
  {
    icon: Users,
    title: 'Student Demographics',
    description: 'Centralized database for all student information including personal details, contact info, emergency contacts, and medical records.',
  },
  {
    icon: ClipboardList,
    title: 'Enrollment Management',
    description: 'Streamlined enrollment workflows with online applications, document collection, and automated waitlist management.',
  },
  {
    icon: Calendar,
    title: 'Attendance Tracking',
    description: 'Automated attendance recording with mobile check-in, real-time alerts for absences, and detailed attendance reports.',
  },
  {
    icon: GraduationCap,
    title: 'Grade Management',
    description: 'Comprehensive gradebook with weighted categories, GPA calculation, and standards-based grading support.',
  },
  {
    icon: FileText,
    title: 'Report Cards',
    description: 'Generate professional report cards with customizable templates, automated calculations, and digital distribution.',
  },
  {
    icon: Bell,
    title: 'Parent Notifications',
    description: 'Automated alerts for grades, attendance, behavior, and school announcements via email, SMS, and push notifications.',
  },
];

// Key capabilities
const capabilities = [
  { title: 'Real-time Data Sync', description: 'All student data syncs instantly across devices and users' },
  { title: 'Custom Fields', description: 'Add unlimited custom fields to track any data point' },
  { title: 'Bulk Import/Export', description: 'Easy data migration with Excel, CSV, and API support' },
  { title: 'Document Storage', description: 'Securely store and organize student documents' },
  { title: 'Advanced Search', description: 'Find any student record in seconds with powerful filters' },
  { title: 'Audit Trails', description: 'Complete history of all changes for accountability' },
];

// Stats
const sisStats = [
  { value: '10x', label: 'Faster Data Entry' },
  { value: '50%', label: 'Less Paperwork' },
  { value: '99.9%', label: 'Data Accuracy' },
  { value: '24/7', label: 'Data Access' },
];

// FAQ
const faqs = [
  {
    question: "What is a Student Information System (SIS)?",
    answer: "A Student Information System (SIS) is software used by schools to manage student data including demographics, enrollment, attendance, grades, transcripts, and parent communication. It serves as the central database for all student records and automates many administrative tasks."
  },
  {
    question: "How is SIS different from school management software?",
    answer: "While often used interchangeably, SIS specifically focuses on student records and academic data. School management software is broader and may include additional modules like HR, finance, and facilities. SchoolExa offers both SIS capabilities and full school management features."
  },
  {
    question: "Can we migrate our existing student data to SchoolExa?",
    answer: "Yes! Our team provides free data migration from any existing SIS. We support imports from Excel, CSV, and most major student information systems. Migration typically takes 1-2 weeks with zero data loss."
  },
  {
    question: "Is student data secure and does it support FERPA requirements?",
    answer: "Absolutely. SchoolExa is designed to support FERPA compliance with security controls aligned with SOC 2 principles. We use AES-256 encryption, role-based access controls, and maintain comprehensive audit logs of all data access."
  },
  {
    question: "Can parents access their child's information?",
    answer: "Yes, parents get secure portal access to view grades, attendance, assignments, and communicate with teachers. They can also receive automated notifications for important updates."
  },
];

export default function StudentInformationSystem() {
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
    }))
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Student Information System (SIS) Software | K-12 SIS - SchoolExa"
        description="SchoolExa's Student Information System (SIS) helps schools manage student records, enrollment, attendance, grades, and parent communication. Designed to support FERPA requirements. Free trial available."
        keywords="student information system, SIS software, student management system, student records software, school SIS, K-12 SIS, student database software, student data management"
        breadcrumbs={[
          { name: 'Home', url: 'https://schoolexa.com' },
          { name: 'Student Information System', url: 'https://schoolexa.com/student-information-system' },
        ]}
      >
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </SEOHead>

      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                Student Information System
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                The Complete <span className="text-[#116B11]">Student Information System</span> for K-12 Schools
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Manage all student data in one secure, easy-to-use platform. From enrollment to graduation, SchoolExa's SIS keeps your student records organized, accessible, and secure.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {['FERPA Ready', 'Free Migration', '24/7 Support'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => setFreeTrialOpen(true)}
                  className="bg-[#116B11] hover:bg-[#0d5a0d] text-white"
                >
                  Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" asChild>
                  <a href="/contact"><Phone className="w-5 h-5 mr-2" /> Request Demo</a>
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="grid grid-cols-2 gap-6">
                {sisStats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-3xl font-bold text-[#116B11]">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 text-[#116B11] font-medium">
                  <Shield className="w-5 h-5" />
                  FERPA & COPPA Ready
                </div>
                <p className="text-sm text-gray-600 mt-1">Your student data is protected with enterprise-grade security</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is SIS Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              What is a Student Information System?
            </h2>
            <p className="text-xl text-gray-600">
              A Student Information System (SIS) is the backbone of school data management. It centralizes all student records in one secure location, automates administrative tasks, and provides insights that help improve student outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sisFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#116B11] hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful SIS Capabilities
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage student information efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, index) => (
              <div key={index} className="bg-white rounded-xl p-6 flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-[#116B11] flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">{cap.title}</h4>
                  <p className="text-sm text-gray-600">{cap.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Management Visual */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                All Student Data, One Secure Platform
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Stop juggling multiple spreadsheets and systems. SchoolExa's SIS brings everything together with powerful features designed for busy school administrators.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Upload, title: 'Easy Data Import', desc: 'Migrate from any system with our import wizard' },
                  { icon: Search, title: 'Instant Search', desc: 'Find any record in milliseconds' },
                  { icon: Download, title: 'Flexible Export', desc: 'Export data anytime in Excel, CSV, or PDF' },
                  { icon: Shield, title: 'Secure Access', desc: 'Role-based permissions protect sensitive data' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#116B11]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#116B11]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Student Records</div>
                      <div className="text-sm text-gray-500">Demographics, contacts, history</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Academic Data</div>
                      <div className="text-sm text-gray-500">Grades, transcripts, assessments</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Attendance</div>
                      <div className="text-sm text-gray-500">Daily, class-by-class tracking</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Reports & Analytics</div>
                      <div className="text-sm text-gray-500">Custom reports, insights</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Student Information System FAQ
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <DeploymentOptions onContactSales={() => setFreeTrialOpen(true)} />

      {/* CTA Section */}
      <section className="py-20 bg-[#116B11]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready for a Better Student Information System?
          </h2>
          <p className="text-xl text-green-100 mb-10">
            Join hundreds of schools using SchoolExa SIS. Start your free trial today.
          </p>
          <Button 
            size="lg" 
            onClick={() => setFreeTrialOpen(true)}
            className="bg-white text-[#116B11] hover:bg-green-50"
          >
            Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <PageFooter />

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
            <DialogDescription>Experience our Student Information System free for 30 days.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFreeTrialSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trial-name">Full Name *</Label>
                <Input id="trial-name" placeholder="John Smith" value={freeTrialForm.data.name} onChange={(e) => freeTrialForm.setData('name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trial-email">Work Email *</Label>
                <Input id="trial-email" type="email" placeholder="john@school.edu" value={freeTrialForm.data.email} onChange={(e) => freeTrialForm.setData('email', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trial-school">School Name *</Label>
              <Input id="trial-school" placeholder="Springfield Elementary School" value={freeTrialForm.data.school_name} onChange={(e) => freeTrialForm.setData('school_name', e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-[#116B11] hover:bg-[#0d5a0d]" disabled={freeTrialForm.processing}>
              {freeTrialForm.processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...</> : <>Start Free Trial <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
