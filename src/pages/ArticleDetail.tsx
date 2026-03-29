import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { articlesService } from '../services/articles';
import ArticleCard from '../components/ArticleCard';
import MediaCarousel from '../components/MediaCarousel';
import { useSavedArticles } from '../hooks/useSavedArticles';
import { 
  MdAccessTime, 
  MdVisibility, 
  MdShare,
  MdLink as MdLinkIcon,
  MdLabel,
  MdPrint,
  MdEmail,
  MdBookmark,
  MdBookmarkBorder,
} from 'react-icons/md';
// Social media icons from Font Awesome (Material Design doesn't have these)
import { FaTwitter, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { SiWhatsapp } from 'react-icons/si';

type TagItem = { key: string; label: string; q: string };

function parseArticleTags(tags: unknown): TagItem[] {
  if (tags == null) return [];
  if (Array.isArray(tags)) {
    return tags
      .map((t, i) => {
        if (typeof t === 'string') return { key: `t-${i}`, label: t, q: t };
        if (t && typeof t === 'object' && 'name' in t) {
          const name = String((t as { name: string }).name);
          const id = (t as { id?: number }).id;
          return { key: id != null ? String(id) : `t-${i}`, label: name, q: name };
        }
        return null;
      })
      .filter((x): x is TagItem => x != null);
  }
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s, i) => ({ key: `s-${i}`, label: s, q: s }));
  }
  return [];
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [linkCopied, setLinkCopied] = useState(false);
  
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

  const { isSaved, toggle: toggleSaved } = useSavedArticles();
  const [readPct, setReadPct] = useState(0);

  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (!article) return;
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setReadPct(docHeight > 0 ? Math.min(100, Math.round((y / docHeight) * 100)) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [article?.id]);

  // Update meta tags for social sharing - MUST be before early returns
  useEffect(() => {
    if (article) {
      // Update title
      document.title = `${article.title} - Congo News`;
      
      // Update or create Open Graph meta tags
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      const updateMetaName = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // Ensure image URL is absolute and uses HTTPS
      let imageUrl = article.featured_image || `https://congonews.news/42c645e0-e3c8-11f0-b20e-95d9b9f5ff2c.png`;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://congonews.news${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
      }
      // Ensure HTTPS
      if (imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace('http://', 'https://');
      }
      
      const description = article.excerpt || article.title || 'Read the full article on Congo News';
      const title = article.title || 'Congo News Article';
      
      // Open Graph tags for Facebook, WhatsApp, LinkedIn, etc.
      updateMetaTag('og:type', 'article');
      updateMetaTag('og:url', articleUrl);
      updateMetaTag('og:title', title);
      updateMetaTag('og:description', description);
      updateMetaTag('og:image', imageUrl);
      updateMetaTag('og:image:secure_url', imageUrl);
      updateMetaTag('og:image:width', '1200');
      updateMetaTag('og:image:height', '630');
      updateMetaTag('og:image:type', 'image/jpeg');
      updateMetaTag('og:site_name', 'Congo News');
      
      // Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:url', articleUrl);
      updateMetaTag('twitter:title', title);
      updateMetaTag('twitter:description', description);
      updateMetaTag('twitter:image', imageUrl);
      updateMetaTag('twitter:image:src', imageUrl);
      
      // Standard meta tags
      updateMetaName('description', description);
      updateMetaName('twitter:description', description);
      
      // Additional tags for better compatibility
      updateMetaTag('article:published_time', article.published_at || article.created_at);
      if (article.category_name) {
        updateMetaTag('article:section', article.category_name);
      }
    }
  }, [article, articleUrl]);

  // Early returns MUST come after all hooks
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

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = (text: string) => {
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  };

  const readingTime = article ? calculateReadingTime(article.body) : 0;
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

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(article.title);
    const body = encodeURIComponent(`${shareText}\n\nRead more: ${articleUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = articleUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const printArticle = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to detect media type
  const detectMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = /\.(mp4|webm|mpeg|mpg|mov|quicktime|avi|wmv|flv|ogv|m4v|mkv)(\?.*)?$/i;
    if (videoExtensions.test(url) || url.includes('video/') || url.startsWith('data:video/')) {
      return 'video';
    }
    return 'image';
  };

  // Prepare media array for carousel
  const mediaForCarousel = article.media && article.media.length > 0
    ? article.media.map((item: any) => ({
        id: item.id,
        url: item.url,
        type: item.type || (item.url.includes('video') || /\.(mp4|webm|mov|avi)/i.test(item.url) ? 'video' : 'image'),
        order: item.order,
      }))
    : article.featured_image
    ? [{
        url: article.featured_image,
        type: detectMediaType(article.featured_image),
        order: 0,
      }]
    : [];

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-1 bg-gray-200 pointer-events-none"
        aria-hidden
        role="presentation"
      >
        <div className="h-full bg-red-600 transition-[width] duration-150 ease-out" style={{ width: `${readPct}%` }} />
      </div>
    <article className="min-h-screen bg-white">
      {/* Article Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title Section - French Press Style (Title Above Image) */}
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

        {/* Media Carousel - Below Title (French Press Style) */}
        {mediaForCarousel.length > 0 && (
          <div className="mb-8">
            <MediaCarousel media={mediaForCarousel} className="h-96 md:h-[500px] w-full" />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8">
            <p className="text-lg text-gray-700 italic">{article.excerpt}</p>
          </div>
        )}

        {/* Tags */}
        {(() => {
          const tagItems = parseArticleTags(article.tags as unknown);
          if (tagItems.length === 0) return null;
          return (
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-3">
                <MdLabel className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tagItems.map((tag) => (
                  <Link
                    key={tag.key}
                    to={`/search?q=${encodeURIComponent(tag.q)}`}
                    className="inline-block bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 px-3 py-1 rounded-full text-sm transition"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

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
                onClick={shareToLinkedIn}
                className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition"
              >
                <FaLinkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={shareViaEmail}
                className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                <MdEmail className="w-5 h-5" />
                <span>Email</span>
              </button>
              <button
                onClick={copyLink}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  linkCopied 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                <MdLinkIcon className="w-5 h-5" />
                <span>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  type="button"
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
                type="button"
                onClick={() => toggleSaved(article.id, article.title)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  isSaved(article.id)
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-800 hover:border-red-600 hover:text-red-600'
                }`}
              >
                {isSaved(article.id) ? (
                  <MdBookmark className="w-5 h-5" />
                ) : (
                  <MdBookmarkBorder className="w-5 h-5" />
                )}
                <span>{isSaved(article.id) ? 'Saved' : 'Save for later'}</span>
              </button>
              <button
                type="button"
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
    </>
  );
}

