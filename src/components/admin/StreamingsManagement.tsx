import { useEffect, useState } from 'react';
import { streamingApi } from '@/lib/api';
import { StreamingService, StreamingAccount } from '@/types/streaming';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Layers, Users, X } from 'lucide-react';

export const StreamingsManagement = () => {
    const { toast } = useToast();
    const [services, setServices] = useState<StreamingService[]>([]);
    const [loading, setLoading] = useState(true);
    const [showServiceDialog, setShowServiceDialog] = useState(false);
    const [showInventoryDialog, setShowInventoryDialog] = useState(false);
    const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false);
    const [editingService, setEditingService] = useState<StreamingService | null>(null);
    const [selectedService, setSelectedService] = useState<StreamingService | null>(null);
    const [accounts, setAccounts] = useState<StreamingAccount[]>([]);
    const [assignedProfiles, setAssignedProfiles] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [serviceForm, setServiceForm] = useState({
        name: '',
        logo_url: '',
        cover_url: '',
        description: '',
        checkout_url: '',
    });

    const [accountForm, setAccountForm] = useState({
        email: '',
        password: '',
        profiles: [{ name: '', pin: '' }],
    });

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
                description: 'Falha ao carregar serviços',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const openServiceDialog = (service?: StreamingService) => {
        if (service) {
            setEditingService(service);
            setServiceForm({
                name: service.name,
                logo_url: service.logo_url || '',
                cover_url: service.cover_url || '',
                description: service.description || '',
                checkout_url: service.checkout_url || '',
            });
        } else {
            setEditingService(null);
            setServiceForm({ name: '', logo_url: '', cover_url: '', description: '', checkout_url: '' });
        }
        setShowServiceDialog(true);
    };

    const handleSaveService = async () => {
        try {
            if (editingService) {
                await streamingApi.updateService(editingService.id, serviceForm);
                toast({ title: 'Sucesso', description: 'Serviço atualizado' });
            } else {
                await streamingApi.createService(serviceForm);
                toast({ title: 'Sucesso', description: 'Serviço criado' });
            }
            setShowServiceDialog(false);
            loadServices();
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao salvar serviço',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteService = async (id: string) => {
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

    const openInventoryDialog = async (service: StreamingService) => {
        setSelectedService(service);
        try {
            const data = await streamingApi.getAccountsByService(service.id);
            setAccounts(data);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao carregar contas',
                variant: 'destructive',
            });
        }
        setShowInventoryDialog(true);
    };

    const handleAddProfile = () => {
        setAccountForm({
            ...accountForm,
            profiles: [...accountForm.profiles, { name: '', pin: '' }],
        });
    };

    const handleRemoveProfile = (index: number) => {
        const newProfiles = accountForm.profiles.filter((_, i) => i !== index);
        setAccountForm({ ...accountForm, profiles: newProfiles });
    };

    const handleSaveAccount = async () => {
        try {
            await streamingApi.createAccount({
                service_id: selectedService!.id,
                email: accountForm.email,
                password: accountForm.password,
                profiles: accountForm.profiles,
            } as any);

            toast({ title: 'Sucesso', description: 'Conta adicionada' });
            setAccountForm({ email: '', password: '', profiles: [{ name: '', pin: '' }] });

            const data = await streamingApi.getAccountsByService(selectedService!.id);
            setAccounts(data);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao adicionar conta',
                variant: 'destructive',
            });
        }
    };

    const openAssignmentsDialog = async (service: StreamingService) => {
        setSelectedService(service);
        try {
            const response = await fetch(`/api/streaming/services/${service.id}/assigned-profiles`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setAssignedProfiles(data);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao carregar atribuições',
                variant: 'destructive',
            });
        }
        setShowAssignmentsDialog(true);
    };

    const handleUnassignProfile = async (profileId: string) => {
        if (!confirm('Deseja realmente desvincular este perfil? O usuário perderá acesso imediatamente.')) {
            return;
        }

        try {
            await fetch(`/api/streaming/profiles/${profileId}/unassign`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            toast({ title: 'Sucesso', description: 'Perfil desvinculado' });
            
            // Recarregar lista
            if (selectedService) {
                const response = await fetch(`/api/streaming/services/${selectedService.id}/assigned-profiles`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                setAssignedProfiles(data);
            }
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao desvincular perfil',
                variant: 'destructive',
            });
        }
    };

    const filteredServices = services.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <Input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar serviços..."
                        className="h-9 sm:h-10 rounded-xl bg-background/70 border-border/60 text-sm sm:text-base w-full sm:w-64"
                    />
                    <Button
                        onClick={() => openServiceDialog()}
                        className="inline-flex items-center gap-2 rounded-xl text-sm sm:text-base"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar Serviço
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {filteredServices.map((service) => (
                    <Card key={service.id} className="border-border bg-card/60 backdrop-blur">
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                                        {service.name}
                                    </h2>
                                    {service.description && (
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                                            {service.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-end">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg"
                                    onClick={() => openInventoryDialog(service)}
                                >
                                    <Layers className="h-4 w-4 mr-2" />
                                    Estoque
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
                                    onClick={() => openAssignmentsDialog(service)}
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Atribuições
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg"
                                    onClick={() => openServiceDialog(service)}
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="rounded-lg"
                                    onClick={() => handleDeleteService(service.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {services.length === 0 && (
                    <div className="col-span-full border border-dashed border-border/60 rounded-2xl p-10 text-center text-muted-foreground">
                        Nenhum serviço cadastrado ainda.
                    </div>
                )}
            </div>

            {/* Service Dialog */}
            <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome do Serviço</Label>
                            <Input
                                placeholder="Ex: Netflix"
                                value={serviceForm.name}
                                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>URL do Checkout (GGCheckout)</Label>
                            <Input
                                placeholder="https://checkout.ggcheckout.com/..."
                                value={serviceForm.checkout_url}
                                onChange={(e) => setServiceForm({ ...serviceForm, checkout_url: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                URL do checkout criado no GGCheckout para este serviço
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>URL do Logo</Label>
                            <Input
                                placeholder="https://..."
                                value={serviceForm.logo_url}
                                onChange={(e) => setServiceForm({ ...serviceForm, logo_url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>URL da Capa</Label>
                            <Input
                                placeholder="https://..."
                                value={serviceForm.cover_url}
                                onChange={(e) => setServiceForm({ ...serviceForm, cover_url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                placeholder="Descrição do serviço..."
                                value={serviceForm.description}
                                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveService}>Salvar</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Inventory Dialog */}
            <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Gerenciar Estoque - {selectedService?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <h3 className="font-semibold">Adicionar Nova Conta</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Email da Conta</Label>
                                        <Input
                                            placeholder="email@exemplo.com"
                                            value={accountForm.email}
                                            onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Senha</Label>
                                        <Input
                                            type="password"
                                            placeholder="••••••"
                                            value={accountForm.password}
                                            onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Perfis</Label>
                                        <Button type="button" size="sm" variant="outline" onClick={handleAddProfile}>
                                            <Plus className="h-4 w-4 mr-1" /> Perfil
                                        </Button>
                                    </div>
                                    {accountForm.profiles.map((profile, index) => (
                                        <div key={index} className="grid grid-cols-3 gap-2">
                                            <Input
                                                placeholder="Nome do Perfil"
                                                value={profile.name}
                                                onChange={(e) => {
                                                    const newProfiles = [...accountForm.profiles];
                                                    newProfiles[index].name = e.target.value;
                                                    setAccountForm({ ...accountForm, profiles: newProfiles });
                                                }}
                                            />
                                            <Input
                                                placeholder="PIN"
                                                value={profile.pin}
                                                onChange={(e) => {
                                                    const newProfiles = [...accountForm.profiles];
                                                    newProfiles[index].pin = e.target.value;
                                                    setAccountForm({ ...accountForm, profiles: newProfiles });
                                                }}
                                            />
                                            {accountForm.profiles.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveProfile(index)}
                                                >
                                                    Remover
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Button onClick={handleSaveAccount} className="w-full">
                                    Salvar Conta
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="font-semibold">Contas Existentes</h3>
                            {accounts.map((account) => (
                                <Card key={account.id}>
                                    <CardContent className="p-4">
                                        <h4 className="font-medium mb-3">{account.email}</h4>
                                        <div className="space-y-2">
                                            {account.profiles?.map((profile) => (
                                                <div key={profile.id} className="flex justify-between items-center p-2 border rounded">
                                                    <div>
                                                        <span className="font-medium">{profile.name}</span>
                                                        <span className="text-sm text-muted-foreground ml-2">PIN: {profile.pin}</span>
                                                    </div>
                                                    <span className={`text-sm ${profile.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {profile.status === 'available' ? 'Disponível' : 'Atribuído'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Assignments Dialog */}
            <Dialog open={showAssignmentsDialog} onOpenChange={setShowAssignmentsDialog}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Perfis Atribuídos - {selectedService?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {assignedProfiles.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum perfil atribuído no momento
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {assignedProfiles.map((profile) => {
                                    const daysRemaining = profile.assignment_info?.days_remaining || 0;
                                    const isExpired = profile.assignment_info?.is_expired;
                                    
                                    return (
                                        <Card key={profile.id} className={`border ${isExpired ? 'border-red-500/50 bg-red-500/5' : daysRemaining < 7 ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-green-500/50'}`}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="font-semibold text-lg">
                                                                {profile.profile_name || 'Perfil sem nome'}
                                                            </div>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                isExpired ? 'bg-red-500 text-white' : 
                                                                daysRemaining < 7 ? 'bg-yellow-500 text-black' : 
                                                                'bg-green-500 text-white'
                                                            }`}>
                                                                {isExpired ? 'EXPIRADO' : `${daysRemaining} dias`}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div>
                                                                <span className="text-muted-foreground">Cliente:</span>
                                                                <div className="font-medium">{profile.user?.full_name || 'N/A'}</div>
                                                                <div className="text-xs text-muted-foreground">{profile.user?.email}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-muted-foreground">Conta:</span>
                                                                <div className="font-medium">{profile.email}</div>
                                                                <div className="text-xs text-muted-foreground">PIN: {profile.pin}</div>
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-4 text-xs text-muted-foreground">
                                                            <div>
                                                                <span>Atribuído em:</span>{' '}
                                                                {new Date(profile.assigned_at).toLocaleDateString('pt-BR')}
                                                            </div>
                                                            <div>
                                                                <span>Expira em:</span>{' '}
                                                                {new Date(profile.assignment_info?.expiration_date).toLocaleDateString('pt-BR')}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="shrink-0"
                                                        onClick={() => handleUnassignProfile(profile.id)}
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                        Desvincular
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
