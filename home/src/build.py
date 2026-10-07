# Monta home/index.html a partir do protótipo da home atual (src/prototype.html, como publicado)
# trocando a fileira de card-app pelo palco (src/stage.html + src/stage.css) e anexando o globo (home.js).
import re, pathlib
H = pathlib.Path(__file__).resolve().parent.parent
src = (H / 'src/prototype.html').read_text()
stage = (H / 'src/stage.html').read_text()
css = (H / 'src/stage.css').read_text()

def img_in(block_start, block_end, nth=0):
    seg = src[src.index(block_start):]
    seg = seg[:seg.index(block_end)]
    return re.findall(r'src="(data:image/[^"]+)"', seg)[nth]

PREV = img_in('data-bn="prev"', '</button>')
NEXT = img_in('data-bn="next"', '</button>')
# ícone do widget de rotas: o de Connections (servidores e rotas no app); o roteador do Network Analyzer foi recusado pelo Gabriel
MON = img_in('data-goto="Connections"', '</div>')
ADD = img_in('<div class="card-add"', '</div>')
# título da seção (pedido do Gabriel)
src = src.replace('<h2>Recent games and apps</h2>', '<h2>Games and monitoring</h2>', 1)
# sem a linha divisória ao lado do título (pedido do Gabriel); o espaçador mantém o botão à direita
src = src.replace('<h2>Games and monitoring</h2><span class="rule"></span>', '<h2>Games and monitoring</h2><span style="flex:1"></span>', 1)
# "View all" do cabeçalho vira "Add game" e abre o dialog do palco (pedido do Gabriel)
src = src.replace('<button class="btn outlined" type="button" data-goto="Library">View all ', '<button class="btn outlined" type="button" id="pkAddBtn">Add game ', 1)
# sem o cabeçalho da seção (título e botão Add game), pedido do Gabriel; o palco fica direto abaixo da topbar
import re as _re
src, _n = _re.subn(r'\s*<div class="page-header">\s*<h2>Games and monitoring</h2>.*?</div>\s*</div>', '', src, count=1, flags=_re.S)
assert _n == 1
stage = stage.replace('{{PREV}}', PREV).replace('{{NEXT}}', NEXT).replace('{{MON}}', MON).replace('{{ADD}}', ADD)

out = src.replace('<title>ExitLag Home Customize</title>', '<title>ExitLag Home Desktop</title>', 1)
i = out.index('<div class="apps">'); j = out.index('<div class="row2">', i)
k = out.rfind('<!--', 0, i)
out = out[:k] + stage.strip() + '\n\n          ' + out[j:]
out = out.replace('</style>', '</style>\n<style>\n' + css + '</style>', 1)
# chips de versão acima do app, fora da interface (pedido do Gabriel); a versão fica em data-v no .app
VCHIPS = '''<nav class="vchips" aria-label="Layout version">
    <button class="vchip" type="button" data-v="1" aria-pressed="true">V1 &middot; Stage + globe</button>
    <button class="vchip" type="button" data-v="4" aria-pressed="false">V4 &middot; Swapped</button>
    <button class="vchip" type="button" data-v="5" aria-pressed="false">V5 &middot; Game art</button>
    <button class="vchip" type="button" data-v="6" aria-pressed="false">V6 &middot; Wide carousel</button>
  </nav>
  '''
out = out.replace('<div class="stage">\n  <div class="app" id="app">', '<div class="stage">\n  ' + VCHIPS + '<div class="app" id="app" data-v="1">', 1)
assert 'class="vchips"' in out
# Sem a ferramenta de feedback do protótipo de origem: não pede o nome ao abrir
out = out.replace('function askName() {', 'function askName() { return;', 1)
# Anek Latin com pesos 600/700 para o título do jogo
out = out.replace('family=Anek+Latin:wght@700', 'family=Anek+Latin:wght@600;700', 1)
out += '''
<script src="land.js"></script>
<script type="importmap">{ "imports": {
  "three": "https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/"
} }</script>
<script type="module" src="home.js"></script>
'''
(H / 'index.html').write_text(out)
print('ok', len(out))
