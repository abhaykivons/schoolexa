import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 p-4 bg-slate-200">
            {/* Left Side - Signup Form */}
            <div className="flex flex-col justify-center px-6 py-12 sm:px-8 lg:px-12">
                    <div 
                    className="absolute inset-0 z-0 opacity-60"
                    style={{
                        backgroundImage: `
                            linear-gradient(190deg,rgba(0, 0, 0, 0.1) 2px, transparent 1px),
                            linear-gradient(100deg, rgba(0, 0, 0, 0.1) 2px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                ></div>
                <div className="w-full max-w-md mx-auto bg-white shadow-xl rounded-4xl p-6 z-50 ">
                    {/* Logo */}
                    <div className="mb-4 flex justify-center">
                        <Link href="/" className="flex flex-col gap-2 font-medium">
                            <div className="flex">
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <svg width="72" height="49" viewBox="0 0 72 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M60 24.5H48C48 5.7 64 0.333333 72 0V12C62.4 12 60 20.3333 60 24.5Z" fill="#116B11" />
                                    <path d="M60 24.5H72C72 43.3 56 48.6667 48 49V37C57.6 37 60 28.6667 60 24.5Z" fill="#116B11" />
                                    <path d="M36 24.5H24C24 5.7 40 0.333333 48 0V12C38.4 12 36 20.3333 36 24.5Z" fill="#47A747" />
                                    <path d="M36 24.5H48C48 43.3 32 48.6667 24 49V37C33.6 37 36 28.6667 36 24.5Z" fill="#47A747" />
                                    <path d="M12 24.5H0C0 5.7 16 0.333333 24 0V12C14.4 12 12 20.3333 12 24.5Z" fill="#89CD89" />
                                    <path d="M12 24.5H24C24 43.3 8 48.6667 0 49V37C9.6 37 12 28.6667 12 24.5Z" fill="#89CD89" />
                                    </svg>
                                </div> 
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="mb-8 flex flex-col items-center text-center">
                        <h1 className="text-2xl font- text-black mb-2">
                            {title || "Get Started Now"}
                        </h1>
                        <p className="text-auth-text-muted text-black text-xs">
                            {description || "Enter your credentials to access your account"}
                        </p>
                    </div>

                    {children}
                </div>
                <p className="text-center text-sm text-black mt-12">Copyright © 2022-2025 SchoolExa. All rights reserved.</p>
            </div>

            {/* Right Side - Promotional Content */}
            <div className="hidden lg:flex bg-[#47A747] relative overflow-hidden rounded-4xl">
                {/* Green Grid Background */}
                <div 
                    className="absolute inset-0 z-0 opacity-60"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                ></div>
                
                <div className="flex flex-col justify-center px-12 py-16 text-auth-promo-text relative z-10 w-full">
                    <div className="max-w-md mx-auto items-center text-center text-white">
                        <h2 className="text-2xl font-light mb-4 leading-tight">
                            Empower Educators, Engage Students, Simplify School Management
                        </h2>
                        <div className="w-full h-80 overflow-hidden">
                            <iframe src="https://lottie.host/embed/15e62eca-b63e-4b03-a287-b7beaa284010/E45Y0y90R5.lottie" className="w-full h-full"></iframe>
                        </div>
                        
                        {/* Attractive Footer Section */}
                        <div className="mt-6 space-y-6">
                            {/* Feature Highlights */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="text-sm text-white/90">Secure & Encrypted</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-sm text-white/90">Lightning Fast</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="text-sm text-white/90">Team Collaboration</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span className="text-sm text-white/90">24/7 Support</span>
                                </div>
                            </div>
                            
                            {/* Subtle CTA */}
                            <div className="pt-4 border-white/10">
                                <p className="text-xs text-white/70 tracking-wide">
                                    Join schools worldwide that transformed their workforce management
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-32 -translate-y-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full transform -translate-x-24 translate-y-24"></div>
            </div>
            
        </div>
    );
}