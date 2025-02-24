import React from 'react';
import { Layout, Twitter, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Layout className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">FlatMag</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Transform your magazine planning process with our intuitive flat plan editor.
              Save time, reduce errors, and collaborate seamlessly.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/flat-plan" className="text-gray-400 hover:text-white">
                  Editor
                </Link>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-white">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-white">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} FlatMag. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}