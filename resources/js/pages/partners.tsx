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
  Handshake,
  CheckCircle2,
  Users,
  DollarSign,
  Award,
  Globe,
  BookOpen,
  Zap,
  Mail,
  Loader2,
  X,
  Building2,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

// Partner benefits
const partnerBenefits = [
  {
    icon: DollarSign,
    title: 'Competitive Commissions',
    description: 'Earn attractive referral commissions for every school you bring to SchoolExa.',
  },
  {
    icon: BookOpen,
    title: 'Training & Certification',
    description: 'Get certified through our partner training program and access exclusive resources.',
  },
  {
    icon: Users,
    title: 'Dedicated Support',
    description: 'Work with a dedicated partner manager who helps you succeed.',
  },
  {
    icon: Zap,
    title: 'Marketing Resources',
    description: 'Access co-branded marketing materials, case studies, and sales tools.',
  },
  {
    icon: Award,
    title: 'Recognition Program',
    description: 'Get recognized for your achievements with our tiered partner program.',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Join a network of partners making a difference in education worldwide.',
  },
];

// Partner types
const partnerTypes = [
  {
    title: 'Referral Partners',
    description: 'Perfect for consultants, associations, and individuals with connections to schools. Refer schools to SchoolExa and earn commissions.',
    features: ['No technical expertise required', 'Flexible referral process', 'Commission on successful deals', 'Marketing support'],
  },
  {
    title: 'Implementation Partners',
    description: 'For consulting firms and service providers who can help schools implement and customize SchoolExa.',
    features: ['Implementation revenue', 'Technical training', 'Priority support access', 'Joint customer success'],
  },
  {
    title: 'Technology Partners',
    description: 'Build integrations with SchoolExa to extend functionality and serve joint customers better.',
    features: ['API access', 'Technical documentation', 'Co-marketing opportunities', 'Integration showcase'],
  },
  {
    title: 'Reseller Partners',
    description: 'Become an authorized reseller of SchoolExa in your region or market segment.',
    features: ['Reseller pricing', 'Territory protection', 'Sales enablement', 'Revenue sharing'],
  },
];

// Partner testimonials
const testimonials = [
  {
    quote: "Partnering with SchoolExa has been transformative for our education consulting business. The product sells itself, and the support is exceptional.",
    author: "Robert Martinez",
    company: "EduConsult Solutions",
    role: "Managing Director",
  },
  {
    quote: "SchoolExa's partner program is the best I've seen in EdTech. Great commissions, excellent support, and a product that actually helps schools.",
    author: "Jennifer Lee",
    company: "School Tech Advisors",
    role: "CEO",
  },
];

export default function Partners() {
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [freeTrialOpen, setFreeTrialOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const partnerForm = useForm({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    company_website: '',
    partner_type: '',
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

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    partnerForm.post('/leads/partner', {
      onSuccess: () => {
        setPartnerModalOpen(false);
        setSuccessMessage('Thank you for your interest in becoming a partner! Our team will contact you within 2-3 business days.');
        partnerForm.reset();
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

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Partners - SchoolExa"
        description="Become a SchoolExa partner. Join our partner ecosystem and help schools succeed while building a profitable business. Referral, implementation, technology, and reseller programs available."
        keywords="SchoolExa partners, school software reseller, EdTech partner program, education technology partnership"
        breadcrumbs={[
          { name: "Home", url: "https://schoolexa.com" },
          { name: "Partners", url: "https://schoolexa.com/partners" }
        ]}
      />

      {/* Header */}
      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <Handshake className="w-4 h-4" />
              Partner Program
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Grow Your Business with <span className="text-[#116B11]">SchoolExa</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join our partner ecosystem and help schools succeed while building a profitable business. Together, we can transform education.
            </p>
            <Button 
              size="lg" 
              className="bg-[#116B11] hover:bg-[#0d5a0d] text-white"
              onClick={() => setPartnerModalOpen(true)}
            >
              Become a Partner <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#116B11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-green-200">Active Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">$2M+</div>
              <div className="text-green-200">Partner Revenue</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">20+</div>
              <div className="text-green-200">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-green-200">Partner Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Benefits */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Partner with SchoolExa?</h2>
            <p className="text-xl text-gray-600">Everything you need to succeed as a partner</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partnerBenefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:bg-green-50 transition-colors">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                  <benefit.icon className="w-7 h-7 text-[#116B11]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Partner Programs</h2>
            <p className="text-xl text-gray-600">Choose the partnership model that fits your business</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {partnerTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-lg transition-all">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{type.title}</h3>
                <p className="text-gray-600 mb-6">{type.description}</p>
                <ul className="space-y-2 mb-6">
                  {type.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-[#116B11]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-[#116B11] text-[#116B11] hover:bg-[#116B11] hover:text-white"
                  onClick={() => {
                    partnerForm.setData('partner_type', type.title);
                    setPartnerModalOpen(true);
                  }}
                >
                  Apply for {type.title.split(' ')[0]} Program
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Partners Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
                <p className="text-gray-700 text-lg italic mb-6">"{testimonial.quote}"</p>
                {/* <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#116B11]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Partner with Us?</h2>
          <p className="text-xl text-green-100 mb-8">
            Join our growing network of partners and start making a difference in education while building a successful business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-[#116B11] hover:bg-green-50"
              onClick={() => setPartnerModalOpen(true)}
            >
              Apply to Partner Program <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <a href="mailto:partners@schoolexa.com">
                <Mail className="w-5 h-5 mr-2" /> partners@schoolexa.com
              </a>
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

      {/* Partner Application Modal */}
      <Dialog open={partnerModalOpen} onOpenChange={setPartnerModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Apply to Partner Program</DialogTitle>
            <DialogDescription>
              {partnerForm.data.partner_type 
                ? `Applying for: ${partnerForm.data.partner_type}`
                : 'Tell us about yourself and your business'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePartnerSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partner-name">Full Name *</Label>
                <Input
                  id="partner-name"
                  placeholder="John Smith"
                  value={partnerForm.data.name}
                  onChange={(e) => partnerForm.setData('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-email">Email *</Label>
                <Input
                  id="partner-email"
                  type="email"
                  placeholder="john@company.com"
                  value={partnerForm.data.email}
                  onChange={(e) => partnerForm.setData('email', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partner-phone">Phone Number</Label>
                <Input
                  id="partner-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={partnerForm.data.phone}
                  onChange={(e) => partnerForm.setData('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner-type">Partner Type *</Label>
                <select
                  id="partner-type"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={partnerForm.data.partner_type}
                  onChange={(e) => partnerForm.setData('partner_type', e.target.value)}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Referral Partners">Referral Partner</option>
                  <option value="Implementation Partners">Implementation Partner</option>
                  <option value="Technology Partners">Technology Partner</option>
                  <option value="Reseller Partners">Reseller Partner</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner-company">Company Name *</Label>
              <Input
                id="partner-company"
                placeholder="Your Company Inc."
                value={partnerForm.data.company_name}
                onChange={(e) => partnerForm.setData('company_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner-website">Company Website</Label>
              <Input
                id="partner-website"
                placeholder="https://yourcompany.com"
                value={partnerForm.data.company_website}
                onChange={(e) => partnerForm.setData('company_website', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner-message">Tell us about your business and how you'd like to partner *</Label>
              <Textarea
                id="partner-message"
                placeholder="Describe your business, your experience in education, and what you hope to achieve as a partner..."
                value={partnerForm.data.message}
                onChange={(e) => partnerForm.setData('message', e.target.value)}
                rows={4}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#116B11] hover:bg-[#0d5a0d]"
              disabled={partnerForm.processing}
            >
              {partnerForm.processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Handshake className="w-4 h-4 mr-2" />
                  Submit Application
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
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
