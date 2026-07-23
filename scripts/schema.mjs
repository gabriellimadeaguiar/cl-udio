// Schema do SINAL (extração) + validador. Sem libs.
// Sinal inválido nunca entra no histórico: vai para dados/rejeitados/ com o motivo.

export const ENUMS = {
  fonte: ["reddit", "forum", "x", "trustpilot", "blog", "outro"],
  sentimento: ["positivo", "neutro", "negativo"],
  severidade: ["alta", "media", "baixa"],
  regiao: ["BR", "LATAM", "NA", "EU", "ASIA", "desconhecida"],
  tipo_churn: ["cancelou", "pediu_reembolso", "migrou", "ameacou", "nenhum"],
  direcao_concorrente: ["veio_de", "foi_para", "comparando", null],
};

// Campos que o MODELO devolve (sem id/primeira_aparicao, que são calculados depois).
export const CAMPOS_MODELO = [
  "url", "fonte", "titulo_thread", "data_publicacao", "tema", "sentimento",
  "severidade", "jogos", "regiao", "intencao_churn", "tipo_churn",
  "concorrente_citado", "direcao_concorrente", "e_pergunta", "respondida",
  "confusao_proposta", "resumo", "citacao",
];

const ehTexto = (v) => typeof v === "string" && v.trim().length > 0;
const ehBool = (v) => typeof v === "boolean";
const palavras = (s) => (s || "").trim().split(/\s+/).filter(Boolean).length;

// Valida um sinal já normalizado. idsTemas vem da taxonomia.
export function validarSinal(s, idsTemas) {
  const e = [];
  if (!ehTexto(s.url) || !/^https?:\/\//i.test(s.url)) e.push("url inválida");
  if (!ENUMS.fonte.includes(s.fonte)) e.push(`fonte inválida: ${s.fonte}`);
  if (!ehTexto(s.titulo_thread)) e.push("titulo_thread vazio");
  if (s.data_publicacao !== null && !/^\d{4}-\d{2}-\d{2}$/.test(s.data_publicacao || ""))
    e.push("data_publicacao inválida");
  if (!idsTemas.includes(s.tema)) e.push(`tema fora da taxonomia: ${s.tema}`);
  if (!ENUMS.sentimento.includes(s.sentimento)) e.push(`sentimento inválido: ${s.sentimento}`);
  if (!ENUMS.severidade.includes(s.severidade)) e.push(`severidade inválida: ${s.severidade}`);
  if (!Array.isArray(s.jogos)) e.push("jogos deve ser array");
  if (!ENUMS.regiao.includes(s.regiao)) e.push(`regiao inválida: ${s.regiao}`);
  if (!ehBool(s.intencao_churn)) e.push("intencao_churn deve ser boolean");
  if (!ENUMS.tipo_churn.includes(s.tipo_churn)) e.push(`tipo_churn inválido: ${s.tipo_churn}`);
  if (s.concorrente_citado !== null && !ehTexto(s.concorrente_citado)) e.push("concorrente_citado inválido");
  if (!ENUMS.direcao_concorrente.includes(s.direcao_concorrente ?? null))
    e.push(`direcao_concorrente inválida: ${s.direcao_concorrente}`);
  if (!ehBool(s.e_pergunta)) e.push("e_pergunta deve ser boolean");
  if (!ehBool(s.respondida)) e.push("respondida deve ser boolean");
  if (!ehBool(s.confusao_proposta)) e.push("confusao_proposta deve ser boolean");
  if (!ehTexto(s.resumo)) e.push("resumo vazio");
  else if (palavras(s.resumo) > 15) e.push(`resumo > 15 palavras (${palavras(s.resumo)})`);
  if (!ehTexto(s.citacao)) e.push("citacao vazia");
  else if (palavras(s.citacao) > 15) e.push(`citacao > 15 palavras (${palavras(s.citacao)})`);
  // Coerência: churn declarado exige tipo != nenhum, e vice-versa.
  if (s.intencao_churn && s.tipo_churn === "nenhum") e.push("intencao_churn=true mas tipo_churn=nenhum");
  if (!s.intencao_churn && s.tipo_churn !== "nenhum") e.push("intencao_churn=false mas tipo_churn≠nenhum");
  return e;
}

// Normaliza o objeto cru do modelo para o formato canônico (coage enums, listas, tipos).
export function normalizarSinal(bruto, idsTemas) {
  const enumOu = (v, lista, padrao) => (lista.includes(v) ? v : padrao);
  const jogos = Array.isArray(bruto.jogos)
    ? bruto.jogos.map((j) => String(j).toLowerCase().trim().replace(/\s+/g, "-")).filter(Boolean)
    : [];
  const intencao = bruto.intencao_churn === true;
  let tipoChurn = enumOu(bruto.tipo_churn, ENUMS.tipo_churn, "nenhum");
  if (!intencao) tipoChurn = "nenhum";
  return {
    url: String(bruto.url || "").trim(),
    fonte: enumOu(bruto.fonte, ENUMS.fonte, "outro"),
    titulo_thread: String(bruto.titulo_thread || "").trim(),
    data_publicacao: /^\d{4}-\d{2}-\d{2}$/.test(bruto.data_publicacao || "") ? bruto.data_publicacao : null,
    tema: idsTemas.includes(bruto.tema) ? bruto.tema : "outros",
    sentimento: enumOu(bruto.sentimento, ENUMS.sentimento, "neutro"),
    severidade: enumOu(bruto.severidade, ENUMS.severidade, "baixa"),
    jogos,
    regiao: enumOu(bruto.regiao, ENUMS.regiao, "desconhecida"),
    intencao_churn: intencao,
    tipo_churn: tipoChurn,
    concorrente_citado: bruto.concorrente_citado ? String(bruto.concorrente_citado).trim() : null,
    direcao_concorrente: ENUMS.direcao_concorrente.includes(bruto.direcao_concorrente) ? bruto.direcao_concorrente : null,
    e_pergunta: bruto.e_pergunta === true,
    respondida: bruto.respondida === true,
    confusao_proposta: bruto.confusao_proposta === true,
    resumo: String(bruto.resumo || "").trim(),
    citacao: String(bruto.citacao || "").trim(),
  };
}

// Assinaturas tema+jogo de um sinal (para catálogo / primeira aparição).
export function assinaturas(sinal) {
  const jogos = sinal.jogos && sinal.jogos.length ? sinal.jogos : ["_geral"];
  return jogos.map((j) => `${sinal.tema}__${j}`);
}
