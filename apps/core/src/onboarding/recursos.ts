// Arquivos estaticos da tela (CSS e JS). Sem fontes nem scripts de fora: a tela funciona sem internet.
// O JS usa so textContent (nunca innerHTML) e concatenacao de texto (sem template literals aqui dentro).
export const CSS = `
:root{--bg:#0F172A;--card:#1B2336;--muted:#272F42;--mfg:#94A3B8;--fg:#F8FAFC;--gold:#D4A84B;--ok:#22C55E;--warn:#FBBF24;--bad:#EF4444;--line:rgba(148,163,184,.28);--serif:"Cormorant Garamond",Cormorant,Georgia,"Times New Roman",serif;--sans:"Fira Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--mono:"Fira Code",ui-monospace,"Cascadia Mono",Consolas,monospace}
*{box-sizing:border-box}
html{color-scheme:dark}
body{margin:0;min-height:100vh;background:radial-gradient(1px 1px at 8% 12%,rgba(248,250,252,.8),transparent),radial-gradient(1px 1px at 22% 6%,rgba(248,250,252,.55),transparent),radial-gradient(1.5px 1.5px at 41% 14%,rgba(248,250,252,.7),transparent),radial-gradient(1px 1px at 63% 9%,rgba(248,250,252,.6),transparent),radial-gradient(1px 1px at 78% 18%,rgba(248,250,252,.8),transparent),radial-gradient(1.5px 1.5px at 91% 7%,rgba(248,250,252,.6),transparent),radial-gradient(900px 380px at 78% -8%,rgba(96,165,250,.16),transparent 62%),radial-gradient(700px 340px at 0% 100%,rgba(167,139,250,.10),transparent 60%),var(--bg);background-attachment:fixed;color:var(--fg);font:16px/1.55 var(--sans)}
h1,h2,.marca,.nav-titulo{font-family:var(--serif);font-weight:600}
header{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;padding:24px 32px 16px}
.marca{font-size:40px;letter-spacing:.18em;line-height:1}
.sub{color:var(--mfg);font-size:14px}
.ponte{height:3px;margin:0 32px;border-radius:3px;background:linear-gradient(90deg,#2DD4BF,#60A5FA,#A78BFA,#F472B6,#FBBF24);opacity:.9}
.fontes{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:10px;padding:16px 32px 0}
.fonte{display:flex;gap:10px;align-items:flex-start;background:rgba(27,35,54,.62);border:1px solid var(--line);border-radius:14px;padding:10px 12px;min-width:0;backdrop-filter:blur(12px)}
.fonte .sigla{flex:0 0 36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--muted);border:1px solid var(--line);color:#C9B27A;font:700 10px var(--mono);letter-spacing:.05em}
.fonte .nome{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--mfg)}
.fonte .nome .dot{width:8px;height:8px;flex:0 0 8px;margin:0}
.fonte .valor{font-size:13px;line-height:1.35;overflow-wrap:anywhere}
.fonte .valor b{display:block;font:11.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--mfg)}
.fonte[data-estado=verde]{border-color:rgba(34,197,94,.45)}.fonte[data-estado=verde] .valor b{color:var(--ok)}
.fonte[data-estado=vermelho]{border-color:rgba(239,68,68,.45)}.fonte[data-estado=vermelho] .valor b{color:var(--bad)}
.fonte[data-estado=processando]{border-color:rgba(251,191,36,.45)}.fonte[data-estado=processando] .valor b{color:var(--warn)}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.chip{border:1px solid var(--line);border-radius:999px;padding:5px 12px;font:12.5px var(--mono);color:var(--mfg);background:rgba(15,23,42,.35)}
main{display:flex;flex-wrap:wrap;gap:22px;padding:20px 32px 40px;align-items:flex-start}
nav{flex:1 1 300px;max-width:380px;background:rgba(27,35,54,.72);border:1px solid rgba(148,163,184,.22);border-radius:20px;padding:20px 18px;backdrop-filter:blur(14px)}
section{flex:999 1 560px;min-width:0;background:rgba(27,35,54,.72);border:1px solid rgba(148,163,184,.22);border-radius:20px;padding:28px 32px 26px;backdrop-filter:blur(14px)}
.nav-titulo{font-size:24px;margin:0 0 4px 6px}
.resumo-ponte{color:var(--mfg);font:12.5px var(--mono);margin:0 6px 12px}
.resumo-ponte .barra{height:6px;margin:6px 0 0}
.legenda{display:flex;flex-wrap:wrap;gap:10px;margin:0 6px 10px;color:var(--mfg);font-size:12px}
.legenda-item{display:inline-flex;align-items:center;gap:5px}
.legenda-item .dot{width:8px;height:8px;flex:0 0 8px;margin:0}
.dica-nav{color:var(--mfg);font-size:12px;margin:0 6px 10px;line-height:1.4}
nav button.passo{display:flex;gap:10px;width:100%;text-align:left;background:transparent;border:1px solid transparent;border-radius:12px;color:var(--fg);padding:9px 10px;min-height:44px;cursor:pointer;font:inherit}
nav button.passo:hover{background:rgba(148,163,184,.08)}
nav button.passo[aria-current=step]{background:rgba(212,168,75,.14);border-color:rgba(212,168,75,.55)}
.no{flex:0 0 28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--muted);color:var(--mfg);font:12px var(--mono);border:1px solid var(--line)}
.no.verde{background:var(--ok);color:#0F172A}.no.vermelho{background:var(--bad);color:#0F172A}.no.processando{background:var(--warn);color:#0F172A}
.mito{display:block;font-family:var(--serif);font-size:14.5px;color:#C9B27A}
.rotulo-passo{font:13px var(--mono);color:#C9B27A;letter-spacing:.08em}
h1{margin:2px 0 2px;font-size:42px;line-height:1.1;text-wrap:balance}
.lead{color:#CBD5E1;max-width:70ch;font-size:16.5px}
.grade{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0}
.verif{display:flex;gap:10px;background:var(--muted);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.dot{flex:0 0 12px;height:12px;border-radius:50%;margin-top:6px}
.dot.ok{background:var(--ok)}.dot.atencao{background:var(--warn)}.dot.falha{background:var(--bad)}.dot.neutro{background:var(--mfg)}
.det{color:var(--mfg);font-size:13.5px}
button.acao{min-height:44px;border:0;border-radius:12px;padding:0 20px;font:600 16px var(--sans);background:linear-gradient(180deg,#E0B85C,#D4A84B);color:#0F172A;cursor:pointer}
button.acao:hover{filter:brightness(1.06)}
button.sec{min-height:44px;border:1px solid rgba(148,163,184,.5);border-radius:12px;padding:0 18px;background:transparent;color:var(--fg);font:inherit;cursor:pointer}
button.sec:hover{background:rgba(148,163,184,.08)}
button:focus-visible,textarea:focus-visible,input:focus-visible{outline:2px solid var(--warn);outline-offset:2px}
input.txt{width:100%;max-width:520px;min-height:44px;background:var(--bg);color:var(--fg);border:1px solid rgba(148,163,184,.4);border-radius:12px;padding:0 12px;font:inherit}
textarea{width:100%;min-height:90px;background:var(--bg);color:var(--fg);border:1px solid rgba(148,163,184,.4);border-radius:12px;padding:10px;font:inherit}
.aviso{background:var(--muted);border:1px solid rgba(251,191,36,.35);border-radius:14px;padding:12px 16px;margin:16px 0;max-width:70ch}
.estado{display:inline-block;border-radius:999px;padding:4px 12px;font-size:14px;font-weight:600;border:1px solid var(--warn);color:var(--warn)}
.estado.verde{border-color:var(--ok);color:var(--ok)}.estado.vermelho{border-color:var(--bad);color:var(--bad)}.estado.processando{border-color:var(--warn);color:var(--warn)}.estado.neutro{border-color:var(--line);color:var(--mfg)}
.bom,.verde{color:var(--ok)}.ruim,.vermelho{color:var(--bad)}
.barra{height:14px;border-radius:999px;background:var(--muted);border:1px solid var(--line);overflow:hidden;margin:6px 0 2px}
.barra.mini{height:6px;margin:4px 0 2px}
.barra>i{display:block;height:100%;background:linear-gradient(90deg,#2DD4BF,#60A5FA,#A78BFA,#F472B6,#FBBF24);width:0}
.qr{background:#fff;border-radius:16px;padding:10px;width:280px;height:280px;display:block;margin:12px 0}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:14px 0}
.kpi{background:var(--muted);border:1px solid var(--line);border-radius:14px;padding:12px 14px}.kpi b{display:block;font:600 27px var(--mono)}
.campo{margin:10px 0}
.campo label{display:block;font-size:13.5px;color:var(--mfg);margin-bottom:4px}
.item-lista{background:var(--muted);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:8px 0}
.item-lista b{display:inline-block;margin-right:8px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
@media (max-width:700px){header{padding:18px 16px 12px}.marca{font-size:34px}.ponte{margin:0 16px}main{padding:16px 16px 28px}section{padding:22px 20px}h1{font-size:34px}.fontes{padding:12px 16px 0;grid-template-columns:1fr 1fr}.fonte .sigla{display:none}}
`;

export const JS = `
(function(){
  var passos=[],atual=0,verifs=[],perfilAtual=null,pn=null,resTeste=null,msgSelf='',timerModelo=null,atualizarSincronizar=null,fontes=null;
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
  function api(m,u,corpo){
    var o={method:m,headers:{'X-Heimdall':'1'},credentials:'same-origin'};
    if(corpo!==undefined){o.headers['Content-Type']='application/json';o.body=JSON.stringify(corpo)}
    return fetch(u,o).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.erro||'erro');return j})});
  }
  function pintarFontes(f){
    var box=document.getElementById('fontes');if(!box)return;box.textContent='';
    if(!f)return;
    var defs=[['whatsapp','WA','WhatsApp'],['modelo','IA','Modelo (ChatGPT)'],['memoria','HS','Memória (Hindsight)'],['midia','MID','Mídia (Whisper/PDF)'],['crm','CRM','CRM (Krayin)']];
    var rot={verde:'ok',vermelho:'atencao',processando:'em andamento',pendente:'aguardando'};
    var ponto={verde:'ok',vermelho:'falha',processando:'atencao',pendente:'neutro'};
    defs.forEach(function(d){
      var x=f[d[0]];if(!x)return;
      var c=el('div','fonte');c.setAttribute('data-estado',x.estado);
      c.appendChild(el('span','sigla',d[1]));
      var t=el('div');t.style.minWidth='0';
      var nome=el('div','nome');nome.appendChild(el('span','dot '+(ponto[x.estado]||'neutro')));nome.appendChild(document.createTextNode(d[2]));t.appendChild(nome);
      var valor=el('div','valor');valor.appendChild(el('b','',rot[x.estado]||x.estado));valor.appendChild(document.createTextNode(x.detalhe));t.appendChild(valor);
      c.appendChild(t);box.appendChild(c);
    });
  }
  function lateral(){
    var nav=document.getElementById('passos');nav.textContent='';
    nav.appendChild(el('div','nav-titulo','A Ponte'));
    var prontos=passos.filter(function(p){return p.estado==='verde'}).length;
    var resumo=el('div','resumo-ponte',prontos+' de '+passos.length+' passos prontos');
    var barra=el('div','barra mini');barra.setAttribute('role','progressbar');barra.setAttribute('aria-label','Progresso da configuracao');barra.setAttribute('aria-valuemin','0');barra.setAttribute('aria-valuemax',String(passos.length));barra.setAttribute('aria-valuenow',String(prontos));
    var bi=document.createElement('i');bi.style.width=(passos.length?Math.round(prontos*100/passos.length):0)+'%';barra.appendChild(bi);resumo.appendChild(barra);nav.appendChild(resumo);
    var legenda=el('div','legenda');
    [['verde','pronto'],['processando','em andamento'],['vermelho','atenção']].forEach(function(x){var l=el('span','legenda-item');l.appendChild(el('span','dot '+x[0]));l.appendChild(document.createTextNode(x[1]));legenda.appendChild(l)});
    nav.appendChild(legenda);
    nav.appendChild(el('div','dica-nav','Clique em um passo para ver o que fazer.'));
    passos.forEach(function(p,i){
      var b=el('button','passo');b.type='button';if(i===atual)b.setAttribute('aria-current','step');
      var icone=p.estado==='verde'?'\\u2713':(p.estado==='processando'?'\\u2026':String(i+1));
      b.appendChild(el('span','no '+p.estado,icone));
      var d=el('span');d.style.flex='1';d.style.minWidth='0';
      d.appendChild(el('span','',p.titulo));
      d.appendChild(el('span','mito',p.mito));
      if(p.detalhe||p.percentual!=null){
        var info=el('div','det');info.style.fontSize='12px';
        info.textContent=p.detalhe||(p.percentual!=null?(p.percentual+'%'):'');
        d.appendChild(info);
      }
      if(p.percentual!=null){
        var mini=el('div','barra mini');var mi=document.createElement('i');
        mi.style.width=Math.max(0,Math.min(100,Math.round(p.percentual)))+'%';
        mini.appendChild(mi);d.appendChild(mini);
      }
      b.appendChild(d);
      b.addEventListener('click',function(){atual=i;tudo()});nav.appendChild(b);
    });
  }
  function painel(){
    if(timerModelo){clearInterval(timerModelo);timerModelo=null}
    atualizarSincronizar=null;
    var p=passos[atual],s=document.getElementById('painel');s.textContent='';
    s.appendChild(el('div','rotulo-passo','PASSO '+(atual+1)+' DE '+passos.length));
    s.appendChild(el('h1','',p.titulo));s.appendChild(el('div','mito',p.mito));
    var rotEstado=p.id==='pronto'?'Painel de status':(p.estado==='verde'?'Verde \\u00b7 pronto':(p.estado==='processando'?'Amarelo \\u00b7 processando':(p.estado==='vermelho'?'Vermelho \\u00b7 precisa de atenção':'Aguardando')));
    var st=el('span','estado '+(p.id==='pronto'?'neutro':p.estado),rotEstado);
    s.appendChild(st);s.appendChild(el('p','lead',p.explicacao));
    if(p.id==='ambiente'){ambiente(s)}
    else if(p.pronto&&pn){var f=RENDER[p.id];if(f)f(s,pn)}
    else if(p.pronto){s.appendChild(el('div','aviso','Carregando os dados...'))}
    else{var a=el('div','aviso','Este passo será ativado em uma versão futura.');s.appendChild(a)}
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
    var rot={ok:'adequado',apertado:'apertado',nao_recomendado:'não recomendado'};
    var c=el('div','aviso');
    c.appendChild(el('div','','Perfil recomendado: '+p.nome+' \\u00b7 '+(rot[p.adequacao]||p.adequacao)));
    c.appendChild(el('div','det',p.resumo));
    var ul=el('ul');p.itens.forEach(function(i){ul.appendChild(el('li','',i.rotulo+': '+i.valor+' ['+i.origem+']'))});c.appendChild(ul);
    p.avisos.forEach(function(a){c.appendChild(el('div','det','Atenção: '+a))});
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
  function cadastro(s,d){
    s.appendChild(el('p','','Cadastre os membros da equipe interna (nao clientes): nome, funcao e telefone. Voce digita do jeito de sempre; o Heimdall entende o formato e procura a pessoa entre os contatos que ja vieram do WhatsApp.'));
    var g=el('div');g.style.maxWidth='520px';
    var cNome=el('div','campo');
    var lNome=el('label','','Nome:');lNome.htmlFor='membro-nome';cNome.appendChild(lNome);
    var inNome=el('input','txt');inNome.id='membro-nome';inNome.type='text';inNome.autocomplete='name';inNome.setAttribute('aria-label','Nome do membro');inNome.placeholder='Exemplo: Maria Souza';cNome.appendChild(inNome);g.appendChild(cNome);
    var cFuncao=el('div','campo');
    var lFuncao=el('label','','Funcao:');lFuncao.htmlFor='membro-funcao';cFuncao.appendChild(lFuncao);
    var inFuncao=el('input','txt');inFuncao.id='membro-funcao';inFuncao.type='text';inFuncao.setAttribute('aria-label','Funcao do membro');inFuncao.placeholder='Exemplo: SDR ou Vendas';cFuncao.appendChild(inFuncao);g.appendChild(cFuncao);
    var cTel=el('div','campo');
    var lTel=el('label','','Telefone com DDD:');lTel.htmlFor='membro-telefone';cTel.appendChild(lTel);
    var inTel=el('input','txt');inTel.id='membro-telefone';inTel.type='tel';inTel.inputMode='tel';inTel.autocomplete='tel';inTel.setAttribute('aria-label','Telefone com DDD');inTel.placeholder='Exemplo: (11) 99999-0000';cTel.appendChild(inTel);g.appendChild(cTel);

    var resEnt=el('div','det');resEnt.style.margin='6px 0';resEnt.setAttribute('role','status');resEnt.setAttribute('aria-live','polite');
    var bEnt=el('button','sec','Entender o numero');bEnt.type='button';
    bEnt.addEventListener('click',function(){
      if(!inTel.value.trim()){resEnt.textContent='Digite um telefone primeiro.';return}
      bEnt.disabled=true;
      api('POST','/api/cadastro/entender',{telefone:inTel.value}).then(function(r){
        resEnt.textContent='Entendido como: '+(r.exibir?r.exibir.join(' e '):'formato valido');
      }).catch(function(e){resEnt.textContent='Erro no numero: '+e.message}).then(function(){bEnt.disabled=false});
    });

    var bSalvar=el('button','acao','Salvar membro');bSalvar.type='button';bSalvar.style.marginLeft='8px';
    var avisoMembro=el('div');avisoMembro.setAttribute('role','status');avisoMembro.setAttribute('aria-live','polite');
    bSalvar.addEventListener('click',function(){
      if(!inNome.value.trim()||!inTel.value.trim()){avisoMembro.textContent='Preencha nome e telefone.';return}
      bSalvar.disabled=true;
      api('POST','/api/cadastro/membro',{nome:inNome.value,funcao:inFuncao.value,telefone:inTel.value}).then(function(r){
        avisoMembro.textContent='';
        if(r.aviso){var av=el('div','aviso','Aviso: '+r.aviso);avisoMembro.appendChild(av)}
        inNome.value='';inFuncao.value='';inTel.value='';resEnt.textContent='';
        carregarEquipe();
        return atualizarMenu();
      }).catch(function(e){avisoMembro.textContent='Nao consegui salvar: '+e.message}).then(function(){bSalvar.disabled=false});
    });

    var botoes=el('div');botoes.style.marginTop='10px';botoes.appendChild(bEnt);botoes.appendChild(bSalvar);
    g.appendChild(resEnt);g.appendChild(botoes);g.appendChild(avisoMembro);s.appendChild(g);

    var titEquipe=el('h2','','Equipe cadastrada');titEquipe.style.marginTop='24px';s.appendChild(titEquipe);
    var divLista=el('div');s.appendChild(divLista);
    function carregarEquipe(){
      divLista.textContent='Carregando equipe...';
      api('GET','/api/cadastro').then(function(r){
        divLista.textContent='';
        if(!r.equipe||!r.equipe.length){divLista.appendChild(el('div','det','Nenhum membro da equipe cadastrado ainda.'));return}
        r.equipe.forEach(function(m){
          var item=el('div','item-lista');
          item.appendChild(el('b','',m.nome));
          if(m.funcao)item.appendChild(el('span','det','('+m.funcao+') '));
          item.appendChild(el('span','det',m.telefone));
          if(!m.achou)item.appendChild(el('span','det',' \\u00b7 [numero ainda nao visto no WhatsApp]'));
          divLista.appendChild(item);
        });
      }).catch(function(e){divLista.textContent='Erro ao carregar equipe: '+e.message});
    }
    carregarEquipe();
  }
  function sincronizar(s,d){
    var topo=el('div');s.appendChild(topo);
    function pintarTopo(p){
      topo.textContent='';
      var w=p.whatsapp,h=w.historico,c=w.contagem;
      if(w.estado!=='conectado')topo.appendChild(el('div','aviso','Conecte o WhatsApp primeiro (passo anterior).'));
      barra(topo,h&&h.ultima?'Historico recebido por inteiro':'Recebendo o historico do telefone',h&&h.ultima?100:(h&&h.progresso!=null?h.progresso:0),h?(h.ultima?'Concluido.':'Deixe o celular ligado e com internet.'):'Aguardando o WhatsApp mandar o historico. Isso pode levar alguns minutos.');
      var g=el('div','kpis');
      kpi(g,'conversas',p.acervo.conversas);
      kpi(g,'mensagens guardadas',p.acervo.mensagens);
      if(c){kpi(g,'repetidas ignoradas',c.duplicadas);kpi(g,'editadas / apagadas',c.editadas+' / '+c.apagadas)}
      topo.appendChild(g);
      topo.appendChild(el('div','det','O WhatsApp so entrega o que o telefone tem disponivel; o que nao vier, nao da para recuperar.'));
    }
    pintarTopo(d);
    // O relogio da tela atualiza o topo E o cartao da busca antiga (o dono precisa ver o trabalho andando).
    // O campo de intervalo nao e apagado: a marca ritmoEditado protege o que foi digitado.
    atualizarSincronizar=function(){
      return Promise.all([api('GET','/api/painel'),api('GET','/api/historico-antigo')]).then(function(rs){
        pn=rs[0];pintarTopo(rs[0]);pintarAntigo(rs[1]);return atualizarMenu();
      }).catch(function(){});
    };

    var cartao=el('div','aviso');cartao.style.marginTop='20px';
    cartao.appendChild(el('h2','','Buscar mensagens antigas conversa por conversa'));
    cartao.appendChild(el('p','det','O WhatsApp entrega cerca de 3 meses ao conectar. Para conversas mais antigas, o Heimdall pode pedir mensagens aos poucos direto ao seu proprio celular. Este pedido vai SO ao seu telefone (mensagem peer). O risco de o WhatsApp limitar a conta por excesso de pedidos NAO foi medido.'));
    var infoAntigo=el('div');infoAntigo.setAttribute('aria-live','polite');cartao.appendChild(infoAntigo);

    var cRitmo=el('div','campo');
    var lRitmo=el('label','','Intervalo entre pedidos (segundos, minimo 15; sugerido 60):');lRitmo.htmlFor='ritmo-antigo';cRitmo.appendChild(lRitmo);
    var inRitmo=el('input','txt');inRitmo.id='ritmo-antigo';inRitmo.type='number';inRitmo.min='15';inRitmo.max='3600';inRitmo.value='60';inRitmo.setAttribute('aria-label','Intervalo entre pedidos em segundos');
    cRitmo.appendChild(inRitmo);cartao.appendChild(cRitmo);
    var ritmoEditado=false;
    inRitmo.addEventListener('input',function(){ritmoEditado=true});

    var bts=el('div');bts.style.marginTop='10px';
    var bLibAnt=el('button','acao','Liberar busca antiga');bLibAnt.type='button';
    var bPausarAnt=el('button','sec','Pausar busca antiga');bPausarAnt.type='button';bPausarAnt.style.marginLeft='8px';
    bts.appendChild(bLibAnt);bts.appendChild(bPausarAnt);cartao.appendChild(bts);

    function pintarAntigo(r){
      infoAntigo.textContent='';
      var cfg=r.config||{},res=r.resumo||{};
      if(cfg.ritmoSegundos&&!ritmoEditado)inRitmo.value=String(cfg.ritmoSegundos);
      var st=el('div','det');
      st.textContent=cfg.liberado?('Trava: BUSCA ABERTA - o Heimdall pede ao seu proprio celular de '+cfg.ritmoSegundos+' em '+cfg.ritmoSegundos+' segundos.'):'Trava: BUSCA PAUSADA - nenhum pedido ao telefone ate voce liberar.';
      st.style.fontWeight='600';st.style.marginBottom='8px';
      infoAntigo.appendChild(st);
      var total=res.conversas||0,feitas=(res.concluidas||0)+(res.esgotadas||0);
      barra(infoAntigo,'Conversas ja atendidas',total?feitas*100/total:0,feitas+' de '+total+' conversas ('+(res.pendentes||0)+' ainda nao pedidas, '+(res.emAndamento||0)+' em andamento)');
      var kg=el('div','kpis');
      kpi(kg,'conversas no total',total);
      kpi(kg,'conversas pendentes',res.pendentes||0);
      kpi(kg,'conversas em andamento',res.emAndamento||0);
      kpi(kg,'conversas concluidas',res.concluidas||0);
      kpi(kg,'atingiram o limite',res.esgotadas||0);
      kpi(kg,'mensagens novas trazidas',res.novas||0);
      kpi(kg,'pedidos ja feitos',res.pedidos||0);
      infoAntigo.appendChild(kg);
      var faltam=(res.pendentes||0)+(res.emAndamento||0);
      if(!cfg.liberado)infoAntigo.appendChild(el('div','det','A busca esta pausada: nenhum pedido sai ate voce liberar. O que ja chegou continua guardado.'));
      else if(faltam===0)infoAntigo.appendChild(el('div','det','Nao ha conversa nova para pedir agora; o Heimdall segue esperando mensagem nova chegar.'));
      else {
        var minutos=Math.round(faltam*((cfg.ritmoSegundos||60)+(cfg.esperaRespostaSegundos||45))/60);
        infoAntigo.appendChild(el('div','det','Estimativa so de tempo: cerca de '+(minutos>=90?Math.round(minutos/60)+' horas':minutos+' minutos')+' para as '+faltam+' conversas que faltam, no ritmo escolhido (depende do tamanho de cada conversa e do ritmo do WhatsApp).'));
      }
      bLibAnt.textContent=cfg.liberado?'Busca liberada (em andamento)':'Liberar busca antiga';
      bLibAnt.disabled=!!cfg.liberado;
      bPausarAnt.disabled=!cfg.liberado;
    }
    function carregarAntigo(){
      infoAntigo.textContent='Carregando estado da busca antiga...';
      api('GET','/api/historico-antigo').then(pintarAntigo).catch(function(e){infoAntigo.textContent='Erro ao carregar busca antiga: '+e.message});
    }

    bLibAnt.addEventListener('click',function(){
      var seg=parseInt(inRitmo.value,10);
      if(!seg||seg<15||seg>3600){alert('O intervalo precisa ficar entre 15 e 3600 segundos.');return}
      if(!window.confirm('O pedido de historico antigo vai direto ao seu proprio celular. O risco de o WhatsApp limitar a conta NAO foi medido. Deseja mesmo liberar?'))return;
      bLibAnt.disabled=true;
      api('POST','/api/historico-antigo/liberar',{liberar:true,confirmar:true,ritmoSegundos:seg}).then(function(){
        return atualizarPainel();
      }).catch(function(e){alert(e.message)}).then(function(){carregarAntigo()});
    });

    bPausarAnt.addEventListener('click',function(){
      bPausarAnt.disabled=true;
      api('POST','/api/historico-antigo/liberar',{liberar:false}).then(function(){
        return atualizarPainel();
      }).catch(function(e){alert(e.message)}).then(function(){carregarAntigo()});
    });

    carregarAntigo();
    s.appendChild(cartao);
  }
  function extrair(s,d){
    var f=d.fila.porTipo,b=f.baixar_midia||{},ok=b.ok||0,tot=ok+(b.pendente||0)+(b.em_andamento||0)+(b.erro||0)+(b.abandonada||0);
    var g=el('div','kpis');kpi(g,'mensagens',d.acervo.mensagens);kpi(g,'audios',d.acervo.audios);kpi(g,'PDFs',d.acervo.pdfs);kpi(g,'downloads com falha definitiva',b.abandonada||0);s.appendChild(g);
    barra(s,'Baixando audios e PDFs originais',tot?ok*100/tot:(d.acervo.mensagens?100:0),ok+' de '+tot+' arquivos');
    s.appendChild(el('div','det','Arquivos expirados no WhatsApp nao podem mais ser baixados; o Heimdall tenta uma vez pedir de novo ao celular.'));
  }
  function modelo(s,d){
    s.appendChild(el('p','','O login do modelo e feito exclusivamente por voce no terminal. A tela nunca ve, recebe nem guarda token, senha ou chave.'));
    var boxInst=el('div','aviso');
    boxInst.appendChild(el('div','','Instrucoes de conexao do modelo:'));
    var ul=el('ul');ul.appendChild(el('li','det','Carregando instrucoes...'));boxInst.appendChild(ul);
    var resTeste=el('div','aviso');resTeste.style.marginTop='14px';resTeste.setAttribute('role','status');resTeste.setAttribute('aria-live','polite');
    var bTestar=el('button','acao','Fazer chamada de teste');bTestar.type='button';

    function mostrarTeste(t){
      resTeste.textContent='';
      if(!t||t.estado==='nenhum'){
        resTeste.appendChild(el('div','','Ainda nao ha chamada de teste realizada.'));
      }else if(t.estado==='pedido'){
        resTeste.appendChild(el('div','','Chamada de teste em andamento... aguardando resposta do Hermes (verificando a cada 2 segundos).'));
      }else if(t.estado==='ok'){
        resTeste.appendChild(el('div','verde','Chamada de teste com sucesso! Respondeu em '+t.ms+' ms.'));
      }else if(t.estado==='falhou'){
        resTeste.appendChild(el('div','vermelho','A chamada de teste falhou: '+(t.motivo||'erro')));
      }
    }

    function sondarTeste(){
      if(timerModelo)clearInterval(timerModelo);
      timerModelo=setInterval(function(){
        api('GET','/api/modelo').then(function(r){
          mostrarTeste(r.teste);
          if(r.teste&&r.teste.estado!=='pedido'){
            clearInterval(timerModelo);timerModelo=null;bTestar.disabled=false;
            atualizarMenu();
          }
        }).catch(function(){});
      },2000);
    }

    api('GET','/api/modelo').then(function(r){
      ul.textContent='';
      (r.passos||[]).forEach(function(txt){ul.appendChild(el('li','',txt))});
      mostrarTeste(r.teste);
      if(r.teste&&r.teste.estado==='pedido'){bTestar.disabled=true;sondarTeste()}
    }).catch(function(e){ul.textContent='Erro ao carregar instrucoes: '+e.message});

    s.appendChild(boxInst);

    bTestar.addEventListener('click',function(){
      bTestar.disabled=true;
      api('POST','/api/modelo/testar',{}).then(function(r){
        mostrarTeste({estado:'pedido'});
        sondarTeste();
      }).catch(function(e){
        bTestar.disabled=false;alert(e.message);
      });
    });

    s.appendChild(bTestar);
    s.appendChild(resTeste);
  }
  function processar(s,d){
    s.appendChild(el('p','','A extracao de compromissos e sinais usa o modelo (Hermes) e gasta a cota do plano do ChatGPT. So comeca depois do seu OK.'));
    var boxDados=el('div');boxDados.setAttribute('aria-live','polite');s.appendChild(boxDados);
    var boxAviso=el('div','aviso');
    boxAviso.appendChild(el('div','','Atencao: cada dia processado consulta o modelo. Se voce pausar, o Heimdall para de pegar novos dias; o dia que ja comecou termina antes de parar. Ao liberar de novo, retoma de onde parou.'));
    s.appendChild(boxAviso);

    var divBotoes=el('div');divBotoes.style.margin='14px 0';
    var bLiberar=el('button','acao','Liberar o processamento');bLiberar.type='button';
    var bPausar=el('button','sec','Pausar processamento');bPausar.type='button';bPausar.style.marginLeft='8px';
    divBotoes.appendChild(bLiberar);divBotoes.appendChild(bPausar);
    s.appendChild(divBotoes);

    function carregarProc(){
      boxDados.textContent='Carregando estimativas...';
      api('GET','/api/processamento').then(function(r){
        boxDados.textContent='';
        var st=el('div','aviso');
        st.appendChild(el('div','',r.liberada?'Estado: Processamento LIBERADO':'Estado: Processamento PAUSADO (trava fechada)'));
        boxDados.appendChild(st);
        var g=el('div','kpis');
        kpi(g,'dias novos para extrair',r.diasNovos);
        kpi(g,'dias refeitos (mudaram)',r.diasRefeitos);
        kpi(g,'trabalhos na fila',r.naFila);
        kpi(g,'consultas previstas ao modelo',r.consultasPrevistas);
        boxDados.appendChild(g);
        bLiberar.disabled=r.liberada;
        bPausar.disabled=!r.liberada;
      }).catch(function(e){boxDados.textContent='Erro ao carregar dados: '+e.message});
    }

    bLiberar.addEventListener('click',function(){
      if(!window.confirm('Deseja liberar o processamento pelo modelo? Isso vai iniciar a extracao dos dias previstos e consumir cota do seu plano.'))return;
      bLiberar.disabled=true;
      api('POST','/api/processamento/liberar',{liberar:true,confirmar:true}).then(function(){
        return atualizarPainel();
      }).catch(function(e){alert(e.message)}).then(function(){carregarProc()});
    });

    bPausar.addEventListener('click',function(){
      bPausar.disabled=true;
      api('POST','/api/processamento/liberar',{liberar:false}).then(function(){
        return atualizarPainel();
      }).catch(function(e){alert(e.message)}).then(function(){carregarProc()});
    });

    carregarProc();
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
  function crm(s){
    s.appendChild(el('p','','O CRM (Krayin) guarda em que etapa do funil cada cliente está. O Heimdall só propõe movimentos; você aprova no self-chat. O endereço e o token ficam num arquivo protegido no computador (data/krayin.json), fora do git; o token nunca volta para esta tela.'));
    var box=el('div','aviso');
    box.appendChild(el('div','','No Krayin, abra Settings >> Pipeline >> Create Pipeline, dê um nome ao funil, marque "Mark as default" e, entre as etapas fixas, adicione estas três (botão de adicionar etapa), nesta ordem:'));
    var ul=el('ul');
    ['Contato iniciado','1ª Reunião Agendada','2ª Reunião Agendada'].forEach(function(t){ul.appendChild(el('li','',t))});
    box.appendChild(ul);
    box.appendChild(el('div','det','Novo (a primeira), Ganho e Perdido (as últimas) já vêm no Krayin e são fixas: o nome delas não muda e não precisa mudar. O Heimdall reconhece ganho e perdido pelo código interno (won/lost). Os três nomes acima podem ser digitados sem acento e sem o símbolo ª (ex.: 1a Reuniao Agendada).'));
    s.appendChild(box);
    s.appendChild(el('div','det','Endereço do Krayin (ex.: http://127.0.0.1:8082)'));
    var url=el('input','txt');url.type='url';url.placeholder='http://127.0.0.1:8082';url.setAttribute('aria-label','Endereço do Krayin');s.appendChild(url);
    var labTok=el('div','det','Token da API (gerado uma vez na instalação do Krayin; não é a senha). Se você não tiver, pare e peça a quem instalou o Krayin; não invente.');labTok.style.marginTop='10px';s.appendChild(labTok);
    var token=el('input','txt');token.type='password';token.autocomplete='off';token.placeholder='cole o token aqui';token.setAttribute('aria-label','Token da API do Krayin');s.appendChild(token);
    var linha=el('div');linha.style.marginTop='10px';
    var bSalvar=el('button','acao','Salvar e testar');bSalvar.type='button';
    var bTestar=el('button','sec','Testar de novo');bTestar.type='button';bTestar.style.marginLeft='8px';bTestar.style.display='none';
    linha.appendChild(bSalvar);linha.appendChild(bTestar);s.appendChild(linha);
    var res=el('div','aviso');res.style.marginTop='12px';res.setAttribute('role','status');res.setAttribute('aria-live','polite');s.appendChild(res);

    function pintar(j){
      res.textContent='';
      if(j.url)url.value=j.url;
      if(!j.configurado){
        res.appendChild(el('div','det','Ainda não configurado. Preencha o endereço e o token para testar.'));
        bTestar.style.display='none';
        return;
      }
      bTestar.style.display='';
      var st=j.status||{};
      if(st.estado==='ok'){
        if(st.completo){res.appendChild(el('div','verde','Conectado. O funil tem as cinco etapas.'));}
        else{
          res.appendChild(el('div','atencao','Conectado, mas o funil ainda não tem as cinco etapas.'));
          if(st.faltando&&st.faltando.length){var falta=el('ul');st.faltando.forEach(function(t){falta.appendChild(el('li','',t))});res.appendChild(falta)}
          res.appendChild(el('div','det','Crie ou corrija as etapas no Krayin e clique em "Testar de novo".'));
        }
      }else if(st.estado==='falhou'){
        res.appendChild(el('div','vermelho','Sem conexão: '+(st.motivo||'erro')));
        res.appendChild(el('div','det','Confira o endereço, se o Krayin está rodando e se o token é válido.'));
      }else{
        res.appendChild(el('div','det','Configurado; ainda sem teste de conexão.'));
      }
    }
    function testar(){
      return api('POST','/api/crm/testar',{}).then(function(j){
        pintar({configurado:true,url:j.url||url.value,status:j.status||{}});
        if(j.ok)res.insertBefore(el('div','verde','A conexão respondeu.'),res.firstChild);
        else res.insertBefore(el('div','vermelho','Não conectou: '+(j.erro||'erro')),res.firstChild);
        return atualizarMenu();
      }).catch(function(e){res.textContent='Não consegui testar: '+e.message});
    }
    bSalvar.addEventListener('click',function(){
      var u=url.value.trim(),t=token.value.trim();
      if(!u||!t){res.textContent='Preencha o endereço e o token.';return}
      token.value='';
      bSalvar.disabled=true;res.textContent='Salvando e testando...';
      api('POST','/api/crm/conectar',{url:u,token:t}).then(function(j){
        pintar({configurado:true,url:j.url||u,status:j.status||{}});
        if(j.ok)res.insertBefore(el('div','verde','A conexão respondeu.'),res.firstChild);
        else res.insertBefore(el('div','vermelho','Não conectou: '+(j.erro||'erro')),res.firstChild);
        return atualizarMenu();
      }).catch(function(e){res.textContent='Não salvei: '+e.message}).then(function(){bSalvar.disabled=false});
    });
    bTestar.addEventListener('click',function(){bTestar.disabled=true;res.textContent='Testando...';testar().then(function(){bTestar.disabled=false})});
    api('GET','/api/crm').then(pintar).catch(function(e){res.textContent='Não carreguei o estado do CRM: '+e.message});
  }
  function backup(s,d){
    var b=d.backup;
    s.appendChild(el('p','',b.destino?('Destino atual: '+b.destino):'Escolha onde guardar o backup: um HD externo, um segundo disco ou um pen drive (nao a mesma pasta do projeto).'));
    var ent=el('input','txt');ent.type='text';ent.placeholder='Exemplo: E:\\\\Backup-Heimdall (a pasta precisa existir)';ent.setAttribute('aria-label','Pasta do backup');if(b.destino)ent.value=b.destino;s.appendChild(ent);
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
  var RENDER={backup:backup,whatsapp:whatsapp,sincronizar:sincronizar,extrair:extrair,selfchat:selfchat,agenda:agenda,pronto:pronto,cadastro:cadastro,modelo:modelo,processar:processar,crm:crm};
  function atualizarPainel(){return api('GET','/api/painel').then(function(r){pn=r;return api('GET','/api/estado')}).then(function(r){passos=r.passos;fontes=r.fontes||null;tudo()}).catch(function(){})}
  function atualizarMenu(){return api('GET','/api/estado').then(function(r){passos=r.passos;fontes=r.fontes||null;lateral();pintarFontes(fontes)}).catch(function(){})}
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
  function tudo(){pintarFontes(fontes);lateral();painel()}
  function carregar(){return api('GET','/api/estado').then(function(r){passos=r.passos;fontes=r.fontes||null;if(!verifs.length)verifs=r.verificacoes||[];document.getElementById('bugs').textContent='relatorios de bug abertos: '+r.bugsAbertos;tudo()})}
  setInterval(function(){
    var p=passos[atual];
    if(!document.hidden){
      if(p&&p.id==='sincronizar'){
        if(atualizarSincronizar)atualizarSincronizar();else atualizarMenu();
      }else if(p&&(p.id==='cadastro'||p.id==='modelo'||p.id==='backup'||p.id==='ambiente'||p.id==='crm')){
        atualizarMenu();
      }else if(p&&p.pronto){
        atualizarPainel();
      }else{
        atualizarMenu();
      }
    }
  },3000);
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
<div id="fontes" class="fontes" aria-label="Estado das fontes de dados"></div>
<main>
  <nav id="passos" aria-label="Passos da configuração"></nav>
  <section id="painel" aria-live="polite"></section>
</main>
<script src="/app.js"></script>
</body>
</html>`;
