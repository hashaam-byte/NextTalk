// src/components/AuthForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GeistMono } from 'geist/font/mono';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // File upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bio: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (mode === 'login') {
      try {
        const result = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          setError('Invalid credentials');
        } else if (result?.ok) {
          router.push('/home');
          router.refresh();
        }
      } catch (error) {
        setError('An error occurred during sign in');
      }
    } else {
      try {
        // Validation checks
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        // First, register the user
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || null,
            bio: formData.bio || null
          }),
        });

        if (!registerResponse.ok) {
          const data = await registerResponse.json();
          throw new Error(data.error || 'Registration failed');
        }

        // If registration successful, sign in
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (signInResult?.error) {
          throw new Error('Error signing in after registration');
        }

        // If sign in successful, upload profile image if exists
        if (selectedImage) {
          const formData = new FormData();
          formData.append('image', selectedImage);

          const imageUploadResponse = await fetch('/api/user/profile-image', {
            method: 'POST',
            body: formData,
          });

          if (!imageUploadResponse.ok) {
            console.error('Failed to upload profile image');
          }
        }

        // Redirect to home page
        router.push('/');
        router.refresh();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 ${GeistMono.className}`}>
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h2>
        
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              {/* Name Field */}
              <div>
                <label className="text-sm text-gray-300">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 mt-1 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Your name"
                />
              </div>
              
              {/* Profile Image */}
              <div>
                <label className="text-sm text-gray-300">Profile Image</label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {previewUrl ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-full">
                        <Image 
                          src={previewUrl}
                          alt="Profile preview" 
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400 text-xl">?</span>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium leading-4 text-gray-300 border border-gray-600 hover:bg-gray-600 transition">
                    <span>Upload image</span>
                    <input 
                      id="profileImage" 
                      name="profileImage" 
                      type="file" 
                      className="sr-only" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
              
              {/* Phone Field */}
              <div>
                <label className="text-sm text-gray-300">Phone Number (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 mt-1 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Your phone number"
                />
              </div>
              
              {/* Bio Field */}
              <div>
                <label className="text-sm text-gray-300">Bio (optional)</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-3 mt-1 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Write a short bio about yourself"
                />
              </div>
            </>
          )}

          {/* Email Field - For both login and register */}
          <div>
            <label className="text-sm text-gray-300">Email address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 mt-1 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Password Field with Toggle */}
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 pr-10 mt-1 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder={mode === 'register' ? "Create a password (8+ characters)" : "Enter your password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field with Toggle - Only for register */}
          {mode === 'register' && (
            <div>
              <label className="text-sm text-gray-300">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 pr-10 mt-1 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 transition"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : mode === 'login' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>

          {/* Add Forgot Password Link - Only show on login mode */}
          {mode === 'login' && (
            <div className="text-center mt-4">
              <Link 
                href="/forgot-password" 
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </form>

        <div className="text-center text-sm text-gray-400">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <Link href="/login?mode=register" className="text-purple-400 hover:text-purple-300">
                Create one
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}