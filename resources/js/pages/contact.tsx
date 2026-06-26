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
  Mail,
  MessageCircle,
  Clock,
  Globe,
  Loader2,
  CheckCircle2,
  X,
  Send,
  Headphones,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

// Contact options
const contactOptions = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Send us an email and we\'ll respond promptly',
    detail: 'support@schoolexa.com',
    action: 'Send Email',
    color: 'bg-green-100 text-green-600',
  },
];


// Departments
const departments = [
  { name: 'General Inquiry', email: 'info@schoolexa.com' },
  { name: 'Sales', email: 'sales@schoolexa.com' },
  { name: 'Support', email: 'support@schoolexa.com' },
  { name: 'Press & Media', email: 'press@schoolexa.com' },
  { name: 'Partnerships', email: 'partners@schoolexa.com' },
  { name: 'Careers', email: 'careers@schoolexa.com' },
];

export default function Contact() {
  const [freeTrialOpen, setFreeTrialOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const contactForm = useForm({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    department: 'General Inquiry',
  });

  const freeTrialForm = useForm({
    name: '',
    email: '',
    school_name: '',
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactForm.post('/leads/contact', {
      onSuccess: () => {
        setSuccessMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
        contactForm.reset();
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
        title="Contact Us - SchoolExa"
        description="Get in touch with SchoolExa. Contact our sales team, customer support, or visit our offices. We're here to help you transform your school management."
        keywords="contact SchoolExa, school software support, SchoolExa phone number, SchoolExa email"
        breadcrumbs={[
          { name: 'Home', url: 'https://schoolexa.com' },
          { name: 'Contact Us', url: 'https://schoolexa.com/contact' },
        ]}
      />

      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
            <Headphones className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            We'd Love to Hear from You
          </h1>
          <p className="text-xl text-gray-600">
            Have questions about SchoolExa? Our team is here to help. Reach out and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-green-300 hover:shadow-lg transition-all group"
              >
                <div className={`w-14 h-14 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <option.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{option.description}</p>
                <p className="text-[#116B11] font-medium mb-4">{option.detail}</p>
                <Button variant="outline" className="border-[#116B11] text-[#116B11] hover:bg-[#116B11] hover:text-white">
                  {option.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={contactForm.data.name}
                      onChange={(e) => contactForm.setData('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@school.edu"
                      value={contactForm.data.email}
                      onChange={(e) => contactForm.setData('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={contactForm.data.phone}
                      onChange={(e) => contactForm.setData('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">School/Organization</Label>
                    <Input
                      id="company"
                      placeholder="Springfield School District"
                      value={contactForm.data.company}
                      onChange={(e) => contactForm.setData('company', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <select
                    id="department"
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    value={contactForm.data.department}
                    onChange={(e) => contactForm.setData('department', e.target.value)}
                    required
                  >
                    {departments.map((dept, i) => (
                      <option key={i} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    value={contactForm.data.subject}
                    onChange={(e) => contactForm.setData('subject', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    value={contactForm.data.message}
                    onChange={(e) => contactForm.setData('message', e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#116B11] hover:bg-[#0d5a0d]"
                  disabled={contactForm.processing}
                >
                  {contactForm.processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              {/* Response Time */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-[#116B11]" />
                  <h3 className="font-bold text-gray-900">Quick Response Time</h3>
                </div>
                <p className="text-gray-600">
                  We typically respond to all inquiries within <span className="font-semibold text-[#116B11]">2-4 hours</span> during business hours.
                  For urgent matters, please use our live chat or phone support.
                </p>
              </div>

              {/* Department Emails */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#116B11]" />
                  Department Contacts
                </h3>
                <div className="space-y-3">
                  {departments.map((dept, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700">{dept.name}</span>
                      <a href={`mailto:${dept.email}`} className="text-[#116B11] hover:underline text-sm">
                        {dept.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Hours */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#116B11]" />
                  Support Hours
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Email Support</span>
                    <span>Response within 2-4 hours</span>
                  </div>
                </div>
              </div>
            </div>
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
            <DialogDescription>Get full access to SchoolExa for 14 days. No credit card required.</DialogDescription>
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
            <Button type="submit" className="w-full bg-[#116B11] hover:bg-[#0d5a0d]" disabled={freeTrialForm.processing}>
              {freeTrialForm.processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...
                </>
              ) : (
                <>
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
