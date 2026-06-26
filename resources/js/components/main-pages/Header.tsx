import { Button } from "@/components/ui/button"; // Using default ShadCN Button
import { ArrowRight, Play } from "lucide-react";
import HandWritingTabletVector from "@/components/main-pages/HandWritingTabletVector";
import ScrollAnimation from "@/components/main-pages/ScrollAnimation";

interface HeroSectionProps {
  onJoinWaitlist?: () => void;
  onExperienceDemo?: () => void;
}

const HeroSection = ({ onJoinWaitlist, onExperienceDemo }: HeroSectionProps) => {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 lg:py-20">
  {/* Background layers */}
  <div className="absolute inset-0 bg-gradient-mesh z-0" />
  <div className="absolute inset-0 bg-gradient-quantum opacity-30 z-10" />
  <div className="absolute inset-0 bg-grid-pattern opacity-22 z-20" />

  {/* Main content container */}
  <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-10 items-center pt-22">
      
      {/* Left content */}
      <ScrollAnimation direction="left">
        <div className="flex flex-col space-y-8 text-center lg:text-left">

          {/* Heading */}
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-quantum-shift">
              <span className="text-white drop-shadow-lg block mb-4">Empowering</span>
              <span className="block mb-4">
                <span className="text-white">Education,</span>{" "}<span className="text-black">Simplifying</span>
              </span>
              <span className="text-white drop-shadow-lg block">Management</span>
            </h1>
            <p className="text-base md:text-lg leading-relaxed text-foreground">
              Experience the future of education management with AI-driven insights, quantum-speed processing,
              and neural network integration. Your school deserves tomorrow's technology today.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <Button 
              size="lg" 
              onClick={onJoinWaitlist}
              className="group shadow-neon hover:bg-[#116B11]"
            >
              <span className="mr-2">Join Waitlist</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-all duration-300" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={onExperienceDemo}
              className="group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-125 transition-all duration-300" />
              <span>Experience Demo</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-6">
            {/* Example stat */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary-light border-2 border-background shadow-neon animate-pulse-glow">
                  <img
                    src="https://trust.laravel.com/images/certifications/ccpa.svg"
                    alt="CCPA"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-accent to-accent-light border-2 border-background shadow-3d" style={{ animationDelay: '0.2s' }}>
                  <img
                    src="https://trust.laravel.com/images/certifications/gdpr.svg"
                    alt="GDPR"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-accent to-accent-light border-2 border-background shadow-3d" style={{ animationDelay: '0.2s' }}>
                  <img
                    src="https://www.ardentprivacy.ai/assets/img/FREPA_act.png"
                    alt="FREPA"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <div className="ml-2">
                <div className="text-sm font-semibold text-foreground">10+ Standards Aligned</div>
                <div className="text-xs text-white">Connected Globally</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollAnimation>

      {/* Right image/vector */}
      <ScrollAnimation direction="right" delay={0.3}>
        <div className="w-full flex justify-center lg:justify-end">
          <img
                  src="/dashboard_main.png"
                  alt="Dashboard Preview"
                  className="w-full h-full object-cover rounded-lg
                            "
                />
          {/* <HandWritingTabletVector className="max-w-full h-auto" /> */}
        </div>
      </ScrollAnimation>
    </div>
  </div>
</section>

  );
};

export default HeroSection;
