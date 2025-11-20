import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, LogOut, Settings, Crown, User, FileText } from 'lucide-react';
import { LanguageSelector, LanguageSelectorCompact } from '@/components/LanguageSelector';
import logo from '@/assets/logo.png';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export const Header = ({ onSearch }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { subscription, hasActiveSubscription, isFounder } = useSubscription();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        {/* Layout Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/catalogo" className="flex-shrink-0">
            <img src={logo} alt="GamingFlix" className="h-8 w-auto max-w-[180px]" />
          </Link>

          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <>
                {hasActiveSubscription && subscription && (
                  <Badge
                    variant="secondary"
                    className={`flex items-center gap-1 ${isFounder
                      ? 'bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-yellow-600/50 text-yellow-600'
                      : ''
                      }`}
                  >
                    <Crown className="h-3 w-3" />
                    {subscription.plan.name}
                  </Badge>
                )}
                <LanguageSelector />
                {!hasActiveSubscription && (
                  <Button variant="default" size="sm" onClick={() => navigate('/')}>
                    <Crown className="mr-2 h-4 w-4" />
                    {t.subscribe}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/profile');
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  {user.username || user.email}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Faturas
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t.admin}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.logout}
                </Button>
              </>
            ) : (
              <>
                <LanguageSelector />
                <Button variant="ghost" onClick={() => navigate('/')}>
                  {t.plans}
                </Button>
                <Button onClick={() => navigate('/auth')}>{t.login}</Button>
              </>
            )}
          </div>
        </div>

        {/* Layout Mobile */}
        <div className="md:hidden space-y-3">
          {/* Linha 1: Logo e botoes de acao */}
          <div className="flex items-center justify-between gap-4">
            <Link to="/catalogo" className="flex-shrink-0">
              <img src={logo} alt="GamingFlix" className="h-6 sm:h-8 w-auto max-w-[120px] sm:max-w-[160px] object-contain" />
            </Link>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {user ? (
                <>
                  {!hasActiveSubscription && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate('/')}
                      className="h-10 w-10 rounded-full border-input"
                    >
                      <Crown className="h-5 w-5" />
                    </Button>
                  )}
                  {hasActiveSubscription && subscription && (
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full border border-input bg-secondary text-secondary-foreground ${isFounder
                        ? 'bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-yellow-600/50 text-yellow-600'
                        : ''
                        }`}
                    >
                      <Crown className="h-5 w-5" />
                    </div>
                  )}
                  <LanguageSelectorCompact />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/profile');
                    }}
                    className="h-10 w-10 rounded-full border-input"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/invoices')}
                    className="h-10 w-10 rounded-full border-input"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate('/admin')}
                      className="h-10 w-10 rounded-full border-input"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-10 w-10 rounded-full border-input"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <LanguageSelectorCompact />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="h-8 px-2 text-xs"
                  >
                    {t.plans}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/auth')}
                    className="h-8 px-3 text-xs"
                  >
                    {t.login}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Linha 2: Barra de busca */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={handleSearch}
              className="h-10 w-full pl-10 text-base"
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
