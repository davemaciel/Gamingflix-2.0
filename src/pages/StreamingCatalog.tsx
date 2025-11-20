import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { streamingApi } from '@/lib/api';
import { StreamingService } from '@/types/streaming';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/components/LoadingOverlay';

const StreamingCatalog = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [services, setServices] = useState<StreamingService[]>([]);
    const [filteredServices, setFilteredServices] = useState<StreamingService[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await streamingApi.getAllServices();
            setServices(data);
            setFilteredServices(data);
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

    const handleSearch = (query: string) => {
        if (!query.trim()) {
            setFilteredServices(services);
            return;
        }

        const filtered = services.filter((service) =>
            service.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredServices(filtered);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <LoadingOverlay
                    open={loading}
                    title="Carregando Streamings"
                    footerLabel="GamingFlix Ultimate Founders"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <Header onSearch={handleSearch} />

            <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                        Serviços de Streaming
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        {filteredServices.length} {filteredServices.length === 1 ? 'serviço disponível' : 'serviços disponíveis'}
                    </p>
                </div>

                {filteredServices.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground text-base sm:text-lg">
                            Nenhum serviço encontrado
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {filteredServices.map((service) => (
                            <Card
                                key={service.id}
                                className="cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                                onClick={() => navigate(`/streaming/${service.id}`)}
                            >
                                <CardContent className="p-0">
                                    <div className="aspect-square relative">
                                        {service.cover_url ? (
                                            <img
                                                src={service.cover_url}
                                                alt={service.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                <span className="text-xl font-bold text-primary">
                                                    {service.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-semibold text-sm truncate">{service.name}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StreamingCatalog;
