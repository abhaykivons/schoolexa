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
  HelpCircle,
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Mail,
  FileText,
  Users,
  GraduationCap,
  DollarSign,
  Shield,
  Settings,
  Loader2,
  CheckCircle2,
  X,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

// Help categories
const helpCategories = [
  {
    icon: Users,
    title: 'Getting Started',
    description: 'New to SchoolExa? Learn the basics and set up your account.',
    articles: ['Creating your first school account', 'Adding administrators and staff', 'Importing student data', 'Setting up academic years'],
    link: '/docs',
  },
  {
    icon: GraduationCap,
    title: 'Student Management',
    description: 'Learn how to manage student information, enrollment, and records.',
    articles: ['Student enrollment process', 'Managing student profiles', 'Attendance tracking', 'Report card generation'],
    link: '/docs',
  },
  {
    icon: DollarSign,
    title: 'Billing & Payments',
    description: 'Manage your subscription, invoices, and payment methods.',
    articles: ['Understanding your invoice', 'Updating payment methods', 'Changing subscription plans', 'Requesting refunds'],
    link: '/docs',
  },
  {
    icon: Shield,
    title: 'Security & Privacy',
    description: 'Keep your data safe with our security features.',
    articles: ['Two-factor authentication', 'Password best practices', 'Data export options', 'Privacy settings'],
    link: '/docs',
  },
  {
    icon: Settings,
    title: 'Account Settings',
    description: 'Customize your account preferences and settings.',
    articles: ['Profile customization', 'Notification preferences', 'User permissions', 'School branding'],
    link: '/docs',
  },
  {
    icon: MessageCircle,
    title: 'Parent Portal',
    description: 'Help for parents using the SchoolExa parent portal.',
    articles: ['Accessing the parent portal', 'Viewing student progress', 'Communicating with teachers', 'Mobile app setup'],
    link: '/docs',
  },
];

// Popular articles
const popularArticles = [
  { title: 'How to import student data from Excel', views: '2.5k views' },
  { title: 'Setting up automated attendance tracking', views: '1.8k views' },
  { title: 'Creating custom report cards', views: '1.5k views' },
  { title: 'Configuring parent notifications', views: '1.3k views' },
  { title: 'Managing multiple campuses', views: '1.1k views' },
];

// FAQs
const faqs = [
  {
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox. If you don\'t receive the email within 5 minutes, check your spam folder or contact support.',
  },
  {
    question: 'Can I use SchoolExa on mobile devices?',
    answer: 'Yes! SchoolExa works on all devices through your web browser. We also have dedicated iOS and Android apps for teachers and parents. Download them from the App Store or Google Play.',
  },
  {
    question: 'How do I add a new student?',
    answer: 'Go to Student Management > Add Student, fill in the required information, and click Save. You can also bulk import students using our Excel template.',
  },
  {
    question: 'What browsers are supported?',
    answer: 'SchoolExa works best on Chrome, Firefox, Safari, and Edge (latest versions). We recommend keeping your browser updated for the best experience.',
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach our support team via live chat (click the chat icon) or email at support@schoolexa.com. We\'re available 24/7.',
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
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
        title="Help Center - SchoolExa Support"
        description="Get help with SchoolExa school management software. Browse our knowledge base, FAQs, video tutorials, and contact support for assistance."
        keywords="SchoolExa help, school software support, SchoolExa FAQ, school management help"
        breadcrumbs={[
          { name: 'Home', url: 'https://schoolexa.com' },
          { name: 'Help Center', url: 'https://schoolexa.com/help-center' },
        ]}
      />

      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            Help Center
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Search our knowledge base or browse categories below
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for articles, tutorials, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#116B11] focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/docs" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-green-100 hover:text-[#116B11] transition-colors">
              <BookOpen className="w-4 h-4" />
              Documentation
            </a>
            <a href="#" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-green-100 hover:text-[#116B11] transition-colors">
              <Video className="w-4 h-4" />
              Video Tutorials
            </a>
            <a href="/contact" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-green-100 hover:text-[#116B11] transition-colors">
              <MessageCircle className="w-4 h-4" />
              Live Chat
            </a>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-300 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <category.icon className="w-6 h-6 text-[#116B11]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <ul className="space-y-2 mb-4">
                  {category.articles.slice(0, 3).map((article, i) => (
                    <li key={i}>
                      <a href={category.link} className="text-sm text-gray-600 hover:text-[#116B11] flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" />
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
                <a
                  href={category.link}
                  className="text-[#116B11] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  View all articles <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Popular Articles */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#116B11]" />
                Popular Articles
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
                {popularArticles.map((article, index) => (
                  <a
                    key={index}
                    href="/docs"
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-900 hover:text-[#116B11]">{article.title}</span>
                    <span className="text-sm text-gray-500">{article.views}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-[#116B11]" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === index ? 'rotate-90' : ''}`}
                      />
                    </button>
                    {openFaq === index && (
                      <div className="px-4 pb-4 text-gray-600 text-sm">{faq.answer}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-xl text-gray-600">Our support team is here for you 24/7</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <a
              href="/contact"
              className="bg-gray-50 rounded-xl p-6 text-center hover:bg-green-50 transition-colors group"
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                <MessageCircle className="w-7 h-7 text-[#116B11]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600">Chat with our team in real-time</p>
              <span className="text-[#116B11] text-sm font-medium mt-2 inline-block">Available 24/7</span>
            </a>

            <a
              href="mailto:support@schoolexa.com"
              className="bg-gray-50 rounded-xl p-6 text-center hover:bg-green-50 transition-colors group"
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                <Mail className="w-7 h-7 text-[#116B11]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
              <p className="text-sm text-gray-600">support@schoolexa.com</p>
              <span className="text-[#116B11] text-sm font-medium mt-2 inline-block">Response within 2 hours</span>
            </a>
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
