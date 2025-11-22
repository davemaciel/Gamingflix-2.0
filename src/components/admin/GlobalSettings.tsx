import { useEffect, useState } from 'react';
import { categoriesApi } from '@/lib/api';
import { GlobalSettings as GlobalSettingsType } from '@/types/category';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Settings2 } from 'lucide-react';

export const GlobalSettings = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState<GlobalSettingsType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await categoriesApi.getGlobalSettings();
            setSettings(data);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao carregar configurações',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        try {
            await categoriesApi.updateGlobalSettings(settings);
            toast({
                title: 'Sucesso',
                description: 'Configurações salvas com sucesso',
            });
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao salvar configurações',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!settings) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Settings2 className="h-6 w-6" />
                        Configurações Gerais
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Configure o comportamento global do sistema de categorias
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Categoria "Últimas Adições" */}
                <Card>
                    <CardHeader>
                        <CardTitle>Categoria "Últimas Adições"</CardTitle>
                        <CardDescription>
                            Categoria automática que mostra os jogos e streamings adicionados recentemente
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Ativar categoria automática</Label>
                                <p className="text-sm text-muted-foreground">
                                    Mostra automaticamente itens recentes na home
                                </p>
                            </div>
                            <Switch
                                checked={settings.show_latest_additions}
                                onCheckedChange={(checked) =>
                                    setSettings({ ...settings, show_latest_additions: checked })
                                }
                            />
                        </div>

                        {settings.show_latest_additions && (
                            <div className="space-y-2">
                                <Label htmlFor="latest_limit">Limite de itens</Label>
                                <Input
                                    id="latest_limit"
                                    type="number"
                                    min="4"
                                    max="24"
                                    value={settings.latest_additions_limit}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            latest_additions_limit: parseInt(e.target.value) || 12,
                                        })
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Quantos itens mostrar (recomendado: 12)
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Categoria "Populares" */}
                <Card>
                    <CardHeader>
                        <CardTitle>Categoria "Populares"</CardTitle>
                        <CardDescription>
                            Categoria automática baseada em acessos e interações dos usuários
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Ativar categoria de populares</Label>
                                <p className="text-sm text-muted-foreground">
                                    Mostra os itens mais acessados
                                </p>
                            </div>
                            <Switch
                                checked={settings.show_popular}
                                onCheckedChange={(checked) =>
                                    setSettings({ ...settings, show_popular: checked })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Hero Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Section</CardTitle>
                        <CardDescription>
                            Configure a seção de destaque no topo da página inicial
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="hero_type">Tipo de Hero</Label>
                            <select
                                id="hero_type"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={settings.hero_type}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        hero_type: e.target.value as 'carousel' | 'static' | 'video',
                                    })
                                }
                            >
                                <option value="carousel">Carrossel Automático</option>
                                <option value="static">Imagem Estática</option>
                                <option value="video">Vídeo de Fundo</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Tema */}
                <Card>
                    <CardHeader>
                        <CardTitle>Aparência</CardTitle>
                        <CardDescription>Configurações visuais do sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="theme_mode">Modo de Tema</Label>
                            <select
                                id="theme_mode"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={settings.theme_mode}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        theme_mode: e.target.value as 'dark' | 'light' | 'auto',
                                    })
                                }
                            >
                                <option value="dark">Escuro</option>
                                <option value="light">Claro</option>
                                <option value="auto">Automático (Sistema)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
