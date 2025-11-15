import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Check, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { openWhatsApp } from '@/config/whatsapp';
import { getFoundersPricing } from '@/config/founders';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const { t, language } = useLanguage();

  const { founders: foundersPrice } = getFoundersPricing(language);
  const foundersHighlight = t.foundersLimitedSpotsHighlight.replace('{{price}}', foundersPrice);

  const handleUpgrade = () => {
    onOpenChange(false);
    openWhatsApp(t.whatsappMessage);
  };

  const benefits = [
    t.features.unlimitedAccess,
    t.features.lifetimePrice,
    t.features.founderBadge,
    t.features.unlimitedSwap,
    t.features.vipSupport,
    t.features.offlineAccess,
    t.features.earlyAccess,
    t.features.catalogPriority,
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            {t.upgradeTitle}
          </DialogTitle>
          <DialogDescription className="text-center text-base text-muted-foreground">
            {t.upgradeDescription}
          </DialogDescription>
          <p className="text-xs text-center font-semibold text-primary mt-2">
            {foundersHighlight}
          </p>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="rounded-2xl bg-muted/60 p-4 space-y-3">
            <h4 className="font-semibold text-sm text-foreground">
              {t.upgradeBenefitsTitle}
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-2xl"
            >
              {t.upgradeBack}
            </Button>
            <Button
              onClick={handleUpgrade}
              className="flex-1 rounded-2xl gap-2 bg-primary hover:bg-primary/90"
            >
              <MessageCircle className="h-4 w-4" />
              {t.upgradeViewPlans}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
