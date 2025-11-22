import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface HeroItem {
    id: string;
    item_id: string;
    item_type: 'game' | 'streaming';
    title?: string;
    name?: string;
    cover_url?: string;
    description?: string;
}

interface HeroSectionProps {
    items: HeroItem[];
    autoPlay?: boolean;
    interval?: number;
}

export const HeroSection = ({ items, autoPlay = true, interval = 5000 }: HeroSectionProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

    useEffect(() => {
        if (!isAutoPlaying || items.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, interval);

        return () => clearInterval(timer);
    }, [isAutoPlaying, items.length, interval]);

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setIsAutoPlaying(false);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        setIsAutoPlaying(false);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
    };

    if (!items || items.length === 0) return null;

    const currentItem = items[currentIndex];
    const itemTitle = currentItem.title || currentItem.name || 'Sem título';
    const itemLink = currentItem.item_type === 'game' 
        ? `/game/${currentItem.item_id}` 
        : `/streaming/${currentItem.item_id}`;

    return (
        <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
            {/* Background Images */}
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <img
                        src={item.cover_url}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent"></div>
                </div>
            ))}

            {/* Content */}
            <div className="relative h-full flex items-end pb-12 sm:pb-16 md:pb-20">
                <div className="container mx-auto px-4 sm:px-6 md:px-12">
                    <div className="max-w-2xl space-y-4 sm:space-y-6">
                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl animate-fade-in">
                            {itemTitle}
                        </h1>

                        {/* Description */}
                        {currentItem.description && (
                            <p className="text-sm sm:text-base md:text-lg text-white/90 line-clamp-3 drop-shadow-lg animate-fade-in-delay">
                                {currentItem.description}
                            </p>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-3 sm:gap-4 animate-fade-in-delay-2">
                            <Link to={itemLink}>
                                <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold gap-2">
                                    <Play className="h-5 w-5" fill="currentColor" />
                                    Acessar Agora
                                </Button>
                            </Link>
                            <Link to={itemLink}>
                                <Button 
                                    size="lg" 
                                    variant="outline" 
                                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 font-semibold gap-2"
                                >
                                    <Info className="h-5 w-5" />
                                    Mais Informações
                                </Button>
                            </Link>
                        </div>

                        {/* Badge */}
                        <div className="flex gap-2">
                            <span className={`text-xs sm:text-sm px-3 py-1 rounded-full backdrop-blur-sm ${
                                currentItem.item_type === 'game' 
                                    ? 'bg-blue-500/80 text-white' 
                                    : 'bg-purple-500/80 text-white'
                            }`}>
                                {currentItem.item_type === 'game' ? '🎮 Jogo' : '📺 Streaming'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all hover:scale-110"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all hover:scale-110"
                        aria-label="Próximo"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </>
            )}

            {/* Dots Navigation */}
            {items.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                index === currentIndex 
                                    ? 'bg-white w-8' 
                                    : 'bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`Ir para slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Custom Animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out;
                }

                .animate-fade-in-delay {
                    animation: fadeIn 0.6s ease-out 0.2s both;
                }

                .animate-fade-in-delay-2 {
                    animation: fadeIn 0.6s ease-out 0.4s both;
                }
            `}</style>
        </div>
    );
};
