import React, { useState } from 'react';
import { createUserWithEmailAndPassword} from 'firebase/auth';
import { auth } from '../../config/firebase'; // Adjust the import path as necessary

interface NavigationProps {
  navigateTo: (page: 'landing' | 'signin' | 'signup') => void;
}

const SignUpPage: React.FC<NavigationProps> = ({ navigateTo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Optionally, update user profile with first/last name here
      // Redirect or show success message
      navigateTo('signin');
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full max-w-md mx-auto">
      {/* Header */}
      <header className="fixed w-full max-w-md mx-auto top-0 bg-white shadow-sm z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigateTo('landing')}
          >
            <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Tg</span>
            </div>
            <span className="ml-2 font-semibold text-lg">ToGether</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 pt-16 w-full max-w-md mx-auto">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl shadow-md p-6 mt-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
              <p className="text-gray-600 text-sm mt-1">Join thousands of users today</p>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-between mb-6">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex-1 flex items-center">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      index + 1 === step 
                        ? 'bg-purple-700 text-white' 
                        : index + 1 < step 
                          ? 'bg-purple-200 text-purple-700' 
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1 < step ? (
                      <i className="fas fa-check text-xs"></i>
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  {index < totalSteps - 1 && (
                    <div 
                      className={`flex-1 h-1 ${
                        index + 1 < step ? 'bg-purple-200' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSignUp}>
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                        First name
                      </label>
                      <input
                        id="first-name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Last name
                      </label>
                      <input
                        id="last-name"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer !rounded-button"
                  >
                    Continue
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400`}></i>
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 8 characters long with a number and a special character.
                    </p>
                  </div>

                  <div className="flex items-center mb-6">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={() => setAgreeTerms(!agreeTerms)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I agree to the <a href="#" className="text-purple-700 hover:text-purple-800">Terms of Service</a> and <a href="#" className="text-purple-700 hover:text-purple-800">Privacy Policy</a>
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer !rounded-button"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !agreeTerms}
                      className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer !rounded-button"
                    >
                      {isLoading ? (
                        <i className="fas fa-circle-notch fa-spin"></i>
                      ) : (
                        "Sign up"
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <span 
              className="font-medium text-purple-700 hover:text-purple-800 cursor-pointer"
              onClick={() => navigateTo('signin')}
            >
              Sign in
            </span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
