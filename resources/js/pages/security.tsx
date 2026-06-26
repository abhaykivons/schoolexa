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
  Shield,
  Lock,
  Key,
  Eye,
  Server,
  FileCheck,
  Users,
  Globe,
  CheckCircle2,
  Loader2,
  X,
  Award,
  Building2,
  ShieldCheck,
  Fingerprint,
  Database,
  CloudOff,
  AlertTriangle,
  Mail,
  Cloud,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';
import { DeploymentOptions } from '@/components/DeploymentOptions';

// Security features
const securityFeatures = [
  {
    icon: Lock,
    title: 'Data Encryption',
    description: 'All data is encrypted at rest using AES-256 encryption and in transit using TLS 1.3. Your sensitive information is always protected.',
  },
  {
    icon: Fingerprint,
    title: 'Multi-Factor Authentication',
    description: 'Add an extra layer of security with MFA support including authenticator apps, SMS codes, and hardware security keys.',
  },
  {
    icon: Key,
    title: 'Single Sign-On (SSO)',
    description: 'Integrate with your existing identity provider using SAML 2.0 or OAuth 2.0 for seamless and secure authentication.',
  },
  {
    icon: Users,
    title: 'Role-Based Access Control',
    description: 'Granular permission settings ensure users only access the data and features they need for their role.',
  },
  {
    icon: Eye,
    title: 'Audit Logging',
    description: 'Comprehensive audit trails track all user activities, data changes, and system access for compliance and security monitoring.',
  },
  {
    icon: Database,
    title: 'Automated Backups',
    description: 'Your data is automatically backed up every hour with point-in-time recovery available for up to 30 days.',
  },
];

// Compliance & Standards Alignment
const certifications = [
  {
    name: 'SOC 2 Aligned',
    description: 'Security controls aligned with SOC 2 principles for security, availability, and confidentiality',
    icon: Award,
  },
  {
    name: 'FERPA Ready',
    description: 'Designed to support compliance with Family Educational Rights and Privacy Act requirements',
    icon: FileCheck,
  },
  {
    name: 'COPPA Ready',
    description: 'Built to support Children\'s Online Privacy Protection Act requirements for student data',
    icon: ShieldCheck,
  },
  {
    name: 'GDPR Aligned',
    description: 'Designed to support European data protection regulation requirements',
    icon: Globe,
  },
  {
    name: 'ISO 27001 Aligned',
    description: 'Security practices aligned with international information security standards',
    icon: Building2,
  },
  {
    name: 'CCPA Ready',
    description: 'Designed to support California Consumer Privacy Act requirements',
    icon: Shield,
  },
];

// Infrastructure security
const infrastructureSecurity = [
  {
    title: 'Cloud Infrastructure',
    items: [
      'Hosted on enterprise-grade cloud infrastructure',
      'Geographic redundancy across multiple availability zones',
      'DDoS protection and web application firewall',
      '99.9% uptime target',
    ],
  },
  {
    title: 'Network Security',
    items: [
      'Network segmentation and micro-segmentation',
      'Intrusion detection and prevention systems',
      'Regular penetration testing by third parties',
      '24/7 security monitoring and alerting',
    ],
  },
  {
    title: 'Application Security',
    items: [
      'Secure software development lifecycle (SDLC)',
      'Regular code reviews and security testing',
      'Automated vulnerability scanning',
      'Bug bounty program for responsible disclosure',
    ],
  },
];

// Security practices
const securityPractices = [
  {
    icon: Users,
    title: 'Employee Security',
    description: 'All employees undergo background checks, security training, and sign confidentiality agreements. Access is granted on a need-to-know basis.',
  },
  {
    icon: AlertTriangle,
    title: 'Incident Response',
    description: 'We have a documented incident response plan with defined procedures for detection, containment, eradication, and recovery.',
  },
  {
    icon: CloudOff,
    title: 'Disaster Recovery',
    description: 'Comprehensive disaster recovery plan with regular testing ensures business continuity and minimal data loss.',
  },
  {
    icon: FileCheck,
    title: 'Vendor Security',
    description: 'All third-party vendors undergo security assessments and must meet our strict security standards.',
  },
];

export default function Security() {
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

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Security - SchoolExa"
        description="Learn about SchoolExa's comprehensive security measures, data protection practices, and how we support FERPA, COPPA, and GDPR compliance for school management."
        keywords="SchoolExa security, school data security, FERPA support, COPPA support, school software security, data protection"
        breadcrumbs={[
          { name: 'Home', url: 'https://schoolexa.com' },
          { name: 'Security', url: 'https://schoolexa.com/security' },
        ]}
      />

      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Enterprise Security
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Your Data Security is Our <span className="text-[#116B11]">Top Priority</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            SchoolExa is built with enterprise-grade security to protect sensitive student and school data.
            We're committed to maintaining the highest standards of security and data protection.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">SOC 2 Aligned</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">FERPA Ready</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">COPPA Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Features</h2>
            <p className="text-xl text-gray-600">Comprehensive security measures to protect your data</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#116B11]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Standards & Compliance Alignment</h2>
            <p className="text-xl text-gray-600">We meet the highest standards for data protection and privacy</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 flex items-start gap-4">
                <div className="w-12 h-12 bg-[#116B11]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <cert.icon className="w-6 h-6 text-[#116B11]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Security */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Infrastructure Security</h2>
            <p className="text-xl text-gray-600">Enterprise-grade infrastructure built for security and reliability</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {infrastructureSecurity.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Practices</h2>
            <p className="text-xl text-gray-600">Our operational security measures</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {securityPractices.map((practice, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <practice.icon className="w-6 h-6 text-[#116B11]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{practice.title}</h3>
                  <p className="text-gray-600">{practice.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Vulnerability */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 lg:p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-[#116B11] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report a Security Vulnerability</h2>
            <p className="text-gray-600 mb-6">
              We take security seriously. If you've discovered a security vulnerability, please report it responsibly.
              We appreciate your help in keeping SchoolExa secure.
            </p>
            <div className="flex justify-center">
              <a
                href="mailto:security@schoolexa.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#116B11] text-white rounded-lg hover:bg-[#0d5a0d] transition-colors"
              >
                <Mail className="w-5 h-5" />
                security@schoolexa.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <DeploymentOptions onContactSales={() => setFreeTrialOpen(true)} />

      {/* CTA Section */}
      <section className="py-16 bg-[#116B11]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Have Security Questions?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Our security team is available to discuss your specific requirements and answer any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setFreeTrialOpen(true)}
              className="bg-white text-[#116B11] hover:bg-green-50"
            >
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" className="border-white text-white hover:bg-white/10" asChild>
              <a href="/contact">Contact Security Team</a>
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
