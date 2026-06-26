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
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Server,
  Database,
  Globe,
  Mail,
  Smartphone,
  Shield,
  Loader2,
  X,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/main-pages/PageHeader';
import PageFooter from '@/components/main-pages/PageFooter';

// Service status types
type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

// Services
const services: { name: string; status: ServiceStatus; description: string; icon: React.ElementType }[] = [
  { name: 'Web Application', status: 'operational', description: 'Main web platform', icon: Globe },
  { name: 'API Services', status: 'operational', description: 'REST API endpoints', icon: Server },
  { name: 'Database', status: 'operational', description: 'Primary data storage', icon: Database },
  { name: 'Authentication', status: 'operational', description: 'Login & SSO services', icon: Shield },
  { name: 'Email Services', status: 'operational', description: 'Notifications & alerts', icon: Mail },
  { name: 'Mobile Apps', status: 'operational', description: 'iOS & Android apps', icon: Smartphone },
];

// Uptime stats
const uptimeStats = [
  { period: 'Today', uptime: '100%' },
  { period: 'Last 7 Days', uptime: '99.99%' },
  { period: 'Last 30 Days', uptime: '99.98%' },
  { period: 'Last 90 Days', uptime: '99.97%' },
];

// Incident history
const incidents = [
  {
    date: 'January 5, 2025',
    title: 'Scheduled Maintenance',
    status: 'completed',
    description: 'Routine database maintenance and security updates. No user impact.',
    duration: '2 hours',
  },
  {
    date: 'December 28, 2024',
    title: 'API Performance Degradation',
    status: 'resolved',
    description: 'Some users experienced slower response times. Issue identified and resolved.',
    duration: '45 minutes',
  },
  {
    date: 'December 15, 2024',
    title: 'Scheduled Maintenance',
    status: 'completed',
    description: 'Infrastructure upgrades to improve performance and reliability.',
    duration: '3 hours',
  },
];

// Upcoming maintenance
const upcomingMaintenance = [
  {
    date: 'January 20, 2025',
    time: '2:00 AM - 4:00 AM EST',
    title: 'Infrastructure Updates',
    description: 'Planned server upgrades to enhance performance.',
    impact: 'Minimal - Brief intermittent access issues possible',
  },
];

const getStatusColor = (status: ServiceStatus) => {
  switch (status) {
    case 'operational':
      return 'bg-green-500';
    case 'degraded':
      return 'bg-yellow-500';
    case 'outage':
      return 'bg-red-500';
    case 'maintenance':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusIcon = (status: ServiceStatus) => {
  switch (status) {
    case 'operational':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'degraded':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'outage':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'maintenance':
      return <Clock className="w-5 h-5 text-blue-500" />;
    default:
      return <CheckCircle2 className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusText = (status: ServiceStatus) => {
  switch (status) {
    case 'operational':
      return 'Operational';
    case 'degraded':
      return 'Degraded Performance';
    case 'outage':
      return 'Service Outage';
    case 'maintenance':
      return 'Under Maintenance';
    default:
      return 'Unknown';
  }
};

export default function Status() {
  const [freeTrialOpen, setFreeTrialOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState('');

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('You\'ve been subscribed to status updates!');
    setSubscribeEmail('');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Calculate overall status
  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="System Status - SchoolExa"
        description="Check the current status of SchoolExa services. View real-time system health, uptime statistics, and incident history."
        keywords="SchoolExa status, school software uptime, SchoolExa system status"
        breadcrumbs={[
          { name: 'Home', url: 'https://schoolexa.com' },
          { name: 'Status', url: 'https://schoolexa.com/status' },
        ]}
      />

      <PageHeader onStartTrial={() => setFreeTrialOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-[#116B11] text-sm font-medium mb-6">
            <Activity className="w-4 h-4" />
            System Status
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            SchoolExa Status
          </h1>

          {/* Overall Status Banner */}
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${allOperational ? 'bg-green-100' : 'bg-yellow-100'}`}>
            {allOperational ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="text-lg font-semibold text-green-800">All Systems Operational</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <span className="text-lg font-semibold text-yellow-800">Some Systems Experiencing Issues</span>
              </>
            )}
          </div>

          <p className="text-gray-500 text-sm mt-4">
            Last updated: {new Date().toLocaleString()}
            <button className="ml-2 text-[#116B11] hover:underline inline-flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </p>
        </div>
      </section>

      {/* Uptime Stats */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {uptimeStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-[#116B11] mb-1">{stat.uptime}</div>
                <div className="text-gray-600 text-sm">{stat.period}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Status */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Status</h2>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {services.map((service, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 ${index !== services.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <span className={`text-sm font-medium ${service.status === 'operational' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {getStatusText(service.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap gap-6 mt-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Outage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Maintenance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Maintenance */}
      {upcomingMaintenance.length > 0 && (
        <section className="py-12 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Scheduled Maintenance
            </h2>

            <div className="space-y-4">
              {upcomingMaintenance.map((maintenance, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-blue-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{maintenance.title}</h3>
                      <p className="text-sm text-gray-500">{maintenance.date} • {maintenance.time}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full w-fit">
                      Scheduled
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{maintenance.description}</p>
                  <p className="text-sm text-gray-500">
                    <strong>Expected Impact:</strong> {maintenance.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Incident History */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Incidents</h2>

          <div className="space-y-4">
            {incidents.map((incident, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{incident.title}</h3>
                    <p className="text-sm text-gray-500">{incident.date} • Duration: {incident.duration}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full w-fit ${
                    incident.status === 'resolved' || incident.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {incident.status === 'completed' ? 'Completed' : 'Resolved'}
                  </span>
                </div>
                <p className="text-gray-600">{incident.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline">View All Incidents</Button>
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Bell className="w-12 h-12 text-[#116B11] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscribe to Status Updates</h2>
          <p className="text-gray-600 mb-6">
            Get notified via email when there are incidents or scheduled maintenance.
          </p>

          <form onSubmit={handleSubscribe} className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" className="bg-[#116B11] hover:bg-[#0d5a0d]">
              Subscribe
            </Button>
          </form>
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
