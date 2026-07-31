# Product Requirement Document (PRD) — Studio SenhorEle

**Versão:** 2.0  
**Status:** Implementado, Testado & Em Produção  
**Plataforma Digital:** Studio SenhorEle — Curadoria & Preservação de Veículos Clássicos (VW Air-Cooled e Porsche)  
**URL de Desenvolvimento:** `http://localhost:3000`

---

## 1. Visão Geral do Produto

O **Studio SenhorEle** é uma plataforma digital de alta sofisticação projetada para entusiastas, colecionadores e investidores internacionais de veículos clássicos, com foco especial na cultura **VW Air-Cooled** e modelos icônicos como **Porsche 911**, **VW Kombi Corujinha**, **VW Fusca Cal Style** e **Aero Willys**.

A aplicação combina uma estética visual atemporal (*Vintage Racing & Dark Luxury*) com interatividade moderna em React 18, oferecendo navegação por acervo 3D, suporte a **três idiomas (PT, EN, DE)**, integração automatizada com o **Feed do Instagram (@studiosenhorele)**, fichas técnicas detalhadas com proveniência histórica, botões de consulta direta via WhatsApp com mensagens pré-formatadas contendo IDs únicos, e feedback tátil por efeitos sonoros mecânicos.

---

## 2. Objetivos Estratégicos & Proposta de Valor

1. **Posicionamento de Marca Premium:** Refletir o cuidado artesanal e o prestígio da curadoria do Studio SenhorEle através de design editorial refinado, tipografia clássica (*Libre Caslon Text* & *Hanken Grotesk*) e paleta em tons de âmbar, champanhe e verde corrida (*Racing Green*).
2. **Internacionalização (i18n):** Suporte nativo em Português, Inglês e Alemão com seletor no Header (`🇧🇷 PT` · `🇺🇸 EN` · `🇩🇪 DE`) e gravação local em `localStorage`.
3. **Curadoria Integrada ao Instagram:** Exibição elegante dos destaques do feed do Instagram da marca sem expor abertamente pretensões comerciais diretas, mantendo o tom velado de apreciação estética e histórico com conversão direta para o WhatsApp.
4. **Descoberta & Filtragem Rápida:** Busca dinâmica em tempo real por palavras-chave, ano, modelo ou código de compartilhamento (Share ID / Instagram ID).
5. **Conversão & Atendimento Multicanais:** Integração unificada via WhatsApp oficial ((11) 94725-1630), Instagram e formulários de agendamento presencial.

---

## 3. Funcionalidades Principais & Arquitetura de Interface

### 3.1. Cabeçalho de Navegação & Seletor de Idiomas (Navigation & i18n)
* **Barra Fixa Glassmorphism com Indicador de Progresso:** Linha superior animada em gradiente de ouro velho que reflete a rolagem da página.
* **Seletor Minimalista de Idiomas (`LanguageSwitcher`):**
  * `🇧🇷 PT` (Português - Padrão)
  * `🇺🇸 EN` (Inglês)
  * `🇩🇪 DE` (Alemão)
  * Transições suaves em pill com Framer Motion e gravação automática em `localStorage`.
* **Menu Responsivo & Feedback Sonoro:** Sons sutis de cliques mecânicos ao interagir com links e botões.

### 3.2. Apresentação Hero (Hero Section)
* **Apresentação de Impacto Cinematográfico:** Imagem de fundo do Aero Willys 1967 com tratamento de iluminação dramática.
* **Chamada para Ação Traduzida:** Título principal, subtítulo e indicador animado de rolagem ("Explorar / Explore / Entdecken").

### 3.3. Seção Institucional ("Nossa História" & "Propósito")
* **Linha do Tempo Editorial:** Relato da origem do Studio SenhorEle, a paixão introduzida pelo irmão José, o aprendizado com o Aero Willys 1967, a aproximação da oficina parceira Box 767 e o propósito da preservação atemporal.

### 3.4. Acervo de Veículos & Feed do Instagram (`Collection.tsx`)
* **Modos de Exibição:** Alternância instantânea entre **Grade 3D (Intersection Observer)** e **Carrossel 3D de Profundidade**.
* **Chips de Filtro Dinâmicos:**
  * `Todos` / `All` / `Alle`
  * `VW Air-Cooled`
  * `Porsche`
  * `Kombi Corujinha` / `Split-Window Bus` / `VW T1 Bulli`
  * `Fusca` / `Beetle` / `VW Käfer`
  * `Aero Willys`
  * `Feed Instagram` *(Integração automatizada de publicações do @studiosenhorele)*
* **Cards Estilo Instagram (`InstagramCard.tsx`):**
  * Topo com avatar da marca e identificador único (`#INSTA-911-73`).
  * Foto no formato quadrado com selo de curtidas.
  * Legenda e título da publicação.
  * Botão de atalho para **Ver no Instagram** e botão de **Consulta via WhatsApp** com mensagem pré-configurada contendo o ID do post.

### 3.5. Modal de Ficha Técnica Detalhada & Proveniência (`VehicleDetailModal.tsx`)
* **Galeria & Ficha Técnica:** Especificações de Motor, Transmissão, Cor, Ano, Potência, Placa Preta e Matching Numbers.
* **Histórico de Restauração em Passos:** Etapas numeradas da restauração *Nuts & Bolts*.
* **Compartilhamento Social com ID Único:** Botão de cópia rápida do link com notificação Toast visual.

### 3.6. Modal de Consulta & Agendamento (`InquireModal.tsx`)
* **Formulário de Atendimento VIP:** Preenchimento de Nome, Telefone, E-mail, Veículo de Interesse e Mensagem personalizada com envio direto para o WhatsApp oficial da curadoria.

### 3.7. Widget Flutuante de Contato (`FloatingContactWidget.tsx`)
* **Botão Flutuante com Logotipo Oficial:** Menu expansível com atalhos para WhatsApp, Instagram `@studiosenhorele` e agendamento presencial.

---

## 4. Arquitetura Técnica & Tecnologias

| Camada | Tecnologia / Biblioteca | Função |
| :--- | :--- | :--- |
| **Frontend Core** | React 18 + TypeScript 5.8 | Estrutura e tipagem de dados estrita |
| **Build & Dev Server** | Vite 6.4 | Bundling e Hot Module Replacement (HMR) ultra-rápido |
| **Estilização** | Tailwind CSS v4 | Utilitários de layout, cores HSL e suporte a temas |
| **Internacionalização** | Custom `LanguageContext` + JSON | Tradução leve em PT, EN, DE sem dependências pesadas |
| **Animações & Interação** | Motion (`motion/react`) | Gestos, carrossel 3D e modais com aceleração por GPU |
| **Integração de Feed** | `InstagramService` + Local Storage | Consumo de posts com cache de 30 min e fallback resiliente |
| **Efeitos Sonoros** | Web Audio API / Audio Utilities | Efeitos de som para cliques mecânicos e aberturas de modal |
| **Acessibilidade (a11y)** | `useAccessibleModal` | Trap de foco, fechamento por tecla ESC e atributos ARIA |

---

## 5. Estrutura de Diretórios do Projeto

```
Studio_senhorEle_website/
├── public/
│   └── assets/images/              # Imagens dos veículos e logotipo oficial
├── src/
│   ├── components/                 # Componentes da interface
│   │   ├── About.tsx               # Seção institucional
│   │   ├── Collection.tsx          # Acervo 3D e filtros
│   │   ├── CustomCursor.tsx        # Cursor vintage customizado
│   │   ├── FloatingContactWidget.tsx # Widget flutuante de atendimento
│   │   ├── Footer.tsx              # Rodapé institucional
│   │   ├── Hero.tsx                # Capa cinematográfica
│   │   ├── InquireModal.tsx        # Modal de agendamento/consulta
│   │   ├── InstagramCard.tsx       # Cards do feed do Instagram
│   │   ├── LanguageSwitcher.tsx    # Seletor de idiomas PT/EN/DE
│   │   ├── Navigation.tsx          # Header glassmorphism
│   │   └── VehicleDetailModal.tsx  # Ficha técnica e história
│   ├── data/
│   │   └── instagramPosts.ts       # Dataset de posts do Instagram
│   ├── hooks/
│   │   └── useAccessibleModal.ts   # Hook de acessibilidade para modais
│   ├── i18n/
│   │   ├── LanguageContext.tsx     # Contexto e Provider de idiomas
│   │   └── translations.ts         # Dicionário de traduções (PT, EN, DE)
│   ├── services/
│   │   └── instagramService.ts     # Serviço de busca e cache do Instagram
│   ├── utils/
│   │   └── audio.ts                # Utilitários de áudio mecânico
│   ├── App.tsx                     # Componente raiz da aplicação
│   ├── main.tsx                    # Ponto de entrada React
│   └── index.css                   # Configuração de temas e variáveis CSS
├── prd.md                          # Este documento (PRD v2.0)
└── package.json                    # Dependências e scripts do projeto
```

---

## 6. Requisitos Não-Funcionais

1. **Performance:** Carregamento inicial sob 1.5s, animações rodando a 60 FPS estáveis.
2. **Disponibilidade 100%:** Fallback automático de dados para garantir que a plataforma continue funcionando perfeitamente mesmo sem conexão externa.
3. **Contraste & Acessibilidade:** Conformidade WCAG AA com navegação via teclado (Setas Esquerda/Direita para o carrossel, ESC para fechar modais) e rótulos `aria-label`.
4. **Responsividade:** Layout responsivo completo testado em telas de 320px até ultrawide 4K.

---

*Documento atualizado e mantido pela equipe de engenharia do Studio SenhorEle.*
