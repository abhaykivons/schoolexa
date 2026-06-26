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
  Cpu,
  Zap,
  Brain,
  Cloud,
  Smartphone,
  BarChart3,
  Users,
  Shield,
  Clock,
  TrendingUp,
  Lightbulb,
  Laptop,
  Phone,
  Loader2,
  X,
  Star,
  Award,
  Server,
  Building2,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';
import { DeploymentOptions } from '@/components/DeploymentOptions';

// EdTech Features
const edtechFeatures = [
  {
    icon: Cloud,
    title: '100% Cloud-Based',
    description: 'Access your school data anywhere, anytime. No servers to maintain, no software to install. Automatic updates and backups included.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Native iOS and Android apps for teachers, parents, and administrators. Complete functionality on any device.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Machine learning algorithms identify at-risk students, predict trends, and provide actionable recommendations.',
  },
  {
    icon: Zap,
    title: 'Smart Automation',
    description: 'Automate routine tasks like attendance tracking, report generation, and parent notifications. Save 10+ hours weekly.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Interactive dashboards with real-time data. Track KPIs, monitor progress, and make data-driven decisions instantly.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, SOC 2 aligned security controls, FERPA-ready design, and 99.9% uptime target for peace of mind.',
  },
];

// Modern EdTech benefits
const modernBenefits = [
  {
    title: 'Digital Transformation Made Easy',
    description: 'Move from paper-based processes to a fully digital ecosystem without the complexity. Our intuitive platform requires minimal training.',
    points: ['One-click data migration', 'Training included', 'Dedicated onboarding support'],
  },
  {
    title: 'Future-Ready Technology',
    description: 'Built with modern technology stack that scales with your needs. Regular updates bring new features without disruption.',
    points: ['API-first architecture', 'Third-party integrations', 'Custom workflows'],
  },
  {
    title: 'Sustainable & Eco-Friendly',
    description: 'Reduce paper usage by 90%+ while improving efficiency. Digital-first approach for environmentally conscious schools.',
    points: ['Paperless operations', 'Digital forms & signatures', 'E-report cards'],
  },
];

// Stats
const stats = [
  { value: '500+', label: 'Schools Trust Us' },
  { value: '1M+', label: 'Students Managed' },
  { value: '99.99%', label: 'Uptime Guaranteed' },
  { value: '4.9/5', label: 'Customer Rating' },
];

// FAQ for EdTech
const faqs = [
  {
    question: "What makes SchoolExa different from traditional school management software?",
    answer: "SchoolExa is built with modern EdTech principles: cloud-native architecture, mobile-first design, AI-powered analytics, and seamless integrations. Unlike legacy systems, we update constantly with new features while maintaining simplicity."
  },
  {
    question: "Is EdTech school management software secure for student data?",
    answer: "Absolutely. SchoolExa employs enterprise-grade security including AES-256 encryption, multi-factor authentication, and security controls aligned with SOC 2 principles. Our platform is designed to support FERPA and COPPA requirements. Your data is protected using industry-standard security practices."
  },
  {
    question: "Can SchoolExa integrate with our existing EdTech tools?",
    answer: "Yes! SchoolExa integrates with 50+ popular EdTech tools including Google Workspace, Microsoft 365, Canvas, Schoology, Zoom, and more. Our open API allows custom integrations for unique needs."
  },
  {
    question: "How does AI help in school management?",
    answer: "Our AI analyzes patterns in attendance, grades, and behavior to identify at-risk students early, predict enrollment trends, automate routine communications, and provide personalized recommendations for student success."
  },
];

export default function EdTechSchoolManagement() {
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
        title="EdTech School Management Software | Cloud-Based School ERP - SchoolExa"
        description="SchoolExa is the leading EdTech school management software with AI-powered analytics, cloud-based platform, and mobile apps. Transform your school with modern education technology. Free trial available."
        keywords="EdTech school management, education technology software, cloud school management, AI school management, modern school software, digital school management, school technology platform, EdTech ERP"
        breadcrumbs={[
          { name: 'Home', url: 'https://schoolexa.com' },
          { name: 'EdTech School Management', url: 'https://schoolexa.com/edtech-school-management' },
        ]}
      >
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </SEOHead>

      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <Cpu className="w-4 h-4" />
              Next-Generation EdTech
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Modern <span className="text-[#116B11]">EdTech</span> School Management for the Digital Age
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-10">
              Transform your school with cloud-native technology, AI-powered insights, and mobile-first design. The future of education management is here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={() => setFreeTrialOpen(true)}
                className="bg-[#116B11] hover:bg-[#0d5a0d] text-white"
              >
                Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" asChild>
                <a href="/contact"><Phone className="w-5 h-5 mr-2" /> Talk to Expert</a>
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-[#116B11]">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why EdTech Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Modern Schools Choose EdTech Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Traditional school software is outdated. Today's schools need cloud-based, AI-powered platforms that grow with their needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {edtechFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-[#116B11]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digital Transformation Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Your Path to Digital Transformation
            </h2>
            <p className="text-xl text-gray-600">
              SchoolExa makes modernizing your school simple and stress-free.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {modernBenefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-10 h-10 bg-[#116B11] text-white rounded-lg flex items-center justify-center text-xl font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 mb-4">{benefit.description}</p>
                <ul className="space-y-2">
                  {benefit.points.map((point, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-[#116B11]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Legacy Software vs Modern EdTech
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
                <X className="w-6 h-6 text-red-500" />
                Traditional Software
              </h3>
              <ul className="space-y-4">
                {[
                  'Installed on local servers',
                  'Manual updates and maintenance',
                  'Limited mobile access',
                  'Static reports only',
                  'Expensive licensing fees',
                  'Long implementation time',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <X className="w-5 h-5 text-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 rounded-2xl p-8 border-2 border-[#116B11]">
              <h3 className="text-xl font-bold text-[#116B11] mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                SchoolExa EdTech
              </h3>
              <ul className="space-y-4">
                {[
                  '100% cloud-based, no servers needed',
                  'Automatic updates, always current',
                  'Full-featured mobile apps',
                  'AI-powered real-time analytics',
                  'Affordable per-student pricing',
                  'Live in 2-4 weeks',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-[#116B11]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              EdTech School Management FAQ
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
      <section className="py-20 bg-gradient-to-r from-[#116B11] to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Modernize Your School?
          </h2>
          <p className="text-xl text-green-100 mb-10">
            Join the EdTech revolution. Start your free 30-day trial today.
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
            <DialogDescription>Experience modern EdTech school management for 30 days free.</DialogDescription>
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
