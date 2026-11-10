import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner.tsx';
import ReactPixel from 'react-facebook-pixel';

// Initialize Facebook Pixel
const options = {
  autoConfig: true,
  debug: false,
};

if (import.meta.env.VITE_FB_PIXEL_ID) {
  ReactPixel.init(import.meta.env.VITE_FB_PIXEL_ID, undefined, options);
  ReactPixel.pageView();

  // Track navigation events for router
  // This will be called by App.tsx's useEffect when route changes
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 1, // 1 minute
      refetchOnWindowFocus: false, // Optional: prevents refetching on every window focus if not desired, though keeping it true with staleTime > 0 is often fine. We'll just set staleTime.
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
)
