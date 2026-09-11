// Linter de Vocabulário — thread principal.
// Varre nós de texto da seleção (ou da página) e compara com o glossário
// decidido no Triador. A UI cuida da rede; aqui só mexemos no documento.

figma.showUI(__html__, { width: 420, height: 560, themeColors: true });

const STORE_KEY = 'glossaryUrl';

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

function findings(node, glossary) {
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

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'ready') {
    const url = await figma.clientStorage.getAsync(STORE_KEY);
    figma.ui.postMessage({ type: 'url', url: url || '' });
    return;
  }

  if (msg.type === 'save-url') {
    await figma.clientStorage.setAsync(STORE_KEY, msg.url || '');
    return;
  }

  if (msg.type === 'scan') {
    const glossary = msg.glossary;
    if (!glossary || !Array.isArray(glossary.terms) || !glossary.terms.length) {
      figma.ui.postMessage({ type: 'error', message: 'Glossário vazio ou sem o campo "terms".' });
      return;
    }
    const { nodes, scope } = scopeNodes();
    const results = [];
    for (const n of nodes) results.push(...findings(n, glossary));
    figma.ui.postMessage({
      type: 'results',
      results: results,
      scanned: nodes.length,
      scope: scope,
    });
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
