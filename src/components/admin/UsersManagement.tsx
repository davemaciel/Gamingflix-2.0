import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi, subscriptionsApi, streamingApi, apiClient, type User, type SubscriptionPlan } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, UserCog, Calendar, Shield, XCircle, CheckCircle, Tv, LogIn } from 'lucide-react';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showStreamingDialog, setShowStreamingDialog] = useState(false);
  const [showLoginAsDialog, setShowLoginAsDialog] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToLogin, setUserToLogin] = useState<User | null>(null);
  const [userToRenew, setUserToRenew] = useState<User | null>(null);
  const [userToCancel, setUserToCancel] = useState<User | null>(null);
  const [userToUpdateRole, setUserToUpdateRole] = useState<{ user: User, newRole: 'admin' | 'client' } | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [renewType, setRenewType] = useState<'months' | 'days' | 'date'>('months');
  const [renewValue, setRenewValue] = useState('');

  const [streamingServices, setStreamingServices] = useState<any[]>([]);
  const [selectedStreamingService, setSelectedStreamingService] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    email: '',
    full_name: '',
    whatsapp: '',
    is_founder: false,
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    plan_id: '',
    duration_months: 1,
  });

  useEffect(() => {
    fetchUsers();
    fetchPlans();
    fetchStreamingServices();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await subscriptionsApi.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const fetchStreamingServices = async () => {
    try {
      const data = await streamingApi.getAllServices();
      setStreamingServices(data);
    } catch (error) {
      console.error('Erro ao carregar serviços de streaming:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      full_name: user.full_name,
      whatsapp: user.whatsapp,
      is_founder: user.is_founder,
    });
    setShowEditDialog(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      await usersApi.update(editingUser.id, editForm);
      toast({
        title: 'Sucesso!',
        description: 'Usuário atualizado com sucesso',
      });
      setShowEditDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar usuário',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRoleClick = (user: User) => {
    const newRole = user.role === 'admin' ? 'client' : 'admin';
    setUserToUpdateRole({ user, newRole });
    setShowRoleDialog(true);
  };

  const handleUpdateRoleConfirm = async () => {
    if (!userToUpdateRole) return;

    try {
      await usersApi.updateRole(userToUpdateRole.user.id, userToUpdateRole.newRole);
      toast({
        title: 'Sucesso!',
        description: `Role atualizada para ${userToUpdateRole.newRole}`,
      });
      setShowRoleDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUserClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;

    try {
      await usersApi.delete(userToDelete.id);
      toast({
        title: 'Sucesso!',
        description: 'Usuário deletado com sucesso',
      });
      setShowDeleteDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar usuário',
        variant: 'destructive',
      });
    }
  };

  const handleOpenSubscriptionDialog = (user: User) => {
    setSelectedUser(user);
    setSubscriptionForm({
      plan_id: plans[0]?.id || '',
      duration_months: 1,
    });
    setShowSubscriptionDialog(true);
  };

  const handleCreateSubscription = async () => {
    if (!selectedUser) return;

    try {
      await usersApi.createSubscription(
        selectedUser.id,
        subscriptionForm.plan_id,
        subscriptionForm.duration_months
      );
      toast({
        title: 'Sucesso!',
        description: 'Assinatura criada com sucesso',
      });
      setShowSubscriptionDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar assinatura',
        variant: 'destructive',
      });
    }
  };

  const handleCancelSubscriptionClick = (user: User) => {
    setUserToCancel(user);
    setShowCancelDialog(true);
  };

  const handleCancelSubscriptionConfirm = async () => {
    if (!userToCancel) return;

    try {
      await usersApi.cancelSubscription(userToCancel.id);
      toast({
        title: 'Sucesso!',
        description: 'Assinatura cancelada',
      });
      setShowCancelDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cancelar assinatura',
        variant: 'destructive',
      });
    }
  };

  const handleRenewSubscriptionClick = (user: User) => {
    setUserToRenew(user);
    setRenewType('months');
    setRenewValue('1');
    setShowRenewDialog(true);
  };

  const handleRenewSubscriptionConfirm = async () => {
    if (!userToRenew || !renewValue) return;

    try {
      const options: any = {};

      if (renewType === 'months') {
        options.duration_months = parseInt(renewValue);
      } else if (renewType === 'days') {
        options.duration_days = parseInt(renewValue);
      } else if (renewType === 'date') {
        options.expiration_date = renewValue;
      }

      await usersApi.renewSubscription(userToRenew.id, options);

      toast({
        title: 'Sucesso!',
        description: 'Assinatura renovada com sucesso',
      });
      setShowRenewDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao renovar assinatura',
        variant: 'destructive',
      });
    }
  };

  const handleOpenStreamingDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedStreamingService(streamingServices[0]?.id || '');
    setShowStreamingDialog(true);
  };

  const handleAssignStreaming = async () => {
    if (!selectedUser || !selectedStreamingService) return;

    try {
      await usersApi.assignStreamingPlan(selectedUser.id, selectedStreamingService);
      toast({
        title: 'Sucesso!',
        description: 'Plano de streaming atribuído com sucesso',
      });
      setShowStreamingDialog(false);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atribuir plano de streaming',
        variant: 'destructive',
      });
    }
  };

  const handleLoginAsUserClick = (user: User) => {
    setUserToLogin(user);
    setShowLoginAsDialog(true);
  };

  const handleLoginAsUserConfirm = async () => {
    if (!userToLogin) return;

    try {
      // Salva o token admin atual para poder voltar depois
      const currentToken = apiClient.getToken();
      if (currentToken) {
        localStorage.setItem('admin_token_backup', currentToken);
      }

      const { user: targetUser, token } = await usersApi.loginAsUser(userToLogin.id);

      // Atualiza o token no apiClient
      apiClient.setToken(token);

      toast({
        title: 'Sucesso!',
        description: `Agora você está logado como ${targetUser.full_name || targetUser.email}`,
      });

      // Recarrega a página para aplicar o novo token
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao fazer login como usuário',
        variant: 'destructive',
      });
      setShowLoginAsDialog(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          <p className="text-muted-foreground">Total: {users.length} usuários</p>
        </div>
        <Input
          placeholder="Buscar por email ou nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{user.full_name || 'Sem nome'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.whatsapp}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Admin' : 'Cliente'}
                  </Badge>
                  {user.is_founder && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                      Founder
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  {user.has_active_subscription ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Assinatura ativa até {formatDate(user.subscription_expires_at || null)}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Sem assinatura ativa</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditUser(user)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateRoleClick(user)}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                  </Button>

                  {user.has_active_subscription ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRenewSubscriptionClick(user)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Renovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelSubscriptionClick(user)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar Assinatura
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenSubscriptionDialog(user)}
                    >
                      <UserCog className="h-4 w-4 mr-1" />
                      Criar Assinatura
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenStreamingDialog(user)}
                  >
                    <Tv className="h-4 w-4 mr-1" />
                    Atribuir Streaming
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleLoginAsUserClick(user)}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <LogIn className="h-4 w-4 mr-1 text-primary" />
                    Login as User
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUserClick(user)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={editForm.whatsapp}
                onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_founder"
                checked={editForm.is_founder}
                onChange={(e) => setEditForm({ ...editForm, is_founder: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_founder">Founder (Acesso Vitalício)</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveUser}>Salvar</Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Assinatura */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Assinatura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plan">Plano</Label>
              <Select
                value={subscriptionForm.plan_id}
                onValueChange={(value) => setSubscriptionForm({ ...subscriptionForm, plan_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - R$ {plan.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Duração (meses)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={subscriptionForm.duration_months}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, duration_months: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateSubscription}>Criar</Button>
              <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Atribuição de Streaming */}
      <Dialog open={showStreamingDialog} onOpenChange={setShowStreamingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Plano de Streaming</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="streaming_service">Serviço de Streaming</Label>
              <Select
                value={selectedStreamingService}
                onValueChange={(value) => setSelectedStreamingService(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {streamingServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAssignStreaming}>Atribuir</Button>
              <Button variant="outline" onClick={() => setShowStreamingDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Renovação */}
      <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renovar Assinatura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {userToRenew && (
              <div className="bg-muted/50 p-3 rounded-lg text-sm mb-4">
                Renovando para: <span className="font-semibold">{userToRenew.full_name || userToRenew.email}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Tipo de Renovação</Label>
              <Select value={renewType} onValueChange={(v: any) => setRenewType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="months">Adicionar Meses</SelectItem>
                  <SelectItem value="days">Adicionar Dias</SelectItem>
                  <SelectItem value="date">Definir Data Específica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {renewType === 'months' && 'Quantidade de Meses'}
                {renewType === 'days' && 'Quantidade de Dias'}
                {renewType === 'date' && 'Data de Expiração'}
              </Label>

              {renewType === 'date' ? (
                <Input
                  type="date"
                  value={renewValue}
                  onChange={(e) => setRenewValue(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              ) : (
                <Input
                  type="number"
                  min="1"
                  value={renewValue}
                  onChange={(e) => setRenewValue(e.target.value)}
                  placeholder={renewType === 'months' ? 'Ex: 1' : 'Ex: 7'}
                />
              )}
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowRenewDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRenewSubscriptionConfirm}>
                Confirmar Renovação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md border-destructive/20">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Cancelar Assinatura</DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4 py-4">
            <p className="text-muted-foreground">
              Tem certeza que deseja cancelar a assinatura de:
            </p>
            {userToCancel && (
              <div className="font-semibold text-lg">
                {userToCancel.full_name || userToCancel.email}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              O usuário perderá acesso aos benefícios imediatamente.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="flex-1">
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscriptionConfirm} className="flex-1">
              Confirmar Cancelamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Role (Admin) */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Alterar Permissões</DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4 py-4">
            <p className="text-muted-foreground">
              Você está prestes a alterar o nível de acesso de:
            </p>
            {userToUpdateRole && (
              <>
                <div className="font-semibold text-lg">
                  {userToUpdateRole.user.full_name || userToUpdateRole.user.email}
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  Nova permissão: <span className="font-bold uppercase">{userToUpdateRole.newRole}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowRoleDialog(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleUpdateRoleConfirm} className="flex-1">
              Confirmar Alteração
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Deletar Usuário */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md border-destructive/20">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center text-destructive">Excluir Usuário</DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4 py-4">
            <p className="text-muted-foreground">
              Esta ação é irreversível. Tem certeza que deseja excluir permanentemente:
            </p>
            {userToDelete && (
              <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-lg">
                <div className="font-semibold text-lg text-destructive">
                  {userToDelete.full_name || 'Usuário sem nome'}
                </div>
                <div className="text-sm text-destructive/80">
                  {userToDelete.email}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Todos os dados, assinaturas e histórico serão apagados.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUserConfirm} className="flex-1">
              Excluir Permanentemente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Login as User */}
      <Dialog open={showLoginAsDialog} onOpenChange={setShowLoginAsDialog}>
        <DialogContent className="sm:max-w-md border-primary/20">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">Acessar como Cliente</DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4 py-4">
            <p className="text-muted-foreground">
              Você está prestes a acessar a plataforma como:
            </p>

            {userToLogin && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="font-semibold text-foreground text-lg">
                  {userToLogin.full_name || 'Usuário sem nome'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {userToLogin.email}
                </p>
              </div>
            )}

            <div className="text-sm bg-yellow-500/10 text-yellow-500 p-3 rounded-md border border-yellow-500/20 flex items-start gap-2 text-left">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Sua sessão de administrador será pausada. Você poderá retornar ao painel admin a qualquer momento clicando no botão "Voltar para Admin" no topo da tela.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowLoginAsDialog(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLoginAsUserConfirm}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Confirmar Acesso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper components that might be missing
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
}

function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
}

function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}
