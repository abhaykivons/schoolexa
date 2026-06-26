import { Head, useForm } from '@inertiajs/react';
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
  Download,
  FileText,
  Image,
  Newspaper,
  Quote,
  Calendar,
  Users,
  Mail,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

// Press releases
const pressReleases = [
  {
    date: 'December 15, 2024',
    title: 'SchoolExa Reaches 500+ Schools Milestone',
    excerpt: 'School management platform now serves over 1 million students across the United States.',
  },
  {
    date: 'October 8, 2024',
    title: 'SchoolExa Launches Advanced Analytics Dashboard',
    excerpt: 'New features help schools make data-driven decisions with real-time insights.',
  },
  {
    date: 'May 15, 2024',
    title: 'SchoolExa Introduces Parent Portal',
    excerpt: 'New communication platform strengthens the connection between schools and families.',
  },
];

// Media coverage
const mediaCoverage = [
  { outlet: 'EdTech Magazine', title: 'Top 10 School Management Platforms of 2024' },
  { outlet: 'Forbes', title: 'How SchoolExa is Revolutionizing K-12 Administration' },
  { outlet: 'Education Week', title: 'The Rise of Modern School Information Systems' },
];

// Company facts
const companyFacts = [
  { label: 'Founded', value: '2019' },
  { label: 'Headquarters', value: 'San Francisco, CA' },
  { label: 'Schools Served', value: '500+' },
  { label: 'Students Managed', value: '1M+' },
  { label: 'Team Size', value: '50+' },
];

export default function PressKit() {
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
      <Head title="Press Kit - SchoolExa" />

      {/* Header */}
      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <Newspaper className="w-4 h-4" />
              Press & Media
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Press Kit
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to tell the SchoolExa story. Download brand assets, get company facts, and find media resources.
            </p>
            <Button size="lg" className="bg-[#116B11] hover:bg-[#0d5a0d] text-white">
              <Download className="w-5 h-5 mr-2" />
              Download Full Press Kit
            </Button>
          </div>
        </div>
      </section>

      {/* Company Facts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Company Facts</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {companyFacts.map((fact, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="text-2xl font-bold text-[#116B11] mb-1">{fact.value}</div>
                <div className="text-sm text-gray-600">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boilerplate */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About SchoolExa</h2>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              SchoolExa is the leading school management platform designed for modern K-12 education. Founded in 2019, SchoolExa provides a comprehensive suite of tools that help schools streamline administration, enhance communication with parents, and make data-driven decisions.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Trusted by over 500 schools and managing more than 1 million students across the United States, SchoolExa combines powerful features with an intuitive interface that educators love. From student information systems to financial management, parent communication to analytics, SchoolExa is the all-in-one platform schools need to succeed.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Headquartered in San Francisco, California, SchoolExa is committed to the highest standards of data security and privacy, with practices designed to support FERPA, COPPA, and GDPR requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Brand Assets</h2>
            <p className="text-xl text-gray-600">Download our logos and brand materials</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:bg-green-50 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Image className="w-8 h-8 text-[#116B11]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Logo Package</h3>
              <p className="text-sm text-gray-500 mb-4">SVG, PNG, EPS formats</p>
              <Button variant="outline" size="sm" className="group-hover:bg-[#116B11] group-hover:text-white">
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:bg-green-50 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileText className="w-8 h-8 text-[#116B11]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Brand Guidelines</h3>
              <p className="text-sm text-gray-500 mb-4">Colors, typography, usage</p>
              <Button variant="outline" size="sm" className="group-hover:bg-[#116B11] group-hover:text-white">
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:bg-green-50 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Image className="w-8 h-8 text-[#116B11]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Product Screenshots</h3>
              <p className="text-sm text-gray-500 mb-4">High-resolution images</p>
              <Button variant="outline" size="sm" className="group-hover:bg-[#116B11] group-hover:text-white">
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:bg-green-50 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="w-8 h-8 text-[#116B11]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Team Photos</h3>
              <p className="text-sm text-gray-500 mb-4">Executive headshots</p>
              <Button variant="outline" size="sm" className="group-hover:bg-[#116B11] group-hover:text-white">
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Press Releases</h2>
            <p className="text-xl text-gray-600">The latest news from SchoolExa</p>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {pressReleases.map((release, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  {release.date}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-[#116B11] transition-colors">
                  {release.title}
                </h3>
                <p className="text-gray-600">{release.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Media Coverage</h2>
            <p className="text-xl text-gray-600">SchoolExa in the news</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {mediaCoverage.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors cursor-pointer">
                <Quote className="w-8 h-8 text-[#116B11] flex-shrink-0" />
                <div>
                  <div className="text-sm text-[#116B11] font-medium">{item.outlet}</div>
                  <div className="text-gray-900 font-semibold">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="py-24 bg-[#116B11]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Media Inquiries</h2>
          <p className="text-xl text-green-100 mb-8">
            For press inquiries, interviews, or additional information, please contact our PR team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#116B11] hover:bg-green-50" asChild>
              <a href="mailto:press@schoolexa.com">
                <Mail className="w-5 h-5 mr-2" />
                press@schoolexa.com
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
