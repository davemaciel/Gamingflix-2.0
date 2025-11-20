import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Search, LogOut, Settings, Crown, User, FileText, Menu as MenuIcon } from 'lucide-react';
import { LanguageSelector, LanguageSelectorCompact } from '@/components/LanguageSelector';
import logo from '@/assets/logo.png';

interface HeaderProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export const Header = ({ onSearch, initialQuery = '' }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { subscription, hasActiveSubscription, isFounder } = useSubscription();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const isCatalogPage = location.pathname === '/catalogo';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Se estiver no catálogo, faz a busca em tempo real
    if (isCatalogPage) {
      onSearch(query);
    }
  };

  const handleSearchSubmit = () => {
    if (!isCatalogPage && searchQuery.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
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
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={handleSearchSubmit}
            />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
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
                <Button variant="ghost" size="sm" onClick={() => navigate('/streaming')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Streamings
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
        <div className="md:hidden flex flex-col gap-3">
          {/* Linha Superior: Logo (Esq) e Ações (Dir) */}
          <div className="flex items-center justify-between">
            <Link to="/catalogo" className="flex-shrink-0">
              <img src={logo} alt="GamingFlix" className="h-7 w-auto max-w-[140px] object-contain" />
            </Link>

            <div className="flex items-center gap-2">
              {/* Badge de Assinatura (Visível se existir) */}
              {user && hasActiveSubscription && subscription && (
                <div
                  className={`flex items-center justify-center h-9 w-9 rounded-full border border-input bg-secondary text-secondary-foreground ${isFounder
                    ? 'bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-yellow-600/50 text-yellow-600'
                    : ''
                    }`}
                >
                  <Crown className="h-4 w-4" />
                </div>
              )}

              {/* Menu Lateral (Sheet) */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle className="text-left flex items-center gap-2">
                      <img src={logo} alt="GamingFlix" className="h-6 w-auto" />
                      <span className="sr-only">Menu</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col gap-4 mt-6">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-muted/50">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-medium truncate">{user.username || 'Usuário'}</span>
                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <SheetClose asChild>
                            <Button variant="ghost" className="justify-start" onClick={() => navigate('/profile')}>
                              <User className="mr-2 h-4 w-4" />
                              Meu Perfil
                            </Button>
                          </SheetClose>

                          <SheetClose asChild>
                            <Button variant="ghost" className="justify-start" onClick={() => navigate('/streaming')}>
                              <FileText className="mr-2 h-4 w-4" />
                              Streamings
                            </Button>
                          </SheetClose>

                          <SheetClose asChild>
                            <Button variant="ghost" className="justify-start" onClick={() => navigate('/invoices')}>
                              <FileText className="mr-2 h-4 w-4" />
                              Minhas Faturas
                            </Button>
                          </SheetClose>

                          {!hasActiveSubscription && (
                            <SheetClose asChild>
                              <Button variant="default" className="justify-start" onClick={() => navigate('/')}>
                                <Crown className="mr-2 h-4 w-4" />
                                Assinar Agora
                              </Button>
                            </SheetClose>
                          )}

                          {isAdmin && (
                            <SheetClose asChild>
                              <Button variant="ghost" className="justify-start" onClick={() => navigate('/admin')}>
                                <Settings className="mr-2 h-4 w-4" />
                                Admin
                              </Button>
                            </SheetClose>
                          )}
                        </div>

                        <div className="h-px bg-border my-2" />

                        <div className="flex items-center justify-between px-2">
                          <span className="text-sm text-muted-foreground">Idioma</span>
                          <LanguageSelectorCompact />
                        </div>

                        <div className="h-px bg-border my-2" />

                        <SheetClose asChild>
                          <Button variant="ghost" className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                          </Button>
                        </SheetClose>
                      </>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-2 mb-4">
                          <span className="text-sm text-muted-foreground">Idioma</span>
                          <LanguageSelectorCompact />
                        </div>
                        <SheetClose asChild>
                          <Button onClick={() => navigate('/auth')}>
                            {t.login}
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button variant="outline" onClick={() => navigate('/')}>
                            {t.plans}
                          </Button>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Linha Inferior: Busca */}
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10 cursor-pointer"
              onClick={handleSearchSubmit}
            />
            <Input
              type="search"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="h-10 w-full pl-10 text-base bg-muted/30"
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
