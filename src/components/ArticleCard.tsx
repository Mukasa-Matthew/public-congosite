import { Link } from 'react-router-dom';
import { MdAccessTime, MdVisibility } from 'react-icons/md';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  body: string;
  featured_image: string | null;
  category_id: number | null;
  category_name?: string;
  tags?: string;
  meta_title: string | null;
  meta_description: string | null;
  status: 'draft' | 'published' | 'archived';
  views: number;
  author_id: number | null;
  scheduled_publish_date: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper function to detect if a URL is a video
  const isVideoUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    
    // Check for video file extensions
    const videoExtensions = /\.(mp4|webm|mpeg|mpg|mov|quicktime|avi|wmv|flv|ogv|m4v)(\?.*)?$/i;
    if (videoExtensions.test(url)) {
      return true;
    }
    
    // Check for video MIME types in data URLs
    if (url.startsWith('data:video/')) {
      return true;
    }
    
    // Check for video MIME types in URLs
    if (url.includes('video/') || url.includes('type=video')) {
      return true;
    }
    
    return false;
  };

  if (featured) {
    return (
      <Link to={`/article/${article.id}`} className="group">
        <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          {article.featured_image && (
            <div className="relative h-64 overflow-hidden">
              {isVideoUrl(article.featured_image) ? (
                <video
                  src={article.featured_image}
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              ) : (
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              )}
              <div className="absolute top-4 left-4">
                {article.category_name && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {article.category_name}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition line-clamp-2">
              {article.title}
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <MdAccessTime className="w-4 h-4" />
                  <span>{formatDate(article.published_at || article.created_at)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MdVisibility className="w-4 h-4" />
                  <span>{article.views} views</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100">
        <div className="flex flex-col md:flex-row">
          {article.featured_image && (
            <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0">
              {isVideoUrl(article.featured_image) ? (
                <video
                  src={article.featured_image}
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              ) : (
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              )}
            </div>
          )}
          <div className="p-4 flex-1">
            {article.category_name && (
              <span className="inline-block bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold mb-2">
                {article.category_name}
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition line-clamp-2">
              {article.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <MdAccessTime className="w-3 h-3" />
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MdVisibility className="w-3 h-3" />
                <span>{article.views}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

