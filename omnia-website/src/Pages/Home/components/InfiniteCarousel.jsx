import React, { useState, useRef, useEffect } from 'react';
import { FlippableVenueCard } from './FlippableVenueCard';

export function InfiniteCarousel({ venues = [], onVenueClick, onBookClick, onWalkIn }) {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [centerIndex, setCenterIndex] = useState(0);
  const [hasFlippedCard, setHasFlippedCard] = useState(false);
  
  const scrollContainerRef = useRef(null);
  const contentRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  const cardWidth = 340;
  const gap = 24;
  const scrollSpeed = 0.4; // pixels per frame for auto-scroll
  
  // Responsive card dimensions
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const responsiveCardWidth = isMobile ? 280 : 340;
  const responsiveGap = isMobile ? 16 : 24;
  
  // Create enough copies for seamless scrolling
  const infiniteVenues = [...venues, ...venues, ...venues, ...venues, ...venues];
  
  // Initialize scroll position to middle
  useEffect(() => {
    if (scrollContainerRef.current && venues.length > 0) {
      const container = scrollContainerRef.current;
      const middlePosition = venues.length * 2 * (cardWidth + gap);
      container.scrollLeft = middlePosition;
      scrollPositionRef.current = middlePosition;
    }
  }, [venues.length]);
  
  // Continuous smooth auto-scroll with momentum
  useEffect(() => {
    const animate = () => {
      if (scrollContainerRef.current && venues.length > 0) {
        const container = scrollContainerRef.current;
        
        // Don't auto-scroll if user is interacting OR if a card is flipped
        if (!isUserInteracting && !hasFlippedCard) {
          // Auto-scroll mode
          scrollPositionRef.current += scrollSpeed;
          container.scrollLeft = scrollPositionRef.current;
          velocityRef.current = 0;
        } else if (velocityRef.current !== 0 && !hasFlippedCard) {
          // Momentum scrolling after release (only if no card is flipped)
          scrollPositionRef.current += velocityRef.current;
          container.scrollLeft = scrollPositionRef.current;
          
          // Friction
          velocityRef.current *= 0.95;
          
          // Stop when velocity is very small
          if (Math.abs(velocityRef.current) < 0.1) {
            velocityRef.current = 0;
          }
        }
        
        // Seamless loop
        const oneSetWidth = venues.length * (cardWidth + gap);
        if (scrollPositionRef.current >= oneSetWidth * 3) {
          scrollPositionRef.current -= oneSetWidth;
          container.scrollLeft = scrollPositionRef.current;
        } else if (scrollPositionRef.current < oneSetWidth) {
          scrollPositionRef.current += oneSetWidth;
          container.scrollLeft = scrollPositionRef.current;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isUserInteracting, hasFlippedCard, venues.length]);
  
  // Track centered card on scroll — measure actual DOM positions
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !contentRef.current) return;

      const container = scrollContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;

      const cards = contentRef.current.children;
      let closestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const distance = Math.abs(containerCenterX - cardCenterX);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      setCenterIndex(closestIndex % venues.length);
      scrollPositionRef.current = container.scrollLeft;
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [venues.length]);
  
  const handleUserInteractionStart = () => {
    setIsUserInteracting(true);
    velocityRef.current = 0;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
  };
  
  const handleUserInteractionEnd = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
      velocityRef.current = 0;
    }, 2500);
  };
  
  // Mouse drag handlers with momentum
  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;

    // Don't interfere if clicking on a card, but pause auto-scroll
    const target = e.target;
    if (target.closest('.flippable-card')) {
      handleUserInteractionStart();
      handleUserInteractionEnd();
      return;
    }

    setIsDragging(true);
    handleUserInteractionStart();
    lastXRef.current = e.clientX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
    e.preventDefault();
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    
    const currentX = e.clientX;
    const currentTime = Date.now();
    const deltaX = lastXRef.current - currentX;
    const deltaTime = currentTime - lastTimeRef.current;
    
    // Calculate velocity
    if (deltaTime > 0) {
      velocityRef.current = deltaX / deltaTime * 16; // Normalize to 60fps
    }
    
    scrollPositionRef.current += deltaX;
    scrollContainerRef.current.scrollLeft = scrollPositionRef.current;
    
    lastXRef.current = currentX;
    lastTimeRef.current = currentTime;
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    handleUserInteractionEnd();
  };
  
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      handleUserInteractionEnd();
    }
  };
  
  // Touch handlers with momentum
  const handleTouchStart = (e) => {
    if (!scrollContainerRef.current) return;

    // Don't interfere if touching a card, but pause auto-scroll
    const target = e.target;
    if (target.closest('.flippable-card')) {
      handleUserInteractionStart();
      handleUserInteractionEnd();
      return;
    }

    handleUserInteractionStart();
    setIsDragging(true);
    lastXRef.current = e.touches[0].clientX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
  };
  
  const handleTouchMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentTime = Date.now();
    const deltaX = lastXRef.current - currentX;
    const deltaTime = currentTime - lastTimeRef.current;
    
    // Calculate velocity
    if (deltaTime > 0) {
      velocityRef.current = deltaX / deltaTime * 16;
    }
    
    scrollPositionRef.current += deltaX;
    scrollContainerRef.current.scrollLeft = scrollPositionRef.current;
    
    lastXRef.current = currentX;
    lastTimeRef.current = currentTime;
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    handleUserInteractionEnd();
  };
  
  return (
    <div className="relative -mx-6 px-6 py-8 md:py-10 bg-gradient-to-b from-[#F8F6F1] via-[#FDFBF7] to-[#F8F6F1]">
      {/* Premium decorative border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      
      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none touch-pan-x"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'auto',
          touchAction: 'pan-x'
        }}
      >
        <div 
          ref={contentRef}
          className="flex gap-4 md:gap-6 py-8 md:py-10 px-10 md:px-14"
          style={{ width: 'max-content' }}
        >
          {infiniteVenues.map((venue, index) => {
            const actualIndex = index % venues.length;
            const isCentered = actualIndex === centerIndex;

            // Only the center card enlarges — all others stay at normal size
            const scale = isCentered ? 1.13 : 1;
            const opacity = isCentered ? 1 : 0.82;
            const translateY = isCentered ? -8 : 0;
            
            return (
              <div
                key={`${venue.id}-${index}`}
                className="relative transition-all duration-700 ease-out"
                style={{
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  opacity: opacity,
                  pointerEvents: isDragging ? 'none' : 'auto',
                  willChange: 'transform, opacity',
                }}
              >
                {/* Premium shadow and glow for centered card */}
                {isCentered && (
                  <>
                    {/* Elegant shadow */}
                    <div 
                      className="absolute -inset-1 rounded-2xl -z-10"
                      style={{
                        boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.25), 0 8px 24px -8px rgba(0, 0, 0, 0.15)',
                      }}
                    />
                    {/* Subtle champagne glow */}
                    <div 
                      className="absolute -inset-2 rounded-2xl -z-20 opacity-60"
                      style={{
                        background: 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.25) 0%, rgba(255, 215, 0, 0.15) 30%, transparent 70%)',
                        filter: 'blur(20px)',
                      }}
                    />
                    {/* Golden accent line on top */}
                    <div 
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-full -z-10"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
                        boxShadow: '0 0 12px rgba(212, 175, 55, 0.6)',
                      }}
                    />
                  </>
                )}
                
                {/* Subtle depth shadow for non-centered cards */}
                {!isCentered && (
                  <div 
                    className="absolute -inset-1 rounded-2xl -z-10"
                    style={{
                      boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                )}
                
                <FlippableVenueCard
                  venue={venue}
                  onVenueClick={onVenueClick}
                  isFeatured={true}
                  onFlipChange={(isFlipped) => setHasFlippedCard(isFlipped)}
                  onBookClick={onBookClick}
                  onWalkIn={onWalkIn}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Elegant Progress Indicators */}
      <div className="flex items-center justify-center gap-2.5 mt-6">
        {venues.map((_, index) => {
          const isActive = index === centerIndex;
          
          return (
            <button
              key={index}
              onClick={() => {
                if (scrollContainerRef.current) {
                  handleUserInteractionStart();
                  const targetPosition = (venues.length * 2 + index) * (cardWidth + gap);
                  scrollContainerRef.current.scrollTo({
                    left: targetPosition,
                    behavior: 'smooth'
                  });
                  scrollPositionRef.current = targetPosition;
                  handleUserInteractionEnd();
                }
              }}
              className={`relative transition-all duration-500 rounded-full overflow-hidden ${ 
                isActive 
                  ? 'w-12 h-2.5' 
                  : 'w-2 h-2 hover:scale-125'
              }`}
              style={{
                background: isActive 
                  ? 'linear-gradient(90deg, #CD7F32 0%, #D4AF37 30%, #FFD700 50%, #D4AF37 70%, #CD7F32 100%)'
                  : 'rgba(212, 175, 55, 0.3)',
                boxShadow: isActive 
                  ? '0 2px 12px rgba(212, 175, 55, 0.5), 0 0 24px rgba(212, 175, 55, 0.2)' 
                  : 'none',
                border: isActive ? '1px solid rgba(255, 215, 0, 0.3)' : 'none'
              }}
              aria-label={`Go to slide ${index + 1}`}
            >
              {isActive && (
                <div 
                  className="absolute inset-0 animate-shimmer"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Premium Auto-play Indicator */}
      {!isUserInteracting && (
        <div className="absolute top-6 right-6 z-20">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.3) 100%)',
              backdropFilter: 'blur(12px)',
              borderColor: 'rgba(212, 175, 55, 0.3)',
            }}
          >
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-[#D4AF37] opacity-75 animate-ping-slow" />
              <div className="relative w-2 h-2 rounded-full bg-gradient-to-br from-[#FFD700] to-[#D4AF37] shadow-lg" 
                style={{ boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)' }}
              />
            </div>
            <span className="text-white text-xs font-semibold tracking-wider">LIVE</span>
          </div>
        </div>
      )}
      
      {/* Premium decorative border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      
      {/* Premium CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.75;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
}