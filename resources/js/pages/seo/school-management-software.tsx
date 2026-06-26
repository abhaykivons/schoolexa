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
  GraduationCap,
  DollarSign,
  MessageCircle,
  BarChart3,
  Shield,
  Clock,
  Zap,
  Building2,
  Star,
  Phone,
  Loader2,
  X,
  Award,
  Globe,
  Heart,
  Cloud,
  Server,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';
import { DeploymentOptions, DeploymentBadges } from '@/components/DeploymentOptions';

// Features for School Management Software
const features = [
  {
    icon: Users,
    title: 'Student Information System (SIS)',
    description: 'Comprehensive student data management from admission to graduation. Track demographics, enrollment history, and academic records in one secure platform.',
  },
  {
    icon: GraduationCap,
    title: 'Academic Management',
    description: 'Streamline curriculum planning, grade management, GPA calculation, and report card generation with intelligent automation.',
  },
  {
    icon: DollarSign,
    title: 'Financial Management',
    description: 'Complete fee management, invoicing, payment tracking, and financial reporting. Accept online payments and automate reminders.',
  },
  {
    icon: MessageCircle,
    title: 'Parent Communication Portal',
    description: 'Keep parents engaged with real-time updates, messaging, mobile app notifications, and a dedicated parent portal.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Make data-driven decisions with powerful dashboards, custom reports, and predictive analytics for student success.',
  },
  {
    icon: Shield,
    title: 'Security & Data Protection',
    description: 'Designed to support FERPA, COPPA, and GDPR requirements with enterprise-grade security, encryption, and comprehensive audit trails.',
  },
];

// Benefits
const benefits = [
  { stat: '40%', title: 'Time Saved', description: 'Reduce administrative work with automation' },
  { stat: '95%', title: 'Parent Engagement', description: 'Real-time updates keep families connected' },
  { stat: 'Compliant', title: 'Regulation-Ready', description: 'Designed to support FERPA & COPPA requirements' },
  { stat: '30%', title: 'Cost Reduction', description: 'Consolidate tools and eliminate paper' },
];

// School types
const schoolTypes = [
  'Elementary Schools',
  'Middle Schools',
  'High Schools',
  'K-12 School Districts',
  'Charter Schools',
  'Private Schools',
  'International Schools',
  'Special Education Schools',
];

// Testimonials
const testimonials = [
  {
    quote: "SchoolExa transformed how we manage our school. What used to take hours now takes minutes. The best school management software we've ever used.",
    author: "Dr. Sarah Johnson",
    role: "Principal",
    school: "Lincoln High School, California",
  },
  {
    quote: "The parent portal has revolutionized our communication. Parents love getting real-time updates about their children's progress.",
    author: "Michael Chen",
    role: "Administrator",
    school: "Riverside Academy, Texas",
  },
];

// FAQ Schema data
const faqs = [
  {
    question: "What is school management software?",
    answer: "School management software is a comprehensive digital platform that helps educational institutions manage all administrative and academic operations including student information, attendance tracking, grade management, fee collection, parent communication, and reporting. It replaces manual processes with automated, efficient workflows."
  },
  {
    question: "How much does school management software cost?",
    answer: "SchoolExa's pricing starts at $1.59 per student per month for the Starter plan, $3.99 per student per month for the Professional plan, and custom pricing for Enterprise. We offer a free 30-day trial with no credit card required."
  },
  {
    question: "Does SchoolExa support FERPA compliance?",
    answer: "Yes, SchoolExa is designed to support FERPA compliance requirements. We also align our practices with COPPA, GDPR, and other data protection standards. Our platform follows SOC 2 security principles and undergoes regular security assessments."
  },
  {
    question: "Can school management software integrate with other tools?",
    answer: "Yes, SchoolExa offers integrations with popular tools including Google Workspace, Microsoft 365, learning management systems (LMS), and payment gateways. Enterprise plans include custom API access for additional integrations."
  },
  {
    question: "How long does it take to implement school management software?",
    answer: "Most schools are fully operational with SchoolExa within 2-4 weeks. Our dedicated onboarding team handles data migration, configuration, and training to ensure a smooth transition."
  },
];

export default function SchoolManagementSoftware() {
  const [freeTrialOpen, setFreeTrialOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const freeTrialForm = useForm({
    name: '',
    email: '',
    phone: '',
    school_name: '',
    school_size: '',
  });

  const demoForm = useForm({
    name: '',
    email: '',
    phone: '',
    school_name: '',
    school_size: '',
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

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    demoForm.post('/leads/demo', {
      onSuccess: () => {
        setDemoOpen(false);
        setSuccessMessage('Demo scheduled! Our team will contact you within 24 hours.');
        demoForm.reset();
        setTimeout(() => setSuccessMessage(null), 5000);
      },
    });
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Best School Management Software 2025 | K-12 School ERP System - SchoolExa"
        description="SchoolExa is the #1 rated school management software for K-12 schools. Features include student information system, attendance tracking, grade management, parent portal, and fee management. Designed to support FERPA requirements. Start free trial today."
        keywords="school management software, school management system, school ERP software, student information system, SIS software, school administration software, K-12 school management, best school management software, school management software for private schools, school management software free trial"
        breadcrumbs={[
          { name: 'Home', url: 'https://schoolexa.com' },
          { name: 'School Management Software', url: 'https://schoolexa.com/school-management-software' },
        ]}
      >
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "SchoolExa School Management Software",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web, iOS, Android",
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "USD",
              "lowPrice": "1.59",
              "highPrice": "3.99"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "500"
            }
          })}
        </script>
      </SEOHead>

      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section - SEO Optimized */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                #1 Rated School Management Software
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                The Best <span className="text-[#116B11]">School Management Software</span> for Modern Education
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                SchoolExa is a complete school management system that helps K-12 schools streamline administration, engage parents, and improve student outcomes. Trusted by 500+ schools managing over 1 million students.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Free 30-Day Trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">FERPA Ready</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => setFreeTrialOpen(true)}
                  className="bg-[#116B11] hover:bg-[#0d5a0d] text-white "
                >
                  Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  onClick={() => setDemoOpen(true)}
                >
                  <Phone className="w-5 h-5 mr-2" /> Schedule Demo
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-emerald-50 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm">
                      <div className="text-3xl font-bold text-[#116B11]">{benefit.stat}</div>
                      <div className="font-medium text-gray-900">{benefit.title}</div>
                      <div className="text-sm text-gray-500">{benefit.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-500">Trusted by schools and districts across the United States</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-gray-400" />
              <span className="font-medium text-gray-600">FERPA Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-gray-400" />
              <span className="font-medium text-gray-600">SOC 2 Aligned</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-gray-400" />
              <span className="font-medium text-gray-600">GDPR Aligned</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-gray-600">4.9/5 Rating (500+ reviews)</span>
            </div>
          </div>
        </div>
      </section>

      {/* What is School Management Software */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              What is School Management Software?
            </h2>
            <p className="text-xl text-gray-600">
              School management software (also known as school management system, school ERP, or student information system) is a comprehensive digital platform that automates and streamlines all aspects of school administration. From student enrollment to graduation, it handles everything in one unified system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-[#116B11]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* School Types */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              School Management Software for Every School Type
            </h2>
            <p className="text-xl text-gray-600">
              SchoolExa adapts to your unique needs, whether you're a small private school or a large district.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {schoolTypes.map((type, index) => (
              <div 
                key={index}
                className="px-6 py-3 bg-white rounded-full border border-gray-200 hover:border-[#116B11] hover:bg-green-50 transition-colors cursor-pointer"
              >
                <span className="text-gray-700 font-medium">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Why Schools Choose SchoolExa Over Other School Management Software
              </h2>
              
              <div className="space-y-6">
                {[
                  { title: 'Easy to Use', desc: 'Intuitive interface that requires minimal training. Teachers love it.' },
                  { title: 'Fast Implementation', desc: 'Go live in 2-4 weeks with free data migration and setup support.' },
                  { title: 'Affordable Pricing', desc: 'Transparent pricing starting at $1.59/student/month. No hidden fees.' },
                  { title: '24/7 Support', desc: 'Real humans available around the clock via chat, email, or phone.' },
                  { title: 'Mobile Apps', desc: 'Dedicated iOS and Android apps for teachers, parents, and students.' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-[#116B11] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.school}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              School Management Software FAQ
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
      <DeploymentOptions onContactSales={() => setDemoOpen(true)} />

      {/* CTA Section */}
      <section className="py-20 bg-[#116B11]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Try the Best School Management Software?
          </h2>
          <p className="text-xl text-green-100 mb-10">
            Join 500+ schools that trust SchoolExa. Start your free 30-day trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setFreeTrialOpen(true)}
              className="bg-white text-[#116B11] hover:bg-green-50"
            >
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              onClick={() => setDemoOpen(true)}
              className="border-white text-white hover:bg-white/10"
            >
              <Phone className="w-5 h-5 mr-2" /> Talk to Sales
            </Button>
          </div>
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
            <DialogDescription>Get full access to our school management software for 30 days. No credit card required.</DialogDescription>
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

      {/* Demo Modal */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Schedule a Demo</DialogTitle>
            <DialogDescription>See our school management software in action with a personalized demo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDemoSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demo-name">Full Name *</Label>
                <Input id="demo-name" placeholder="John Smith" value={demoForm.data.name} onChange={(e) => demoForm.setData('name', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-email">Work Email *</Label>
                <Input id="demo-email" type="email" placeholder="john@school.edu" value={demoForm.data.email} onChange={(e) => demoForm.setData('email', e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-school">School Name *</Label>
              <Input id="demo-school" placeholder="Springfield Elementary School" value={demoForm.data.school_name} onChange={(e) => demoForm.setData('school_name', e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-[#116B11] hover:bg-[#0d5a0d]" disabled={demoForm.processing}>
              {demoForm.processing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scheduling...</> : <>Schedule Demo <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
