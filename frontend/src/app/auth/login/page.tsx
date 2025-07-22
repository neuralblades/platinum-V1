import { Suspense } from 'react';
import LoginForm from './LoginForm';

// Loading component for suspense fallback
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gray-900"></div>
      </div>
      
      {/* Loading Card */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md z-10 mx-4">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-2">
              <div className="w-[180px] h-[40px] bg-gray-200 animate-pulse rounded"></div>
            </div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
          
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}