import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AuthDialog } from "@/components/AuthDialog";
import { UpgradeModal } from "@/components/UpgradeModal";

interface Game {
  id: string;
  title: string;
  cover_url: string;
  gradient: string;
  is_release?: boolean;
}

interface User {
  id: string;
  email: string;
  username?: string;
}

interface GameCardProps {
  game: Game;
  user: User | null;
  hasCatalogAccess: boolean;
  subscriptionLoading: boolean;
}

export const GameCard = ({ game, user, hasCatalogAccess, subscriptionLoading }: GameCardProps) => {
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleClick = () => {
    if (subscriptionLoading) {
      return;
    }

    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (!hasCatalogAccess) {
      setShowUpgradeModal(true);
      return;
    }

    navigate(`/game/${game.id}`);
  };

  const cardStateClasses = subscriptionLoading
    ? "cursor-wait opacity-75"
    : "cursor-pointer";

  return (
    <>
      <Card
        onClick={handleClick}
        className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border-0 bg-card transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_hsl(0_84%_50%/0.3)] active:scale-95 ${cardStateClasses}`}
      >
        <div className="aspect-square relative overflow-hidden rounded-2xl sm:rounded-3xl">
          <div className={`absolute inset-0 bg-gradient-to-t ${game.gradient} opacity-20`} />
          <img
            src={game.cover_url}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 rounded-2xl sm:rounded-3xl"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badge de Lançamento */}
          {game.is_release && (
            <div className="absolute top-2 right-2 z-10">
              <span className="px-2 py-1 bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg animate-pulse">
                NOVO
              </span>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-foreground font-semibold text-xs sm:text-sm line-clamp-2 drop-shadow-lg">
            {game.title}
          </h3>
        </div>
      </Card>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        redirectTo={`/game/${game.id}`}
      />

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
    </>
  );
};
