-- =====================================================
-- TEMPLATE PARA CRIAR/ATUALIZAR NOVO PLANO DE ASSINATURA
-- -----------------------------------------------------
-- COMO USAR ESTE MODELO
--  1. Faça uma cópia deste arquivo e renomeie (ex: 2025XXXXXX_add-plano-premium.sql)
--  2. Substitua todos os marcadores TODO_ pelo valor correto.
--  3. Leia as notas em cada seção antes de executar no Supabase SQL Editor.
-- =====================================================

DO $$
DECLARE
    -- ✅ Substitua pelo slug em minúsculas (usar apenas letras, números e hífen).
    v_plan_slug CONSTANT TEXT := 'TODO_slug';

    -- ✅ Nome apresentado aos usuários.
    v_plan_name CONSTANT TEXT := 'TODO Nome visível do plano';

    -- ✅ Preço mensal padrão. Use ponto como separador decimal.
    v_plan_price CONSTANT NUMERIC(10, 2) := 99.90;

    -- ✅ Limite de jogos simultâneos (use 999999 para "ilimitado").
    v_max_games CONSTANT INTEGER := 10;

    -- ✅ Descrição curta exibida no front-end.
    v_description CONSTANT TEXT := 'TODO descrição curta do plano';

    -- ✅ Lista de benefícios que aparecerá na landing / telas internas.
    v_features CONSTANT JSONB := jsonb_build_array(
        'TODO benefício 1',
        'TODO benefício 2'
    );

    v_plan_id UUID;
BEGIN
    -- 1) GARANTIR QUE O PLANO EXISTE (INSERT + UPSERT)
    INSERT INTO public.subscription_plans (
        name,
        slug,
        price,
        max_games,
        description,
        features,
        is_active
    )
    VALUES (
        v_plan_name,
        v_plan_slug,
        v_plan_price,
        v_max_games,
        v_description,
        v_features,
        TRUE -- Altere para FALSE se o plano não deve aparecer imediatamente.
    )
    ON CONFLICT (slug) DO UPDATE
        SET name        = EXCLUDED.name,
            price       = EXCLUDED.price,
            max_games   = EXCLUDED.max_games,
            description = EXCLUDED.description,
            features    = EXCLUDED.features,
            is_active   = EXCLUDED.is_active,
            updated_at  = NOW()
    RETURNING id INTO v_plan_id;

    RAISE NOTICE 'Plano % (% / slug: %) criado/atualizado com sucesso. ID: %',
        v_plan_name, v_plan_price, v_plan_slug, v_plan_id;

    -- 2) ⚠️ OPCIONAIS: ADAPTE AO SEU CASO
    -- -------------------------------------------------
    -- 2.1) Se o plano tiver uma lista fixa de jogos (ex: plano Select),
    --      habilite e ajuste o bloco abaixo.
    --      Lembre-se de inserir os UUIDs verdadeiros dos jogos.
    /*
    INSERT INTO public.select_plan_games (game_id)
    VALUES
        ('TODO_UUID_JOGO_1'::UUID),
        ('TODO_UUID_JOGO_2'::UUID)
    ON CONFLICT (game_id) DO NOTHING;
    */

    -- 2.2) Se precisar de uma função específica de verificação de acesso,
    --      crie/atualize aqui. Exemplo: user_has_game_access() com novos casos.
    /*
    -- Exemplo de adição de regra personalizada:
    -- Atualize public.user_has_game_access() OU crie uma função específica para o plano,
    -- mantendo a compatibilidade com os planos existentes.
    */

    -- 2.3) Caso o plano use pricing especial (founder_price), lembre de ajustar
    --      as funções auxiliares (ex: create_founder_subscription).

END $$;

-- =====================================================
-- CHECKLIST PÓS-EXECUÇÃO
-- -----------------------------------------------------
-- ▢ Atualizar traduções e textos no front-end:
--      - src/i18n/translations.ts
--      - src/pages/Landing.tsx (se aparecer na landing)
--      - componentes que exibem planos (ex: src/pages/Admin.tsx, hooks/useSubscription.tsx)
--
-- ▢ Ajustar qualquer lógica condicional no front-end
--      (ex: uso de slug para liberar funcionalidades especiais).
--
-- ▢ Atualizar documentação interna / playbooks (ex: arquivos em docs/ ou .md na raiz).
--
-- ▢ Adicionar testes ou consultas de verificação no Supabase:
--      SELECT * FROM public.subscription_plans WHERE slug = 'TODO_slug';
--
-- ▢ Se houver automação de upgrades, lembrar de adaptar webhooks/bots/scripts.
-- =====================================================
