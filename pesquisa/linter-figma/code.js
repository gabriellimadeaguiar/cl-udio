// Linter de Vocabulário — thread principal.
// Varre nós de texto da seleção (ou da página) e compara com o glossário
// decidido no Triador. O glossário vem embutido: o plugin não faz rede.
//
// Para atualizar: exporte o glossario.json no Triador, deixe o arquivo
// nesta pasta e rode `python3 embutir.py`. Depois, Publish no Figma.

// <<<GLOSSARIO — gerado por embutir.py, não edite à mão
const GLOSSARY = {
  "version": 1,
  "updated": "2026-09-11",
  "source": "EXEMPLO — não é a decisão do time",
  "terms": [
    {
      "term": "latency",
      "decision": "traduzir",
      "prefer": "ping"
    },
    {
      "term": "ndis",
      "decision": "traduzir",
      "prefer": "driver de rede"
    },
    {
      "term": "ipv6",
      "decision": "traduzir",
      "prefer": "conexão"
    },
    {
      "term": "ping",
      "decision": "manter"
    },
    {
      "term": "lag",
      "decision": "manter"
    },
    {
      "term": "fps",
      "decision": "manter"
    },
    {
      "term": "route",
      "decision": "decidir",
      "note": "marketing usa em 33% das strings do portal — decidir por superfície"
    },
    {
      "term": "packet",
      "decision": "decidir",
      "note": "aparece como packet loss; decidir se o conceito vira um nome só"
    }
  ]
};
// GLOSSARIO>>>

figma.showUI(__html__, { width: 420, height: 560, themeColors: true });

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

function findings(node) {
  const text = node.characters;
  if (!text || !text.trim()) return [];
  const out = [];
  for (const entry of GLOSSARY.terms) {
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
    const terms = Array.isArray(GLOSSARY.terms) ? GLOSSARY.terms : [];
    figma.ui.postMessage({
      type: 'glossary',
      updated: GLOSSARY.updated || '',
      source: GLOSSARY.source || '',
      total: terms.length,
      // "manter" não gera apontamento — só estes contam como regra ativa.
      active: terms.filter((t) => t.decision !== 'manter').length,
    });
    return;
  }

  if (msg.type === 'scan') {
    if (!Array.isArray(GLOSSARY.terms) || !GLOSSARY.terms.length) {
      figma.ui.postMessage({ type: 'error', message: 'O glossário embutido está vazio. Rode embutir.py e publique de novo.' });
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
