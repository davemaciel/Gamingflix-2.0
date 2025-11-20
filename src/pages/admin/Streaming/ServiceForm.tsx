import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { streamingApi } from '@/lib/api';
import { StreamingService } from '@/types/streaming';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export const ServiceForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        logo_url: '',
        cover_url: '',
        description: '',
    });

    useEffect(() => {
        if (id && id !== 'new') {
            loadService();
        }
    }, [id]);

    const loadService = async () => {
        try {
            const service = await streamingApi.getServiceById(id!);
            setFormData({
                name: service.name,
                logo_url: service.logo_url || '',
                cover_url: service.cover_url || '',
                description: service.description || '',
            });
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao carregar serviço',
                variant: 'destructive',
            });
            navigate('/admin/streaming');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (id && id !== 'new') {
                await streamingApi.updateService(id, formData);
                toast({ title: 'Sucesso', description: 'Serviço atualizado' });
            } else {
                await streamingApi.createService(formData);
                toast({ title: 'Sucesso', description: 'Serviço criado' });
            }
            navigate('/admin/streaming');
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao salvar serviço',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <Button variant="ghost" onClick={() => navigate('/admin/streaming')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>{id && id !== 'new' ? 'Editar' : 'Novo'} Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Serviço</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Netflix"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo_url">URL do Logo</Label>
                            <Input
                                id="logo_url"
                                placeholder="https://..."
                                value={formData.logo_url}
                                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cover_url">URL da Capa</Label>
                            <Input
                                id="cover_url"
                                placeholder="https://..."
                                value={formData.cover_url}
                                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                placeholder="Descrição do serviço..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/admin/streaming')}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
