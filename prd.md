# Product Requirements Document — Studio SenhorEle

**Versão:** 3.0

**Última atualização:** 14 de agosto de 2026

**Status:** Produto em produção, com evolução administrativa em validação

**Produção:** https://studio-senhorele.vercel.app

**Desenvolvimento:** http://localhost:3000

---

## 1. Visão do produto

O Studio SenhorEle é uma experiência digital de curadoria e preservação de veículos clássicos. O produto apresenta o acervo com linguagem editorial premium, fichas técnicas detalhadas e contato direto com a equipe, além de oferecer uma área administrativa para cadastrar, editar, ordenar e controlar a publicação dos veículos.

O foco da experiência é combinar a atmosfera de automóveis clássicos — especialmente Volkswagen refrigerados a ar, Porsche e exemplares selecionados — com uma interface contemporânea, responsiva, acessível e discreta.

## 2. Objetivos

- Fortalecer o posicionamento premium e a identidade visual do Studio SenhorEle.
- Organizar o acervo em uma vitrine clara, responsiva e fácil de compartilhar.
- Facilitar consultas por WhatsApp usando o veículo e seu código de referência.
- Permitir que a equipe mantenha o acervo sem alterar código-fonte.
- Controlar editorialmente quais veículos estão publicados, reservados, vendidos ou em preparação.
- Persistir dados e imagens no Supabase com acesso administrativo protegido por autenticação e RLS.

## 3. Públicos

- Entusiastas e colecionadores de veículos clássicos.
- Interessados em conhecer a história e as especificações dos exemplares.
- Potenciais clientes que desejam conversar diretamente com a curadoria.
- Curadores e administradores responsáveis pelo conteúdo do acervo.

## 4. Experiência pública

### 4.1 Página principal

- Apresentação cinematográfica da marca.
- Conteúdo institucional e narrativa sobre a curadoria.
- Navegação responsiva para desktop e celular.
- Identidade visual dark luxury com verde discreto, superfícies escuras, âmbar pontual e tipografia editorial.
- Respeito à preferência de movimento reduzido.

### 4.2 Acervo

- Exibição dos veículos em grade e experiências de navegação visual.
- Busca e filtros conforme os dados disponíveis.
- Ordenação definida pelo administrador, sendo a primeira posição o destaque principal.
- Atualização após alterações realizadas no painel administrativo.
- Estados de carregamento, vazio e falha de sincronização.

### 4.3 Visibilidade por status

| Status | Vitrine pública | Painel administrativo | Comportamento |
| --- | --- | --- | --- |
| `draft` | Não | Sim | Veículo em preparação |
| `published` | Sim | Sim | Publicação normal |
| `reserved` | Sim | Sim | Exibe selo “Reservado” |
| `sold` | Não | Sim | Mantido no histórico administrativo |

Registros legados sem status são interpretados como publicados para compatibilidade. Novos veículos começam como rascunho.

### 4.4 Ficha do veículo

- Galeria com até três imagens.
- Ano, motor, transmissão, cor, potência, condição e descrição.
- Conteúdo histórico e curiosidades quando disponíveis.
- URL compartilhável baseada no identificador do veículo.
- Visualização ampliada de imagens com navegação acessível.
- Ação de contato pelo WhatsApp com nome e código do veículo preenchidos automaticamente.

### 4.5 Contato

- Atalhos para WhatsApp e Instagram.
- Mensagens de WhatsApp pré-preenchidas com contexto do veículo.
- Widget flutuante de contato.

## 5. Área administrativa

### 5.1 Acesso e navegação

- Rota principal: `/admin`.
- Compatibilidade: `?admin=true` redireciona para `/admin`.
- Cabeçalho compacto e navegação entre Cadastro rápido, Formulário completo e Acervo.
- Layout amplo no desktop e controles segmentados, confortáveis para toque, no celular.

### 5.2 Autenticação

O frontend está sendo migrado do login fixo local para Supabase Auth com e-mail e senha.

Requisitos de segurança:

- Sessão persistida e renovada pelo cliente oficial `@supabase/supabase-js`.
- Logout encerra a sessão no Supabase.
- A interface administrativa só aceita usuários cujo `app_metadata.role` seja `admin`.
- Autorização no banco é aplicada por RLS; ocultar a interface não é considerado controle de segurança.
- A chave pública/publishable pode existir no frontend; chaves secretas ou `service_role` nunca podem ser expostas.
- `user_metadata` não deve ser usado para autorização.

**Pendência de ativação:** criar ou promover o usuário administrativo no Supabase Auth, atribuir `app_metadata.role = "admin"`, aplicar a migration administrativa e validar o fluxo em produção. Até essa etapa ser concluída, a nova autenticação não deve ser considerada operacional em produção.

### 5.3 Cadastro rápido

- Aba aberta por padrão.
- Entrada por marca, modelo e ano.
- Modelos conhecidos pelo acervo exibem marca e ano no próprio seletor.
- Ao selecionar um modelo curado, marca e ano são preenchidos automaticamente quando os dados forem inequívocos.
- Geração de título, apresentação, especificações e contexto histórico com base na versão e no período.
- Prévia antes da gravação.
- Novo registro inicia como rascunho.

### 5.4 Formulário completo

- Criação e edição de todos os campos existentes de `CustomVehicle`.
- Seleção de status.
- Upload de até três imagens.
- Validação de campos obrigatórios.
- Indicação clara de salvamento, sucesso, erro e falha de upload.
- Após salvar, atualização do acervo e ação para visualizar o veículo no site.

### 5.5 Acervo administrativo

- Busca por nome, código ou ano.
- Filtros combináveis por marca, ano e status.
- Contagem de resultados e limpeza dos filtros.
- Selo e alteração rápida de status em cada item.
- Edição e exclusão.
- Reordenação por arrastar no desktop.
- Controles acessíveis para mover itens no celular sem depender de arrastar.

### 5.6 Exclusão segura

- Confirmação visual personalizada com nome, imagem e aviso.
- Ações “Cancelar” e “Excluir veículo”.
- Captura de foco, fechamento por `Esc` e devolução do foco ao acionador.
- Notificação com opção “Desfazer” durante oito segundos.
- Restauração de dados, status e posição durante o prazo.
- Exclusão e restauração sincronizadas com o Supabase.

## 6. Dados e persistência

### 6.1 Modelo principal

O formato `CustomVehicle` permanece como contrato principal. Ele inclui identificação, código compartilhável, conteúdo editorial, imagens, ficha técnica e status:

```ts
type VehicleStatus = 'draft' | 'published' | 'reserved' | 'sold';
```

Não fazem parte desta versão: lixeira permanente, histórico de alterações, múltiplos estados comerciais adicionais ou mudança estrutural ampla do modelo.

### 6.2 Supabase

- Tabela: `public.custom_vehicles`.
- Storage: bucket público `vehicle-images`, com escrita administrativa protegida.
- Registros antigos recebem `published` por backfill.
- Coluna `status` possui `NOT NULL`, default `draft` e restrição aos quatro valores válidos.
- Visitantes anônimos podem consultar somente `published` e `reserved`.
- Escritas anônimas são proibidas.
- Usuários autenticados somente podem administrar quando o JWT contém `app_metadata.role = "admin"`.
- Upload, substituição e exclusão de imagens devem seguir políticas equivalentes no `storage.objects`.

### 6.3 Compatibilidade local

O armazenamento local continua servindo como tolerância temporária e compatibilidade durante a migração. Com Supabase Auth plenamente ativado, o banco deve ser a fonte compartilhada de verdade para alterações entre navegadores e dispositivos. Dados locais não devem sobrescrever silenciosamente versões remotas mais recentes.

## 7. Arquitetura técnica

| Camada | Tecnologia | Responsabilidade |
| --- | --- | --- |
| Frontend | React 19 + TypeScript 5.8 | Interface, componentes e tipagem |
| Build | Vite 6 | Desenvolvimento e geração do bundle |
| Estilos | Tailwind CSS 4 | Layout, responsividade e design tokens |
| Movimento | Motion | Transições e interações |
| Backend | Supabase | Postgres, Auth, Storage e API de dados |
| Segurança | Supabase Auth + PostgreSQL RLS | Autenticação e autorização |
| Hospedagem | Vercel | Deploy da aplicação pública |
| Acessibilidade | `useAccessibleModal` e HTML semântico | Foco, teclado, ARIA e diálogos |

O painel administrativo e os modais de detalhes são carregados com `React.lazy` e `Suspense` para reduzir o carregamento inicial. Dados detalhados associados a URLs devem ser carregados sob demanda.

## 8. Requisitos não funcionais

### Segurança

- RLS habilitado e forçado na tabela pública de veículos.
- Nenhuma escrita permitida ao papel `anon`.
- Autorização administrativa baseada em `app_metadata`, controlado pelo servidor.
- Nenhum segredo administrativo armazenado no código, bundle ou repositório.
- Políticas e advisors do Supabase revisados após cada migration.

### Acessibilidade

- Navegação integral por teclado.
- Foco visível.
- Rótulos associados aos controles.
- Modais com foco capturado e fechamento por `Esc`.
- Contraste compatível com WCAG AA nas ações essenciais.
- Suporte a `prefers-reduced-motion`.

### Responsividade

- Suporte mínimo a telas móveis de 320 px.
- Controles com área confortável para toque.
- Dashboard adaptável sem perda de funcionalidades.

### Performance

- Admin e modais fora do bundle inicial.
- Imagens e dados detalhados carregados sob demanda quando possível.
- Build sem erros TypeScript.
- Monitoramento contínuo do tamanho do chunk principal.

### Resiliência

- Estados explícitos de loading, sucesso, vazio e erro.
- Erros de sincronização não podem ser apresentados como sucesso definitivo.
- Alterações administrativas devem ser confirmadas pelo Supabase antes de serem consideradas persistidas entre dispositivos.

## 9. Critérios de aceite da próxima entrega

- Usuário administrativo real criado no Supabase Auth.
- Claim `app_metadata.role = "admin"` configurada pelo servidor.
- Migration de políticas administrativas aplicada sem findings críticos no Security Advisor.
- Login e logout validados localmente e em produção.
- Usuário comum autenticado não consegue visualizar rascunhos nem executar escritas.
- Visitante anônimo lê somente publicados e reservados.
- Cadastro, edição, alteração de status, upload, exclusão e desfazer persistem após recarregar e em outro navegador.
- Mudanças aparecem imediatamente na vitrine conforme as regras de status.
- `npm run lint` e `npm run build` concluídos sem erros.

## 10. Fora do escopo atual

- Cadastro público de usuários.
- Recuperação de senha personalizada dentro do site.
- MFA obrigatório.
- Papéis administrativos múltiplos.
- Workflow de aprovação com auditoria.
- Lixeira permanente e histórico de versões.
- Migração estrutural ampla do modelo de veículos.

## 11. Roadmap recomendado

1. Concluir a ativação do Supabase Auth e validar RLS ponta a ponta.
2. Tornar o Supabase a fonte de verdade e apresentar falhas de persistência no admin.
3. Adicionar recuperação segura de senha e, posteriormente, MFA para administradores.
4. Implementar auditoria de alterações e histórico de status.
5. Continuar a otimização do bundle inicial e das imagens.

---

Este documento descreve o estado funcional conhecido do projeto e as condições necessárias para considerar a administração segura em produção.
