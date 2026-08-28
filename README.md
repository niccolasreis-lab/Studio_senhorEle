# Studio SenhorEle

Site institucional, vitrine de veículos clássicos e painel de curadoria do Studio SenhorEle.

- Produção: https://studio-senhorele.vercel.app
- Repositório: https://github.com/niccolasreis-lab/Studio_senhorEle
- Especificação do produto: [prd.md](./prd.md)
- Diretrizes visuais: [DESIGN.md](./DESIGN.md)

## Funcionalidades

- Vitrine responsiva de veículos clássicos.
- Fichas técnicas com até três imagens, histórico e curiosidades.
- Links compartilháveis e atendimento contextual pelo WhatsApp.
- Área administrativa em `/admin`.
- Cadastro rápido por marca, modelo e ano.
- Preenchimento automático de marca e ano para modelos conhecidos pelo acervo.
- Formulário completo para criação e edição.
- Busca e filtros administrativos por marca, ano e status.
- Estados `draft`, `published`, `reserved` e `sold`.
- Ordenação do acervo e definição do veículo em destaque.
- Exclusão com confirmação acessível e opção de desfazer.
- Persistência de veículos e imagens no Supabase.

## Regras de publicação

| Status | Visível publicamente | Administração |
| --- | --- | --- |
| `draft` | Não | Sim |
| `published` | Sim | Sim |
| `reserved` | Sim, com selo “Reservado” | Sim |
| `sold` | Não | Sim |

Novos veículos começam como rascunho. Registros antigos sem status são interpretados como publicados por compatibilidade.

## Tecnologias

- React 19
- TypeScript 5.8
- Vite 6
- Tailwind CSS 4
- Motion
- Supabase Postgres, Auth e Storage
- Vercel

## Executar localmente

Requisitos:

- Node.js 20 ou mais recente
- npm

```bash
git clone https://github.com/niccolasreis-lab/Studio_senhorEle.git
cd Studio_senhorEle
npm install
npm run dev
```

A aplicação ficará disponível em http://localhost:3000.

Rotas principais:

- `/` — site e acervo público
- `/admin` — painel administrativo
- `/?admin=true` — compatibilidade; redireciona para `/admin`

## Scripts

```bash
npm run dev      # servidor local na porta 3000
npm run lint     # validação TypeScript sem emissão
npm run build    # build de produção
npm run preview  # prévia local do build
```

## Supabase

O projeto usa o Supabase de referência `rucqvvollyrlgyekoelq` para banco, autenticação e imagens.

A aplicação cliente deve usar somente uma chave pública/publishable. Nunca inclua `service_role`, secret key, access token da CLI ou credenciais administrativas no frontend, em arquivos versionados ou em variáveis expostas pelo Vite.

Arquivos relevantes:

```text
src/services/supabaseService.ts
src/services/customVehicleService.ts
supabase/migrations/
```

Migrations existentes:

```text
20260813160000_add_vehicle_status.sql
20260813173000_harden_custom_vehicles_rls.sql
20260813190000_enable_authenticated_admin.sql
```

As migrations configuram:

- coluna e validação dos quatro status;
- backfill dos registros existentes como publicados;
- leitura anônima somente de veículos publicados ou reservados;
- bloqueio de escritas anônimas;
- administração restrita a JWTs com `app_metadata.role = "admin"`;
- escrita no bucket `vehicle-images` restrita ao administrador.

### Ativação do acesso administrativo

A migração do login local para Supabase Auth está implementada no frontend, mas precisa ser ativada no projeto Supabase antes do deploy correspondente:

1. Criar o usuário administrativo pelo painel do Supabase Auth.
2. Atribuir `app_metadata.role = "admin"` usando uma operação administrativa segura.
3. Aplicar a migration `20260813190000_enable_authenticated_admin.sql`.
4. Encerrar e iniciar novamente a sessão para renovar o JWT após alterar `app_metadata`.
5. Validar login, logout, criação, edição, status, upload e exclusão.
6. Executar o Security Advisor e corrigir qualquer finding antes do deploy.

Não use `user_metadata` para autorização, pois esse campo pode ser alterado pelo próprio usuário.

## Persistência

O Supabase deve ser a fonte compartilhada de verdade para alterações administrativas entre dispositivos. O armazenamento local permanece como compatibilidade temporária e tolerância durante a migração.

Uma ação não deve ser tratada como persistida entre dispositivos quando o Supabase rejeitar a escrita. Falhas de RLS, rede ou upload precisam ser apresentadas no painel.

## Validação antes de publicar

```bash
npm run lint
npm run build
```

Além do build, valide manualmente:

- acesso direto a `/admin`;
- login e logout pelo Supabase Auth;
- cadastro rápido e completo;
- upload de até três imagens;
- transições entre todos os status;
- busca e filtros combinados;
- exclusão e desfazer;
- persistência após recarregar e em outro navegador;
- vitrine pública como visitante anônimo;
- teclado, foco, contraste e movimento reduzido;
- layouts desktop e mobile.

## Deploy

### Diário do Studio e sincronização social

A Edge Function `sync-social` importa e publica automaticamente as publicações
permanentes dos canais configurados. O primeiro ciclo considera apenas os 30 dias
anteriores; itens rejeitados pelo administrador não são recriados pela sincronização.

1. Confirme que o projeto selecionado é `rucqvvollyrlgyekoelq`.
2. Aplique, em ordem, as migrations `20260828101459_add_guests_and_studio_diary.sql`
   e `20260828114542_auto_publish_studio_diary.sql`.
3. Configure `YOUTUBE_API_KEY`, `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` e
   `SYNC_CRON_SECRET` como secrets da Edge Function.
4. Publique com `supabase functions deploy sync-social --no-verify-jwt`. A função
   aplica sua própria autorização: segredo constante do cron ou JWT de administrador;
   sem uma dessas credenciais, responde `401`.
5. Copie `supabase/social-sync-setup.example.sql`, substitua o placeholder pelo
   mesmo `SYNC_CRON_SECRET` e execute no SQL Editor para ativar Vault e o cron horário.
6. Restrinja a chave Google exclusivamente à YouTube Data API v3 e valide a
   primeira execução pela aba Diário.

Tokens do Instagram, chave de serviço e segredo do cron nunca devem ser colocados
em variáveis `VITE_*`, no `localStorage` ou em arquivos versionados.

O projeto é publicado na Vercel. O arquivo [vercel.json](./vercel.json) direciona todas as rotas para `index.html`, permitindo acesso direto às rotas da SPA, incluindo `/admin`.

Antes do deploy, confirme que as migrations necessárias já foram aplicadas e que o usuário administrador está ativo. O frontend nunca deve ser publicado contendo senha fixa ou chave secreta.

## Documentação

Consulte o [PRD](./prd.md) para requisitos, arquitetura, critérios de aceite, pendências e roadmap completo.
