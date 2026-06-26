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
import { ArrowRight, FileText, Loader2, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

export default function TermsOfService() {
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
        title="Terms of Service - SchoolExa"
        description="Read SchoolExa's terms of service. Understand your rights and responsibilities when using our school management software."
        keywords="SchoolExa terms of service, school software terms, SchoolExa legal"
        breadcrumbs={[
          { name: 'Home', url: 'https://schoolexa.com' },
          { name: 'Terms of Service', url: 'https://schoolexa.com/terms-of-service' },
        ]}
      />

      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: January 1, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">

            {/* Section 1 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                By accessing or using SchoolExa's services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you are using the Services on behalf of an organization (such as a school or school district), you represent that you have the authority to bind that organization to these Terms.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">2. Description of Services</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                SchoolExa provides a cloud-based school management platform that includes student information management, academic tracking, parent communication tools, financial management, and related services. We reserve the right to modify, suspend, or discontinue any part of the Services at any time.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">3. Account Registration</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">To use our Services, you must:</p>
              <ul className="space-y-3 ml-6">
                {[
                  'Create an account with accurate and complete information',
                  'Maintain the security of your account credentials',
                  'Promptly notify us of any unauthorized access',
                  'Be at least 18 years old or have parental consent',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#116B11] rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800">You are responsible for all activities that occur under your account.</p>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">4. Subscription and Payment</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">4.1 Pricing</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our Services are provided on a subscription basis. Pricing is based on the number of students and selected features. Current pricing is available on our website and may be subject to change with 30 days' notice.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">4.2 Billing</h3>
                <ul className="space-y-3 ml-6">
                  {[
                    'Subscriptions are billed annually or monthly as selected',
                    'Payment is due at the beginning of each billing period',
                    'All fees are non-refundable except as required by law',
                    'We may suspend access for overdue payments',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#116B11] rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">4.3 Free Trial</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may offer a free trial period. At the end of the trial, your account will convert to a paid subscription unless cancelled.
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">5. Acceptable Use</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">You agree not to:</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Violate any laws or regulations',
                  'Infringe on intellectual property rights',
                  'Upload malicious code or interfere with the Services',
                  'Attempt to gain unauthorized access to systems',
                  'Use the Services to harm or exploit minors',
                  'Share login credentials or allow unauthorized access',
                  'Resell or redistribute the Services without authorization',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-red-50 p-3 rounded-lg">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">6. Data Ownership and Use</h2>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">6.1 Your Data</h3>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of all data you input into the Services ("Customer Data"). By using our Services, you grant us a limited license to use, process, and store Customer Data solely to provide the Services.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">6.2 Data Protection</h3>
                <p className="text-gray-700 leading-relaxed">
                  We will protect Customer Data in accordance with our Privacy Policy and applicable laws. Our practices are designed to support FERPA, COPPA, and GDPR requirements where applicable.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">6.3 Data Export</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may export your data at any time through our platform. Upon termination, we will make your data available for export for 30 days.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">7. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                SchoolExa and its licensors own all rights to the Services, including software, designs, trademarks, and documentation. You receive a limited, non-exclusive license to use the Services during your subscription.
              </p>
            </div>

            {/* Section 8 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">8. Privacy and Security</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Our collection and use of personal information is governed by our Privacy Policy. We implement industry-standard security measures but cannot guarantee absolute security.
              </p>
            </div>

            {/* Section 9 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">9. Service Level Agreement</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800">
                    We commit to <strong>99.9% uptime</strong> for our Services (excluding scheduled maintenance). Service credits may be available for extended outages as described in our SLA.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 10 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">10. Disclaimers</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 text-sm uppercase tracking-wide">
                  THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
              </div>
            </div>

            {/* Section 11 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">11. Limitation of Liability</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 text-sm uppercase tracking-wide">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, SCHOOLEXA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.
                </p>
              </div>
            </div>

            {/* Section 12 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">12. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                You agree to indemnify and hold SchoolExa harmless from claims arising from your use of the Services, violation of these Terms, or infringement of third-party rights.
              </p>
            </div>

            {/* Section 13 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">13. Termination</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Either party may terminate the subscription at the end of any billing period. We may suspend or terminate access immediately for violation of these Terms. Upon termination, your access will cease and data will be handled per our data retention policies.
              </p>
            </div>

            {/* Section 14 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">14. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                We may modify these Terms at any time. Material changes will be communicated via email or in-app notification at least 30 days before taking effect. Continued use constitutes acceptance of modified Terms.
              </p>
            </div>

            {/* Section 15 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">15. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                These Terms are governed by the laws of the State of California, USA, without regard to conflict of law principles. Disputes shall be resolved in the courts of San Francisco County, California.
              </p>
            </div>

            {/* Section 16 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">16. General Provisions</h2>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong className="text-gray-900">Entire Agreement:</strong> These Terms constitute the entire agreement between you and SchoolExa</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong className="text-gray-900">Severability:</strong> If any provision is found unenforceable, other provisions remain in effect</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong className="text-gray-900">Waiver:</strong> Failure to enforce any right does not waive future enforcement</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong className="text-gray-900">Assignment:</strong> You may not assign these Terms without our consent</span>
                </li>
              </ul>
            </div>

            {/* Section 17 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">17. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed text-lg">For questions about these Terms, contact us:</p>
              <div className="bg-gray-50 rounded-xl p-6 mt-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                  <a href="mailto:legal@schoolexa.com" className="text-[#116B11] hover:underline">legal@schoolexa.com</a>
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
