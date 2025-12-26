import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdSearch, MdMenu, MdClose } from 'react-icons/md';
import { categoriesService } from '../services/categories';
import { settingsService } from '../services/settings';
import { useQuery } from '@tanstack/react-query';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsService.getPublicSettings(),
    retry: 1,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute (reduced for faster updates)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const siteName = siteSettings?.site_name || 'Congo News';
  const siteTagline = siteSettings?.site_tagline || 'Breaking News & Latest Updates';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white border-b-2 border-red-600 sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-red-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">{siteName}</span>
              <span className="hidden md:inline">{siteTagline}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline">Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-red-600 text-white px-4 py-2 rounded font-bold text-2xl">
              CN
            </div>
            <span className="text-2xl font-bold text-gray-900 hidden sm:block">{siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className="px-4 py-2 text-gray-900 hover:bg-red-50 hover:text-red-600 font-medium transition rounded"
            >
              Home
            </Link>
            {categories && categories.length > 0 && categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="px-4 py-2 text-gray-900 hover:bg-red-50 hover:text-red-600 font-medium transition rounded"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-900 hover:text-red-600"
          >
            {mobileMenuOpen ? <MdClose className="w-6 h-6" /> : <MdMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-gray-900 hover:bg-red-50 hover:text-red-600 font-medium transition rounded"
              >
                Home
              </Link>
              {categories && categories.length > 0 && categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-gray-900 hover:bg-red-50 hover:text-red-600 font-medium transition rounded"
                >
                  {category.name}
                </Link>
              ))}
              <form onSubmit={handleSearch} className="pt-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search news..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </form>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

