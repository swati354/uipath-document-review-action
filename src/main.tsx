import { enableMapSet } from 'immer';
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/index.css';
import { ActionPage } from '@/pages/ActionPage';

// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ActionPage />
    </ErrorBoundary>
  </StrictMode>
);
