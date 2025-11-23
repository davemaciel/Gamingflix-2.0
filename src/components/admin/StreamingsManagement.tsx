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
import { Plus, Pencil, Trash2, Layers, Users, X, Edit } from 'lucide-react';

export const StreamingsManagement = () => {
    const { toast } = useToast();
    const [services, setServices] = useState<StreamingService[]>([]);
    const [loading, setLoading] = useState(true);
    const [showServiceDialog, setShowServiceDialog] = useState(false);
    const [showInventoryDialog, setShowInventoryDialog] = useState(false);
    const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false);
    const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
    const [editingService, setEditingService] = useState<StreamingService | null>(null);
    const [selectedService, setSelectedService] = useState<StreamingService | null>(null);
    const [accounts, setAccounts] = useState<StreamingAccount[]>([]);
    const [assignedProfiles, setAssignedProfiles] = useState<any[]>([]);
    const [editingProfile, setEditingProfile] = useState<any>(null);
    const [profileEditForm, setProfileEditForm] = useState({ name: '', pin: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const [showDeleteServiceDialog, setShowDeleteServiceDialog] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<StreamingService | null>(null);
    const [showUnassignDialog, setShowUnassignDialog] = useState(false);
    const [profileToUnassign, setProfileToUnassign] = useState<any>(null);

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

    const handleDeleteServiceClick = (service: StreamingService) => {
        setServiceToDelete(service);
        setShowDeleteServiceDialog(true);
    };

    const handleDeleteServiceConfirm = async () => {
        if (!serviceToDelete) return;

        try {
            await streamingApi.deleteService(serviceToDelete.id);
            toast({ title: 'Sucesso', description: 'Serviço excluído' });
            setShowDeleteServiceDialog(false);
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
            const data = await streamingApi.getAssignedProfiles(service.id);
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

    const handleUnassignProfileClick = (profile: any) => {
        setProfileToUnassign(profile);
        setShowUnassignDialog(true);
    };

    const handleUnassignProfileConfirm = async () => {
        if (!profileToUnassign) return;

        try {
            await streamingApi.unassignProfile(profileToUnassign.id);

            toast({ title: 'Sucesso', description: 'Perfil desvinculado' });
            setShowUnassignDialog(false);

            // Recarregar lista
            if (selectedService) {
                const data = await streamingApi.getAssignedProfiles(selectedService.id);
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

    const openEditProfileDialog = (profile: any) => {
        setEditingProfile(profile);
        setProfileEditForm({
            name: profile.profile_name || profile.name || '',
            pin: profile.pin || '',
        });
        setShowEditProfileDialog(true);
    };

    const handleSaveProfileEdit = async () => {
        if (!editingProfile) return;

        try {
            await streamingApi.updateProfile(editingProfile.id, profileEditForm);

            toast({ title: 'Sucesso', description: 'Perfil atualizado' });
            setShowEditProfileDialog(false);

            // Recarregar listas
            if (selectedService) {
                if (showInventoryDialog) {
                    const data = await streamingApi.getAccountsByService(selectedService.id);
                    setAccounts(data);
                }
                if (showAssignmentsDialog) {
                    const data = await streamingApi.getAssignedProfiles(selectedService.id);
                    setAssignedProfiles(data);
                }
            }
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Falha ao atualizar perfil',
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
                    <Card key={service.id} className="border-border bg-card/60 backdrop-blur hover:bg-card/80 transition-all duration-300 group">
                        <CardContent className="p-5 flex flex-col h-full">
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        {service.logo_url && (
                                            <img
                                                src={service.logo_url}
                                                alt={service.name}
                                                className="w-8 h-8 object-contain rounded-md bg-background/50 p-1 border border-border/50"
                                            />
                                        )}
                                        <h2 className="text-lg font-semibold text-foreground truncate">
                                            {service.name}
                                        </h2>
                                    </div>
                                    {service.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                            {service.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => openServiceDialog(service)}
                                        title="Editar Serviço"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteServiceClick(service)}
                                        title="Excluir Serviço"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-center gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors"
                                    onClick={() => openInventoryDialog(service)}
                                >
                                    <Layers className="h-4 w-4" />
                                    Estoque
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-center gap-2 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30 transition-colors"
                                    onClick={() => openAssignmentsDialog(service)}
                                >
                                    <Users className="h-4 w-4" />
                                    Atribuições
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
                                            type="text"
                                            placeholder="Senha da conta"
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
                                                <div key={profile.id} className="flex justify-between items-center p-3 border rounded-lg hover:border-primary/50 transition-colors">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-base">{profile.profile_name || profile.name || 'Sem nome'}</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${profile.status === 'available' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                                                                {profile.status === 'available' ? 'Disponível' : 'Atribuído'}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">PIN: {profile.pin || 'Não definido'}</span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openEditProfileDialog(profile)}
                                                        className="ml-2"
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Editar
                                                    </Button>
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
                                                            <span className={`text-xs px-2 py-1 rounded-full ${isExpired ? 'bg-red-500 text-white' :
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

                                                    <div className="flex gap-2 shrink-0">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openEditProfileDialog(profile)}
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleUnassignProfileClick(profile)}
                                                        >
                                                            <X className="h-4 w-4 mr-1" />
                                                            Desvincular
                                                        </Button>
                                                    </div>
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

            {/* Edit Profile Dialog */}
            <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Perfil</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome do Perfil</Label>
                            <Input
                                placeholder="Ex: Perfil 1"
                                value={profileEditForm.name}
                                onChange={(e) => setProfileEditForm({ ...profileEditForm, name: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Este nome será exibido para o cliente selecionar após o login
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>PIN do Perfil</Label>
                            <Input
                                placeholder="Ex: 1234"
                                value={profileEditForm.pin}
                                onChange={(e) => setProfileEditForm({ ...profileEditForm, pin: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                PIN que o cliente usará para acessar o perfil
                            </p>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setShowEditProfileDialog(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveProfileEdit}>
                                Salvar Alterações
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Exclusão de Serviço */}
            <Dialog open={showDeleteServiceDialog} onOpenChange={setShowDeleteServiceDialog}>
                <DialogContent className="sm:max-w-md border-destructive/20">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <Trash2 className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-center text-destructive">Excluir Serviço</DialogTitle>
                    </DialogHeader>

                    <div className="text-center space-y-4 py-4">
                        <p className="text-muted-foreground">
                            Tem certeza que deseja excluir permanentemente o serviço:
                        </p>
                        {serviceToDelete && (
                            <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-lg">
                                <div className="font-semibold text-lg text-destructive">
                                    {serviceToDelete.name}
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Todas as contas e perfis associados também serão removidos.
                        </p>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowDeleteServiceDialog(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteServiceConfirm} className="flex-1">
                            Excluir Serviço
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Desvinculação de Perfil */}
            <Dialog open={showUnassignDialog} onOpenChange={setShowUnassignDialog}>
                <DialogContent className="sm:max-w-md border-destructive/20">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <X className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-center text-destructive">Desvincular Perfil</DialogTitle>
                    </DialogHeader>

                    <div className="text-center space-y-4 py-4">
                        <p className="text-muted-foreground">
                            Deseja realmente desvincular este perfil?
                        </p>
                        {profileToUnassign && (
                            <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-lg">
                                <div className="font-semibold text-lg text-destructive">
                                    {profileToUnassign.profile_name || profileToUnassign.name || 'Perfil sem nome'}
                                </div>
                                <div className="text-sm text-destructive/80 mt-1">
                                    Usuário: {profileToUnassign.user?.full_name || profileToUnassign.user?.email || 'N/A'}
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            O usuário perderá o acesso imediatamente e o perfil ficará disponível novamente.
                        </p>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowUnassignDialog(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleUnassignProfileConfirm} className="flex-1">
                            Confirmar Desvinculação
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
