import { Cloud, Server, Building2, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeploymentOptionsProps {
  onContactSales?: () => void;
  variant?: 'light' | 'dark';
  showCTA?: boolean;
}

const deploymentOptions = [
  {
    icon: Cloud,
    name: 'Cloud Hosted',
    tagline: 'Most Popular',
    description: 'Fully managed cloud solution with automatic updates, backups, and 99.9% uptime guarantee.',
    features: [
      'Zero infrastructure management',
      'Automatic updates & patches',
      'Daily backups with 30-day retention',
      'Global CDN for fast access',
      'Instant scalability',
      'Pay-as-you-grow pricing',
    ],
    bestFor: 'Best for: Most schools looking for hassle-free management',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    popular: true,
  },
  {
    icon: Server,
    name: 'On-Premises',
    tagline: 'Full Control',
    description: 'Deploy SchoolExa on your own servers with complete control over your data and infrastructure.',
    features: [
      'Complete data sovereignty',
      'Custom security policies',
      'No internet dependency',
      'Integration with local systems',
      'One-time license option',
      'Full administrative control',
    ],
    bestFor: 'Best for: Schools with strict data residency requirements',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    popular: false,
  },
  {
    icon: Building2,
    name: 'Private Dedicated',
    tagline: 'Enterprise Grade',
    description: 'Your own dedicated cloud instance with isolated resources and enhanced security.',
    features: [
      'Isolated dedicated servers',
      'Custom SLA agreements',
      'Enhanced security controls',
      'Dedicated support team',
      'Custom integrations',
      'White-label options',
    ],
    bestFor: 'Best for: Large districts & institutions with high compliance needs',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    popular: false,
  },
];

export function DeploymentOptions({ onContactSales, variant = 'light', showCTA = true }: DeploymentOptionsProps) {
  const isDark = variant === 'dark';

  return (
    <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
            isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-[#116B11]'
          }`}>
            <Server className="w-4 h-4" />
            Flexible Deployment
          </div>
          <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Deploy Your Way
          </h2>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose the deployment option that fits your school's infrastructure, 
            security requirements, and IT capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {deploymentOptions.map((option, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 border-2 transition-all hover:shadow-xl ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                  : `bg-white ${option.borderColor} hover:border-green-300`
              } ${option.popular ? 'ring-2 ring-[#116B11] ring-offset-2' : ''}`}
            >
              {option.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#116B11] text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center mb-6`}>
                <option.icon className="w-7 h-7 text-white" />
              </div>

              <div className="mb-4">
                <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {option.name}
                </h3>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {option.tagline}
                </span>
              </div>

              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {option.description}
              </p>

              <ul className="space-y-3 mb-6">
                {option.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#116B11] flex-shrink-0 mt-0.5" />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {option.bestFor}
              </div>
            </div>
          ))}
        </div>

        {showCTA && (
          <div className="text-center mt-12">
            <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Not sure which deployment option is right for you?
            </p>
            <Button 
              size="lg" 
              onClick={onContactSales}
              className="bg-[#116B11] hover:bg-[#0d5a0d] text-white"
            >
              Talk to Our Team <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

// Compact version for use in feature lists
export function DeploymentBadges() {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
        <Cloud className="w-4 h-4" />
        Cloud Hosted
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
        <Server className="w-4 h-4" />
        On-Premises
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
        <Building2 className="w-4 h-4" />
        Private Dedicated
      </div>
    </div>
  );
}

export default DeploymentOptions;
