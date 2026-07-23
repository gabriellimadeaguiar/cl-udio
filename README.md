# Radar de Feedback — ExitLag

Página web hospedada no GitHub que roda uma **busca automática diária** por menções
públicas à ExitLag e acumula histórico comparável (meta: 1+ ano). O truque central:
**o próprio repositório Git é o banco de dados** — cada dia vira um JSON versionado.
Sem servidor, sem banco, sem custo de hospedagem.

```
GitHub Actions (cron 6h) → scripts/coletar.mjs → API Anthropic (busca web)
   → dedup por URL → classifica só o novo → grava dados/snapshots/AAAA-MM-DD.json
   → atualiza dados/serie-historica.json → commit no repo → GitHub Pages republica
```

---

## Estrutura

```
.github/workflows/
  coleta-diaria.yml     # cron 6h + botão "Run workflow" (manual)
  deploy-site.yml       # publica no Pages a cada commit de dado
config/
  taxonomia.json        # a lista FECHADA de temas (o coração do histórico)
scripts/
  coletar.mjs           # chama a API com busca web, classifica, valida, grava
  dedup.mjs             # compara com vistos.json (dedup por URL)
  agregar.mjs           # atualiza a série histórica leve
  comum.mjs             # utilidades compartilhadas (preços, validação, datas)
  montar-site.mjs       # monta _site/ para o Pages e para preview local
  semear-exemplo.mjs    # gera dados de EXEMPLO (rode uma vez; some após 1ª coleta real)
dados/
  snapshots/AAAA-MM-DD.json   # um arquivo por dia (sinais completos)
  serie-historica.json        # agregado leve (números por dia) — o site desenha 1 ano disso
  vistos.json                 # URLs já processadas
  ultimo.json                 # atalho para o painel do dia
  eventos.json                # marcadores de release/incidente (edite à mão)
site/
  index.html · app.js · estilo.css   # painel estático (fundo escuro, verde de sinal)
```

**Por que `serie-historica.json` separado:** o site não pode baixar 365 snapshots para
desenhar um gráfico. Esse arquivo guarda só contagem por tema + sentimento + custo por dia;
fica com poucos KB mesmo depois de um ano. Os snapshots completos só são buscados ao clicar
num dia específico.

---

## Ativação (primeira vez)

1. **Chave de API** — crie em https://console.anthropic.com e **defina um limite de gasto
   mensal** (um bug de loop pode multiplicar o custo).
2. **GitHub Secret** — em `Settings → Secrets and variables → Actions`, crie o secret
   **`ANTHROPIC_API_KEY`**. (Opcional: uma *variable* `MODELO` para trocar o modelo.)
3. **GitHub Pages** — `Settings → Pages → Source = GitHub Actions`.
4. **Agendamento** — o GitHub só dispara o `cron` a partir do **branch padrão** do repo.
   Enquanto isso, use **Actions → Coleta diária → Run workflow** (manual). Para automatizar,
   faça deste branch o padrão (ou faça merge para o padrão).
5. **Primeira coleta manual** — rode o workflow e **leia o resultado inteiro à mão**:
   confirme que as fontes existem e que as citações batem com os links. Essa é a única
   verificação real contra fonte inventada. Faça isso antes de confiar na automação.

### Rodar localmente

```bash
npm install
export ANTHROPIC_API_KEY=...      # sua chave
node scripts/coletar.mjs          # faz uma coleta real (custa ~US$0,25)

# preview do site sem coletar (usa os dados atuais do repo):
node scripts/montar-site.mjs
python3 -m http.server -d _site 8000   # abra http://localhost:8000
```

Sem chave de API, você ainda vê o site com os **dados de exemplo**
(`node scripts/semear-exemplo.mjs` recria os exemplos, se precisar).

---

## As três decisões que sustentam a arquitetura

- **A — Privacidade do site.** Repo privado **não** deixa o Pages privado. Opções: (A1)
  repo privado + Pages público por link; (A3) hospedagem com senha (Cloudflare/Vercel).
  O conteúdo coletado é feedback público; o confidencial é a *leitura interna* disso —
  mantenha conclusões de produto/roadmap num doc separado. **Nunca** exponha a chave de
  API, nomes de usuários coletados ou dados de receita.
  → _Escreva aqui a opção escolhida:_ **(A definir)**

- **B — Taxonomia fixa** (`config/taxonomia.json`). Se o modelo inventar nomes de tema a
  cada dia, o gráfico de 1 ano vira lixo. A lista é **fechada**. Para evoluir:
  **só ADICIONE** temas novos e incremente `versao` — **nunca** renomeie nem remova ids.
  A categoria `outros` é o alarme: se inchar, falta um tema.

- **C — Deduplicação** (`dados/vistos.json`). A busca diária retorna em grande parte os
  mesmos threads. Sem dedup, uma discussão seria contada 365 vezes. O snapshot registra
  **sinais novos**, não o acumulado.

- **Ritual de uso** — _defina quem abre o painel e quando_ (ex.: "toda segunda antes do
  refinamento"). Sem isso, a ferramenta vira painel bonito que ninguém abre.
  → _Escreva aqui:_ **(A definir)**

---

## Como adicionar um tema (sem quebrar o histórico)

1. Em `config/taxonomia.json`, **acrescente** um objeto em `temas` (id novo, nunca reusado).
2. Incremente `versao`.
3. Commit. A partir daí os dias novos podem usar o tema; os dias antigos continuam válidos.
   **Não** renomeie nem remova ids existentes.

---

## Modelo e custo

O script usa a variável de ambiente `MODELO` (padrão **`claude-sonnet-5`**, escolhido pela
relação custo/qualidade para uma execução diária). O padrão do Claude Code é o Opus 4.8;
troque definindo a *variable* `MODELO` no GitHub ou a env local.

Estimativa (confira os valores atuais em https://claude.com/pricing antes de aprovar orçamento):

| Período | Estimativa |
|---|---|
| Dia | ~US$0,25 |
| Mês | ~US$7,50 |
| Ano | ~US$90 |

Cada snapshot registra `custo` (buscas + tokens + USD); o painel mostra o **custo acumulado
do mês**.

---

## Confiabilidade (já embutido)

- **Falha da API não corrompe o histórico** — o dia é gravado como `status: "sem-coleta"`
  (não como "zero sinais"), preservando a continuidade da série.
- **Validação de esquema antes de gravar** — snapshot malformado é rejeitado.
- **Notificação de falha** — o workflow abre/atualiza uma issue rotulada `coleta-falhou`.
- **Custo por execução** — registrado no snapshot e somado no painel.

---

## Limites honestos

- Discord e grupos privados ficam de fora (busca web só alcança o público indexado).
- Não é amostra estatística — é um radar direcional para levantar hipótese.
- Enviesa para os extremos (quem está muito bravo ou muito satisfeito).
- Combine com dado quantitativo próprio (churn, tickets, telemetria) antes de priorizar.
