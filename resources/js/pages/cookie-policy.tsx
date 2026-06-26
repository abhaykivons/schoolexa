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
import { ArrowRight, Cookie, Loader2, CheckCircle2, X, Settings, Shield, BarChart3, Zap } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

// Cookie categories data
const cookieCategories = [
  {
    icon: Shield,
    name: 'Essential Cookies',
    description: 'Required for the website to function. Cannot be disabled.',
    cookies: [
      { name: 'session_id', purpose: 'Maintains your login session', duration: 'Session' },
      { name: 'csrf_token', purpose: 'Security protection against CSRF attacks', duration: 'Session' },
      { name: 'remember_token', purpose: 'Keeps you logged in across visits', duration: '30 days' },
    ],
  },
  {
    icon: BarChart3,
    name: 'Performance Cookies',
    description: 'Help us understand how visitors use our website.',
    cookies: [
      { name: '_ga', purpose: 'Google Analytics - distinguishes unique users', duration: '2 years' },
      { name: '_gid', purpose: 'Google Analytics - distinguishes users', duration: '24 hours' },
    ],
  },
  {
    icon: Zap,
    name: 'Functional Cookies',
    description: 'Enable personalization and enhanced functionality.',
    cookies: [
      { name: 'theme', purpose: 'Remembers your theme preference (light/dark)', duration: '1 year' },
      { name: 'language', purpose: 'Remembers your language selection', duration: '1 year' },
    ],
  },
];

// Browser links
const browserLinks = [
  { name: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
  { name: 'Mozilla Firefox', url: 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer' },
  { name: 'Apple Safari', url: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac' },
  { name: 'Microsoft Edge', url: 'https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies' },
];

export default function CookiePolicy() {
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
        title="Cookie Policy - SchoolExa"
        description="Learn about how SchoolExa uses cookies and similar technologies. Understand what cookies we use and how to manage your preferences."
        keywords="SchoolExa cookie policy, cookies, tracking, privacy"
        breadcrumbs={[
          { name: 'Home', url: 'https://schoolexa.com' },
          { name: 'Cookie Policy', url: 'https://schoolexa.com/cookie-policy' },
        ]}
      />

      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
            <Cookie className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-600">Last updated: January 1, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">

            {/* Section 1 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">1. What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Quick Summary:</strong> Cookies help us remember you, understand how you use our site, and improve your experience.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">2. How We Use Cookies</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">SchoolExa uses cookies and similar technologies to:</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Keep you signed in to your account',
                  'Remember your preferences and settings',
                  'Understand how you use our services',
                  'Improve our products and services',
                  'Provide personalized content and experiences',
                  'Measure the effectiveness of our communications',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[#116B11] flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3 - Cookie Categories */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">3. Types of Cookies We Use</h2>
              
              {cookieCategories.map((category, catIndex) => (
                <div key={catIndex} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-[#116B11]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-200">Cookie</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-200">Purpose</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-200">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.cookies.map((cookie, cookieIndex) => (
                          <tr key={cookieIndex} className={cookieIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm font-mono text-gray-700 border-b border-gray-200">{cookie.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">{cookie.purpose}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200">{cookie.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">4. Third-Party Cookies</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                Some cookies are placed by third-party services that appear on our pages. We do not control these cookies. Third parties that may set cookies include:
              </p>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#116B11] rounded-full flex-shrink-0 mt-2"></div>
                  <span className="text-gray-700"><strong className="text-gray-900">Google Analytics:</strong> For website analytics and usage statistics</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#116B11] rounded-full flex-shrink-0 mt-2"></div>
                  <span className="text-gray-700"><strong className="text-gray-900">Intercom:</strong> For customer support chat functionality</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#116B11] rounded-full flex-shrink-0 mt-2"></div>
                  <span className="text-gray-700"><strong className="text-gray-900">Stripe:</strong> For secure payment processing</span>
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">5. Managing Cookies</h2>
              <p className="text-gray-700 leading-relaxed text-lg">You can control and manage cookies in several ways:</p>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">5.1 Browser Settings</h3>
                <p className="text-gray-700 leading-relaxed">
                  Most browsers allow you to control cookies through their settings. You can usually find these in the "Options" or "Preferences" menu.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {browserLinks.map((browser, index) => (
                    <a
                      key={index}
                      href={browser.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-green-50 hover:text-[#116B11] transition-colors text-sm"
                    >
                      {browser.name}
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">5.2 Cookie Consent Tool</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you first visit our website, you will see a cookie consent banner. You can use this to accept or reject non-essential cookies. You can change your preferences at any time by clicking the "Cookie Settings" link in the footer.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">5.3 Opt-Out Links</h3>
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-green-100 hover:text-[#116B11] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Google Analytics Opt-Out
                </a>
              </div>
            </div>

            {/* Section 6 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">6. Impact of Disabling Cookies</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                If you disable or decline cookies, some parts of our website may not function properly. For example:
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {[
                    'You may not be able to log in or stay logged in',
                    'Your preferences may not be remembered',
                    'Some features may be unavailable or degraded',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-yellow-800">
                      <X className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 7 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">7. Do Not Track</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Some browsers have a "Do Not Track" feature. We currently do not respond to Do Not Track signals because there is no industry-standard way to interpret them.
              </p>
            </div>

            {/* Section 8 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">8. Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </div>

            {/* Section 9 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">9. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed text-lg">If you have questions about our use of cookies, please contact us:</p>
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
