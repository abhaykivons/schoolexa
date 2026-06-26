import React from 'react';
import { Twitter, Linkedin, Facebook, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            SchoolExa
          </h3>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Revolutionizing school management with innovative technology solutions.
          </p>
        </div>

        <div className="flex justify-center space-x-8 mb-12">
          <a
            href="https://twitter.com/schoolexa"
            className="p-3 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors duration-300 group"
            aria-label="Follow us on Twitter"
          >
            <Twitter className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </a>
          <a
            href="https://linkedin.com/company/schoolexa"
            className="p-3 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors duration-300 group"
            aria-label="Connect with us on LinkedIn"
          >
            <Linkedin className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </a>
          <a
            href="https://facebook.com/schoolexa"
            className="p-3 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors duration-300 group"
            aria-label="Like us on Facebook"
          >
            <Facebook className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </a>
          <a
            href="mailto:hello@schoolexa.com"
            className="p-3 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors duration-300 group"
            aria-label="Send us an email"
          >
            <Mail className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </a>
        </div>

        <div className="text-center">
          <div className="mb-4">
            <a
              href="mailto:hello@schoolexa.com"
              className="text-blue-400 hover:text-blue-300 transition-colors text-lg font-medium"
            >
              info@schoolexa.com
            </a>
          </div>
          <p className="text-slate-400 text-sm">
            © 2025 SchoolExa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;