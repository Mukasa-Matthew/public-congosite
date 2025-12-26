import { useState, useEffect } from 'react';
import { MdChevronLeft, MdChevronRight, MdPlayArrow, MdPause } from 'react-icons/md';

interface MediaItem {
  id?: number;
  url: string;
  type: 'image' | 'video';
  order?: number;
}

interface MediaCarouselProps {
  media: MediaItem[];
  className?: string;
}

export default function MediaCarousel({ media, className = '' }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRefs, setVideoRefs] = useState<{ [key: number]: HTMLVideoElement | null }>({});

  // Auto-advance slides every 5 seconds if not manually controlled
  useEffect(() => {
    if (media.length <= 1) return;
    
    const interval = setInterval(() => {
      if (!isPlaying) {
        setCurrentIndex((prev) => (prev + 1) % media.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [media.length, isPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    // Pause all videos when changing slides
    Object.values(videoRefs).forEach((video) => {
      if (video) video.pause();
    });
  };

  const goToPrevious = () => {
    goToSlide((currentIndex - 1 + media.length) % media.length);
  };

  const goToNext = () => {
    goToSlide((currentIndex + 1) % media.length);
  };

  const handleVideoPlay = (index: number) => {
    const video = videoRefs[index];
    if (video) {
      if (video.paused) {
        // Pause all other videos
        Object.entries(videoRefs).forEach(([idx, v]) => {
          if (v && Number(idx) !== index) v.pause();
        });
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Auto-advance to next slide when video ends
    if (media.length > 1) {
      setTimeout(() => {
        goToNext();
      }, 1000);
    }
  };

  if (!media || media.length === 0) {
    return null;
  }

  // If only one media item, show it without carousel controls
  if (media.length === 1) {
    const item = media[0];
    return (
      <div className={`relative w-full ${className}`}>
        {item.type === 'video' ? (
          <div className="relative w-full bg-black">
            <video
              ref={(el) => {
                if (el) setVideoRefs({ 0: el });
              }}
              src={item.url}
              controls
              playsInline
              className="w-full h-full object-contain"
              onEnded={handleVideoEnded}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <img
            src={item.url}
            alt="Article media"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Main Media Display */}
      <div className="relative w-full h-96 md:h-[500px] bg-black">
        {media.map((item, index) => (
          <div
            key={item.id || index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 translate-x-0'
                : index < currentIndex
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            {item.type === 'video' ? (
              <div className="relative w-full h-full">
                <video
                  ref={(el) => {
                    if (el) setVideoRefs({ ...videoRefs, [index]: el });
                  }}
                  src={item.url}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                  onEnded={handleVideoEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  Your browser does not support the video tag.
                </video>
                {/* Custom play overlay for better UX */}
                {videoRefs[index]?.paused && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer group"
                    onClick={() => handleVideoPlay(index)}
                  >
                    <div className="bg-white/90 rounded-full p-4 group-hover:bg-white transition-all transform group-hover:scale-110">
                      <MdPlayArrow className="w-12 h-12 text-gray-900" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <img
                src={item.url}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all transform hover:scale-110 z-10"
          aria-label="Previous slide"
        >
          <MdChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-all transform hover:scale-110 z-10"
          aria-label="Next slide"
        >
          <MdChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 w-2 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-10">
          {currentIndex + 1} / {media.length}
        </div>
      </div>
    </div>
  );
}

