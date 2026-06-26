import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, CheckCircle, ArrowRight, Users, Bell } from 'lucide-react';

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      toast.success('Welcome to the waitlist!');
    }, 500);
  };

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-float"></div>
      <div className="absolute top-40 right-32 w-6 h-6 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-white/15 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center text-white animate-scale-in">
          {!isSubmitted ? (
            <>
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm p-6 rounded-full border border-white/20">
                    <Mail className="h-16 w-16 text-white animate-bounce" />
                  </div>
                </div>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Be the
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200"> First</span>
                <br />
                to Know!
              </h2>

              <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto mb-12 leading-relaxed">
                Join our exclusive waitlist and get early access to SchoolExa when we launch in just
                <span className="font-bold text-blue-200"> 60 days</span>!
              </p>

              {/* Stats */}
              <div className="flex justify-center items-center space-x-8 mb-12 opacity-80">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span className="text-sm">1,247+ Schools Interested</span>
                </div>
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  <span className="text-sm">Early Bird Benefits</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-14 text-lg bg-white/90 border-0 focus:ring-2 focus:ring-blue-400 text-slate-900 placeholder:text-slate-500"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg min-w-[160px] group transition-all duration-300 transform hover:scale-105"
                  >
                    Join Waitlist
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-center mt-6 opacity-75">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="ml-3 text-sm">Join 1,247+ educators already waiting</span>
                </div>
              </form>
            </>
          ) : (
            <div className="animate-fade-in">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400/50 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-green-500/20 backdrop-blur-sm p-6 rounded-full border border-green-400/30">
                    <CheckCircle className="h-16 w-16 text-green-300" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                🎉 You're on the list!
              </h3>
              <p className="text-xl opacity-90 max-w-lg mx-auto">
                We'll notify you as soon as SchoolExa is ready to transform your school management experience.
              </p>
              
              <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-md mx-auto">
                <p className="text-sm opacity-80">
                  🚀 <strong>What's next?</strong><br />
                  You'll receive exclusive updates, early access, and special launch pricing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Waitlist;