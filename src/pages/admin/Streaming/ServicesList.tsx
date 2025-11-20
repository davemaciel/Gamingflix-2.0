import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { streamingApi } from '@/lib/api';
import { StreamingService } from '@/types/streaming';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ServicesList = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [services, setServices] = useState<StreamingService[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await streamingApi.getAllServices();
            setServices(data);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao carregar serviços de streaming',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

        try {
            await streamingApi.deleteService(id);
            toast({ title: 'Sucesso', description: 'Serviço excluído' });
            loadServices();
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao excluir serviço',
                variant: 'destructive',
            });
        }
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Serviços de Streaming</h2>
                <Button onClick={() => navigate('/admin/streaming/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                    <Card key={service.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {service.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {service.logo_url && (
                                <img
                                    src={service.logo_url}
                                    alt={service.name}
                                    className="h-12 w-auto object-contain mb-4"
                                />
                            )}
                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => navigate(`/admin/streaming/${service.id}/inventory`)}
                                >
                                    <Layers className="mr-2 h-4 w-4" /> Estoque
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(`/admin/streaming/${service.id}/edit`)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => handleDelete(service.id)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
