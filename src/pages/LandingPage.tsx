import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { MetaTags } from '../components/MetaTags';
import {
  Layout,
  Clock,
  Users,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  FileText,
  PenTool,
  Share2
} from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Editor-in-Chief, Style Magazine',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    content: 'FlatPlan has revolutionized our editorial planning process. What used to take days now takes hours.'
  },
  {
    name: 'Michael Chen',
    role: 'Art Director, Tech Weekly',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    content: 'The visual layout tools are incredible. It\'s like having a digital art board that the whole team can access.'
  },
  {
    name: 'Emma Davis',
    role: 'Managing Editor, Lifestyle Quarterly',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    content: 'The collaboration features have made remote work with our global team seamless and efficient.'
  }
];

const brands = [
  {
    name: 'The Telegraph',
    logo: '/logos/telegraph.svg'
  },
  {
    name: 'Lufthansa',
    logo: '/logos/lufthansa.svg'
  },
  {
    name: 'Cosmopolitan',
    logo: '/logos/cosmopolitan.jpg'
  },
  {
    name: 'The London Standard',
    logo: '/logos/tls.webp'
  }
];

const features = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Smart Layout Planning',
    description: 'Intelligent page distribution and automatic content flow',
    examples: [
      'Automatic page number calculation based on content',
      'Smart visual placement with collision detection',
      'Dynamic word count distribution across pages'
    ]
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Team Collaboration',
    description: 'Real-time peer-to-peer collaboration without servers',
    examples: [
      'Instant article updates across all connected editors',
      'Visual indicators for concurrent editing',
      'No server required - works directly between browsers'
    ]
  },
  {
    icon: <PenTool className="w-6 h-6" />,
    title: 'Advanced Content Management',
    description: 'Comprehensive tools for content organization',
    examples: [
      'Tag-based content organization and filtering',
      'Visual size ratio management for images',
      'Multi-column layout support with dynamic text flow'
    ]
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: 'Seamless Sharing',
    description: 'Multiple ways to share and preview your work',
    examples: [
      'Interactive flipbook preview mode',
      'Shareable URLs with complete layout state',
      'Export capabilities for stakeholder review'
    ]
  }
];

const comparisons = [
  {
    traditional: 'Manual layout planning with spreadsheets',
    flatplan: 'Visual drag-and-drop interface'
  },
  {
    traditional: 'Time-consuming email updates',
    flatplan: 'Real-time collaboration'
  },
  {
    traditional: 'Scattered content across tools',
    flatplan: 'Centralized content hub'
  },
  {
    traditional: 'Complex revision process',
    flatplan: 'One-click updates and history'
  }
];

export function LandingPage() {
  const navigate = useNavigate();
  const { magazines } = useSelector((state: RootState) => state.magazineList);

  useEffect(() => {
    // If we have magazines, redirect to the magazine list
    if (magazines.length > 0) {
      navigate('/magazines');
    }
  }, [magazines, navigate]);

  return (
    <>
      <MetaTags />
      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Magazine Planning,{' '}
              <span className="text-blue-200">Simplified</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Transform your editorial workflow with our intuitive flat plan editor.
              Plan, collaborate, and publish with confidence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/magazines')}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors"
              >
                Try Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-white text-white font-medium hover:bg-white hover:text-blue-600 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join the world's most innovative publications and media companies
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center">
            {brands.map(brand => (
              <div
                key={brand.name}
                className="group relative aspect-[3/2] bg-white rounded-2xl p-8 flex items-center justify-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className={`relative max-h-16 w-auto object-contain transition-all duration-500 ${
                    brand.name === 'The London Standard'
                      ? 'brightness-0 opacity-40 group-hover:opacity-80'
                      : 'filter grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0'
                  }`}
                />
              </div>
            ))}
          </div>
          <p className="text-center text-lg text-gray-600 mt-12">
            Join over <span className="font-semibold text-blue-600">2,000+</span> publications worldwide
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to create the perfect flat plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your magazine planning process
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map(feature => (
              <div
                key={feature.title}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <div className="space-y-3">
                  {feature.examples.map((example, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Feature Demo Section */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              See It In Action
            </h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h4 className="text-lg font-semibold mb-4">Real-time Collaboration Demo</h4>
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&h=450"
                    alt="Real-time collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-gray-600">
                  Work together in real-time with your team using our peer-to-peer collaboration feature.
                  Changes sync instantly across all connected editors.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h4 className="text-lg font-semibold mb-4">Smart Layout System</h4>
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&h=450"
                    alt="Smart layout system"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-gray-600">
                  Our intelligent layout system automatically handles page distribution, content flow,
                  and visual placement while maintaining perfect balance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose FlatPlan?
            </h2>
            <p className="text-xl text-gray-600">
              See how FlatPlan transforms your workflow
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-red-600 mb-6">
                Traditional Method
              </h3>
              <ul className="space-y-4">
                {comparisons.map(item => (
                  <li
                    key={item.traditional}
                    className="flex items-start text-gray-600"
                  >
                    <span className="text-red-500 mr-3">✕</span>
                    {item.traditional}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-green-600 mb-6">
                With FlatPlan
              </h3>
              <ul className="space-y-4">
                {comparisons.map(item => (
                  <li
                    key={item.flatplan}
                    className="flex items-start text-gray-600"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    {item.flatplan}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Loved by editorial teams worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map(testimonial => (
              <div
                key={testimonial.name}
                className="bg-white p-8 rounded-xl shadow-sm"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600">{testimonial.content}</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              No subscriptions, no hidden fees
            </p>
          </div>
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-blue-600 p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-2">Lifetime Access</h3>
                <div className="text-5xl font-bold mb-4">€99</div>
                <p className="text-blue-100">One-time payment, forever access</p>
              </div>
              <div className="p-8">
                <ul className="space-y-4">
                  {[
                    'Unlimited magazines',
                    'All premium features',
                    'Free updates forever',
                    'Priority support',
                    'No recurring fees'
                  ].map(feature => (
                    <li key={feature} className="flex items-center text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/magazines"
                  className="mt-8 w-full inline-flex justify-center items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}