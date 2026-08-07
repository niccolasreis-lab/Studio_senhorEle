# Design System & Guidelines — Studio SenhorEle

**Estética Primária:** *Vintage Racing & Dark Luxury*  
**Filosofia:** Preservação artesanal de automóveis clássicos (VW Air-Cooled e Porsche) com estética de alta relojoaria e exposição de arte.

---

## 🎨 1. Paleta de Cores (Design Tokens)

### Cores Primárias & Pigmentação
- **Fundo Principal (`--color-background`):** `#131313` (Charcoal profundo pigmentado aquecido, nunca `#000000` puro).
- **Verde Corrida Vintage (`--color-racing-green-dark`):** `#1A241E` / `#27332b`.
- **Ouro Âmbar / Detalhes Clássicos (`--color-amber-glow` / `--color-secondary`):** `#C19245` / `#E8C177`.
- **Papel Pergaminho Vintage (`--color-parchment`):** `#EBE7DB`.
- **Texto Principal (`--color-on-background`):** `#E4E2E0` (Branco creme de alto contraste).

### Regras Impeccable de Cor
1. **Zero Pure Black:** Não utilizar `#000000`. Todos os fundos escuros possuem pigmentação verde ou sépia sutil.
2. **Harmonia de Vidro (Glassmorphism):** Camadas flutuantes utilizam `backdrop-blur-md` e bordas finas com transparência dourada (`rgba(193, 146, 69, 0.15)`).

---

## ✒️ 2. Tipografia

- **Cabeçalhos & Títulos (Editorial & Luxo):** `Libre Caslon Text`, serif (32px a 64px, weight 400).
- **Corpo de Texto & Especificações:** `Hanken Grotesk`, sans-serif (16px a 18px).
- **Rótulos, Badges & Chips (`text-label-caps`):** `Hanken Grotesk`, caixa alta, `letter-spacing: 0.1em`, weight 600, 12px.

---

## ⚡ 3. Micro-Interações & Áudio

- **Animações (Motion):** Curvas suaves e naturais (`cubic-bezier(0.4, 0, 0.2, 1)`), com durações entre 200ms e 400ms. Evitar ressaltos exagerados (*bounce*).
- **Feedback Sonoro Mecânico:** Sons de relés e interruptores vintage gerados via Web Audio API (`src/utils/audio.ts`) ao clicar em botões, alternar idiomas e navegar por fotos da galeria.
- **Cursor Personalizado:** Cursor ponto de precisão + anel elástico de acompanhamento que expande em elementos interativos (`src/components/CustomCursor.tsx`).

---

## ♿ 4. Acessibilidade & Navegação por Teclado

- **Conformidade WCAG AA:** Relação de contraste mínima mantida em todas as combinações de cor.
- **Modais Accessible Trap:** Atributos `aria-modal="true"`, foco capturado dentro do modal e fechamento imediato pela tecla `ESC`.
- **Navegação de Galeria:** Suporte total a `Setas Esquerda/Direita` e teclas de atalho contextuais.
