import React from 'react';
import { ArrowRight, Play, User, Mail, Tent, WalletMinimal, MessagesSquare, Award, Quote  } from 'lucide-react';
import HandWritingTabletVector from './HandWritingTabletVector';
import { Button } from '../ui/button';
import { Card, CardContent } from "@/components/ui/card"

const IconDot = ({ x, y, Icon, color }) => (
  <g className="animated-dot">
    {/* Background circle */}
    <circle cx={x} cy={y} r="35" fill={color} />

    {/* Lucide Icon centered */}
    <foreignObject x={x - 17.5} y={y - 17.5} width="35" height="35">
      <div className="flex items-center justify-center w-full h-full">
        <Icon className="w-10 h-10 text-white" />
      </div>
    </foreignObject>
  </g>
);
const WorkManagement = () => {
  return (
    <>
      <style>
        {`
          @keyframes rotateDots {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .animated-dot {
            animation: rotateDots 20s linear infinite;
            transform-origin: 365.5px 330.5px;
          }
        `}
      </style>
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          
          {/* This section Is not responcive */}
          {/* First Content Block */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 mb-16 lg:mb-32 ">
            {/* Left Content */}
            <div className="flex-1 space-y-8 lg:space-y-16">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-3xl xl:text-4xl font-bold text-gray-900">
                  Best School Management Software in USA (K-12 ERP & SIS)
                </h2>
                <p className="text-base md:text-lg leading-relaxed text-foreground">
                  Running a school involves hundreds of tasks every day—from managing admissions and attendance to handling payroll and parent communication. Without the right tools, schools waste precious time on manual processes.
                </p>
                <p className="text-base md:text-lg leading-relaxed text-foreground">
                  That’s why we built SchoolExa: a cloud-based, school management software designed to support FERPA requirements, built exclusively for U.S. schools. With SchoolExa, you can manage students, staff, finance, academics, and communication—all from a single platform.
                </p>
              </div>
              
              <Button variant="outline" size="lg" className="group">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-125 transition-all duration-300" />
                  <span>Experience Demo</span>
              </Button>
            </div>

            {/* Right Image Container */}
            <div className="w-full lg:flex-1 relative">
              {/* Background pattern for visual interest */}
              <div className="inset-0">
                <HandWritingTabletVector/>
              </div>
            </div>
          </div>

          {/* Second Content Block */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
            {/* Right Content */}
            <div className="flex-1 space-y-8 lg:space-y-16">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  Why Choose{' '}
                  <span className="text-[#116B11] relative">
                    SchoolExa?
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#116B11]"></div>
                  </span>
                </h2>
                <p className="text-base md:text-lg leading-relaxed text-foreground">
                  Managing a school in today’s world isn’t easy. Administrators juggle admissions, attendance, compliance, staff management, finance, and parent communication—all while ensuring students get the best education. Many schools rely on outdated systems or multiple software tools that don’t connect, leading to inefficiency and frustration.
                </p>
                <p>Trusted by 100+ Schools.</p>
              </div>
              
              <Button variant="outline" size="lg" className="group">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-125 transition-all duration-300" />
                  <span>Experience Demo</span>
              </Button>
            </div>

            {/* Left SVG Illustration */}
            <div className="w-full lg:w-96 h-80 lg:h-96 relative">
              <svg 
                className="w-full h-full" 
              viewBox="-50 -50 810 761"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer dashed circle */}
                <circle 
                  cx="365.5" 
                  cy="330.5" 
                  r="329.5" 
                  stroke="#A7CEFC" 
                  strokeWidth="2" 
                  strokeDasharray="15 15"
                />
                
                {/* Inner dashed circle */}
                <circle 
                  cx="365.5" 
                  cy="330.5" 
                  r="192.5" 
                  stroke="#A7CEFC" 
                  strokeWidth="2" 
                  strokeDasharray="15 15"
                />
                
                {/* Colored dots around the circles with animations */}
                <IconDot x={35} y={331} Icon={Award} color="#00CA75" />
                <IconDot x={559} y={326} Icon={ArrowRight} color="#00CA75" />
                <IconDot x={366} y={524} Icon={User} color="#00CA75" />
                <IconDot x={172} y={331} Icon={Mail} color="#00CA75" />
                <IconDot x={172} y={603} Icon={Tent} color="#00CA75" />
                <IconDot x={599} y={106} Icon={WalletMinimal} color="#00CA75" />
                <IconDot x={675} y={436} Icon={MessagesSquare} color="#00CA75" />
                <IconDot x={367} y={137} Icon={WalletMinimal} color="#00CA75" />


                {/* <circle cx="35" cy="331" r="35" fill="#FF5758" className="animated-dot" />
                <circle cx="559" cy="326" r="34.5" fill="white" stroke="#EBEBEB" className="animated-dot" />
                <circle cx="366" cy="524" r="35" fill="#FFBF60" className="animated-dot" />
                <circle cx="172" cy="331" r="35" fill="#37A3FF" className="animated-dot" />
                <circle cx="172" cy="603" r="35" fill="#37A3FF" className="animated-dot" />
                <circle cx="599" cy="106" r="35" fill="#37A3FF" className="animated-dot" />
                <circle cx="675" cy="436" r="35" fill="#00CA75" className="animated-dot" />
                <circle cx="367" cy="137" r="35" fill="#00CA75" className="animated-dot" />
                <circle cx="175" cy="58" r="35" fill="#FFDC4D" className="animated-dot" /> */}
                
                {/* Central white circle with shadow */}
                <g filter="url(#filter1_d_66_994)">
                  <circle
                    cx="366"
                    cy="334"
                    r="75"
                    fill="white"
                  />
                </g>
                
                {/* Green logo elements inside the central box */}
                <path 
                  d="M397.701 338.427H382.736C382.736 314.982 402.69 308.289 412.666 307.874V322.839C400.694 322.839 397.701 333.231 397.701 338.427Z" 
                  fill="#116B11"
                />
                <path 
                  d="M397.702 338.428H412.667C412.667 361.873 392.714 368.566 382.737 368.981V354.016C394.709 354.016 397.702 343.624 397.702 338.428Z" 
                  fill="#116B11"
                />
                <path 
                  d="M367.772 338.427H352.807C352.807 314.982 372.76 308.289 382.737 307.874V322.839C370.765 322.839 367.772 333.231 367.772 338.427Z" 
                  fill="#47A747"
                />
                <path 
                  d="M367.772 338.428H382.737C382.737 361.873 362.784 368.566 352.807 368.981V354.016C364.779 354.016 367.772 343.624 367.772 338.428Z" 
                  fill="#47A747"
                />
                <path 
                  d="M337.841 338.427H322.876C322.876 314.982 342.829 308.289 352.806 307.874V322.839C340.834 322.839 337.841 333.231 337.841 338.427Z" 
                  fill="#89CD89"
                />
                <path 
                  d="M337.842 338.428H352.807C352.807 361.873 332.853 368.566 322.877 368.981V354.016C334.849 354.016 337.842 343.624 337.842 338.428Z" 
                  fill="#89CD89"
                />
                
                {/* Filter definitions */}
                <defs>
                  <filter 
                    id="filter1_d_66_994" 
                    x="266.999" 
                    y="238.998" 
                    width="198.001" 
                    height="198.001" 
                    filterUnits="userSpaceOnUse" 
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix 
                      in="SourceAlpha" 
                      type="matrix" 
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" 
                      result="hardAlpha"
                    />
                    <feMorphology 
                      radius="11" 
                      operator="erode" 
                      in="SourceAlpha" 
                      result="effect1_dropShadow_66_994"
                    />
                    <feOffset dy="4"/>
                    <feGaussianBlur stdDeviation="25"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix 
                      type="matrix" 
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend 
                      mode="normal" 
                      in2="BackgroundImageFix" 
                      result="effect1_dropShadow_66_994"
                    />
                    <feBlend 
                      mode="normal" 
                      in="SourceGraphic" 
                      in2="effect1_dropShadow_66_994" 
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
          
        </div>

        <div className="max-w-6xl mx-auto text-center space-y-12 pt-22">
        
        {/* Heading */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            The Results Schools Achieve with{" "}
            <span className="text-[#116B11]">SchoolExa</span>
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="text-3xl">⏳</div>
              <h3 className="font-semibold text-lg">40% Reduction</h3>
              <p className="text-sm text-muted-foreground">
                Teachers & staff spend less time on paperwork.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="text-3xl">📊</div>
              <h3 className="font-semibold text-lg">Improved Accuracy</h3>
              <p className="text-sm text-muted-foreground">
                Regulatory reports generated with one click.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="text-3xl">💬</div>
              <h3 className="font-semibold text-lg">95% Engagement</h3>
              <p className="text-sm text-muted-foreground">
                Parents stay informed with portals & instant notifications.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="text-3xl">💵</div>
              <h3 className="font-semibold text-lg">30% Cost Savings</h3>
              <p className="text-sm text-muted-foreground">
                Schools reduce expenses with a single integrated system.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </section>
    </>
  );
};

export default WorkManagement;
