import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { articlesService } from '../services/articles';
import { categoriesService } from '../services/categories';
import ArticleCard from '../components/ArticleCard';
import { MdTrendingUp, MdFolder } from 'react-icons/md';

export default function Home() {
  const { data: featuredData, isLoading: featuredLoading, error: featuredError } = useQuery({
    queryKey: ['articles', 'featured'],
    queryFn: () => articlesService.getPublished({ limit: 1 }),
    retry: false,
  });

  const { data: latestData, isLoading: latestLoading, error: latestError } = useQuery({
    queryKey: ['articles', 'latest'],
    queryFn: () => articlesService.getPublished({ limit: 6, page: 1 }),
    retry: false,
  });

  const { data: moreArticles } = useQuery({
    queryKey: ['articles', 'more'],
    queryFn: () => articlesService.getPublished({ limit: 12, page: 2 }),
    retry: false,
  });

  const { data: trendingArticles } = useQuery({
    queryKey: ['articles', 'trending'],
    queryFn: () => articlesService.getTrending(5),
    retry: false,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    retry: false,
  });

  const featuredArticle = featuredData?.articles?.[0];
  const latestArticles = latestData?.articles?.slice(1) || [];
  const moreArticlesList = moreArticles?.articles || [];

  if (featuredLoading || latestLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Breaking News Banner */}
      <div className="bg-red-600 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2">
            <MdTrendingUp className="w-5 h-5 animate-pulse" />
            <span className="font-bold">BREAKING:</span>
            <span className="flex-1">
              {featuredArticle ? featuredArticle.title : 'Stay tuned for the latest updates'}
            </span>
          </div>
        </div>
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-red-600 pl-4">
              Featured Story
            </h2>
          </div>
          <ArticleCard article={featuredArticle} featured />
        </section>
      )}

      {/* Latest News Grid */}
      {latestArticles.length > 0 && (
        <section className="bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-red-600 pl-4">
                Latest News
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* More Articles */}
      {moreArticlesList.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-red-600 pl-4">
              More Stories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moreArticlesList.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Articles */}
      {trendingArticles && trendingArticles.length > 0 && (
        <section className="bg-red-600 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h2 className="text-3xl font-bold border-l-4 border-white pl-4 flex items-center space-x-2">
                <MdTrendingUp className="w-8 h-8" />
                <span>Trending Now</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {trendingArticles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:underline line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-white/80 text-xs mt-1">{article.views} views</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="bg-white py-8 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-red-600 pl-4">
                Browse by Category
              </h2>
              <p className="text-gray-600 mt-2">Explore news by topic</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-600 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-red-600 text-white p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <MdFolder className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Articles Message */}
      {!featuredArticle && latestArticles.length === 0 && moreArticlesList.length === 0 && !featuredLoading && !latestLoading && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Articles Yet</h2>
            <p className="text-gray-600 mb-2">
              {(!!featuredError || !!latestError)
                ? "Unable to load articles. Please check if the backend server is running."
                : "Check back soon for the latest news and updates."}
            </p>
            {(!!featuredError || !!latestError) && (
              <p className="text-sm text-gray-500 mt-2">
                Make sure the backend API is running
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

