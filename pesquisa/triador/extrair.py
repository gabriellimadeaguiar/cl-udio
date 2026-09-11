#!/usr/bin/env python3
"""Extrai termos técnicos do registry de strings e pré-classifica.

Uso:  python3 extrair.py registry.json

Gera terms.json e inconsistencies.json, insumos do Triador de Vocabulário.
A heurística de pré-classificação usa o portal como prova de comunicação:
termo que o marketing usa é termo que o público entende.
"""
import json, re, sys, collections

CURATED = {
 'ping':'n','lag':'n','fps':'n','ms':'n','spikes':'n',
 'dns':'i','tcp':'i','udp':'i','ndis':'i','wfp':'i','proxy':'i','driver':'i','drivers':'i','socket':'i',
 'multipath':'i','protocol':'i','ip':'i','tunnel':'i','timeout':'i','mtr':'i','rtt':'i','ipv6':'i','ipv4':'i',
 'firewall':'i','gateway':'i','handshake':'i','nameserver':'i','packets':'i',
 'latency':'g','jitter':'g','packet':'g','route':'g','routes':'g','routing':'g','bandwidth':'g',
 'hop':'g','hops':'g','shaper':'g','throughput':'g','vpn':'g','ram':'g',
}

GROUPS = {
 'Medida de atraso': [('ping', r'\bping\b'), ('latency', r'\blatency\b')],
 'Caminho da conexão': [('route', r'\broutes?\b'), ('routing', r'\brouting\b'), ('path', r'\bpaths?\b')],
 'Perda de dados': [('packet loss', r'packet loss'), ('lost packets', r'lost packets|packets lost')],
 'Atraso percebido': [('lag', r'\blag\b'), ('delay', r'\bdelay\b')],
 'Instabilidade': [('jitter', r'\bjitter\b'), ('instability', r'\binstability\b'), ('spikes', r'\bspikes?\b')],
}


def comp_of(key, product):
    """Nome da tela/componente a partir da chave.

    As chaves vêm em dois formatos: 'Componente.chave' e
    'produto.componente.categoria.label'. Quando o primeiro segmento é o
    nome do produto, o componente é o segundo.
    """
    parts = key.split('.')
    if len(parts) > 1 and parts[0].lower() == str(product).lower():
        return parts[1]
    return parts[0]


def dedupe(prods):
    """Uma entrada por texto único, por produto.

    O registry carrega cada string em dois formatos de chave: o legado
    ('FTUESteps.chave') e o novo ('desktop.ftuesteps.categoria.label_chave').
    São a mesma string na interface. Contar as duas dobra todos os números.
    Mantemos a chave legada, que nomeia a tela de forma legível.
    """
    out = []
    for prod, entries in prods.items():
        by_text = {}
        for key, v in entries.items():
            en = (v.get('translations', {}).get('en-US') or '').strip()
            if not en:
                continue
            prev = by_text.get(en)
            legacy = key.split('.')[0].lower() != str(prod).lower()
            if prev is None or (legacy and not prev[1]):
                by_text[en] = (key, legacy)
        for en, (key, _) in by_text.items():
            out.append({'key': key, 'text': en, 'prod': prod})
    return out


def extract(path):
    prods = json.load(open(path, encoding='utf-8'))['product']
    strings = dedupe(prods)

    rows = []
    for term, kind in CURATED.items():
        pf, samples, keys = collections.Counter(), [], set()
        pat = re.compile(r'\b' + re.escape(term) + r's?\b', re.I)
        for s in strings:
                en, key, prod = s['text'], s['key'], s['prod']
                if pat.search(en):
                    pf[prod] += 1
                    keys.add(key)
                    if len(samples) < 3 and 10 < len(en) < 150:
                        samples.append({'key': key, 'prod': prod, 'text': en.replace('\n', ' ')[:150]})
        tot = sum(pf.values())
        if not tot:
            continue
        ratio = pf['portal'] / tot
        if kind == 'n':
            pre, why = 'manter', 'vocabulário nativo de gaming'
        elif kind == 'i':
            pre = 'traduzir'
            why = 'implementação: marketing não usa' if ratio < .05 else 'termo de implementação'
        else:
            pre = 'decidir'
            why = (f'marketing usa ({int(ratio*100)}% no portal): comunica, mas é técnico'
                   if ratio >= .30 else f'técnico e pouco usado no marketing ({int(ratio*100)}% no portal)')
        rows.append({'term': term, 'total': tot, 'desktop': pf['desktop'], 'mobile': pf['mobile'],
                     'portal': pf['portal'], 'portal_ratio': round(ratio, 2),
                     'pre': pre, 'why': why, 'samples': samples, 'key_count': len(keys)})
    rows.sort(key=lambda r: -r['total'])

    report = []
    for gname, variants in GROUPS.items():
        usage = collections.defaultdict(lambda: {'count': 0, 'labels': [], 'prods': collections.Counter(),
                                                 'comps': collections.Counter()})
        for s in strings:
                en, key, prod = s['text'], s['key'], s['prod']
                for vname, pat in variants:
                    if re.search(pat, en, re.I):
                        u = usage[vname]
                        u['count'] += 1
                        u['prods'][prod] += 1
                        u['comps'][f'{prod}/{comp_of(key, prod)}'] += 1
                        if len(en) <= 28 and len(u['labels']) < 4:
                            u['labels'].append({'key': key, 'prod': prod, 'text': en})
        present = {k: v for k, v in usage.items() if v['count']}
        if len(present) > 1:
            # telas que usam mais de uma variante do mesmo grupo: conflito local
            seen = collections.Counter()
            for v in present.values():
                for c in v['comps']:
                    seen[c] += 1
            clashes = sorted(c for c, n in seen.items() if n > 1)
            report.append({'group': gname, 'clashes': clashes, 'variants': [
                {'term': k, 'count': v['count'], 'by_prod': dict(v['prods']), 'labels': v['labels'],
                 'comps': [{'name': c, 'n': n} for c, n in v['comps'].most_common(12)]}
                for k, v in sorted(present.items(), key=lambda x: -x[1]['count'])]})
    return rows, report


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'registry.json'
    terms, inc = extract(src)
    json.dump(terms, open('terms.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump(inc, open('inconsistencies.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(terms)} termos, {len(inc)} grupos de inconsistência')
