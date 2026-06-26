import React from 'react';
import { Users, UserCheck, MessageCircle, BarChart3, Server, Sparkles, Calendar, DollarSign, Shield, Bell, Heart, FileText, Clock, GraduationCap, BookOpen, Award, Phone, Settings, Eye, Lock, Activity, TrendingUp, Building } from 'lucide-react';

const Features = () => {
  const mainFeatures = [
    {
      icon: Users,
      title: 'Student Enrollment & Admission',
      description: 'Streamline student registration and onboarding with our intuitive enrollment system.',
      gradient: 'from-[#116B11] to-[#47a747]',
      delay: '100ms'
    },
    {
      icon: UserCheck,
      title: 'Staff & Teacher Management',
      description: 'Manage staff schedules, roles, and payroll effortlessly with comprehensive tools.',
      gradient: 'from-[#47a747] to-[#116B11]',
      delay: '200ms'
    },
    {
      icon: MessageCircle,
      title: 'Family Connect / Parent Portal',
      description: 'Connect families with real-time updates on student progress and school activities.',
      gradient: 'from-[#116B11] to-[#47a747]',
      delay: '300ms'
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Generate insights with powerful, easy-to-use reporting tools and dashboards.',
      gradient: 'from-[#116B11] to-[#47a747]',
      delay: '400ms'
    },
    {
      icon: Server,
      title: 'On-Premise Server Solution',
      description: 'Secure, dedicated on-site server installation for complete data control and privacy.',
      gradient: 'from-[#47a747] to-[#116B11]',
      delay: '500ms'
    },
    {
      icon: DollarSign,
      title: 'Finance, Fees & Billing',
      description: 'Comprehensive financial management with automated billing and payment tracking.',
      gradient: 'from-[#116B11] to-[#47a747]',
      delay: '600ms'
    }
  ];

  const additionalFeatures = [
    { icon: GraduationCap, title: 'Class & Grade Management', description: 'Organize classes, grades, and academic structures efficiently.' },
    { icon: BookOpen, title: 'Subject & Curriculum Management', description: 'Manage subjects, curricula, and educational content seamlessly.' },
    { icon: Calendar, title: 'Academic Year Management', description: 'Plan and organize academic years, terms, and scheduling.' },
    { icon: Clock, title: 'Attendance Management', description: 'Track student and staff attendance with automated systems.' },
    { icon: FileText, title: 'Leave & Substitute Management', description: 'Handle leave requests and substitute teacher assignments.' },
    { icon: DollarSign, title: 'Payroll Management', description: 'Automate payroll processing for all staff members.' },
    { icon: Shield, title: 'Discipline & Behavior Management', description: 'Track and manage student behavior and disciplinary actions.' },
    { icon: Award, title: 'After-School Activities & Clubs', description: 'Manage extracurricular activities and club memberships.' },
    { icon: TrendingUp, title: 'Polls & Elections', description: 'Conduct school polls and student government elections digitally.' },
    { icon: Building, title: 'Policy Center', description: 'Centralized hub for school policies and procedures.' },
    { icon: Bell, title: 'Event Scheduler & Calendar', description: 'Schedule and manage school events and important dates.' },
    { icon: Phone, title: 'Communication Center (App)', description: 'Unified communication platform for the school community.' },
    { icon: Heart, title: 'Health & Medical Records', description: 'Secure management of student health and medical information.' },
    { icon: Settings, title: 'Role & Permission Management', description: 'Configure user roles and access permissions granularly.' },
    { icon: Lock, title: 'FERPA & COPPA Ready', description: 'Designed to support educational privacy regulation requirements.' },
    { icon: Activity, title: 'Audit Logs & Activity Tracking', description: 'Comprehensive logging and tracking of all system activities.' }
  ];

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#116B11] rounded-full animate-ping"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-[#47A747] rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-[#116B11] rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-[#116B11] mr-3 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-[#116B11] font-semibold text-lg uppercase tracking-wider">Features</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Complete School Management
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#116B11] to-[#47A747] block"> Solution</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to manage your educational institution efficiently and effectively
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative"
              style={{ animationDelay: feature.delay }}
            >
              {/* Animated background glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500 transform group-hover:scale-110`}></div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 animate-fade-in-up">
                <div className="flex items-center justify-center w-16 h-16 mb-6 relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl transform group-hover:rotate-12 transition-transform duration-300`}></div>
                  <div className={`relative bg-gradient-to-r ${feature.gradient} rounded-2xl p-4 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#116B11] group-hover:to-[#47A747] transition-all duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                  {feature.description}
                </p>
                
                {/* Hover effect indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#116B11] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features Section */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-12 shadow-inner">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              And Much More...
            </h3>
            <p className="text-lg text-slate-600">
              Additional features to support every aspect of school management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="group bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
                <div className="flex items-center mb-3">
                  <div className="bg-gradient-to-r from-[#47A747] to-[#116B11] rounded-lg p-2 mr-3">
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm leading-tight">{feature.title}</h4>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;