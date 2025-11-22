import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface CarouselItem {
    id: string;
    item_id: string;
    item_type: 'game' | 'streaming';
    title?: string;
    name?: string;
    cover_url?: string;
    logo_url?: string;
    description?: string;
}

interface CategoryCarouselProps {
    title: string;
    items: CarouselItem[];
    color?: string;
}

export const CategoryCarousel = ({ title, items, color }: CategoryCarouselProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = container.clientWidth * 0.8;
        const newScrollLeft = direction === 'left'
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth',
        });
    };

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        setShowLeftArrow(container.scrollLeft > 0);
        setShowRightArrow(
            container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        );
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="relative group mb-8">
            {/* Header */}
            <div className="mb-4 px-4 sm:px-6 md:px-12">
                <h2 
                    className="text-xl sm:text-2xl font-bold flex items-center gap-2"
                    style={color ? { color } : {}}
                >
                    {color && (
                        <div
                            className="w-1 h-6 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                    )}
                    {title}
                </h2>
            </div>

            {/* Carousel */}
            <div className="relative">
                {/* Left Arrow */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:scale-110"
                    >
                        <div className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background">
                            <ChevronLeft className="h-6 w-6" />
                        </div>
                    </button>
                )}

                {/* Items Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6 md:px-12 pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.map((item) => {
                        const itemTitle = item.title || item.name || 'Sem título';
                        const itemImage = item.cover_url || item.logo_url;
                        const itemLink = item.item_type === 'game' 
                            ? `/game/${item.item_id}` 
                            : `/streaming/${item.item_id}`;
                        
                        return (
                            <Link
                                key={item.id}
                                to={itemLink}
                                className="flex-shrink-0 w-36 sm:w-44 md:w-52 group/item"
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                <div className="relative aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300 group-hover/item:scale-105 group-hover/item:shadow-2xl">
                                    {/* Image */}
                                    <img
                                        src={itemImage}
                                        alt={itemTitle}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />

                                    {/* Hover Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
                                        hoveredItem === item.id ? 'opacity-100' : 'opacity-0'
                                    }`}>
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <h3 className="font-bold text-white text-sm sm:text-base line-clamp-2">
                                                {itemTitle}
                                            </h3>
                                            {item.description && (
                                                <p className="text-xs text-white/80 mt-1 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            )}
                                            <div className="mt-2">
                                                <span className="text-xs px-2 py-1 bg-primary rounded-full text-white">
                                                    {item.item_type === 'game' ? 'Jogo' : 'Streaming'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badge de Tipo */}
                                    <div className="absolute top-2 right-2">
                                        <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
                                            item.item_type === 'game' 
                                                ? 'bg-blue-500/80 text-white' 
                                                : 'bg-purple-500/80 text-white'
                                        }`}>
                                            {item.item_type === 'game' ? '🎮' : '📺'}
                                        </span>
                                    </div>
                                </div>

                                {/* Title Below (visible on non-hover) */}
                                <div className="mt-2 px-1">
                                    <h3 className="font-semibold text-sm line-clamp-1 text-foreground">
                                        {itemTitle}
                                    </h3>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Right Arrow */}
                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:scale-110"
                    >
                        <div className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background">
                            <ChevronRight className="h-6 w-6" />
                        </div>
                    </button>
                )}
            </div>

            {/* Custom CSS for hiding scrollbar */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};
