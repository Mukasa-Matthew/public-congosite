import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Category from './pages/Category';
import Search from './pages/Search';
import { settingsService } from './services/settings';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      retryOnMount: false,
    },
  },
});

function AppContent() {
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsService.getPublicSettings(),
    retry: 1,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute (reduced for faster updates)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const siteName = siteSettings?.site_name || 'Congo News';
    const siteTagline = siteSettings?.site_tagline || 'Breaking News & Latest Updates';
    document.title = `${siteName} - ${siteTagline}`;
  }, [siteSettings]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
