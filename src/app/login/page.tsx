// src/app/login/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthForm from '@/components/AuthForm';

function LoginContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  return <AuthForm mode={mode} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[100dvh]">
        {/* Use dvh for better mobile viewport handling */}
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}