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
  Target,
  Heart,
  Lightbulb,
  Globe,
  Shield,
  Zap,
  Users,
  Quote,
  Linkedin,
  Twitter,
  Briefcase,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

// Team members
const teamMembers = [
  {
    name: 'Dr. Sarah Mitchell',
    role: 'CEO & Co-Founder',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
    bio: 'Former school principal with 20+ years in education. Passionate about transforming how schools operate.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Michael Chen',
    role: 'CTO & Co-Founder',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    bio: 'Tech veteran from Google and Microsoft. Building the future of education technology.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Emily Rodriguez',
    role: 'VP of Product',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    bio: 'Product leader focused on creating intuitive experiences for educators and administrators.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'David Kim',
    role: 'VP of Engineering',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    bio: 'Engineering leader passionate about building scalable, secure solutions for education.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Lisa Thompson',
    role: 'VP of Customer Success',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=300&fit=crop&crop=face',
    bio: 'Dedicated to ensuring every school succeeds with SchoolExa. Former district administrator.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'James Wilson',
    role: 'VP of Sales',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    bio: 'Helping schools discover the power of modern management software.',
    linkedin: '#',
    twitter: '#',
  },
];

// Company values
const values = [
  {
    icon: Heart,
    title: 'Student First',
    description: 'Every decision we make is guided by what\'s best for students. Their success is our mission.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We constantly push boundaries to create better solutions for the education sector.',
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'Schools trust us with sensitive data. We take that responsibility seriously.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'We work closely with educators to build tools that truly meet their needs.',
  },
  {
    icon: Zap,
    title: 'Simplicity',
    description: 'Powerful doesn\'t have to mean complicated. We make complex tasks simple.',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description: 'Education is for everyone. Our tools are designed to be inclusive and accessible.',
  },
];

// Timeline / Milestones
const milestones = [
  { year: '2019', title: 'Founded', description: 'SchoolExa was born from a simple idea: make school management easier.' },
  { year: '2020', title: 'First 50 Schools', description: 'Launched our platform and quickly gained traction with schools nationwide.' },
  { year: '2022', title: '200+ Schools', description: 'Expanded features and reached a major milestone in school adoption.' },
  { year: '2023', title: 'Parent Portal Launch', description: 'Introduced our game-changing parent communication platform.' },
  { year: '2024', title: '500+ Schools', description: 'Now serving over 1 million students across the United States.' },
];

export default function About() {
  const [freeTrialOpen, setFreeTrialOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const freeTrialForm = useForm({
    name: '',
    email: '',
    phone: '',
    school_name: '',
    school_size: '',
    role: '',
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
        title="About Us - SchoolExa"
        description="Learn about SchoolExa's mission to empower schools with modern management software. Meet our team, discover our values, and see how we're transforming education administration."
        keywords="SchoolExa about, school management company, education technology, school ERP company, SIS provider USA"
        breadcrumbs={[
          { name: "Home", url: "https://schoolexa.com" },
          { name: "About Us", url: "https://schoolexa.com/about" }
        ]}
      />

      {/* Header */}
      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
              <Target className="w-4 h-4" />
              Our Mission
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Empowering Schools to <span className="text-[#116B11]">Focus on What Matters</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We believe every educator deserves powerful tools that simplify their work, so they can spend more time inspiring the next generation.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#116B11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-green-200">Schools Served</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">1M+</div>
              <div className="text-green-200">Students Managed</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-green-200">Team Members</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">5</div>
              <div className="text-green-200">Years of Innovation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 text-lg">
              <p>
                SchoolExa was founded in 2019 by Abhay Patel with a simple but bold idea: school management could be far better than it was. At the time, many schools were struggling with outdated, disconnected tools that created more administrative burden than value.
              </p>
              <p>
                Without coming from a traditional education leadership background, Abhay approached the problem as an outsider—questioning existing systems and focusing on real challenges faced by teachers and administrators. By listening closely, learning continuously, and building alongside real users, SchoolExa evolved into a modern, reliable platform designed to help schools focus more on education and less on administration.
              </p>
            </div>
          </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-emerald-50 rounded-3xl p-8">
                <Quote className="w-12 h-12 text-[#116B11] mb-6" />
                <p className="text-xl text-gray-700 italic mb-6">
                  "We started SchoolExa because we believe educators deserve tools as dedicated as they are. Every feature we build is guided by a simple question: will this help schools focus on their students?"
                </p>
                {/* <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                    alt="Dr. Sarah Mitchell"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Dr. Sarah Mitchell</div>
                    <div className="text-gray-500">CEO & Co-Founder</div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7 text-[#116B11]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">From startup to industry leader</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-green-200 hidden lg:block" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <span className="text-[#116B11] font-bold text-lg">{milestone.year}</span>
                      <h3 className="text-xl font-bold text-gray-900 mt-1">{milestone.title}</h3>
                      <p className="text-gray-600 mt-2">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#116B11] rounded-full hidden lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Leadership Team</h2>
            <p className="text-xl text-gray-600">The people behind SchoolExa's success</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-[#116B11] font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                <div className="flex justify-center gap-3">
                  <a href={member.linkedin} className="p-2 bg-gray-100 rounded-lg hover:bg-[#116B11] hover:text-white transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href={member.twitter} className="p-2 bg-gray-100 rounded-lg hover:bg-[#116B11] hover:text-white transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-24 bg-[#116B11]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Join Our Mission?</h2>
          <p className="text-xl text-green-100 mb-8">
            Whether you're a school looking for better tools or a talented individual who wants to make a difference in education, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-[#116B11] hover:bg-green-50"
              onClick={() => setFreeTrialOpen(true)}
            >
              Explore Our Platform <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" className="border-white text-white hover:bg-white/10" asChild>
              <a href="/careers">
                <Briefcase className="w-5 h-5 mr-2" /> View Open Positions
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
