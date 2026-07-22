# Portfólio — Product Designer

Portfólio estático (HTML + CSS, sem build) com direção de arte flat e minimalista,
construído para **não** parecer conteúdo gerado por IA. Todo o conteúdo atual é
**placeholder** — feito para ser substituído.

## Estrutura

```
index.html        Página inicial: hero + índice de trabalhos + sobre + contato
case-study.html   Template de case study (contexto → papel → processo → solução → resultado)
styles/main.css   Tokens de marca e todos os estilos
```

Para ver localmente, abra `index.html` no navegador (ou sirva a pasta com
`python3 -m http.server`).

## Direção de arte (não alterar sem intenção)

**Paleta — exatamente 3 cores.** Nunca introduzir uma 4ª cor, gradiente ou tom
semitransparente novo. Estados derivam por opacidade.

| Papel | Token | Hex |
|---|---|---|
| Base (neutro quente) | `--color-base` | `#F6F4EF` |
| Tinta (quase-preto) | `--color-ink` | `#15201B` |
| Destaque (verde fosco) | `--color-accent` | `#1F6F43` |

O verde marca **um único** ponto de atenção por tela — nunca fundo de seção,
nunca gradiente, nunca glow.

**Tipografia deliberada:** Bricolage Grotesque (display) + IBM Plex Sans (corpo).
Escolha consciente — evita o default de IA (Inter/Geist). Hierarquia por escala e
peso, não por cor.

**Flat de verdade:** sem gradiente, sem glassmorphism/blur, sem sombra colorida.
Elevação só com cor chapada e bordas de 1px. Esquina reta (`--radius: 0`).

**Layout de assinatura:** índice editorial vertical e assimétrico de case studies.
Sem grid de 3 cards com ícone, sem hero centralizado com badge, sem faixa de stats
solta, sem rótulos em CAIXA ALTA por toda parte.

## Motion (contido e intencional)

O movimento serve à leitura, nunca decora — coerente com o estilo flat e sem
introduzir gradiente, blur ou glow. Definido em `styles/main.css` (camada
"Motion") e `scripts/motion.js`:

- **Entrada do hero** — título, lead e meta sobem em cascata curta no load.
- **Reveal on scroll** — blocos principais sobem sutilmente ao entrar na viewport
  (`.reveal` + IntersectionObserver).
- **Parallax editorial** — números-catálogo (01–04) e anos fazem *counter-drift*
  de poucos px; no case, a capa e os números dos blocos têm deslocamento leve
  (`data-parallax="…"`, magnitude ~≤20px).

**Guarda-corpos:** tudo desliga em `prefers-reduced-motion: reduce`, e sem
JS/suporte o conteúdo permanece 100% visível — o motion nunca esconde conteúdo.

## Como substituir os placeholders

1. **Identidade:** troque `Nome Sobrenome`, o e-mail e o LinkedIn em `index.html`.
2. **Hero:** reescreva o título e a `.lead` com sua proposta de valor real.
3. **Trabalhos:** cada `.work__item` em `index.html` é um projeto — atualize título,
   descrição, tags e ano; aponte o `href` para o case correspondente.
4. **Case studies:** duplique `case-study.html` por projeto. Substitua os blocos
   `.frame` por **telas reais** do produto (nunca stock/ilustração genérica).
5. **Números de impacto:** só mantenha os que forem reais, sempre com contexto.

## Checklist antes de publicar

- [ ] Nenhuma cor além das 3 (incluindo gradientes)
- [ ] Sem glassmorphism, blur ou sombra colorida
- [ ] Fontes carregando (Bricolage Grotesque + IBM Plex Sans)
- [ ] Sem grid de 3 cards idênticos com ícone
- [ ] Sem card com borda colorida lateral
- [ ] Hero não é centralizado com badge
- [ ] Tema claro por padrão
- [ ] Todas as imagens são trabalho real, não stock
- [ ] Contraste de texto ≥ WCAG AA (4.5:1)
