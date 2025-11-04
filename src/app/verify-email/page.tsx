import { Suspense } from 'react';
import VerifyEmailClient from './VerifyEmailClient';
import { Loader2 } from 'lucide-react';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailClient searchParams={resolvedSearchParams} />
    </Suspense>
  );
}