// Arquivos estaticos da tela (CSS e JS). Sem fontes nem scripts de fora: a tela funciona sem internet.
// O JS usa so textContent (nunca innerHTML) e concatenacao de texto (sem template literals aqui dentro).
export const CSS = `
:root{--bg:#0F172A;--card:#1B2336;--muted:#272F42;--mfg:#94A3B8;--fg:#F8FAFC;--gold:#D4A84B;--ok:#22C55E;--warn:#FBBF24;--bad:#EF4444;--line:rgba(148,163,184,.28)}
*{box-sizing:border-box}
body{margin:0;background:radial-gradient(900px 380px at 78% -8%,rgba(96,165,250,.16),transparent 62%),radial-gradient(700px 340px at 0% 100%,rgba(167,139,250,.10),transparent 60%),var(--bg);color:var(--fg);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
h1,h2,.marca{font-family:Georgia,"Times New Roman",serif}
header{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:20px 28px 14px}
.marca{font-size:34px;letter-spacing:.16em;font-weight:700}
.sub{color:var(--mfg);font-size:14px}
.ponte{height:3px;margin:0 28px;border-radius:3px;background:linear-gradient(90deg,#2DD4BF,#60A5FA,#A78BFA,#F472B6,#FBBF24)}
.chip{border:1px solid var(--line);border-radius:999px;padding:4px 12px;font:13px ui-monospace,Consolas,monospace;color:var(--mfg)}
main{display:flex;flex-wrap:wrap;gap:20px;padding:18px 28px 36px;align-items:flex-start}
nav{flex:1 1 280px;max-width:360px;background:rgba(27,35,54,.8);border:1px solid var(--line);border-radius:18px;padding:16px}
section{flex:999 1 520px;min-width:0;background:rgba(27,35,54,.8);border:1px solid var(--line);border-radius:18px;padding:24px 28px}
nav button.passo{display:flex;gap:10px;width:100%;text-align:left;background:transparent;border:1px solid transparent;border-radius:12px;color:var(--fg);padding:8px 10px;min-height:44px;cursor:pointer;font:inherit}
nav button.passo[aria-current=step]{background:rgba(212,168,75,.14);border-color:rgba(212,168,75,.55)}
.no{flex:0 0 28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--muted);color:var(--mfg);font:12px ui-monospace,monospace;border:1px solid var(--line)}
.no.verde{background:var(--ok);color:#0F172A}.no.vermelho{background:var(--bad);color:#0F172A}
.mito{display:block;font-size:12.5px;color:#C9B27A}
h1{margin:0 0 2px;font-size:38px;line-height:1.1}
.lead{color:#CBD5E1;max-width:70ch}
.grade{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0}
.verif{display:flex;gap:10px;background:var(--muted);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.dot{flex:0 0 12px;height:12px;border-radius:50%;margin-top:6px}
.dot.ok{background:var(--ok)}.dot.atencao{background:var(--warn)}.dot.falha{background:var(--bad)}
.det{color:var(--mfg);font-size:13.5px}
button.acao{min-height:44px;border:0;border-radius:12px;padding:0 20px;font:600 16px system-ui;background:var(--gold);color:#0F172A;cursor:pointer}
button.sec{min-height:44px;border:1px solid var(--line);border-radius:12px;padding:0 18px;background:transparent;color:var(--fg);font:inherit;cursor:pointer}
button:focus-visible,textarea:focus-visible{outline:2px solid var(--warn);outline-offset:2px}
textarea{width:100%;min-height:90px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit}
.aviso{background:var(--muted);border:1px solid rgba(251,191,36,.35);border-radius:14px;padding:12px 16px;margin:16px 0;max-width:70ch}
.estado{display:inline-block;border-radius:999px;padding:4px 12px;font-size:14px;font-weight:600;border:1px solid var(--warn);color:var(--warn)}
.estado.verde{border-color:var(--ok);color:var(--ok)}.estado.vermelho{border-color:var(--bad);color:var(--bad)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

export const JS = `
(function(){
  var passos=[],atual=0,verifs=[];
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
  function api(m,u,corpo){
    var o={method:m,headers:{'X-Heimdall':'1'},credentials:'same-origin'};
    if(corpo!==undefined){o.headers['Content-Type']='application/json';o.body=JSON.stringify(corpo)}
    return fetch(u,o).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.erro||'erro');return j})});
  }
  function lateral(){
    var nav=document.getElementById('passos');nav.textContent='';
    var t=el('div','marca','A Ponte');t.style.fontSize='22px';nav.appendChild(t);
    passos.forEach(function(p,i){
      var b=el('button','passo');b.type='button';if(i===atual)b.setAttribute('aria-current','step');
      b.appendChild(el('span','no '+p.estado,p.estado==='verde'?'\\u2713':String(i+1)));
      var d=el('span');d.appendChild(el('span','',p.titulo));d.appendChild(el('span','mito',p.mito));b.appendChild(d);
      b.addEventListener('click',function(){atual=i;tudo()});nav.appendChild(b);
    });
  }
  function painel(){
    var p=passos[atual],s=document.getElementById('painel');s.textContent='';
    s.appendChild(el('div','sub','PASSO '+(atual+1)+' DE '+passos.length));
    s.appendChild(el('h1','',p.titulo));s.appendChild(el('div','mito',p.mito));
    var st=el('span','estado '+p.estado,p.estado==='verde'?'Verde \\u00b7 pronto':p.estado==='vermelho'?'Vermelho \\u00b7 precisa de atencao':'Aguardando');
    s.appendChild(st);s.appendChild(el('p','lead',p.explicacao));
    if(p.id==='ambiente'){ambiente(s)}
    else{var a=el('div','aviso','Este passo ainda nao esta ligado nesta versao. A IA que acompanha a primeira instalacao constroi e testa este passo a seguir (docs/plano/fase-1-onboarding-visual.md).');s.appendChild(a)}
    bug(s,p.id);
  }
  function ambiente(s){
    var g=el('div','grade');verifs.forEach(function(v){
      var c=el('div','verif');c.appendChild(el('span','dot '+v.estado));var d=el('div');d.appendChild(el('div','',v.rotulo));d.appendChild(el('div','det',v.detalhe));c.appendChild(d);g.appendChild(c)});
    s.appendChild(g);
    var b=el('button','acao','Testar ambiente');b.type='button';
    b.addEventListener('click',function(){b.disabled=true;api('POST','/api/ambiente/testar',{}).then(function(r){verifs=r.verificacoes;return carregar()}).catch(function(e){alert(e.message)}).then(function(){b.disabled=false})});
    s.appendChild(b);
  }
  function bug(s,id){
    var box=el('div','aviso');box.appendChild(el('div','','Algo deu errado ou estranho neste passo?'));
    var ta=el('textarea');ta.setAttribute('aria-label','Descreva o problema');ta.placeholder='Conte o que aconteceu. Nao escreva senhas nem chaves.';box.appendChild(ta);
    var out=el('div','det');
    var b=el('button','sec','Relatar problema');b.type='button';b.style.marginTop='8px';
    b.addEventListener('click',function(){
      if(!ta.value.trim()){out.textContent='Escreva uma frase sobre o problema.';return}
      api('POST','/api/bug',{etapa:id,descricao:ta.value}).then(function(r){out.textContent='Relatorio criado ('+r.arquivo+'). A IA vai transformar isso em teste e correcao.';ta.value=''}).catch(function(e){out.textContent='Nao consegui salvar: '+e.message});
    });
    box.appendChild(b);box.appendChild(out);s.appendChild(box);
  }
  function tudo(){lateral();painel()}
  function carregar(){return api('GET','/api/estado').then(function(r){passos=r.passos;if(!verifs.length)verifs=r.verificacoes||[];document.getElementById('bugs').textContent='relatorios de bug abertos: '+r.bugsAbertos;tudo()})}
  carregar().then(function(){return api('POST','/api/ambiente/testar',{})}).then(function(r){verifs=r.verificacoes;return carregar()}).catch(function(){});
})();
`;

export const HTML = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Heimdall — configuração inicial</title>
<link rel="stylesheet" href="/app.css">
</head>
<body>
<header>
  <div><div class="marca">HEIMDALL</div><div class="sub">Sentinela de Bifröst · configuração inicial, uma vez só</div></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip">só nesta máquina · 127.0.0.1</span><span class="chip" id="bugs">relatórios de bug abertos: 0</span></div>
</header>
<div class="ponte"></div>
<main>
  <nav id="passos" aria-label="Passos da configuração"></nav>
  <section id="painel" aria-live="polite"></section>
</main>
<script src="/app.js"></script>
</body>
</html>`;
