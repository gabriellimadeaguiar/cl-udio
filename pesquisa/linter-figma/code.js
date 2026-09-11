// Linter de Vocabulário — thread principal.
// Varre nós de texto da seleção (ou da página) e compara com o glossário
// decidido no Triador.
//
// O glossário mora numa URL, não aqui dentro: assim o time atualiza o
// vocabulário sem ninguém republicar o plugin. Ninguém digita esse endereço —
// ele vem gravado abaixo, e a interface não tem campo para ele.

// Preencha uma vez, antes de publicar para a organização. Depois disso, o
// vocabulário muda editando o arquivo nessa URL, e o plugin acompanha sozinho.
const GLOSSARY_URL = '';

// Última versão que carregou com sucesso, para o plugin continuar servindo
// quando a rede falhar. Fica na máquina de quem usa, não no arquivo do Figma.
const CACHE_KEY = 'glossaryCache';

figma.showUI(__html__, { width: 420, height: 560, themeColors: true });

let glossary = null;

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Preserva a capitalização do original: Latency -> Ping, LATENCY -> PING.
function matchCase(original, replacement) {
  if (original === original.toUpperCase() && original !== original.toLowerCase()) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement.toLowerCase();
}

// Só consideramos seguro trocar quando o texto inteiro é o termo, com um
// sufixo opcional entre parênteses: "Latency" ou "Latency (ms)".
// Em frase, a troca pode quebrar concordância — aí apenas sinalizamos.
function safeReplacement(text, term, prefer) {
  if (!prefer) return null;
  const re = new RegExp('^(\\s*)(' + escapeRe(term) + ')(\\s*(?:\\([^)]*\\))?\\s*)$', 'i');
  const m = text.match(re);
  if (!m) return null;
  return m[1] + matchCase(m[2], prefer) + m[3];
}

function valid(g) {
  return !!(g && Array.isArray(g.terms) && g.terms.length
    && g.terms.every((t) => t && t.term && t.decision));
}

function summary(g, stale) {
  const terms = g.terms;
  return {
    type: 'glossary',
    updated: g.updated || '',
    source: g.source || '',
    total: terms.length,
    // "manter" não gera apontamento — só estes contam como regra ativa.
    active: terms.filter((t) => t.decision !== 'manter').length,
    stale: !!stale,
  };
}

function findings(node) {
  const text = node.characters;
  if (!text || !text.trim()) return [];
  const out = [];
  for (const entry of glossary.terms) {
    if (entry.decision === 'manter') continue;
    const re = new RegExp('\\b' + escapeRe(entry.term) + 's?\\b', 'i');
    if (!re.test(text)) continue;
    const fix = entry.decision === 'traduzir' ? safeReplacement(text, entry.term, entry.prefer) : null;
    out.push({
      id: node.id,
      name: node.name,
      text: text.length > 140 ? text.slice(0, 140) + '…' : text,
      term: entry.term,
      decision: entry.decision,
      prefer: entry.prefer || '',
      note: entry.note || '',
      fix: fix,
    });
  }
  return out;
}

function scopeNodes() {
  const sel = figma.currentPage.selection;
  if (sel.length) {
    const nodes = [];
    for (const n of sel) {
      if (n.type === 'TEXT') nodes.push(n);
      else if ('findAllWithCriteria' in n) nodes.push(...n.findAllWithCriteria({ types: ['TEXT'] }));
    }
    return { nodes: nodes, scope: 'seleção' };
  }
  return {
    nodes: figma.currentPage.findAllWithCriteria({ types: ['TEXT'] }),
    scope: 'página “' + figma.currentPage.name + '”',
  };
}

async function loadFontsOf(node) {
  const fonts = node.getRangeAllFontNames(0, node.characters.length);
  await Promise.all(fonts.map(figma.loadFontAsync));
}

// Quando a busca falha, tenta o último glossário que funcionou. Melhor apontar
// com vocabulário de ontem do que não apontar nada.
async function useCache(reason) {
  const cached = await figma.clientStorage.getAsync(CACHE_KEY);
  if (valid(cached)) {
    glossary = cached;
    figma.ui.postMessage(summary(cached, true));
    figma.ui.postMessage({ type: 'warn', message: reason + ' Usando a última versão que baixou.' });
  } else {
    figma.ui.postMessage({ type: 'error', message: reason });
  }
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'ready') {
    if (!GLOSSARY_URL) {
      figma.ui.postMessage({ type: 'error', message: 'Este plugin foi distribuído sem a URL do glossário. Preencha GLOSSARY_URL no code.js e publique de novo.' });
      return;
    }
    figma.ui.postMessage({ type: 'fetch', url: GLOSSARY_URL });
    return;
  }

  // A UI é quem tem rede; ela busca e devolve o resultado para cá.
  if (msg.type === 'fetched') {
    if (!valid(msg.glossary)) {
      await useCache('O glossário baixado está vazio ou fora do formato.');
      return;
    }
    glossary = msg.glossary;
    await figma.clientStorage.setAsync(CACHE_KEY, glossary);
    figma.ui.postMessage(summary(glossary, false));
    return;
  }

  if (msg.type === 'fetch-failed') {
    await useCache('Não consegui buscar o glossário: ' + msg.message + '.');
    return;
  }

  if (msg.type === 'scan') {
    if (!valid(glossary)) {
      figma.ui.postMessage({ type: 'error', message: 'Nenhum glossário carregado.' });
      return;
    }
    const { nodes, scope } = scopeNodes();
    const results = [];
    for (const n of nodes) results.push(...findings(n));
    figma.ui.postMessage({ type: 'results', results: results, scanned: nodes.length, scope: scope });
    return;
  }

  if (msg.type === 'focus') {
    const node = await figma.getNodeByIdAsync(msg.id);
    if (!node) {
      figma.ui.postMessage({ type: 'gone', id: msg.id });
      return;
    }
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
    return;
  }

  if (msg.type === 'fix') {
    const node = await figma.getNodeByIdAsync(msg.id);
    if (!node || node.type !== 'TEXT') {
      figma.ui.postMessage({ type: 'gone', id: msg.id });
      return;
    }
    try {
      await loadFontsOf(node);
      node.characters = msg.text;
      figma.ui.postMessage({ type: 'fixed', id: msg.id });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: 'Não consegui editar “' + node.name + '”: ' + e.message });
    }
    return;
  }

  if (msg.type === 'close') figma.closePlugin();
};
