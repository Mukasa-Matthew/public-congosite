import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { articlesService } from '../services/articles';
import ArticleCard from '../components/ArticleCard';
import { useState, useEffect } from 'react';
import { 
  MdAccessTime, 
  MdVisibility, 
  MdShare,
  MdLink as MdLinkIcon,
  MdLabel,
  MdPrint
} from 'react-icons/md';
// Social media icons from Font Awesome (Material Design doesn't have these)
import { FaTwitter, FaFacebook } from 'react-icons/fa';
import { SiWhatsapp } from 'react-icons/si';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [mediaType, setMediaType] = useState<'video' | 'image' | 'unknown'>('unknown');
  const [videoError, setVideoError] = useState(false);
  
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articlesService.getById(Number(id)),
    enabled: !!id,
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ['related-articles', id, article?.category_id],
    queryFn: () => articlesService.getRelated(Number(id), article?.category_id || undefined, 4),
    enabled: !!id && !!article,
  });

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = (text: string) => {
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  };

  const readingTime = article ? calculateReadingTime(article.body) : 0;
  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = article ? `${article.title} - ${article.excerpt}` : '';

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + articleUrl)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    // You could add a toast notification here
    alert('Link copied to clipboard!');
  };

  const printArticle = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600">The article you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to detect if a URL is likely a video
  const isVideoUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    
    // Check for video file extensions (most reliable)
    const videoExtensions = /\.(mp4|webm|mpeg|mpg|mov|quicktime|avi|wmv|flv|ogv|m4v|mkv)(\?.*)?$/i;
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
    
    // If URL is from uploads and we can't determine, be lenient and try video
    // (This helps catch videos that might not have standard extensions)
    if (url.includes('/uploads/')) {
      // Could be a video, let the error handler determine
      return true;
    }
    
    return false;
  };

  // Determine media type when article loads
  useEffect(() => {
    if (article?.featured_image) {
      const url = article.featured_image;
      // Try to detect from URL patterns
      if (isVideoUrl(url)) {
        setMediaType('video');
      } else {
        // Default to trying video first for unknown types, fallback to image
        setMediaType('video');
      }
      setVideoError(false);
    }
  }, [article?.featured_image]);

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section */}
      {article.featured_image && (
        <div className="relative h-96 overflow-hidden bg-gray-200">
          {/* Try video first if detected as video or if we haven't determined it's an image yet */}
          {!videoError && (isVideoUrl(article.featured_image) || mediaType === 'video' || mediaType === 'unknown') ? (
            <video
              key={article.featured_image} // Force re-render when URL changes
              src={article.featured_image}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Video failed to load, falling back to image:', article.featured_image);
                setVideoError(true);
                setMediaType('image');
              }}
              onLoadedData={() => {
                // Video loaded successfully
                setMediaType('video');
                setVideoError(false);
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              key={article.featured_image} // Force re-render when URL changes
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', article.featured_image);
              }}
              onLoad={() => {
                setMediaType('image');
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              {article.category_name && (
                <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {article.category_name}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>
              <div className="flex items-center space-x-4 text-sm flex-wrap gap-2">
                <span className="flex items-center space-x-1">
                  <MdAccessTime className="w-4 h-4" />
                  <span>{formatDate(article.published_at || article.created_at)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MdVisibility className="w-4 h-4" />
                  <span>{article.views} views</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MdAccessTime className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!article.featured_image && (
          <div className="mb-8">
            {article.category_name && (
              <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                {article.category_name}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{article.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6 flex-wrap gap-2">
              <span className="flex items-center space-x-1">
                <MdAccessTime className="w-4 h-4" />
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MdVisibility className="w-4 h-4" />
                <span>{article.views} views</span>
              </span>
              <span className="flex items-center space-x-1">
                <MdAccessTime className="w-4 h-4" />
                <span>{readingTime} min read</span>
              </span>
            </div>
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8">
            <p className="text-lg text-gray-700 italic">{article.excerpt}</p>
          </div>
        )}

        {/* Tags */}
        {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-3">
              <MdLabel className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: any) => (
                <Link
                  key={tag.id || tag}
                  to={`/search?q=${encodeURIComponent(typeof tag === 'string' ? tag : tag.name)}`}
                  className="inline-block bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 px-3 py-1 rounded-full text-sm transition"
                >
                  {typeof tag === 'string' ? tag : tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-lg max-w-none">
          <div
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, '<br />') }}
          />
        </div>

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={shareToFacebook}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <FaFacebook className="w-5 h-5" />
                <span>Facebook</span>
              </button>
              <button
                onClick={shareToTwitter}
                className="flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition"
              >
                <FaTwitter className="w-5 h-5" />
                <span>Twitter</span>
              </button>
              <button
                onClick={shareToWhatsApp}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <SiWhatsapp className="w-5 h-5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={copyLink}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
              >
                <MdLinkIcon className="w-5 h-5" />
                <span>Copy Link</span>
              </button>
              {navigator.share && (
                <button
                  onClick={() => {
                    navigator.share({
                      title: article.title,
                      text: article.excerpt,
                      url: articleUrl,
                    });
                  }}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <MdShare className="w-5 h-5" />
                  <span>Share</span>
                </button>
              )}
              <button
                onClick={printArticle}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
              >
                <MdPrint className="w-5 h-5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard key={relatedArticle.id} article={relatedArticle} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

