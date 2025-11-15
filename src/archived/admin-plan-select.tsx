// Arquivado em 2025-10: implementação anterior da aba "Plano Select" do painel admin.
// Mantido para referência futura enquanto a funcionalidade fica desativada no front-end.
// O código abaixo dependia de estados e efeitos presentes na versão original de Admin.tsx.
export const adminPlanSelectArchive = `
<TabsContent value="select" className="space-y-4">
  <Card className="bg-card border-border rounded-xl sm:rounded-2xl mb-6">
    <CardHeader>
      <CardTitle className="text-lg sm:text-xl">Gerencie o Plano Select</CardTitle>
      <p className="text-sm text-muted-foreground">
        Selecione quais jogos estarão disponíveis para assinantes do plano Select.
        Assinantes Ultimate têm acesso a todos os jogos.
      </p>
    </CardHeader>
  </Card>

  <div className="grid gap-3 sm:gap-4">
    {games.map((game) => {
      const isSelected = selectPlanGames.has(game.id);
      return (
        <Card key={game.id} className={\`bg-card border-border rounded-xl sm:rounded-2xl transition-all \${isSelected ? 'ring-2 ring-primary' : ''}\`}>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={game.cover_url}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">{game.title}</h3>
                  {isSelected && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                      No Plano Select
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">
                  {game.description}
                </p>
              </div>
              <div className="flex sm:flex-col gap-2 justify-end sm:justify-start">
                <Button
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => toggleSelectPlanGame(game.id)}
                  className="h-9 px-4"
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Selecionado</span>
                      <span className="sm:hidden">OK</span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Selecionar</span>
                      <span className="sm:hidden">+</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
</TabsContent>
`;
