import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Header from '@/components/main-pages/Header';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  Play,
  Check,
  Star,
  Users,
  GraduationCap,
  Shield,
  Clock,
  Zap,
  Award,
  Building2,
  ChevronRight,
  Quote,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Heart,
  Globe,
  Sparkles,
  BookOpen,
  Calendar,
  DollarSign,
  Bell,
  BarChart3,
  MessageCircle,
  FileText,
  Lock,
  Server,
  Cloud,
  X,
  Loader2,
} from 'lucide-react';
import { DeploymentOptions } from '@/components/DeploymentOptions';
import { useState } from 'react';

// Stats data
const stats = [
  { number: '500+', label: 'Schools Trust Us', icon: Building2 },
  { number: '1M+', label: 'Students Managed', icon: GraduationCap },
  { number: '50K+', label: 'Teachers Empowered', icon: Users },
  { number: '5', label: 'Years of Innovation', icon: Zap },
];

// Core features
const coreFeatures = [
  {
    icon: Users,
    title: 'Student Information System',
    description: 'Complete student lifecycle management from admission to graduation with detailed profiles, academic history, and real-time tracking.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: GraduationCap,
    title: 'Academic Management',
    description: 'Streamline curriculum planning, grade management, report cards, and academic progress tracking with intelligent automation.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: DollarSign,
    title: 'Financial Management',
    description: 'Comprehensive fee collection, invoicing, payroll processing, and financial reporting with automated reminders.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: MessageCircle,
    title: 'Parent Communication',
    description: 'Keep parents informed with real-time updates, messaging, mobile app notifications, and a dedicated parent portal.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Make data-driven decisions with powerful dashboards, custom reports, and predictive analytics.',
    color: 'from-rose-500 to-red-500',
  },
  {
    icon: Shield,
    title: 'Security & Data Protection',
    description: 'Designed to support FERPA, COPPA, and GDPR requirements with enterprise-grade security, encryption, and audit trails.',
    color: 'from-slate-600 to-slate-800',
  },
];

// Problems schools face
const problems = [
  {
    title: 'Scattered Data Across Multiple Systems',
    description: 'Student records in one place, attendance in another, finances in spreadsheets. Finding information takes forever and errors are common.',
  },
  {
    title: 'Time-Consuming Manual Processes',
    description: 'Teachers spend hours on paperwork instead of teaching. Administrators drown in repetitive tasks that could be automated.',
  },
  {
    title: 'Poor Communication with Parents',
    description: 'Parents feel disconnected. They don\'t know about their child\'s progress until report cards arrive. Urgent updates get lost.',
  },
  {
    title: 'Regulatory Complexity',
    description: 'FERPA requirements, state reporting, audit trails - keeping up with regulations is stressful and time-consuming.',
  },
];

// Benefits with stats
const benefits = [
  {
    stat: '40%',
    title: 'Less Administrative Time',
    description: 'Automate repetitive tasks like attendance tracking, report generation, and fee reminders. Your staff can focus on what matters.',
  },
  {
    stat: '95%',
    title: 'Parent Engagement Rate',
    description: 'Real-time updates, instant messaging, and a dedicated parent portal keep families connected and involved in their child\'s education.',
  },
  {
    stat: 'Compliant',
    title: 'Regulation-Ready',
    description: 'Designed to support FERPA, COPPA, and state reporting requirements. Automatic audit trails for your peace of mind.',
  },
  {
    stat: '30%',
    title: 'Cost Reduction',
    description: 'Eliminate paper, reduce errors, and consolidate multiple software subscriptions into one affordable platform.',
  },
];

// How it works steps
const howItWorks = [
  {
    step: '1',
    title: 'Quick Setup',
    description: 'Our team migrates your existing data and configures the system for your school. Most schools are live within 2 weeks.',
  },
  {
    step: '2',
    title: 'Staff Training',
    description: 'Comprehensive training for administrators, teachers, and staff. Video tutorials, live sessions, and 24/7 support.',
  },
  {
    step: '3',
    title: 'Go Live',
    description: 'Start managing your school efficiently. Our support team is always available to help you succeed.',
  },
];

// Use cases
const useCases = [
  {
    type: 'Elementary Schools',
    description: 'Simplified interfaces for young student management. Parent communication tools that keep families engaged. Attendance and behavior tracking made easy.',
    features: ['Age-appropriate interfaces', 'Parent engagement tools', 'Behavior tracking', 'Activity management'],
  },
  {
    type: 'Middle Schools',
    description: 'Handle the complexity of departmentalized classes. Track student performance across subjects. Manage extracurricular activities and clubs.',
    features: ['Multi-subject scheduling', 'Performance analytics', 'Club management', 'Transition planning'],
  },
  {
    type: 'High Schools',
    description: 'College prep tracking, GPA calculations, transcript management. Advanced scheduling for electives and AP courses. Career counseling tools.',
    features: ['College prep tracking', 'Transcript management', 'Advanced scheduling', 'Career planning'],
  },
  {
    type: 'School Districts',
    description: 'Centralized management across all schools. District-wide reporting and analytics. Standardized processes with local flexibility.',
    features: ['Multi-school dashboard', 'District analytics', 'Centralized admin', 'Resource sharing'],
  },
];

// Testimonials
const testimonials = [
  {
    quote: "SchoolExa transformed how we manage our school. Administrative tasks that took hours now take minutes. Our teachers can finally focus on what matters - teaching.",
    author: "Dr. Sarah Johnson",
    role: "Principal",
    school: "Lincoln High School, California",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote: "The parent portal has revolutionized our communication. Parents love the real-time updates, and we've seen a 95% increase in parent engagement.",
    author: "Michael Chen",
    role: "Administrator",
    school: "Riverside Academy, Texas",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote: "Finally, a school management system that understands the needs of modern education. The analytics help us make better decisions for our students.",
    author: "Emily Rodriguez",
    role: "Superintendent",
    school: "Sunshine School District, Florida",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
];

// Pricing plans
const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for small schools getting started',
    price: '$ 1.59',
    period: '/student/month',
    features: [
      'Up to 500 students',
      'Core SIS features',
      'Parent portal',
      'Basic reporting',
      'Email support',
      '5 admin users',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    description: 'Most popular for growing schools',
    price: '$ 3.99',
    period: '/student/month',
    features: [
      'Up to 2,000 students',
      'All Starter features',
      'Advanced analytics',
      'Financial management',
      'Priority support',
      'Unlimited admin users',
      'Mobile app access',
      'Custom branding',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large districts and institutions',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited students',
      'All Professional features',
      'Multi-campus support',
      'Dedicated account manager',
      'On-premise option',
      'Custom integrations',
      'Custom SLA available',
      'Training included',
    ],
    popular: false,
  },
];

// FAQ data
const faqs = [
  {
    question: 'How long does implementation take?',
    answer: 'Most schools are fully operational within 2-4 weeks. Our dedicated onboarding team handles data migration, training, and setup to ensure a smooth transition.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level encryption and follow security best practices aligned with FERPA and COPPA requirements. Your data is protected with enterprise-grade security controls and regular security assessments.',
  },
  {
    question: 'Can I migrate from my current system?',
    answer: 'Yes! We provide free data migration from any existing system. Our team handles the entire process with careful attention to data integrity.',
  },
  {
    question: 'Do you offer training?',
    answer: 'We provide comprehensive training including live sessions, video tutorials, and documentation. Our support team is available 24/7 to help.',
  },
  {
    question: 'What about mobile access?',
    answer: 'SchoolExa works seamlessly on all devices. We also offer dedicated iOS and Android apps for teachers and parents.',
  },
];

export default function Welcome() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Modal states
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [contactSalesOpen, setContactSalesOpen] = useState(false);
  const [freeTrialOpen, setFreeTrialOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form handlers
  const waitlistForm = useForm({
    name: '',
    email: '',
    school_name: '',
  });

  const demoForm = useForm({
    name: '',
    email: '',
    phone: '',
    school_name: '',
    school_size: '',
    role: '',
  });

  const contactSalesForm = useForm({
    name: '',
    email: '',
    phone: '',
    school_name: '',
    school_size: '',
    message: '',
  });

  const freeTrialForm = useForm({
    name: '',
    email: '',
    phone: '',
    school_name: '',
    school_size: '',
    role: '',
  });

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    waitlistForm.post('/leads/waitlist', {
      onSuccess: () => {
        setWaitlistOpen(false);
        setSuccessMessage('Thank you for joining our waitlist! We\'ll be in touch soon.');
        waitlistForm.reset();
        setTimeout(() => setSuccessMessage(null), 5000);
      },
    });
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    demoForm.post('/leads/demo', {
      onSuccess: () => {
        setDemoOpen(false);
        setSuccessMessage('Demo request submitted! Our team will contact you within 24 hours.');
        demoForm.reset();
        setTimeout(() => setSuccessMessage(null), 5000);
      },
    });
  };

  const handleContactSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactSalesForm.post('/leads/contact-sales', {
      onSuccess: () => {
        setContactSalesOpen(false);
        setSuccessMessage('Thank you for your interest! Our sales team will reach out shortly.');
        contactSalesForm.reset();
        setTimeout(() => setSuccessMessage(null), 5000);
      },
    });
  };

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

  // FAQ Schema for rich snippets in Google search results
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
      <Head title="SchoolExa - #1 School Management Software for Modern Education">
        {/* FAQ Schema for rich search results */}
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Head>

      {/* Navigation Header with Mega Menu */}
      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Original Hero Section - Unchanged */}
      <Header 
        onJoinWaitlist={() => setWaitlistOpen(true)}
        onExperienceDemo={() => setDemoOpen(true)}
      />

      {/* Stats Section */}
      <section className="py-16 bg-[#116B11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-10 h-10 text-green-300 mx-auto mb-3" />
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-green-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 mb-8">Trusted by leading schools and districts across the USA</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-gray-600" />
              <span className="font-semibold text-gray-600">FERPA Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-8 h-8 text-gray-600" />
              <span className="font-semibold text-gray-600">COPPA Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-8 h-8 text-gray-600" />
              <span className="font-semibold text-gray-600">GDPR Aligned</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-8 h-8 text-gray-600" />
              <span className="font-semibold text-gray-600">SOC 2 Aligned</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="text-[#116B11]"> Run Your School</span>
            </h2>
            <p className="text-xl text-gray-600">
              A complete suite of tools designed specifically for K-12 schools. Manage everything from a single platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <ChevronRight className="absolute bottom-8 right-8 w-5 h-5 text-gray-300 group-hover:text-[#116B11] group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full text-red-700 text-sm font-medium mb-6">
                The Challenge
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Running a School Shouldn't Be This Hard
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Every day, school administrators and teachers struggle with outdated systems, disconnected tools, and endless paperwork. Sound familiar?
              </p>
              <p className="text-lg text-gray-600">
                You entered education to make a difference in students' lives—not to fight with spreadsheets and chase down missing information. There's a better way.
              </p>
            </div>
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <div key={index} className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{problem.title}</h3>
                    <p className="text-gray-600">{problem.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-24 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              The Solution
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              SchoolExa: Your Complete School Management Platform
            </h2>
            <p className="text-xl text-gray-600">
              One powerful platform that brings together everything you need to run your school efficiently. No more switching between systems. No more lost data. No more headaches.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all">
                <div className="text-5xl font-bold text-[#116B11] mb-4">{benefit.stat}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Easy Implementation
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Get Started in Just 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              We've helped over 500 schools transition to SchoolExa. Our proven process ensures a smooth implementation with minimal disruption to your daily operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-[#116B11] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 text-lg">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-green-200" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-6">
              Average implementation time: <span className="font-semibold text-[#116B11]">Just 1 weeks</span>
            </p>
            <Button 
              size="lg" 
              onClick={() => setDemoOpen(true)}
              className="bg-[#116B11] hover:bg-[#0d5a0d] text-white"
            >
              Schedule Your Free Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              Built for Every School
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Tailored Solutions for Your School Type
            </h2>
            <p className="text-xl text-gray-600">
              Whether you're managing a small elementary school or a large district, SchoolExa adapts to your unique needs and workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{useCase.type}</h3>
                <p className="text-gray-600 mb-6">{useCase.description}</p>
                <div className="flex flex-wrap gap-2">
                  {useCase.features.map((feature, i) => (
                    <span key={i} className="px-3 py-1 bg-green-50 text-[#116B11] text-sm font-medium rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
                Why SchoolExa?
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                The Most Trusted School Management Software in the USA
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Built by educators, for educators. We understand the unique challenges of running a school because we've lived them. That's why over 500 schools trust SchoolExa every day.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-[#116B11] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Made in the USA</h4>
                    <p className="text-gray-600">Developed and hosted in the United States with US-based support.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-[#116B11] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">24/7 Expert Support</h4>
                    <p className="text-gray-600">Real humans available around the clock to help when you need it.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-[#116B11] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Free Data Migration</h4>
                    <p className="text-gray-600">We handle the entire migration process with careful attention to data integrity.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-[#116B11] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">No Long-Term Contracts</h4>
                    <p className="text-gray-600">Month-to-month billing. Cancel anytime. We earn your business every day.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 lg:p-12">
              <div className="text-center">
                <div className="text-6xl font-bold text-[#116B11] mb-4">500+</div>
                <p className="text-xl text-gray-700 mb-8">Schools Already Trust SchoolExa</p>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/80 rounded-xl p-4">
                    <div className="text-3xl font-bold text-gray-900">1M+</div>
                    <p className="text-gray-600">Students Managed</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4">
                    <div className="text-3xl font-bold text-gray-900">50K+</div>
                    <p className="text-gray-600">Teachers Empowered</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4">
                    <div className="text-3xl font-bold text-gray-900">24/7</div>
                    <p className="text-gray-600">Support Available</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4">
                    <div className="text-3xl font-bold text-gray-900">4.9/5</div>
                    <p className="text-gray-600">Customer Rating</p>
                  </div>
                </div>

                <div className="flex justify-center gap-1 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 italic">"Best decision we ever made for our school."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Options Section */}
      <DeploymentOptions onContactSales={() => setContactSalesOpen(true)} />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Loved by Schools
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              What Educators Say About Us
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <Quote className="w-10 h-10 text-green-200 mb-6" />
                <p className="text-gray-700 leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-1 mb-6">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-[#116B11]">{testimonial.school}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <DollarSign className="w-4 h-4" />
              Simple Pricing
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Plans for Every School Size
            </h2>
            <p className="text-xl text-gray-600">
              Start free for 30 days. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white rounded-2xl p-8 border-2 ${
                  plan.popular 
                    ? 'border-[#116B11] shadow-xl scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#116B11] text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => plan.price === 'Custom' ? setContactSalesOpen(true) : setFreeTrialOpen(true)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-[#116B11] hover:bg-[#0d5a0d] text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Got questions? We've got answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#116B11]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-green-100 mb-10">
            Join 500+ schools that have already made the switch. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setFreeTrialOpen(true)}
              className="bg-white text-[#116B11] hover:bg-green-50"
            >
              Start Free 30-Day Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              onClick={() => setDemoOpen(true)}
            >
              <Phone className="w-5 h-5 mr-2" />
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PageFooter />

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <p>{successMessage}</p>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="ml-2 hover:bg-white/20 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Join the Waitlist</DialogTitle>
            <DialogDescription>
              Be the first to know when SchoolExa launches. Get early access and exclusive pricing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWaitlistSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="waitlist-name">Full Name *</Label>
              <Input
                id="waitlist-name"
                placeholder="John Smith"
                value={waitlistForm.data.name}
                onChange={(e) => waitlistForm.setData('name', e.target.value)}
                required
              />
              {waitlistForm.errors.name && (
                <p className="text-sm text-red-600">{waitlistForm.errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="waitlist-email">Email Address *</Label>
              <Input
                id="waitlist-email"
                type="email"
                placeholder="john@school.edu"
                value={waitlistForm.data.email}
                onChange={(e) => waitlistForm.setData('email', e.target.value)}
                required
              />
              {waitlistForm.errors.email && (
                <p className="text-sm text-red-600">{waitlistForm.errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="waitlist-school">School Name (Optional)</Label>
              <Input
                id="waitlist-school"
                placeholder="Springfield Elementary"
                value={waitlistForm.data.school_name}
                onChange={(e) => waitlistForm.setData('school_name', e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#116B11] hover:bg-[#0d5a0d]"
              disabled={waitlistForm.processing}
            >
              {waitlistForm.processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Waitlist
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Demo Request Modal */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Schedule Your Free Demo</DialogTitle>
            <DialogDescription>
              See SchoolExa in action. Our team will give you a personalized walkthrough.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDemoSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demo-name">Full Name *</Label>
                <Input
                  id="demo-name"
                  placeholder="John Smith"
                  value={demoForm.data.name}
                  onChange={(e) => demoForm.setData('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email *</Label>
                <Input
                  id="demo-email"
                  type="email"
                  placeholder="john@school.edu"
                  value={demoForm.data.email}
                  onChange={(e) => demoForm.setData('email', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demo-phone">Phone Number</Label>
                <Input
                  id="demo-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={demoForm.data.phone}
                  onChange={(e) => demoForm.setData('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-role">Your Role</Label>
                <select
                  id="demo-role"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={demoForm.data.role}
                  onChange={(e) => demoForm.setData('role', e.target.value)}
                >
                  <option value="">Select role</option>
                  <option value="Principal">Principal</option>
                  <option value="Administrator">Administrator</option>
                  <option value="IT Director">IT Director</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-school">School/District Name *</Label>
              <Input
                id="demo-school"
                placeholder="Springfield Elementary School"
                value={demoForm.data.school_name}
                onChange={(e) => demoForm.setData('school_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-size">Number of Students</Label>
              <select
                id="demo-size"
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                value={demoForm.data.school_size}
                onChange={(e) => demoForm.setData('school_size', e.target.value)}
              >
                <option value="">Select size</option>
                <option value="1-100">1-100 students</option>
                <option value="101-500">101-500 students</option>
                <option value="501-1000">501-1,000 students</option>
                <option value="1001-5000">1,001-5,000 students</option>
                <option value="5000+">5,000+ students</option>
              </select>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#116B11] hover:bg-[#0d5a0d]"
              disabled={demoForm.processing}
            >
              {demoForm.processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Schedule Demo
                </>
              )}
            </Button>
            <p className="text-xs text-center text-gray-500">
              We'll contact you within 24 hours to schedule your demo.
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contact Sales Modal */}
      <Dialog open={contactSalesOpen} onOpenChange={setContactSalesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Contact Our Sales Team</DialogTitle>
            <DialogDescription>
              Have questions about enterprise pricing or custom features? Let's talk.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContactSalesSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sales-name">Full Name *</Label>
                <Input
                  id="sales-name"
                  placeholder="John Smith"
                  value={contactSalesForm.data.name}
                  onChange={(e) => contactSalesForm.setData('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-email">Email *</Label>
                <Input
                  id="sales-email"
                  type="email"
                  placeholder="john@school.edu"
                  value={contactSalesForm.data.email}
                  onChange={(e) => contactSalesForm.setData('email', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sales-phone">Phone Number</Label>
                <Input
                  id="sales-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={contactSalesForm.data.phone}
                  onChange={(e) => contactSalesForm.setData('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales-size">Number of Students</Label>
                <select
                  id="sales-size"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={contactSalesForm.data.school_size}
                  onChange={(e) => contactSalesForm.setData('school_size', e.target.value)}
                >
                  <option value="">Select size</option>
                  <option value="1-100">1-100 students</option>
                  <option value="101-500">101-500 students</option>
                  <option value="501-1000">501-1,000 students</option>
                  <option value="1001-5000">1,001-5,000 students</option>
                  <option value="5000+">5,000+ students</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-school">School/District Name *</Label>
              <Input
                id="sales-school"
                placeholder="Springfield School District"
                value={contactSalesForm.data.school_name}
                onChange={(e) => contactSalesForm.setData('school_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-message">How can we help?</Label>
              <Textarea
                id="sales-message"
                placeholder="Tell us about your needs..."
                value={contactSalesForm.data.message}
                onChange={(e) => contactSalesForm.setData('message', e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#116B11] hover:bg-[#0d5a0d]"
              disabled={contactSalesForm.processing}
            >
              {contactSalesForm.processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Sales
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trial-phone">Phone Number</Label>
                <Input
                  id="trial-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={freeTrialForm.data.phone}
                  onChange={(e) => freeTrialForm.setData('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trial-role">Your Role</Label>
                <select
                  id="trial-role"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={freeTrialForm.data.role}
                  onChange={(e) => freeTrialForm.setData('role', e.target.value)}
                >
                  <option value="">Select role</option>
                  <option value="Principal">Principal</option>
                  <option value="Administrator">Administrator</option>
                  <option value="IT Director">IT Director</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Other">Other</option>
                </select>
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
            <div className="space-y-2">
              <Label htmlFor="trial-size">Number of Students</Label>
              <select
                id="trial-size"
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                value={freeTrialForm.data.school_size}
                onChange={(e) => freeTrialForm.setData('school_size', e.target.value)}
              >
                <option value="">Select size</option>
                <option value="1-100">1-100 students</option>
                <option value="101-500">101-500 students</option>
                <option value="501-1000">501-1,000 students</option>
                <option value="1001-5000">1,001-5,000 students</option>
                <option value="5000+">5,000+ students</option>
              </select>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                What's included in your trial:
              </div>
              <ul className="mt-2 space-y-1 ml-6 list-disc text-green-700">
                <li>Full access to all features</li>
                <li>Unlimited students and staff</li>
                <li>Free data migration assistance</li>
                <li>24/7 customer support</li>
              </ul>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#116B11] hover:bg-[#0d5a0d]"
              disabled={freeTrialForm.processing}
            >
              {freeTrialForm.processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <p className="text-xs text-center text-gray-500">
              No credit card required. Cancel anytime.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
