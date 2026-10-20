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
.chips{display:flex;gap:8px;flex-wrap:wrap}
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
input.txt{width:100%;max-width:520px;min-height:44px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:12px;padding:0 12px;font:inherit}
textarea{width:100%;min-height:90px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:12px;padding:10px;font:inherit}
.aviso{background:var(--muted);border:1px solid rgba(251,191,36,.35);border-radius:14px;padding:12px 16px;margin:16px 0;max-width:70ch}
.estado{display:inline-block;border-radius:999px;padding:4px 12px;font-size:14px;font-weight:600;border:1px solid var(--warn);color:var(--warn)}
.estado.verde{border-color:var(--ok);color:var(--ok)}.estado.vermelho{border-color:var(--bad);color:var(--bad)}
.barra{height:14px;border-radius:999px;background:var(--muted);border:1px solid var(--line);overflow:hidden;margin:6px 0 2px}
.barra>i{display:block;height:100%;background:linear-gradient(90deg,#2DD4BF,#60A5FA,#A78BFA);width:0}
.qr{background:#fff;border-radius:16px;padding:10px;width:280px;height:280px;display:block;margin:12px 0}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:14px 0}
.kpi{background:var(--muted);border:1px solid var(--line);border-radius:14px;padding:12px 14px}.kpi b{display:block;font-size:26px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

export const JS = `
(function(){
  var passos=[],atual=0,verifs=[],perfilAtual=null,pn=null,resTeste=null,msgSelf='';
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
    else if(p.pronto&&pn){var f=RENDER[p.id];if(f)f(s,pn)}
    else if(p.pronto){s.appendChild(el('div','aviso','Carregando os dados...'))}
    else{var a=el('div','aviso','Este passo ainda nao esta ligado nesta versao. A IA que acompanha a primeira instalacao constroi e testa este passo a seguir (docs/plano/fase-1-onboarding-visual.md).');s.appendChild(a)}
    bug(s,p.id);
  }
  function ambiente(s){
    var g=el('div','grade');verifs.forEach(function(v){
      var c=el('div','verif');c.appendChild(el('span','dot '+v.estado));var d=el('div');d.appendChild(el('div','',v.rotulo));d.appendChild(el('div','det',v.detalhe));c.appendChild(d);g.appendChild(c)});
    s.appendChild(g);
    if(perfilAtual){s.appendChild(perfilCard(perfilAtual))}
    var b=el('button','acao','Testar ambiente');b.type='button';
    b.addEventListener('click',function(){b.disabled=true;api('POST','/api/ambiente/testar',{}).then(function(r){verifs=r.verificacoes;perfilAtual=r.perfil||null;return carregar()}).catch(function(e){alert(e.message)}).then(function(){b.disabled=false})});
    s.appendChild(b);
  }
  function perfilCard(p){
    var rot={ok:'adequado',apertado:'apertado',nao_recomendado:'nao recomendado'};
    var c=el('div','aviso');
    c.appendChild(el('div','','Perfil recomendado: '+p.nome+' \\u00b7 '+(rot[p.adequacao]||p.adequacao)));
    c.appendChild(el('div','det',p.resumo));
    var ul=el('ul');p.itens.forEach(function(i){ul.appendChild(el('li','',i.rotulo+': '+i.valor+' ['+i.origem+']'))});c.appendChild(ul);
    p.avisos.forEach(function(a){c.appendChild(el('div','det','Atencao: '+a))});
    p.passos.forEach(function(x){c.appendChild(el('div','det','Proximo passo: '+x))});
    return c;
  }
  function barra(s,rotulo,pct,detalhe){
    s.appendChild(el('div','',rotulo));
    var b=el('div','barra');b.setAttribute('role','progressbar');b.setAttribute('aria-valuemin','0');b.setAttribute('aria-valuemax','100');
    var v=Math.max(0,Math.min(100,Math.round(pct||0)));b.setAttribute('aria-valuenow',String(v));
    var i=document.createElement('i');i.style.width=v+'%';b.appendChild(i);s.appendChild(b);
    if(detalhe)s.appendChild(el('div','det',detalhe));
  }
  function kpi(g,rotulo,valor){var k=el('div','kpi');k.appendChild(el('b','',String(valor)));k.appendChild(el('span','det',rotulo));g.appendChild(k)}
  var ESTADO_WA={desconhecido:'Ainda nao liguei o listener.',conectado:'Conectado.',deslogado:'O WhatsApp desconectou este aparelho. Precisa de um QR novo.',reconectar:'Reconectando...',erro:'Erro na conexao.'};
  function whatsapp(s,d){
    var w=d.whatsapp;
    s.appendChild(el('p','',(w.qrSvg&&w.estado!=='conectado'?'Aguardando a leitura do QR Code.':(ESTADO_WA[w.estado]||w.estado))+(w.dono?' Conta terminada em '+w.dono+'.':'')));
    if(w.motivo)s.appendChild(el('div','det','Motivo: '+w.motivo));
    if(w.qrSvg){
      var im=document.createElement('img');im.className='qr';im.alt='QR Code para conectar o WhatsApp';
      im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(w.qrSvg);s.appendChild(im);
      s.appendChild(el('div','aviso','No celular: WhatsApp > Configuracoes > Aparelhos conectados > Conectar um aparelho. Aponte a camera para este desenho. O QR e como uma senha: nao compartilhe esta tela. Ele renova sozinho a cada poucos segundos.'));
    }else if(w.estado==='conectado'){
      s.appendChild(el('div','aviso','Tudo certo. E normal o WhatsApp reconectar uma vez logo depois de ler o QR. O Heimdall so escuta; nunca envia a ninguem alem de voce.'));
    }else{
      s.appendChild(el('div','aviso','Para gerar o QR, ligue o listener (janela do PowerShell): node apps/listener/src/iniciar.ts. O desenho aparece aqui em instantes.'));
    }
    if(w.aviso)s.appendChild(el('div','det','Aviso: '+w.aviso.motivo));
  }
  function sincronizar(s,d){
    var w=d.whatsapp,h=w.historico,c=w.contagem;
    if(w.estado!=='conectado'){s.appendChild(el('div','aviso','Conecte o WhatsApp primeiro (passo anterior).'));return}
    barra(s,h&&h.ultima?'Historico recebido por inteiro':'Recebendo o historico do telefone',h&&h.ultima?100:(h&&h.progresso!=null?h.progresso:0),h?(h.ultima?'Concluido.':'Deixe o celular ligado e com internet.'):'Aguardando o WhatsApp mandar o historico. Isso pode levar alguns minutos.');
    var g=el('div','kpis');kpi(g,'conversas',d.acervo.conversas);kpi(g,'mensagens guardadas',d.acervo.mensagens);if(c){kpi(g,'repetidas ignoradas',c.duplicadas);kpi(g,'editadas / apagadas',c.editadas+' / '+c.apagadas)}s.appendChild(g);
    s.appendChild(el('div','det','O WhatsApp so entrega o que o telefone tem disponivel; o que nao vier, nao da para recuperar.'));
  }
  function extrair(s,d){
    var f=d.fila.porTipo,b=f.baixar_midia||{},ok=b.ok||0,tot=ok+(b.pendente||0)+(b.em_andamento||0)+(b.erro||0)+(b.abandonada||0);
    var g=el('div','kpis');kpi(g,'mensagens',d.acervo.mensagens);kpi(g,'audios',d.acervo.audios);kpi(g,'PDFs',d.acervo.pdfs);kpi(g,'downloads com falha definitiva',b.abandonada||0);s.appendChild(g);
    barra(s,'Baixando audios e PDFs originais',tot?ok*100/tot:(d.acervo.mensagens?100:0),ok+' de '+tot+' arquivos');
    s.appendChild(el('div','det','Arquivos expirados no WhatsApp nao podem mais ser baixados; o Heimdall tenta uma vez pedir de novo ao celular.'));
  }
  function selfchat(s,d){
    var T={nao_feito:'Ainda nao testei.',aguardando_envio:'Mensagem de teste na fila; sai quando o listener estiver conectado.',aguardando_resposta:'Enviei. Agora responda a mensagem no seu WhatsApp (conversa com voce mesmo) com qualquer texto.',ok:'Ida e volta funcionando.',falhou:'Nao consegui enviar. Confira o listener.'};
    s.appendChild(el('p','',T[d.selfchat.teste]));
    var b=el('button','acao','Enviar mensagem de teste');b.type='button';
    b.addEventListener('click',function(){b.disabled=true;api('POST','/api/selfchat/testar',{}).then(function(r){msgSelf=r.pedido?'Pedido feito.':'Ja ha um teste em andamento.';return atualizarPainel()}).catch(function(e){msgSelf=e.message}).then(function(){b.disabled=false})});
    s.appendChild(b);if(msgSelf)s.appendChild(el('div','det',msgSelf));
    s.appendChild(el('div','aviso','Depois do primeiro relatorio, voce corrige pelo codigo do item no proprio WhatsApp, por exemplo: A1 ja resolvi.'));
  }
  function agenda(s,d){
    var u=el('ul');['Semanal: segunda-feira as 08:00','Diario: terca a sexta as 08:00','Fuso: America/Sao_Paulo (se o computador estiver desligado, sai quando ligar, ate as 20:00)'].forEach(function(t){u.appendChild(el('li','',t))});s.appendChild(u);
    var b=el('button','acao','Gerar relatorio de teste agora');b.type='button';
    b.addEventListener('click',function(){b.disabled=true;api('POST','/api/agenda/testar',{}).then(function(r){resTeste=r.relatorios;return carregar()}).catch(function(e){resTeste=null;alert(e.message)}).then(function(){b.disabled=false})});
    s.appendChild(b);
    if(resTeste){resTeste.forEach(function(r){s.appendChild(el('div','det',(r.tipo==='diario'?'Diario':'Semanal')+' de teste: '+r.palavras+' palavras - '+(r.cabe?'cabe em uma tela':'passou do tamanho de uma tela')))});s.appendChild(el('div','det','Os dois foram para a caixa de saida e chegam no seu WhatsApp (conversa com voce mesmo).'))}
  }
  function pronto(s,d){
    var g=el('div','kpis');
    kpi(g,'WhatsApp',d.whatsapp.estado);kpi(g,'mensagens no acervo',d.acervo.mensagens);kpi(g,'trabalhos na fila',(d.fila.total.pendente||0)+(d.fila.total.em_andamento||0));kpi(g,'abandonados',d.fila.total.abandonada||0);
    kpi(g,'conversas enviadas a memoria',d.memoria.documentosEnviados);kpi(g,'mensagens esperando entrega',d.saida.pendente||0);kpi(g,'ultimo relatorio',d.relatorios.ultimo?d.relatorios.ultimo.chave.replace('relatorio:',''):'nenhum');
    ['hindsight','hermes'].forEach(function(n){var sv=d.servicos[n];kpi(g,'servico '+n,sv?(sv.ok?'respondendo':'sem resposta ha '+sv.ha+'s'):'sem dados')});
    s.appendChild(g);
    s.appendChild(el('div','det','Daqui em diante e automatico. Esta pagina so mostra o estado.'));
  }
  var msgBackup='';
  function backup(s,d){
    var b=d.backup;
    s.appendChild(el('p','',b.destino?('Destino atual: '+b.destino):'Escolha onde guardar o backup: um HD externo, um segundo disco ou um pen drive (nao a mesma pasta do projeto).'));
    var ent=el('input','txt');ent.type='text';ent.placeholder='Exemplo: E:\\Backup-Heimdall (a pasta precisa existir)';ent.setAttribute('aria-label','Pasta do backup');if(b.destino)ent.value=b.destino;s.appendChild(ent);
    var linha=el('div');linha.style.marginTop='10px';
    var ok=el('button','acao','Salvar destino');ok.type='button';
    ok.addEventListener('click',function(){ok.disabled=true;api('POST','/api/backup/destino',{pasta:ent.value}).then(function(){msgBackup='Destino salvo.';return atualizarPainel()}).catch(function(e){msgBackup='Nao salvei: '+e.message;tudo()}).then(function(){ok.disabled=false})});
    var ag=el('button','sec','Fazer backup agora');ag.type='button';ag.style.marginLeft='8px';
    ag.addEventListener('click',function(){ag.disabled=true;api('POST','/api/backup/agora',{}).then(function(r){msgBackup=r.resultado==='feito'?'Backup feito.':r.resultado==='em_dia'?'O backup de hoje ja foi feito.':'Nao consegui: '+(r.erro||'erro');return atualizarPainel()}).catch(function(e){msgBackup=e.message;tudo()}).then(function(){ag.disabled=false})});
    linha.appendChild(ok);linha.appendChild(ag);s.appendChild(linha);
    if(msgBackup)s.appendChild(el('div','det',msgBackup));
    s.appendChild(el('div','det',b.ultimoEm?('Ultimo backup: '+new Date(b.ultimoEm).toLocaleString('pt-BR')+(b.erro?' - ATENCAO: '+b.erro:'')):(b.erro?'Erro: '+b.erro:'Ainda nao ha backup.')));
    s.appendChild(el('div','aviso','O backup e feito sozinho no primeiro uso de cada dia (uma copia do acervo com a data no nome). Para apagar dados de um cliente: voce pede no WhatsApp e confirma com um codigo de seis letras (duas etapas).'));
  }
  var RENDER={backup:backup,whatsapp:whatsapp,sincronizar:sincronizar,extrair:extrair,selfchat:selfchat,agenda:agenda,pronto:pronto};
  function atualizarPainel(){return api('GET','/api/painel').then(function(r){pn=r;return api('GET','/api/estado')}).then(function(r){passos=r.passos;tudo()}).catch(function(){})}
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
  setInterval(function(){var p=passos[atual];if(p&&p.pronto&&p.id!=='ambiente'&&p.id!=='cadastro'&&p.id!=='backup'&&!document.hidden){atualizarPainel()}},3000);
  carregar().then(atualizarPainel).then(function(){return api('POST','/api/ambiente/testar',{})}).then(function(r){verifs=r.verificacoes;perfilAtual=r.perfil||null;return carregar()}).catch(function(){});
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
  <div class="chips"><span class="chip">só nesta máquina · 127.0.0.1</span><span class="chip" id="bugs">relatórios de bug abertos: 0</span></div>
</header>
<div class="ponte"></div>
<main>
  <nav id="passos" aria-label="Passos da configuração"></nav>
  <section id="painel" aria-live="polite"></section>
</main>
<script src="/app.js"></script>
</body>
</html>`;
