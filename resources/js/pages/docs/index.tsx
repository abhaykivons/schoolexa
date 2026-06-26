import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';
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
  Search,
  GraduationCap,
  Users,
  Bell,
  Home,
  Zap,
  BookOpen,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  articles: { id: string; title: string; description: string }[];
}

const sections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics and get up and running quickly',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-500',
    articles: [
      { id: 'introduction', title: 'Introduction', description: 'Overview of SchoolExa and its features' },
      { id: 'quick-start', title: 'Quick Start Guide', description: 'Complete setup guide including all configurations' },
    ],
  },
  {
    id: 'student-management',
    title: 'Student Management',
    description: 'Manage admissions, enrollments, and students',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
    articles: [
      { id: 'student-admission', title: 'Student Admission', description: 'Handle new student applications' },
      { id: 'enrollment-management', title: 'Managing Enrollments', description: 'Track and manage student enrollments' },
    ],
  },
  {
    id: 'staff-management',
    title: 'Staff Management',
    description: 'Onboard staff and manage roles',
    icon: <Users className="w-6 h-6" />,
    color: 'from-violet-500 to-purple-500',
    articles: [
      { id: 'staff-onboarding', title: 'Staff Onboarding', description: 'Add and configure staff members' },
      { id: 'roles-permissions', title: 'Roles & Permissions', description: 'Control access with role-based permissions' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure emails and notification workflows',
    icon: <Bell className="w-6 h-6" />,
    color: 'from-rose-500 to-pink-500',
    articles: [
      { id: 'email-templates', title: 'Email Templates', description: 'Customize your email communications' },
      { id: 'notification-flows', title: 'Notification Flows', description: 'Automate notifications for events' },
    ],
  },
  {
    id: 'parent-portal',
    title: 'Parent Portal',
    description: 'Guide for parents using the system',
    icon: <Home className="w-6 h-6" />,
    color: 'from-sky-500 to-indigo-500',
    articles: [
      { id: 'parent-registration', title: 'Parent Registration', description: 'How parents create accounts' },
      { id: 'submitting-forms', title: 'Submitting Forms', description: 'Guide to submitting admission forms' },
    ],
  },
];

export default function DocsIndex() {
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections
      .map((s) => ({
        ...s,
        articles: s.articles.filter(
          (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.articles.length > 0 || s.title.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Head title="Documentation - SchoolExa" />

      {/* Main Header */}
      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Documentation
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Learn how to use
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> SchoolExa</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Everything you need to know about managing your school efficiently. 
              From student admissions to staff management, we've got you covered.
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl text-lg shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sections Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.map((section) => (
            <div
              key={section.id}
              className="group bg-white rounded-2xl border border-slate-200/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden"
            >
              {/* Section Header */}
              <div className={`p-6 bg-gradient-to-r ${section.color}`}>
                <div className="flex items-center gap-3 text-white">
                  {section.icon}
                  <h2 className="text-lg font-bold">{section.title}</h2>
                </div>
                <p className="text-white/90 text-sm mt-2">{section.description}</p>
              </div>

              {/* Articles */}
              <div className="p-4">
                {section.articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/docs/${section.id}/${article.id}`}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group/item"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover/item:text-green-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{article.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover/item:text-green-600 group-hover/item:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
            <p className="text-slate-500 mb-6">We couldn't find anything matching "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')} 
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
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
