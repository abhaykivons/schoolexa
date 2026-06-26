import { useForm } from '@inertiajs/react';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowRight,
  Check,
  X,
  Phone,
  HelpCircle,
  CheckCircle2,
  Loader2,
  Zap,
  Shield,
  Users,
  Building2,
  Star,
  DollarSign,
  Clock,
  HeadphonesIcon,
  Award,
  BarChart3,
  MessageCircle,
  FileText,
  Calendar,
  GraduationCap,
  CreditCard,
  BadgePercent,
  Cloud,
  Server,
} from 'lucide-react';
import { DeploymentOptions } from '@/components/DeploymentOptions';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

// Pricing plans with detailed features
const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for small schools getting started with digital management',
    price: '1.59',
    period: '/student/month',
    annualPrice: '1.27',
    highlight: false,
    features: [
      { name: 'Up to 500 students', included: true },
      { name: 'Core Student Information System', included: true },
      { name: 'Parent portal access', included: true },
      { name: 'Basic attendance tracking', included: true },
      { name: 'Standard reports', included: true },
      { name: 'Email support', included: true },
      { name: '5 admin users', included: true },
      { name: 'Basic grade management', included: true },
      { name: 'Mobile app access', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'Financial management', included: false },
      { name: 'Custom branding', included: false },
      { name: 'API access', included: false },
      { name: 'Dedicated account manager', included: false },
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'outline' as const,
  },
  {
    name: 'Professional',
    description: 'Most popular choice for growing schools needing full features',
    price: '3.99',
    period: '/student/month',
    annualPrice: '3.19',
    highlight: true,
    badge: 'Most Popular',
    features: [
      { name: 'Up to 2,000 students', included: true },
      { name: 'Advanced Student Information System', included: true },
      { name: 'Full attendance & behavior tracking', included: true },
      { name: 'Advanced reporting & analytics', included: true },
      { name: 'Financial management & invoicing', included: true },
      { name: 'Priority email & chat support', included: true },
      { name: 'Unlimited admin users', included: true },
      { name: 'Mobile app access (iOS & Android)', included: true },
      { name: 'Custom branding', included: true },
      { name: 'Automated notifications', included: true },
      { name: 'Calendar & scheduling', included: true },
      { name: 'API access', included: false },
      { name: 'Dedicated account manager', included: false },
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'default' as const,
  },
  {
    name: 'Enterprise',
    description: 'For large districts and institutions requiring custom solutions',
    price: 'Custom',
    period: '',
    annualPrice: '',
    highlight: false,
    features: [
      { name: 'Unlimited students', included: true },
      { name: 'Multi-campus management', included: true },
      { name: 'District-wide analytics', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: '24/7 priority phone support', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Full API access', included: true },
      { name: 'On-premise deployment option', included: true },
      { name: 'Custom SLA available', included: true },
      { name: 'Advanced security features', included: true },
      { name: 'Training & onboarding included', included: true },
      { name: 'Data migration assistance', included: true },
      { name: 'Regulatory guidance support', included: true },
    ],
    cta: 'Contact Sales',
    ctaVariant: 'outline' as const,
  },
];

// Feature comparison categories
const featureCategories = [
  {
    name: 'Student Management',
    icon: GraduationCap,
    features: [
      { name: 'Student profiles', starter: true, professional: true, enterprise: true },
      { name: 'Enrollment management', starter: true, professional: true, enterprise: true },
      { name: 'Class assignments', starter: true, professional: true, enterprise: true },
      { name: 'Academic history', starter: 'Basic', professional: true, enterprise: true },
      { name: 'Transcript generation', starter: false, professional: true, enterprise: true },
      { name: 'Bulk data import/export', starter: false, professional: true, enterprise: true },
    ],
  },
  {
    name: 'Attendance & Behavior',
    icon: Calendar,
    features: [
      { name: 'Daily attendance', starter: true, professional: true, enterprise: true },
      { name: 'Period-wise attendance', starter: false, professional: true, enterprise: true },
      { name: 'Behavior tracking', starter: false, professional: true, enterprise: true },
      { name: 'Automated alerts', starter: false, professional: true, enterprise: true },
      { name: 'Attendance reports', starter: 'Basic', professional: 'Advanced', enterprise: 'Custom' },
    ],
  },
  {
    name: 'Financial Management',
    icon: DollarSign,
    features: [
      { name: 'Fee structure setup', starter: false, professional: true, enterprise: true },
      { name: 'Invoice generation', starter: false, professional: true, enterprise: true },
      { name: 'Payment tracking', starter: false, professional: true, enterprise: true },
      { name: 'Online payments', starter: false, professional: true, enterprise: true },
      { name: 'Financial reports', starter: false, professional: true, enterprise: 'Custom' },
      { name: 'Multi-currency support', starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: 'Communication',
    icon: MessageCircle,
    features: [
      { name: 'Parent portal', starter: true, professional: true, enterprise: true },
      { name: 'In-app messaging', starter: 'Limited', professional: true, enterprise: true },
      { name: 'Email notifications', starter: true, professional: true, enterprise: true },
      { name: 'SMS notifications', starter: false, professional: true, enterprise: true },
      { name: 'Push notifications', starter: false, professional: true, enterprise: true },
      { name: 'Custom notification workflows', starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: 'Reports & Analytics',
    icon: BarChart3,
    features: [
      { name: 'Standard reports', starter: true, professional: true, enterprise: true },
      { name: 'Custom report builder', starter: false, professional: true, enterprise: true },
      { name: 'Analytics dashboard', starter: 'Basic', professional: 'Advanced', enterprise: 'Custom' },
      { name: 'Export to Excel/PDF', starter: true, professional: true, enterprise: true },
      { name: 'Scheduled reports', starter: false, professional: true, enterprise: true },
      { name: 'District-wide analytics', starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: 'Support & Security',
    icon: Shield,
    features: [
      { name: 'Email support', starter: true, professional: true, enterprise: true },
      { name: 'Chat support', starter: false, professional: true, enterprise: true },
      { name: 'Phone support', starter: false, professional: false, enterprise: '24/7' },
      { name: 'Dedicated account manager', starter: false, professional: false, enterprise: true },
      { name: 'Data encryption', starter: true, professional: true, enterprise: true },
      { name: 'SSO/SAML integration', starter: false, professional: false, enterprise: true },
      { name: 'Custom SLA', starter: false, professional: false, enterprise: true },
    ],
  },
];

// FAQ data
const pricingFaqs = [
  {
    question: 'How does per-student pricing work?',
    answer: 'You pay based on the number of active students in your school. If you have 500 students on the Professional plan at $3.99/student/month, your monthly cost would be $1,995. We count only active, enrolled students - not alumni or withdrawn students.',
  },
  {
    question: 'What\'s included in the free trial?',
    answer: 'The 30-day free trial includes full access to all Professional plan features. No credit card required. We\'ll help you import your data and get set up. At the end of the trial, you can choose the plan that fits your needs.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you get immediate access to new features. When downgrading, the change takes effect at the start of your next billing cycle.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes, we offer a 20% discount when you pay annually instead of monthly. This can result in significant savings, especially for larger schools.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), ACH bank transfers, and purchase orders for Enterprise customers. We can also accommodate school district procurement processes.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees for Starter and Professional plans. Enterprise customers receive complimentary setup, data migration, and training as part of their package.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'Your data belongs to you. Upon cancellation, you have 30 days to export all your data. After that, we securely delete it from our servers in accordance with data protection best practices.',
  },
  {
    question: 'Do you offer special pricing for non-profits?',
    answer: 'Yes! We offer discounted pricing for registered non-profit schools and educational organizations. Contact our sales team for more information.',
  },
];

// Trust indicators
const trustIndicators = [
  { icon: Shield, label: 'FERPA Ready' },
  { icon: Award, label: 'SOC 2 Aligned' },
  { icon: Clock, label: 'High Availability' },
  { icon: HeadphonesIcon, label: '24/7 Support' },
];

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [freeTrialOpen, setFreeTrialOpen] = useState(false);
  const [contactSalesOpen, setContactSalesOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const freeTrialForm = useForm({
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

  const handleContactSalesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactSalesForm.post('/leads/contact-sales', {
      onSuccess: () => {
        setContactSalesOpen(false);
        setSuccessMessage('Thank you! Our sales team will contact you within 24 hours.');
        contactSalesForm.reset();
        setTimeout(() => setSuccessMessage(null), 5000);
      },
    });
  };

  const handlePlanClick = (planName: string) => {
    if (planName === 'Enterprise') {
      setContactSalesOpen(true);
    } else {
      setFreeTrialOpen(true);
    }
  };

  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": pricingFaqs.map(faq => ({
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
        title="Pricing - SchoolExa School Management Software"
        description="Transparent pricing for SchoolExa school management software. Plans starting at $1.59/student/month. Free 30-day trial, no credit card required. Compare Starter, Professional, and Enterprise plans."
        keywords="SchoolExa pricing, school management software cost, school ERP pricing, SIS pricing, education software pricing, school software plans"
        breadcrumbs={[
          { name: "Home", url: "https://schoolexa.com" },
          { name: "Pricing", url: "https://schoolexa.com/pricing" }
        ]}
      >
        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        {/* Pricing Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "SchoolExa School Management Software",
            "description": "Complete school management software for K-12 schools",
            "brand": {
              "@type": "Brand",
              "name": "SchoolExa"
            },
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "USD",
              "lowPrice": "1.59",
              "highPrice": "3.99",
              "offerCount": "3"
            }
          })}
        </script>
      </SEOHead>

      {/* Header */}
      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <DollarSign className="w-4 h-4" />
              Simple, Transparent Pricing
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Choose the Right Plan for <span className="text-[#116B11]">Your School</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Start with a 30-day free trial. No credit card required. Cancel anytime.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {trustIndicators.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-600">
                  <item.icon className="w-5 h-5 text-[#116B11]" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-4 p-1 bg-gray-100 rounded-full">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="px-2 py-0.5 bg-green-100 text-[#116B11] text-xs rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all ${
                  plan.highlight
                    ? 'border-[#116B11] shadow-xl scale-105 z-10'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#116B11] text-white text-sm font-medium rounded-full">
                    {plan.badge}
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                  
                  <div className="mb-2">
                    {plan.price === 'Custom' ? (
                      <span className="text-4xl font-bold text-gray-900">Custom</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">
                          ${billingPeriod === 'annual' ? plan.annualPrice : plan.price}
                        </span>
                        <span className="text-gray-500">{plan.period}</span>
                      </>
                    )}
                  </div>
                  {plan.price !== 'Custom' && billingPeriod === 'annual' && (
                    <p className="text-sm text-[#116B11]">
                      Billed annually (Save 20%)
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-3 ${
                        feature.isHeader ? 'font-semibold text-gray-900 mt-4' : ''
                      }`}
                    >
                      {!feature.isHeader && (
                        feature.included ? (
                          <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePlanClick(plan.name)}
                  className={`w-full ${
                    plan.highlight
                      ? 'bg-[#116B11] hover:bg-[#0d5a0d] text-white'
                      : plan.ctaVariant === 'outline'
                      ? 'border-[#116B11] text-[#116B11] hover:bg-[#116B11] hover:text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                  variant={plan.ctaVariant}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Compare All Features</h2>
            <p className="text-xl text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
              <div className="font-semibold text-gray-900">Features</div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">Starter</div>
                <div className="text-sm text-gray-500">$1.59/student/mo</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-[#116B11]">Professional</div>
                <div className="text-sm text-gray-500">$3.99/student/mo</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">Enterprise</div>
                <div className="text-sm text-gray-500">Custom</div>
              </div>
            </div>

            {/* Feature Categories */}
            {featureCategories.map((category, catIndex) => (
              <div key={catIndex}>
                {/* Category Header */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-green-50 border-b border-gray-200">
                  <div className="flex items-center gap-2 font-semibold text-gray-900">
                    <category.icon className="w-5 h-5 text-[#116B11]" />
                    {category.name}
                  </div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>

                {/* Features */}
                {category.features.map((feature, featIndex) => (
                  <div
                    key={featIndex}
                    className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50"
                  >
                    <div className="text-gray-700">{feature.name}</div>
                    <div className="text-center">
                      {feature.starter === true ? (
                        <Check className="w-5 h-5 text-[#116B11] mx-auto" />
                      ) : feature.starter === false ? (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-600">{feature.starter}</span>
                      )}
                    </div>
                    <div className="text-center">
                      {feature.professional === true ? (
                        <Check className="w-5 h-5 text-[#116B11] mx-auto" />
                      ) : feature.professional === false ? (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-600">{feature.professional}</span>
                      )}
                    </div>
                    <div className="text-center">
                      {feature.enterprise === true ? (
                        <Check className="w-5 h-5 text-[#116B11] mx-auto" />
                      ) : feature.enterprise === false ? (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-600">{feature.enterprise}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Schools Choose SchoolExa</h2>
            <p className="text-xl text-gray-600">
              More value, better support, and transparent pricing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BadgePercent className="w-8 h-8 text-[#116B11]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Hidden Fees</h3>
              <p className="text-gray-600">
                What you see is what you pay. No setup fees, no surprise charges, no long-term contracts.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-[#116B11]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Free Data Migration</h3>
              <p className="text-gray-600">
                We'll migrate your data from any existing system at no extra cost. Our team handles the migration with careful attention to data integrity.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeadphonesIcon className="w-8 h-8 text-[#116B11]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Exceptional Support</h3>
              <p className="text-gray-600">
                Real humans available to help. Average response time under 15 minutes during business hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <DeploymentOptions onContactSales={() => setContactSalesOpen(true)} />

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Pricing FAQ
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about pricing</p>
          </div>

          <div className="space-y-4">
            {pricingFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ArrowRight
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
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
            Ready to Get Started?
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
              Start Free 30-Day Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              onClick={() => setContactSalesOpen(true)}
              className=" text-white hover:bg-white/10"
            >
              <Phone className="w-5 h-5 mr-2" />
              Talk to Sales
            </Button>
          </div>
          <p className="text-green-200 mt-6 text-sm">
            No credit card required • Free data migration • Cancel anytime
          </p>
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

      {/* Free Trial Modal */}
      <Dialog open={freeTrialOpen} onOpenChange={setFreeTrialOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Start Your Free Trial</DialogTitle>
            <DialogDescription>
              Get full access to SchoolExa for 30 days. No credit card required.
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
                <li>Full access to all Professional features</li>
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

      {/* Contact Sales Modal */}
      <Dialog open={contactSalesOpen} onOpenChange={setContactSalesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Contact Our Sales Team</DialogTitle>
            <DialogDescription>
              Let's discuss your school's needs and find the perfect plan.
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
                placeholder="Tell us about your school's needs..."
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
    </div>
  );
}
