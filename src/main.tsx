import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';

import './index.css';
import './i18n';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useLocale } from './hooks/useLocale';
import { queryClient } from './lib/queryClient';

function AppToaster() {
  const { direction } = useLocale();
  const { theme } = useTheme();

  return (
    <Toaster
      position={direction === 'rtl' ? 'top-left' : 'top-right'}
      dir={direction}
      theme={theme}
      richColors
      closeButton
      expand
      visibleToasts={5}
      gap={10}
      toastOptions={{
        duration: 4500,
        classNames: {
          toast: 'app-toast',
          title: 'app-toast-title',
          description: 'app-toast-description',
          closeButton: 'app-toast-close',
          actionButton: 'app-toast-action',
          cancelButton: 'app-toast-cancel',
          success: 'app-toast-success',
          error: 'app-toast-error',
          info: 'app-toast-info',
          warning: 'app-toast-warning',
          loading: 'app-toast-loading',
          default: 'app-toast-default',
          icon: 'app-toast-icon',
          content: 'app-toast-content',
        },
      }}
      className="app-toaster"
      containerAriaLabel="Application notifications"
    />
  );
}

function RootApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <App />
            <AppToaster />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
