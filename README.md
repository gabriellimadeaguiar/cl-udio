# Radar de Feedback — ExitLag

Site estático no GitHub Pages que roda uma **coleta diária** (GitHub Actions), busca
menções **públicas** à ExitLag na web, classifica os achados e acumula histórico
comparável de 1+ ano. O repositório Git **é o banco de dados**: cada dia vira um JSON
versionado — sem servidor, sem banco.

A pergunta que o painel responde não é "como está o feedback?", e sim
**"o que mudou e o que eu faço a respeito?"**. Regra de ouro: nível absoluto sem linha
de base comparativa não entra. Todo número é clicável até o post de origem (drill-down).

> **Sobre a ExitLag:** software de otimização de **rota** para jogos (multipath routing).
> **Não é VPN** — não criptografa, não mascara IP, não serve para navegação geral.

---

## Como funciona

```
GitHub Actions (cron 6h) → scripts/coletar.mjs → API Anthropic (busca web)
  → extrai schema rico → valida (inválido → dados/rejeitados/) → dedup por id
  → marca 1ª aparição (catálogo) → grava dados/snapshots/AAAA-MM-DD.json
  → agrega série + baselines + deltas → commit → GitHub Pages republica
```

## Estrutura

```
config/
  taxonomia.json     # 9 temas FECHADOS + regra de alerta de 'outros' > 15%
  eventos.json       # marcadores de release/incidente — VOCÊ edita à mão
scripts/
  schema.mjs         # schema do sinal + validador + normalização de enums
  comum.mjs          # id=sha1(url), médias móveis 7/30/90, múltiplo, custo
  coletar.mjs        # chama a API, extrai, valida, grava snapshot
  dedup.mjs          # dedup por id;  catalogo.mjs: 1ª aparição (tema+jogo)
  agregar.mjs        # série + baselines + deltas + "O que mudou" + sinais-recentes
  montar-site.mjs    # monta _site/ (Pages e preview local)
dados/
  snapshots/AAAA-MM-DD.json  # sinais completos do dia (dado histórico — IMUTÁVEL)
  rejeitados/AAAA-MM-DD.json # sinais barrados na validação + motivo
  serie-historica.json       # agregados/dia + baselines + deltas + "O que mudou"
  sinais-recentes.json       # sinais dos últimos 90d (feeds/tabelas/drill-down)
  catalogo.json / vistos.json / ultimo.json
site/
  index.html · app.js · estilo.css   # painel (SVG/JS puro, sem framework)
```

## O schema do sinal (o gargalo é a coleta)

Campo não extraído na hora da classificação **não é recuperável depois**. Cada sinal sai
da API já com: `url, fonte, titulo_thread, data_publicacao, tema, sentimento, severidade,
jogos[], regiao, intencao_churn, tipo_churn, concorrente_citado, direcao_concorrente,
e_pergunta, respondida, confusao_proposta, resumo, citacao`. Calculados depois:
`id` (sha1 da URL) e `primeira_aparicao` (assinatura tema+jogo nunca vista).

- **`citacao` e `resumo` são sempre PARÁFRASE (≤15 palavras), nunca cópia literal.**
- Sinal que falha o schema vai para `dados/rejeitados/` com o motivo — **nunca** entra no
  histórico silenciosamente.

## As views

1. **O que mudou** — 5 linhas determinísticas (regra sobre os deltas, não IA). Se nada
   cruza os limiares, diz exatamente *"Nada relevante mudou nos últimos 7 dias."*
2. **Small multiples** — 9 mini-gráficos (um por tema), mesma escala, faixa = média de 90d.
3. **Linha do tempo** — volume total + marcadores de release (de `config/eventos.json`).
4. **Frequência × severidade** — 4 quadrantes: agir agora · investigar · melhorar UX ·
   ignorar conscientemente.
5. **Por jogo** — tabela ordenável: menções, Δ vs base, sentimento, tema dominante, região.
6. **Primeira aparição** — só o inédito, cronológico. É o alarme do sistema.
7. **Coorte de release** — 14 dias após cada lançamento, para comparar releases.
8. **Churn declarado** — intenção de abandono com motivo e link. Fala direto com receita.

Todo ponto/barra/linha abre os sinais de origem, cada um com link para o post.

---

## Ativação (primeira vez)

1. **Chave de API** — console.anthropic.com → **Billing** (adicione crédito) → **defina um
   limite de gasto mensal** (freio contra loop) → **API keys → Create key** (`sk-ant-...`).
2. **GitHub Secret** — `Settings → Secrets and variables → Actions` → secret
   **`ANTHROPIC_API_KEY`**. (Opcional: *variable* `MODELO`.)
3. **GitHub Pages** — `Settings → Pages → Source = GitHub Actions`.
4. **Agendamento** — o `cron` só dispara a partir do **branch padrão** do repo. Até lá, use
   **Actions → Coleta diária → Run workflow**. Para automatizar, torne este branch o padrão
   (ou faça merge para ele).
5. **Passo obrigatório — 1ª coleta conferida à mão** (contra o modelo inventar fonte):
   rode uma coleta e **leia o JSON cru**, confirmando que cada `url` abre e que
   `citacao`/`resumo` batem com a fonte. Só automatize depois disso.

### Rodar localmente

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...        # macOS/Linux (Windows: $env:ANTHROPIC_API_KEY=...)
node scripts/coletar.mjs                    # uma coleta real (~US$0,50–0,70 no Opus 4.8)
cat dados/snapshots/$(date -u +%F).json     # confira as fontes

# preview do site sem coletar:
node scripts/montar-site.mjs && python3 -m http.server -d _site 8000
```

O histórico começa **vazio**; o painel se preenche a partir da 1ª coleta.

---

## Operação

**Adicionar um tema (sem quebrar o histórico):** em `config/taxonomia.json`, **acrescente**
um objeto em `temas` (id novo) e incremente `versao`. **Nunca** renomeie nem remova ids. Se o
painel avisar que `outros` passou de 15% em 30 dias, é sinal de que falta um tema.

**Anotar um release/incidente:** edite `config/eventos.json`, adicionando
`{ "data": "AAAA-MM-DD", "titulo": "Release X", "tipo": "release" }`. Aparece na timeline e na
coorte. Ver o pico três dias depois de um deploy é o insight que justifica o projeto.

**Modelo e custo:** `MODELO` (padrão **`claude-opus-4-8`**, pela qualidade de extração do
schema rico; troque para `claude-sonnet-5` para reduzir custo). Confira preços em
https://claude.com/pricing.

| Período | Opus 4.8 | Sonnet 5 |
|---|---|---|
| Dia | ~US$0,50–0,70 | ~US$0,25 |
| Mês | ~US$15–20 | ~US$7,50 |

O custo de cada execução vai no snapshot; o rodapé mostra o acumulado do mês.

## Confiabilidade (embutida)

- **Falha da API não corrompe o histórico** — o dia é gravado com `status:"falha"` (buraco ≠
  zero); o workflow abre/atualiza uma issue `coleta-falhou`.
- **Validação de schema antes de gravar** — inválido vai para `dados/rejeitados/`.
- **Confiança baixa quando o material é escasso** — aparece no painel, em vez de encher a
  tela com conteúdo fabricado.

## Guardrails

Nunca inventar fonte, URL, número ou citação. Citação sempre paráfrase ≤15 palavras, com link.
Chave de API só via `secrets.ANTHROPIC_API_KEY` — nunca no código do site, nunca commitada. O
site publicado contém apenas dados agregados e links públicos.

## Limites honestos

- Alcança só o **público indexado**. **Discord e grupos privados ficam de fora** — se a
  comunidade mais ativa está lá, esta ferramenta cobre a parte visível, não a mais rica.
- **Não é amostra estatística** — é radar direcional; enviesa para os extremos (quem está
  muito bravo ou muito satisfeito). Combine com churn/tickets/telemetria antes de priorizar.
