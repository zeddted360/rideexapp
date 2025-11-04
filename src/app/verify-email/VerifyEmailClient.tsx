"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/utils/appwrite';
import toast from 'react-hot-toast';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Mail, 
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type VerificationState = 'verifying' | 'success' | 'error' | 'invalid';

export default function VerifyEmailClient({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const router = useRouter();
  const userId = Array.isArray(searchParams.userId) ? searchParams.userId[0] : searchParams.userId;
  const secret = Array.isArray(searchParams.secret) ? searchParams.secret[0] : searchParams.secret;
  const [state, setState] = useState<VerificationState>('verifying');
  const [countdown, setCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!userId || !secret) {
      setState('invalid');
      return;
    }

    const verify = async () => {
      try {
        await account.updateVerification(userId, secret);
        setState('success');
        toast.success('Email verified successfully!');
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              router.push('/');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error: any) {
        setState('error');
        setErrorMessage(error.message || 'Verification failed. The link may be expired or invalid.');
        toast.error(error.message || 'Verification failed');
      }
    };

    verify();
  }, [userId, secret, router]);

  const handleRetry = () => {
    setState('verifying');
    setErrorMessage('');
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          
          {/* Verifying State */}
          {state === 'verifying' && (
            <div className="p-8 text-center">
              <div className="mb-6 relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-24 h-24 text-orange-500 animate-spin opacity-30" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Verifying Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Please wait while we verify your email address...
              </p>
              
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="p-8 text-center">
              <div className="mb-6 relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center animate-scale-in">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border-4 border-green-500 rounded-full animate-ping opacity-20" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Email Verified Successfully!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your email has been verified. You can now access all features of your account.
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 dark:text-green-300">
                  Redirecting to home page in <span className="font-bold text-lg">{countdown}</span> seconds...
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleGoHome}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  Go to Home
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="p-8 text-center">
              <div className="mb-6 relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-full flex items-center justify-center animate-scale-in">
                  <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {errorMessage}
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                      Common reasons for failure:
                    </p>
                    <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                      <li>• Verification link has expired</li>
                      <li>• Link has already been used</li>
                      <li>• Invalid or corrupted link</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleRetry}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          )}

          {/* Invalid Link State */}
          {state === 'invalid' && (
            <div className="p-8 text-center">
              <div className="mb-6 relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-full flex items-center justify-center animate-scale-in">
                  <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Invalid Verification Link
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This verification link appears to be invalid or incomplete.
              </p>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Please check your email and click the verification link again, or request a new verification email.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  Go to Login
                </Button>
                <Button 
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help? <a href="/support" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium">Contact Support</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}