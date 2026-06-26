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
  MapPin,
  Clock,
  Briefcase,
  Heart,
  Coffee,
  Plane,
  GraduationCap,
  Users,
  Zap,
  Building2,
  DollarSign,
  Laptop,
  Baby,
  Dumbbell,
  ChevronRight,
  Loader2,
  CheckCircle2,
  X,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

// Job openings
const jobs = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Build scalable features for our school management platform using React, Laravel, and PostgreSQL.',
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Create intuitive user experiences for educators and administrators.',
  },
  {
    id: 3,
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Help schools succeed with SchoolExa through onboarding, training, and ongoing support.',
  },
  {
    id: 4,
    title: 'Sales Development Representative',
    department: 'Sales',
    location: 'Austin, TX',
    type: 'Full-time',
    description: 'Connect with schools and districts to introduce them to SchoolExa.',
  },
  {
    id: 5,
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Maintain and improve our infrastructure for reliability and scale.',
  },
  {
    id: 6,
    title: 'Content Marketing Manager',
    department: 'Marketing',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Create compelling content that helps schools discover and understand SchoolExa.',
  },
];

// Benefits
const benefits = [
  { icon: DollarSign, title: 'Competitive Salary', description: 'Top-of-market compensation packages' },
  { icon: Laptop, title: 'Remote-First', description: 'Work from anywhere in the US' },
  { icon: Heart, title: 'Health Insurance', description: '100% covered medical, dental, vision' },
  { icon: Plane, title: 'Unlimited PTO', description: 'Take the time you need to recharge' },
  { icon: Baby, title: 'Parental Leave', description: '16 weeks paid for all parents' },
  { icon: GraduationCap, title: 'Learning Budget', description: '$2,000/year for professional development' },
  { icon: Coffee, title: 'Home Office Stipend', description: '$1,000 to set up your workspace' },
  { icon: Dumbbell, title: 'Wellness Program', description: '$100/month fitness reimbursement' },
];

// Company values
const values = [
  {
    icon: Heart,
    title: 'Mission-Driven',
    description: 'We\'re passionate about improving education. Every line of code, every design decision, every customer conversation moves us closer to that goal.',
  },
  {
    icon: Users,
    title: 'Collaborative',
    description: 'We believe the best ideas come from diverse perspectives. We work together across teams to solve problems and celebrate wins.',
  },
  {
    icon: Zap,
    title: 'Move Fast',
    description: 'Education can\'t wait. We ship quickly, learn from feedback, and iterate. We\'re not afraid to try new things.',
  },
  {
    icon: Building2,
    title: 'Own Your Impact',
    description: 'Everyone at SchoolExa has real ownership and makes meaningful contributions. Your work directly impacts millions of students.',
  },
];

export default function Careers() {
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [freeTrialOpen, setFreeTrialOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<typeof jobs[0] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const applicationForm = useForm({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    cover_letter: '',
    job_title: '',
    job_department: '',
  });

  const resumeForm = useForm({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
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

  const handleApplyClick = (job: typeof jobs[0]) => {
    setSelectedJob(job);
    applicationForm.setData('job_title', job.title);
    applicationForm.setData('job_department', job.department);
    setApplyModalOpen(true);
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applicationForm.post('/leads/contact-sales', {
      onSuccess: () => {
        setApplyModalOpen(false);
        setSelectedJob(null);
        setSuccessMessage(`Your application for ${selectedJob?.title} has been submitted! We'll review it and get back to you soon.`);
        applicationForm.reset();
        setTimeout(() => setSuccessMessage(null), 5000);
      },
    });
  };

  const handleResumeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resumeForm.post('/leads/contact-sales', {
      onSuccess: () => {
        setResumeModalOpen(false);
        setSuccessMessage('Your resume has been submitted! We\'ll keep you in mind for future opportunities.');
        resumeForm.reset();
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
        title="Careers - Join SchoolExa"
        description="Join our team at SchoolExa. We're hiring for engineering, design, customer success, sales, and more. Build the future of education technology with us."
        keywords="SchoolExa careers, EdTech jobs, school software jobs, education technology careers, remote jobs education"
        breadcrumbs={[
          { name: "Home", url: "https://schoolexa.com" },
          { name: "Careers", url: "https://schoolexa.com/careers" }
        ]}
      />

      {/* Header */}
      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4" />
              We're Hiring!
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Build the Future of <span className="text-[#116B11]">Education Technology</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join our mission to empower schools with powerful, intuitive tools. Help us make a difference in the lives of millions of students.
            </p>
            <Button size="lg" className="bg-[#116B11] hover:bg-[#0d5a0d] text-white" asChild>
              <a href="#openings">
                View Open Positions <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#116B11] mb-2">50+</div>
              <div className="text-gray-600">Team Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#116B11] mb-2">8</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#116B11] mb-2">70%</div>
              <div className="text-gray-600">Remote Workers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#116B11] mb-2">4.8/5</div>
              <div className="text-gray-600">Glassdoor Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Culture & Values</h2>
            <p className="text-xl text-gray-600">What it's like to work at SchoolExa</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7 text-[#116B11]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-lg">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Benefits & Perks</h2>
            <p className="text-xl text-gray-600">We take care of our team so they can take care of our customers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:bg-green-50 transition-colors">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <benefit.icon className="w-6 h-6 text-[#116B11]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="openings" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-xl text-gray-600">Find your next opportunity at SchoolExa</p>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-lg transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#116B11] transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{job.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <Briefcase className="w-4 h-4" /> {job.department}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" /> {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" /> {job.type}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Button 
                      onClick={() => handleApplyClick(job)}
                      className="bg-[#116B11] hover:bg-[#0d5a0d] text-white group-hover:shadow-lg transition-shadow"
                    >
                      Apply Now <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#116B11]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Don't See the Right Role?</h2>
          <p className="text-xl text-green-100 mb-8">
            We're always looking for talented people. Send us your resume and we'll keep you in mind for future openings.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-[#116B11] hover:bg-green-50"
            onClick={() => setResumeModalOpen(true)}
          >
            Send Your Resume <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
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

      {/* Apply Modal */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              {selectedJob?.department} • {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplicationSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Full Name *</Label>
                <Input
                  id="app-name"
                  placeholder="John Smith"
                  value={applicationForm.data.name}
                  onChange={(e) => applicationForm.setData('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-email">Email *</Label>
                <Input
                  id="app-email"
                  type="email"
                  placeholder="john@example.com"
                  value={applicationForm.data.email}
                  onChange={(e) => applicationForm.setData('email', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-phone">Phone Number</Label>
                <Input
                  id="app-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={applicationForm.data.phone}
                  onChange={(e) => applicationForm.setData('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-linkedin">LinkedIn URL</Label>
                <Input
                  id="app-linkedin"
                  placeholder="linkedin.com/in/yourprofile"
                  value={applicationForm.data.linkedin}
                  onChange={(e) => applicationForm.setData('linkedin', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-portfolio">Portfolio/Website URL</Label>
              <Input
                id="app-portfolio"
                placeholder="https://yourportfolio.com"
                value={applicationForm.data.portfolio}
                onChange={(e) => applicationForm.setData('portfolio', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-cover">Cover Letter / Why do you want to join? *</Label>
              <Textarea
                id="app-cover"
                placeholder="Tell us why you're excited about this role..."
                value={applicationForm.data.cover_letter}
                onChange={(e) => applicationForm.setData('cover_letter', e.target.value)}
                rows={4}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#116B11] hover:bg-[#0d5a0d]"
              disabled={applicationForm.processing}
            >
              {applicationForm.processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resume Modal */}
      <Dialog open={resumeModalOpen} onOpenChange={setResumeModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Send Your Resume</DialogTitle>
            <DialogDescription>
              We'll keep your information on file for future opportunities.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResumeSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resume-name">Full Name *</Label>
                <Input
                  id="resume-name"
                  placeholder="John Smith"
                  value={resumeForm.data.name}
                  onChange={(e) => resumeForm.setData('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resume-email">Email *</Label>
                <Input
                  id="resume-email"
                  type="email"
                  placeholder="john@example.com"
                  value={resumeForm.data.email}
                  onChange={(e) => resumeForm.setData('email', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resume-phone">Phone Number</Label>
                <Input
                  id="resume-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={resumeForm.data.phone}
                  onChange={(e) => resumeForm.setData('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resume-linkedin">LinkedIn URL *</Label>
                <Input
                  id="resume-linkedin"
                  placeholder="linkedin.com/in/yourprofile"
                  value={resumeForm.data.linkedin}
                  onChange={(e) => resumeForm.setData('linkedin', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume-message">Tell us about yourself *</Label>
              <Textarea
                id="resume-message"
                placeholder="What roles are you interested in? What's your experience?"
                value={resumeForm.data.message}
                onChange={(e) => resumeForm.setData('message', e.target.value)}
                rows={4}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#116B11] hover:bg-[#0d5a0d]"
              disabled={resumeForm.processing}
            >
              {resumeForm.processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Resume
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
