import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { gamesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Copy, Users, Gamepad2, MessageSquare, DollarSign, Tv, Settings, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { TransactionsManagement } from '@/components/admin/TransactionsManagement';
import { StreamingsManagement } from '@/components/admin/StreamingsManagement';
import { GlobalSettings } from '@/components/admin/GlobalSettings';
import { CategoriesManagement } from '@/components/admin/CategoriesManagement';

type ContentLanguage = 'pt' | 'en' | 'es';

interface Game {
  id: string;
  title: string;
  cover_url: string;
  description: string;
  description_en?: string | null;
  description_es?: string | null;
  gradient: string;
  login: string;
  password: string;
  family_code?: string | null;
  is_release?: boolean;
  tutorial: any;
  tutorial_en?: any;
  tutorial_es?: any;
}

interface GameFormState {
  title: string;
  cover_url: string;
  description: string;
  description_en: string;
  description_es: string;
  gradient: string;
  login: string;
  password: string;
  family_code: string;
  is_release: boolean;
  tutorial: string;
  tutorial_en: string;
  tutorial_es: string;
}

const LANGUAGE_OPTIONS: Array<{ id: ContentLanguage; label: string }> = [
  { id: 'pt', label: 'PT' },
  { id: 'en', label: 'EN' },
  { id: 'es', label: 'ES' },
];

const DESCRIPTION_LABELS: Record<ContentLanguage, string> = {
  pt: 'Descrição (PT)',
  en: 'Description (EN)',
  es: 'Descripción (ES)',
};

const TUTORIAL_LABELS: Record<ContentLanguage, string> = {
  pt: 'Tutorial (PT) - uma etapa por linha',
  en: 'Tutorial (EN) - one step per line',
  es: 'Tutorial (ES) - una etapa por línea',
};

const TUTORIAL_PLACEHOLDERS: Record<ContentLanguage, string> = {
  pt: 'Instalar a Steam\nFazer login\nBaixar o jogo',
  en: 'Install Steam\nSign in\nDownload the game',
  es: 'Instalar Steam\nIniciar sesión\nDescargar el juego',
};

const initialFormState: GameFormState = {
  title: '',
  cover_url: '',
  description: '',
  description_en: '',
  description_es: '',
  gradient: 'from-red-600 to-orange-700',
  login: '',
  password: '',
  family_code: '',
  is_release: false,
  tutorial: '',
  tutorial_en: '',
  tutorial_es: '',
};

const arrayToMultiline = (value: any): string => {
  if (!value) return '';
  if (Array.isArray(value)) return value.join('\n');
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.join('\n') : value;
    } catch {
      return value;
    }
  }
  return '';
};

const multilineToArray = (value: string): string[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [formData, setFormData] = useState<GameFormState>(initialFormState);
  const [activeContentLanguage, setActiveContentLanguage] = useState<ContentLanguage>('pt');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchGames();
    }
  }, [isAdmin]);

  const fetchGames = async () => {
    try {
      const data = await gamesApi.getAll();
      setGames(data ?? []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os jogos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openDuplicateDialog = (game: Game) => {
    setEditingGame(null);
    setFormData({
      title: '',
      cover_url: '',
      description: game.description,
      description_en: game.description_en ?? '',
      description_es: game.description_es ?? '',
      gradient: game.gradient,
      login: '',
      password: '',
      family_code: '',
      is_release: false,
      tutorial: arrayToMultiline(game.tutorial),
      tutorial_en: arrayToMultiline(game.tutorial_en),
      tutorial_es: arrayToMultiline(game.tutorial_es),
    });
    setActiveContentLanguage('pt');
    setShowDialog(true);
  };

  const openEditDialog = (game?: Game) => {
    if (game) {
      setEditingGame(game);
      setFormData({
        title: game.title,
        cover_url: game.cover_url,
        description: game.description,
        description_en: game.description_en ?? '',
        description_es: game.description_es ?? '',
        gradient: game.gradient,
        login: game.login,
        password: game.password,
        family_code: game.family_code ?? '',
        is_release: game.is_release ?? false,
        tutorial: arrayToMultiline(game.tutorial),
        tutorial_en: arrayToMultiline(game.tutorial_en),
        tutorial_es: arrayToMultiline(game.tutorial_es),
      });
    } else {
      setEditingGame(null);
      setFormData(initialFormState);
    }
    setActiveContentLanguage('pt');
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const tutorialPt = multilineToArray(formData.tutorial);
      const tutorialEn = multilineToArray(formData.tutorial_en);
      const tutorialEs = multilineToArray(formData.tutorial_es);

      const descriptionEn = formData.description_en.trim();
      const descriptionEs = formData.description_es.trim();

      const payload = {
        title: formData.title,
        cover_url: formData.cover_url,
        description: formData.description,
        description_en: descriptionEn || null,
        description_es: descriptionEs || null,
        gradient: formData.gradient,
        login: formData.login,
        password: formData.password,
        family_code: formData.family_code || null,
        is_release: formData.is_release,
        tutorial: tutorialPt,
        tutorial_en: tutorialEn,
        tutorial_es: tutorialEs,
      };

      if (editingGame) {
        await gamesApi.update(editingGame.id, payload);

        toast({
          title: 'Jogo atualizado!',
          description: 'As informações foram atualizadas com sucesso.',
        });
      } else {
        await gamesApi.create(payload);

        toast({
          title: 'Jogo criado!',
          description: 'O jogo foi adicionado ao catálogo.',
        });
      }

      setShowDialog(false);
      setFormData(initialFormState);
      setActiveContentLanguage('pt');
      fetchGames();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (game: Game) => {
    setGameToDelete(game);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!gameToDelete) return;

    try {
      await gamesApi.delete(gameToDelete.id);

      toast({
        title: 'Jogo excluído',
        description: 'O jogo foi removido do catálogo.',
      });

      setShowDeleteDialog(false);
      fetchGames();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredGames = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    if (!normalizedQuery) return games;

    return games.filter((game) => {
      const titleMatch = game.title.toLowerCase().includes(normalizedQuery);
      const descMatch = game.description.toLowerCase().includes(normalizedQuery);
      const loginMatch = game.login.toLowerCase().includes(normalizedQuery);
      const descriptionEnMatch = (game.description_en ?? '').toLowerCase().includes(normalizedQuery);
      const descriptionEsMatch = (game.description_es ?? '').toLowerCase().includes(normalizedQuery);

      return titleMatch || descMatch || loginMatch || descriptionEnMatch || descriptionEsMatch;
    });
  }, [games, searchTerm]);

  const descriptionValue = useMemo(() => {
    switch (activeContentLanguage) {
      case 'en':
        return formData.description_en;
      case 'es':
        return formData.description_es;
      default:
        return formData.description;
    }
  }, [activeContentLanguage, formData.description, formData.description_en, formData.description_es]);

  const tutorialValue = useMemo(() => {
    switch (activeContentLanguage) {
      case 'en':
        return formData.tutorial_en;
      case 'es':
        return formData.tutorial_es;
      default:
        return formData.tutorial;
    }
  }, [activeContentLanguage, formData.tutorial, formData.tutorial_en, formData.tutorial_es]);

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => {
      if (activeContentLanguage === 'en') {
        return { ...prev, description_en: value };
      }
      if (activeContentLanguage === 'es') {
        return { ...prev, description_es: value };
      }
      return { ...prev, description: value };
    });
  };

  const handleTutorialChange = (value: string) => {
    setFormData((prev) => {
      if (activeContentLanguage === 'en') {
        return { ...prev, tutorial_en: value };
      }
      if (activeContentLanguage === 'es') {
        return { ...prev, tutorial_es: value };
      }
      return { ...prev, tutorial: value };
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingOverlay
          open={authLoading || loading}
          title={t.loadingAdmin}
          footerLabel="Painel Administrativo"
        />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => { }} />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Gerencie jogos e usuários da plataforma
          </p>
        </div>

        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-5xl mb-6">
            <TabsTrigger value="games" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Gamepad2 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Jogos</span>
            </TabsTrigger>
            <TabsTrigger value="streamings" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Tv className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Streamings</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
              <DollarSign className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Transações</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar jogos..."
                  className="h-9 sm:h-10 rounded-xl bg-background/70 border-border/60 text-sm sm:text-base w-full sm:w-64"
                />
                <Button
                  onClick={() => openEditDialog()}
                  className="inline-flex items-center gap-2 rounded-xl text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar jogo
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredGames.map((game) => (
                <Card key={game.id} className="border-border bg-card/60 backdrop-blur">
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-foreground">{game.title}</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                          {game.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Informações de acesso</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="rounded-lg border border-border/50 bg-background/70 p-3 text-sm">
                          <span className="block text-muted-foreground text-xs mb-1">Login</span>
                          <span className="font-medium text-foreground break-words">{game.login}</span>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-background/70 p-3 text-sm">
                          <span className="block text-muted-foreground text-xs mb-1">Senha</span>
                          <span className="font-medium text-foreground break-words">{game.password}</span>
                        </div>
                      </div>
                      {game.family_code && (
                        <div className="rounded-lg border border-border/50 bg-background/70 p-3 text-sm">
                          <span className="block text-muted-foreground text-xs mb-1">Modo Família</span>
                          <span className="font-medium text-foreground break-words">{game.family_code}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => openEditDialog(game)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-lg"
                        onClick={() => openDuplicateDialog(game)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-lg"
                        onClick={() => handleDeleteClick(game)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {games.length === 0 && (
                <div className="col-span-full border border-dashed border-border/60 rounded-2xl p-10 text-center text-muted-foreground">
                  Nenhum jogo cadastrado ainda.
                </div>
              )}
              {games.length > 0 && filteredGames.length === 0 && (
                <div className="col-span-full border border-dashed border-border/60 rounded-2xl p-10 text-center text-muted-foreground">
                  Nenhum jogo encontrado para a busca atual.
                </div>
              )}
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl md:text-2xl">
                    {editingGame ? 'Editar Jogo' : 'Adicionar Novo Jogo'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm sm:text-base">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-9 sm:h-10 rounded-xl text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover_url" className="text-sm sm:text-base">URL da Capa</Label>
                    <Input
                      id="cover_url"
                      value={formData.cover_url}
                      onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                      className="h-9 sm:h-10 rounded-xl text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm sm:text-base">
                        {DESCRIPTION_LABELS[activeContentLanguage]}
                      </Label>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {LANGUAGE_OPTIONS.map(({ id, label }) => (
                          <Button
                            key={id}
                            type="button"
                            size="sm"
                            variant={activeContentLanguage === id ? 'default' : 'outline'}
                            className="h-8 px-3"
                            onClick={() => setActiveContentLanguage(id)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      value={descriptionValue}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      rows={3}
                      className="rounded-xl text-sm sm:text-base resize-none"
                      required={activeContentLanguage === 'pt'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradient" className="text-sm sm:text-base">Gradiente (classes Tailwind)</Label>
                    <Input
                      id="gradient"
                      value={formData.gradient}
                      onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                      placeholder="from-red-600 to-orange-700"
                      className="h-9 sm:h-10 rounded-xl text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 border border-border/50 rounded-xl bg-background/50">
                    <div className="space-y-0.5">
                      <Label className="text-sm sm:text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        É Lançamento?
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Se marcado, aparecerá com destaque em Novidades
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_release}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_release: checked })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="login" className="text-sm sm:text-base">Login Steam</Label>
                      <Input
                        id="login"
                        value={formData.login}
                        onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                        className="h-9 sm:h-10 rounded-xl text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm sm:text-base">Senha</Label>
                      <Input
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-9 sm:h-10 rounded-xl text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="family_code" className="text-sm sm:text-base">Código Modo Família (opcional)</Label>
                    <Input
                      id="family_code"
                      value={formData.family_code}
                      onChange={(e) => setFormData({ ...formData, family_code: e.target.value })}
                      className="h-9 sm:h-10 rounded-xl text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">
                      {TUTORIAL_LABELS[activeContentLanguage]}
                    </Label>
                    <Textarea
                      value={tutorialValue}
                      onChange={(e) => handleTutorialChange(e.target.value)}
                      rows={5}
                      placeholder={TUTORIAL_PLACEHOLDERS[activeContentLanguage]}
                      className="rounded-xl text-sm sm:text-base resize-none"
                      required={activeContentLanguage === 'pt'}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use uma linha por passo. Altere a aba acima para editar as traduções.
                    </p>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowDialog(false)}
                      className="w-full sm:w-auto rounded-xl text-sm sm:text-base"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} className="w-full sm:w-auto rounded-xl text-sm sm:text-base">
                      {editingGame ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Modal de Exclusão de Jogo */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent className="sm:max-w-md border-destructive/20">
                <DialogHeader>
                  <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <Trash2 className="h-6 w-6 text-destructive" />
                  </div>
                  <DialogTitle className="text-center text-destructive">Excluir Jogo</DialogTitle>
                </DialogHeader>

                <div className="text-center space-y-4 py-4">
                  <p className="text-muted-foreground">
                    Tem certeza que deseja excluir permanentemente o jogo:
                  </p>
                  {gameToDelete && (
                    <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-lg">
                      <div className="font-semibold text-lg text-destructive">
                        {gameToDelete.title}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Esta ação não pode ser desfeita.
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteConfirm} className="flex-1">
                    Excluir Jogo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="streamings">
            <StreamingsManagement />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <GlobalSettings />
            <div className="border-t pt-8">
              <CategoriesManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
