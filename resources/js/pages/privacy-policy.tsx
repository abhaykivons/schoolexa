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
import { ArrowRight, Shield, Loader2, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

export default function PrivacyPolicy() {
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
        title="Privacy Policy - SchoolExa"
        description="Read SchoolExa's privacy policy. Learn how we collect, use, and protect your data. Designed to support FERPA, COPPA, and GDPR requirements."
        keywords="SchoolExa privacy policy, school data privacy, FERPA support, student data protection"
        breadcrumbs={[
          { name: 'Home', url: 'https://schoolexa.com' },
          { name: 'Privacy Policy', url: 'https://schoolexa.com/privacy-policy' },
        ]}
      />

      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: January 1, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            
            {/* Section 1 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Welcome to SchoolExa ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our school management platform and services.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">2. Information We Collect</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">2.1 Information You Provide</h3>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700"><strong className="text-gray-900">Account Information:</strong> Name, email address, phone number, school name, job title</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700"><strong className="text-gray-900">Student Information:</strong> Student names, grades, attendance records, academic performance data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700"><strong className="text-gray-900">Parent/Guardian Information:</strong> Names, contact information, relationship to students</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700"><strong className="text-gray-900">Payment Information:</strong> Billing address, payment method details (processed securely by our payment providers)</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">2.2 Information Collected Automatically</h3>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#116B11] rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-gray-700">Device information (browser type, operating system, device identifiers)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#116B11] rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-gray-700">Usage data (pages visited, features used, time spent)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#116B11] rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-gray-700">IP address and approximate location</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#116B11] rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-gray-700">Cookies and similar tracking technologies</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed text-lg">We use the collected information to:</p>
              <ul className="space-y-3 ml-6">
                {[
                  'Provide, maintain, and improve our services',
                  'Process transactions and send related information',
                  'Send administrative notifications and updates',
                  'Respond to your comments, questions, and support requests',
                  'Monitor and analyze usage patterns to enhance user experience',
                  'Detect, prevent, and address technical issues or fraudulent activity',
                  'Comply with legal obligations',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#116B11] rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">4. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed text-lg">We may share your information with:</p>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong className="text-gray-900">School Administrators:</strong> To enable school management functions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong className="text-gray-900">Service Providers:</strong> Third parties who perform services on our behalf (hosting, analytics, payment processing)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong className="text-gray-900">Legal Requirements:</strong> When required by law or to protect our rights</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong className="text-gray-900">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</span>
                </li>
              </ul>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-green-800 font-medium">We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed text-lg">We implement industry-standard security measures to protect your data, including:</p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {[
                  'Encryption of data in transit and at rest (AES-256)',
                  'Regular security audits and penetration testing',
                  'Access controls and authentication mechanisms',
                  'Secure data centers with enterprise-grade security',
                  'Employee security training and background checks',
                  '24/7 security monitoring',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <Shield className="w-5 h-5 text-[#116B11] flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">6. Regulatory Alignment</h2>
              <p className="text-gray-700 leading-relaxed text-lg">SchoolExa is designed to support compliance with applicable privacy laws and regulations, including:</p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">FERPA</h4>
                  <p className="text-gray-600 text-sm">Family Educational Rights and Privacy Act</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">COPPA</h4>
                  <p className="text-gray-600 text-sm">Children's Online Privacy Protection Act</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">GDPR</h4>
                  <p className="text-gray-600 text-sm">General Data Protection Regulation (for EU users)</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">CCPA</h4>
                  <p className="text-gray-600 text-sm">California Consumer Privacy Act</p>
                </div>
              </div>
            </div>

            {/* Section 7 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">7. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed text-lg">Depending on your location, you may have the right to:</p>
              <ul className="space-y-3 ml-6">
                {[
                  'Access your personal information',
                  'Correct inaccurate data',
                  'Delete your personal information',
                  'Export your data in a portable format',
                  'Opt out of certain data processing activities',
                  'Withdraw consent where applicable',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#116B11] rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@schoolexa.com" className="text-[#116B11] hover:underline font-medium">privacy@schoolexa.com</a>.
              </p>
            </div>

            {/* Section 8 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                We retain your information for as long as your account is active or as needed to provide services. We may retain certain information as required by law or for legitimate business purposes (e.g., to resolve disputes, enforce agreements).
              </p>
            </div>

            {/* Section 9 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Our services are designed for use by schools and educational institutions. We do not knowingly collect personal information directly from children under 13 without parental consent. Schools are responsible for obtaining appropriate consent from parents or guardians.
              </p>
            </div>

            {/* Section 10 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">10. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including Standard Contractual Clauses where applicable.
              </p>
            </div>

            {/* Section 11 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">11. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>
            </div>

            {/* Section 12 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">12. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed text-lg">If you have any questions about this Privacy Policy, please contact us:</p>
              <div className="bg-gray-50 rounded-xl p-6 mt-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                  <a href="mailto:privacy@schoolexa.com" className="text-[#116B11] hover:underline">privacy@schoolexa.com</a>
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
