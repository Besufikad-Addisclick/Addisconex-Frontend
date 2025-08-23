"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

// Validation rules - keep in sync with API
const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 50,
    required: true
  },
  email: {
    required: true
  },
  subject: {
    minLength: 5,
    maxLength: 100,
    required: true
  },
  message: {
    minLength: 10,
    maxLength: 1000,
    required: true
  }
};

interface ValidationErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Real-time validation
  const validateField = (name: string, value: string): string | undefined => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue && VALIDATION_RULES[name as keyof typeof VALIDATION_RULES]?.required) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    switch (name) {
      case 'name':
        if (trimmedValue.length < VALIDATION_RULES.name.minLength) {
          return `Name must be at least ${VALIDATION_RULES.name.minLength} characters long`;
        }
        if (trimmedValue.length > VALIDATION_RULES.name.maxLength) {
          return `Name must be no more than ${VALIDATION_RULES.name.maxLength} characters long`;
        }
        break;
      
      case 'email':
        if (trimmedValue) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(trimmedValue)) {
            return 'Please enter a valid email address';
          }
        }
        break;
      
      case 'subject':
        if (trimmedValue.length < VALIDATION_RULES.subject.minLength) {
          return `Subject must be at least ${VALIDATION_RULES.subject.minLength} characters long`;
        }
        if (trimmedValue.length > VALIDATION_RULES.subject.maxLength) {
          return `Subject must be no more than ${VALIDATION_RULES.subject.maxLength} characters long`;
        }
        break;
      
      case 'message':
        if (trimmedValue.length < VALIDATION_RULES.message.minLength) {
          return `Message must be at least ${VALIDATION_RULES.message.minLength} characters long`;
        }
        if (trimmedValue.length > VALIDATION_RULES.message.maxLength) {
          return `Message must be no more than ${VALIDATION_RULES.message.maxLength} characters long`;
        }
        break;
    }
    
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key as keyof ValidationErrors] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true
    });
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Reset states
    setError('');
    setIsSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Success
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      setTouched({});
      
      toast({
        title: "Success!",
        description: data.message || "Message sent successfully!",
      });

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      
      toast({
        title: "Error",
        description: err.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName: string) => {
    const baseClasses = "mt-1 block w-full border rounded-lg shadow-sm p-3 focus:ring-primary focus:border-primary transition";
    const hasError = errors[fieldName as keyof ValidationErrors] && touched[fieldName];
    
    if (hasError) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500`;
    }
    
    return `${baseClasses} border-gray-300`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row gap-12 mt-8">
          {/* Form (Left) */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold text-primary mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Have questions or want to work with us? Fill out the form or reach us at <a href="mailto:info@addisclick.com" className="text-primary underline">info@addisclick.com</a>.
            </p>
            
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Message sent successfully! We'll get back to you soon.</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClassName('name')}
                  placeholder="Your Name"
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClassName('email')}
                  placeholder="you@email.com"
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClassName('subject')}
                  placeholder="What is this about?"
                />
                {errors.subject && touched.subject && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.subject}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClassName('message')}
                  placeholder="How can we help you?"
                ></textarea>
                {errors.message && touched.message && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.message.length}/{VALIDATION_RULES.message.maxLength} characters
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold text-lg shadow hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </div>
          {/* Info & Map (Right) */}
          <div className="md:w-1/2 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Office</h3>
              <div className="text-gray-700 space-y-2 mb-6 text-base">
                <div>
                  <span className="font-semibold">Address:</span> Bole Road, Addis Ababa, Ethiopia
                </div>
                <div>
                  <span className="font-semibold">Mobile:</span>{" "}
                  <a href="tel:+251912345678" className="text-primary underline">+251 912 345 678</a>
                </div>
                <div>
                  <span className="font-semibold">Fax:</span> +251 11 123 4567
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  <a href="mailto:info@addisclick.com" className="text-primary underline">info@addisclick.com</a>
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-end">
              <iframe
                title="AddisClick Location"
                src="https://www.google.com/maps?q=Bole+Road,+Addis+Ababa,+Ethiopia&output=embed"
                width="100%"
                height="240"
                style={{ border: 0, borderRadius: '0.75rem', minHeight: '180px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
