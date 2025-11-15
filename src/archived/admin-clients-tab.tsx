// Arquivado em 2025-10: implementação anterior da aba "Clientes" e do diálogo de gerenciamento.
// Mantido apenas para consulta futura, não é importado por nenhuma parte do app.
export const adminClientsTabArchive = `
<TabsContent value="users" className="space-y-4">
  <Card className="bg-card border-border rounded-xl sm:rounded-2xl mb-6">
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl">Gestão de Clientes</CardTitle>
      <p className="text-sm text-muted-foreground">
        Gerencie todos os usuários: altere planos, torne admin ou dê acesso a jogos específicos.
      </p>
    </CardHeader>
  </Card>

  <div className="grid gap-3 sm:gap-4">
    {users.map((user) => (
      <Card key={user.user_id} className="bg-card border-border rounded-xl sm:rounded-2xl hover:ring-2 hover:ring-primary/50 transition-all">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">{user.email}</h3>
                  {user.is_admin && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                  {user.is_founder && (
                    <Badge className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-600">
                      <Crown className="h-3 w-3" />
                      FOUNDER
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col gap-1 text-xs sm:text-sm text-muted-foreground">
                  {user.whatsapp && <span>📞 {user.whatsapp}</span>}
                  <span>
                    Plano: {user.plan_name || 'Sem plano'}
                    {user.is_founder && user.founder_price && (
                      <span className="text-amber-500 font-bold ml-2">
                        💎 R$ {user.founder_price.toFixed(2)}/mês vitalício
                      </span>
                    )}
                    {user.subscription_status && (
                      <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'} className="ml-2 text-xs">
                        {user.subscription_status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    )}
                  </span>
                  {user.custom_games_count > 0 && (
                    <span className="text-primary">
                      🎮 {user.custom_games_count} jogo{user.custom_games_count > 1 ? 's' : ''} customizado{user.custom_games_count > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={() => openUserDialog(user)} className="rounded-xl">
                  Gerenciar
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
              <span>Cadastro: {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
              <span>ID: {user.user_id}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</TabsContent>

<Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
  <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
    <DialogHeader>
      <DialogTitle className="text-lg sm:text-xl md:text-2xl">
        Gerenciar Cliente: {editingUser?.email}
      </DialogTitle>
    </DialogHeader>

    {editingUser && (
      <div className="space-y-6">
        {/* Seções de formulário e jogos customizados aqui */}
      </div>
    )}
  </DialogContent>
</Dialog>
`;
