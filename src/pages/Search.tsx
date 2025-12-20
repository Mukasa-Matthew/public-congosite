import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { articlesService } from '../services/articles';
import ArticleCard from '../components/ArticleCard';
import { MdSearch } from 'react-icons/md';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['articles', 'search', query, page],
    queryFn: () => articlesService.getPublished({ search: query, page, limit: 12 }),
    enabled: !!query,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      setPage(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Search Results</h1>
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for news..."
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!query ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Enter a search term to find articles.</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : data?.articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-2">No articles found for "{query}"</p>
            <p className="text-gray-500">Try a different search term.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Found {data?.total} result{data?.total !== 1 ? 's' : ''} for "{query}"
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data?.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {data && data.total > 12 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 hover:border-red-600 transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {page} of {Math.ceil(data.total / 12)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * 12 >= data.total}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 hover:border-red-600 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


