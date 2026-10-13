(function () {
  'use strict';

  var ESTOQUE = window.ESTOQUE || [];
  var LOJA = window.LOJA;

  // Valores iniciais do simulador.
  var TAXA_PADRAO = 1.99; // % ao mês
  var ENTRADA_PADRAO = 30; // %
  var PRAZO_PADRAO = 48; // meses

  var TIPOS = ['Hatch', 'Sedã', 'SUV', 'Picape'];
  var MSG_PADRAO = 'Olá, RM Motors! Vim pelo site e quero saber mais sobre os carros.';

  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  var brlCentavos = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var numero = new Intl.NumberFormat('pt-BR');
  var decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

  function $(seletor, raiz) { return (raiz || document).querySelector(seletor); }
  function $$(seletor, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(seletor)); }

  function esc(texto) {
    return String(texto).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function linkWhatsApp(texto, fone) {
    return 'https://wa.me/' + (fone || LOJA.whatsappLoja) + '?text=' + encodeURIComponent(texto);
  }

  function abrirWhatsApp(texto, fone) {
    window.open(linkWhatsApp(texto, fone), '_blank', 'noopener');
  }

  function nomeCarro(c) { return c.marca + ' ' + c.modelo + ' ' + c.versao; }
  function anoModelo(c) { return parseInt(String(c.ano).split('/').pop(), 10); }

  function parcela(valorFinanciado, taxaMes, meses) {
    if (valorFinanciado <= 0) return 0;
    var i = taxaMes / 100;
    if (i === 0) return valorFinanciado / meses;
    return valorFinanciado * i / (1 - Math.pow(1 + i, -meses));
  }

  function placaHTML(preco, grande) {
    return '<span class="placa' + (grande ? ' placa--grande' : '') + '">' +
      '<span class="placa__rm" aria-hidden="true">RM</span>' +
      '<span>' + brl.format(preco) + '</span></span>';
  }

  function msgInteresse(c) {
    return 'Olá, RM Motors! Vi no site o ' + nomeCarro(c) + ' ' + c.ano + ' por ' + brl.format(c.preco) + '. Ele ainda está disponível?';
  }

  function carroPorId(id) {
    for (var i = 0; i < ESTOQUE.length; i++) if (ESTOQUE[i].id === id) return ESTOQUE[i];
    return null;
  }

  /* ---------- Textos gerais ---------- */

  $$('[data-total]').forEach(function (el) { el.textContent = ESTOQUE.length; });
  $$('[data-ano]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$('a[data-wa]').forEach(function (a) {
    a.href = linkWhatsApp(MSG_PADRAO);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // "Aberto agora" calculado no horário de Brasília (o mesmo de Catalão).
  function statusLoja() {
    var partes = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date());
    function pega(tipo) { for (var i = 0; i < partes.length; i++) if (partes[i].type === tipo) return partes[i].value; }
    var dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(pega('weekday'));
    var minutos = parseInt(pega('hour'), 10) * 60 + parseInt(pega('minute'), 10);
    var abre = 8 * 60 + 30;
    var fecha = 18 * 60 + 30;
    var diaUtil = dia >= 1 && dia <= 5;

    if (diaUtil && minutos >= abre && minutos < fecha) {
      return '<span class="status-aberto">Aberto agora</span>, até 18h30.';
    }
    var proximo;
    if (diaUtil && minutos < abre) proximo = 'hoje às 8h30';
    else if ((dia >= 1 && dia <= 4) || dia === 0) proximo = 'amanhã às 8h30';
    else proximo = 'segunda às 8h30';
    return '<span class="status-aberto">Fechado agora</span>. Abre ' + proximo + '.';
  }

  var aberto = $('[data-aberto]');
  if (aberto) {
    try { aberto.innerHTML = statusLoja(); } catch (e) { /* mantém o horário fixo */ }
  }

  /* ---------- Destaque do topo ---------- */

  function renderDestaque() {
    var c = ESTOQUE.filter(function (x) { return x.destaque; })[0] || ESTOQUE[0];
    var fig = $('#destaque');
    if (!c || !fig) return;
    fig.innerHTML =
      '<a class="hero__foto" href="#carro-' + c.id + '" data-abrir="' + c.id + '" tabindex="-1" aria-hidden="true">' +
        '<img src="' + c.foto + '" alt="" width="1200" height="1200" fetchpriority="high">' +
        placaHTML(c.preco, true) +
      '</a>' +
      '<figcaption class="hero__legenda">' +
        '<span><strong>' + esc(nomeCarro(c)) + '</strong><br>' +
        esc(c.ano) + ', ' + numero.format(c.km) + ' km, câmbio ' + esc(c.cambio.toLowerCase()) +
        '<span class="visualmente-oculto">, ' + brl.format(c.preco) + '</span></span>' +
        '<a href="#carro-' + c.id + '" data-abrir="' + c.id + '">Ver detalhes</a>' +
      '</figcaption>';
  }

  /* ---------- Estoque ---------- */

  var estado = { tipo: '', preco: '', ordem: 'preco-asc' };
  var grade = $('#grade');
  var contagem = $('#contagem');
  var vazio = $('#vazio');
  var tiposEl = $('#filtro-tipos');

  function renderTipos() {
    var botoes = [{ valor: '', nome: 'Todos', qtd: ESTOQUE.length }];
    TIPOS.forEach(function (t) {
      var qtd = ESTOQUE.filter(function (c) { return c.categoria === t; }).length;
      if (qtd) botoes.push({ valor: t, nome: t, qtd: qtd });
    });
    tiposEl.innerHTML = botoes.map(function (b) {
      return '<button type="button" class="chip" data-tipo="' + esc(b.valor) + '" aria-pressed="' + (b.valor === estado.tipo) + '">' +
        esc(b.nome) + ' <span class="chip__qtd">' + b.qtd + '</span></button>';
    }).join('');
  }

  function cardHTML(c) {
    return '<li class="carro">' +
      '<a class="carro__link" href="#carro-' + c.id + '" data-abrir="' + c.id + '">' +
        '<div class="carro__foto"><img src="' + c.foto + '" alt="" loading="lazy" width="1200" height="1200"></div>' +
        '<div class="carro__corpo">' +
          '<p class="carro__marca">' + esc(c.marca) + '</p>' +
          '<h3 class="carro__nome">' + esc(c.modelo) + ' <span class="carro__versao">' + esc(c.versao) + '</span></h3>' +
          '<dl class="carro__dados">' +
            '<div><dt>Ano</dt><dd>' + esc(c.ano) + '</dd></div>' +
            '<div><dt>Km</dt><dd>' + numero.format(c.km) + '</dd></div>' +
            '<div><dt>Câmbio</dt><dd>' + esc(c.cambio) + '</dd></div>' +
          '</dl>' +
        '</div>' +
      '</a>' +
      '<div class="carro__rodape">' +
        placaHTML(c.preco) +
        '<a class="carro__wa" href="' + linkWhatsApp(msgInteresse(c)) + '" target="_blank" rel="noopener" aria-label="Chamar no WhatsApp sobre o ' + esc(c.modelo + ' ' + c.ano) + '">' +
          '<svg class="icone" aria-hidden="true"><use href="#i-whatsapp"/></svg><span>Chamar</span>' +
        '</a>' +
      '</div>' +
    '</li>';
  }

  function listaFiltrada() {
    var lista = ESTOQUE.filter(function (c) { return !estado.tipo || c.categoria === estado.tipo; });
    if (estado.preco) {
      var faixa = estado.preco.split('-').map(Number);
      lista = lista.filter(function (c) {
        return (faixa[0] === 0 ? c.preco >= 0 : c.preco > faixa[0]) && c.preco <= faixa[1];
      });
    }
    var ordens = {
      'preco-asc': function (a, b) { return a.preco - b.preco; },
      'preco-desc': function (a, b) { return b.preco - a.preco; },
      'ano-desc': function (a, b) { return anoModelo(b) - anoModelo(a) || a.km - b.km; },
      'km-asc': function (a, b) { return a.km - b.km; }
    };
    return lista.slice().sort(ordens[estado.ordem]);
  }

  function renderEstoque() {
    var lista = listaFiltrada();
    var total = ESTOQUE.length;
    grade.innerHTML = lista.map(cardHTML).join('');
    vazio.hidden = lista.length > 0;
    if (lista.length === total) {
      contagem.textContent = total + (total === 1 ? ' carro à venda' : ' carros à venda');
    } else {
      contagem.textContent = 'Mostrando ' + lista.length + ' de ' + total + (total === 1 ? ' carro' : ' carros');
    }
  }

  tiposEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tipo]');
    if (!b) return;
    estado.tipo = b.getAttribute('data-tipo');
    $$('[data-tipo]', tiposEl).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    renderEstoque();
  });
  $('#filtro-preco').addEventListener('change', function (e) { estado.preco = e.target.value; renderEstoque(); });
  $('#filtro-ordem').addEventListener('change', function (e) { estado.ordem = e.target.value; renderEstoque(); });

  /* ---------- Detalhe do carro ---------- */

  var dlg = $('#detalhe');
  var carroAberto = null;

  function abrirCarro(id, atualizarUrl) {
    var c = carroPorId(id);
    if (!c) return;
    carroAberto = c;

    var foto = $('#detalhe-foto');
    foto.src = c.foto;
    foto.alt = nomeCarro(c) + ' ' + c.ano + ' no pátio da RM Motors';

    $('#detalhe-marca').textContent = c.marca;
    $('#detalhe-titulo').innerHTML = esc(c.modelo) + ' <span>' + esc(c.versao) + '</span>';
    $('#detalhe-placa').innerHTML = '<span class="placa__rm" aria-hidden="true">RM</span><span>' + brl.format(c.preco) + '</span>';

    var fipe = $('#detalhe-fipe');
    fipe.hidden = !c.fipe;
    if (c.fipe) fipe.innerHTML = 'Tabela Fipe: <strong>' + brl.format(c.fipe) + '</strong>';

    var ficha = [
      ['Ano', c.ano],
      ['Quilometragem', numero.format(c.km) + ' km'],
      ['Câmbio', c.cambio],
      c.combustivel ? ['Combustível', c.combustivel] : null,
      ['Tipo', c.categoria]
    ].filter(Boolean);
    $('#detalhe-ficha').innerHTML = ficha.map(function (l) {
      return '<div><dt>' + esc(l[0]) + '</dt><dd>' + esc(l[1]) + '</dd></div>';
    }).join('');

    $('#detalhe-itens').innerHTML = (c.itens || []).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('');

    var entrada = c.preco * ENTRADA_PADRAO / 100;
    var p = parcela(c.preco - entrada, TAXA_PADRAO, PRAZO_PADRAO);
    $('#detalhe-parcela').innerHTML = 'Com ' + ENTRADA_PADRAO + '% de entrada (' + brl.format(entrada) + '), fica em <strong>' +
      PRAZO_PADRAO + 'x de ' + brlCentavos.format(p) + '</strong>, com taxa estimada de ' + decimal.format(TAXA_PADRAO) + '% ao mês.';

    var wa = $('#detalhe-wa');
    wa.href = linkWhatsApp(msgInteresse(c));
    wa.target = '_blank';
    wa.rel = 'noopener';

    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    if (atualizarUrl !== false) history.replaceState(null, '', '#carro-' + c.id);
  }

  dlg.addEventListener('close', function () {
    if (location.hash.indexOf('#carro-') === 0) history.replaceState(null, '', location.pathname + location.search);
  });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || e.target.closest('[data-fechar]')) dlg.close();
  });

  $('#detalhe-simular').addEventListener('click', function (e) {
    e.preventDefault();
    var c = carroAberto;
    dlg.close();
    if (c) escolherCarroNoSimulador(c.id);
    $('#pagamento').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('#sim-carro').focus({ preventScroll: true });
  });

  document.addEventListener('click', function (e) {
    var gatilho = e.target.closest('[data-abrir]');
    if (!gatilho) return;
    e.preventDefault();
    abrirCarro(gatilho.getAttribute('data-abrir'));
  });

  function abrirPeloLink() {
    if (location.hash.indexOf('#carro-') === 0) abrirCarro(location.hash.slice(7), false);
  }
  window.addEventListener('hashchange', abrirPeloLink);

  /* ---------- Simulador ---------- */

  var sim = { valor: 0, entrada: ENTRADA_PADRAO, prazo: PRAZO_PADRAO, taxa: TAXA_PADRAO };
  var simCarro = $('#sim-carro');
  var simValor = $('#sim-valor');
  var simEntrada = $('#sim-entrada');
  var simTaxa = $('#sim-taxa');

  function apenasNumero(texto) {
    var digitos = String(texto).replace(/\D/g, '');
    return digitos ? parseInt(digitos, 10) : 0;
  }

  function lerTaxa() {
    var t = parseFloat(String(simTaxa.value).replace(/\s|%/g, '').replace(',', '.'));
    return isFinite(t) && t >= 0 && t <= 15 ? t : TAXA_PADRAO;
  }

  // O erro só aparece ao sair do campo ou ao enviar; enquanto digita, só some.
  function atualizarSimulador(mostrarErro) {
    var erro = $('#sim-valor-erro');
    var valorOk = sim.valor >= 1000;
    if (valorOk) {
      erro.textContent = '';
      simValor.setAttribute('aria-invalid', 'false');
    } else if (mostrarErro) {
      erro.textContent = 'Informe o valor do carro, por exemplo 50.000.';
      simValor.setAttribute('aria-invalid', 'true');
    }

    var entrada = sim.valor * sim.entrada / 100;
    var financiado = sim.valor - entrada;
    $('#sim-entrada-valor').textContent = brl.format(entrada) + ' (' + sim.entrada + '%)';
    $('#sim-prazo-txt').textContent = sim.prazo + 'x de';

    if (!valorOk) {
      $('#sim-parcela').textContent = 'R$ —';
      $('#sim-detalhe').textContent = '';
      return;
    }
    var p = parcela(financiado, sim.taxa, sim.prazo);
    $('#sim-parcela').textContent = brlCentavos.format(p);
    $('#sim-detalhe').textContent = financiado > 0
      ? 'Valor financiado: ' + brl.format(financiado) + '. Taxa estimada de ' + decimal.format(sim.taxa) + '% ao mês.'
      : 'Sem valor a financiar: a entrada cobre o carro.';
  }

  function escolherCarroNoSimulador(id) {
    var c = carroPorId(id);
    if (!c) return;
    simCarro.value = c.id;
    sim.valor = c.preco;
    simValor.value = numero.format(c.preco);
    atualizarSimulador();
  }

  simCarro.innerHTML = ESTOQUE.map(function (c) {
    return '<option value="' + c.id + '">' + esc(c.modelo + ' ' + c.ano) + ', ' + brl.format(c.preco) + '</option>';
  }).join('') + '<option value="">Outro valor</option>';

  simCarro.addEventListener('change', function () {
    if (simCarro.value) {
      escolherCarroNoSimulador(simCarro.value);
    } else {
      simValor.focus();
      simValor.select();
    }
  });

  simValor.addEventListener('input', function () {
    sim.valor = apenasNumero(simValor.value);
    var igual = ESTOQUE.filter(function (c) { return c.preco === sim.valor && c.id === simCarro.value; })[0];
    if (!igual) simCarro.value = '';
    atualizarSimulador();
  });
  simValor.addEventListener('blur', function () {
    if (sim.valor) simValor.value = numero.format(sim.valor);
    atualizarSimulador(true);
  });

  simEntrada.addEventListener('input', function () {
    sim.entrada = parseInt(simEntrada.value, 10);
    atualizarSimulador();
  });

  $$('input[name="prazo"]').forEach(function (r) {
    r.addEventListener('change', function () {
      sim.prazo = parseInt(r.value, 10);
      atualizarSimulador();
    });
  });

  simTaxa.addEventListener('input', function () { sim.taxa = lerTaxa(); atualizarSimulador(); });
  simTaxa.addEventListener('blur', function () { sim.taxa = lerTaxa(); simTaxa.value = decimal.format(sim.taxa); atualizarSimulador(); });

  $('#simulador').addEventListener('submit', function (e) {
    e.preventDefault();
    if (sim.valor < 1000) {
      atualizarSimulador(true);
      simValor.focus();
      return;
    }
    var c = carroPorId(simCarro.value);
    var entrada = sim.valor * sim.entrada / 100;
    var p = parcela(sim.valor - entrada, sim.taxa, sim.prazo);
    var carro = c ? nomeCarro(c) + ' ' + c.ano + ' (' + brl.format(c.preco) + ')' : 'um carro de ' + brl.format(sim.valor);
    abrirWhatsApp('Olá, RM Motors! Fiz uma simulação no site para ' + carro + ': entrada de ' + brl.format(entrada) +
      ' (' + sim.entrada + '%) e ' + sim.prazo + 'x de ' + brlCentavos.format(p) + ', com taxa estimada de ' +
      decimal.format(sim.taxa) + '% ao mês. Podem me ajudar com o financiamento?');
  });

  /* ---------- Troca / encomenda ---------- */

  var form = $('#form-contato');
  var TEXTOS_INTENCAO = {
    troca: { rotulo: 'Seu carro: modelo e ano', exemplo: 'Ex.: Onix LT 2019', erro: 'Digite o modelo e o ano do seu carro.', km: true },
    procura: { rotulo: 'Carro que você procura', exemplo: 'Ex.: Hilux SRV até R$ 150 mil', erro: 'Diga qual carro você procura.', km: false }
  };

  function intencao() { return $('input[name="intencao"]:checked', form).value; }

  function aplicarIntencao() {
    var t = TEXTOS_INTENCAO[intencao()];
    $('#c-carro-rotulo').textContent = t.rotulo;
    $('#c-carro').placeholder = t.exemplo;
    $('#c-km-campo').hidden = !t.km;
  }

  $$('input[name="intencao"]', form).forEach(function (r) { r.addEventListener('change', aplicarIntencao); });

  function marcarErro(campo, mensagem) {
    var erro = $('#' + campo.id + '-erro');
    erro.textContent = mensagem;
    campo.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
  }

  ['#c-nome', '#c-carro'].forEach(function (s) {
    $(s).addEventListener('input', function (e) { if (e.target.value.trim().length >= 2) marcarErro(e.target, ''); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = $('#c-nome');
    var carro = $('#c-carro');
    var t = TEXTOS_INTENCAO[intencao()];
    var invalidos = [];

    if (nome.value.trim().length < 2) { marcarErro(nome, 'Digite seu nome.'); invalidos.push(nome); } else marcarErro(nome, '');
    if (carro.value.trim().length < 2) { marcarErro(carro, t.erro); invalidos.push(carro); } else marcarErro(carro, '');
    if (invalidos.length) { invalidos[0].focus(); return; }

    var km = t.km ? $('#c-km').value.trim() : '';
    var extra = $('#c-msg').value.trim();
    var texto = intencao() === 'troca'
      ? 'Olá, RM Motors! Meu nome é ' + nome.value.trim() + '. Quero avaliar meu carro na troca: ' + carro.value.trim() + (km ? ', ' + km + ' km' : '') + '.'
      : 'Olá, RM Motors! Meu nome é ' + nome.value.trim() + '. Estou procurando: ' + carro.value.trim() + '.';
    if (extra) texto += ' ' + extra;
    abrirWhatsApp(texto);
  });

  $$('[data-procurar]').forEach(function (a) {
    a.addEventListener('click', function () {
      $('input[name="intencao"][value="procura"]', form).checked = true;
      aplicarIntencao();
    });
  });

  /* ---------- Contatos ---------- */

  function telefoneLink(c) { return 'tel:+' + c.whatsapp; }

  $('#contatos').innerHTML = LOJA.contatos.map(function (c) {
    return '<li>' +
      '<div><span class="contatos__nome">' + esc(c.nome) + '</span><span class="contatos__fone">' + esc(c.fone) + '</span></div>' +
      '<div class="contatos__acoes">' +
        '<a class="btn btn--secundario" href="' + linkWhatsApp(MSG_PADRAO, c.whatsapp) + '" target="_blank" rel="noopener" aria-label="WhatsApp ' + (c.nome === 'Loja' ? 'da loja' : 'do ' + esc(c.nome)) + '">' +
          '<svg class="icone" aria-hidden="true"><use href="#i-whatsapp"/></svg>WhatsApp</a>' +
        '<a class="btn btn--secundario" href="' + telefoneLink(c) + '" aria-label="Ligar para ' + (c.nome === 'Loja' ? 'a loja' : esc(c.nome)) + '">' +
          '<svg class="icone" aria-hidden="true"><use href="#i-phone"/></svg>Ligar</a>' +
      '</div></li>';
  }).join('');

  $('#rodape-contatos').innerHTML = LOJA.contatos.map(function (c) {
    return '<li><a href="' + linkWhatsApp(MSG_PADRAO, c.whatsapp) + '" target="_blank" rel="noopener">' + esc(c.nome) + ': ' + esc(c.fone) + '</a></li>';
  }).join('');

  /* ---------- Tema claro/escuro ---------- */

  var raiz = document.documentElement;
  var botaoTema = $('#tema');
  var temaEscuroSistema = window.matchMedia('(prefers-color-scheme: dark)');

  function temaAtual() { return raiz.dataset.theme || (temaEscuroSistema.matches ? 'dark' : 'light'); }

  function atualizarBotaoTema() {
    var escuro = temaAtual() === 'dark';
    botaoTema.setAttribute('aria-label', escuro ? 'Ativar tema claro' : 'Ativar tema escuro');
    $('use', botaoTema).setAttribute('href', escuro ? '#i-sol' : '#i-lua');
  }

  botaoTema.addEventListener('click', function () {
    var novo = temaAtual() === 'dark' ? 'light' : 'dark';
    raiz.dataset.theme = novo;
    try { localStorage.setItem('rm-tema', novo === 'dark' ? 'escuro' : 'claro'); } catch (e) { /* sem armazenamento */ }
    atualizarBotaoTema();
  });
  if (temaEscuroSistema.addEventListener) temaEscuroSistema.addEventListener('change', atualizarBotaoTema);

  /* ---------- Menu no celular ---------- */

  var nav = $('#nav');
  var botaoMenu = $('#menu');

  function fecharMenu() {
    nav.classList.remove('nav--aberta');
    botaoMenu.setAttribute('aria-expanded', 'false');
    botaoMenu.setAttribute('aria-label', 'Abrir menu');
    $('use', botaoMenu).setAttribute('href', '#i-menu');
  }

  botaoMenu.addEventListener('click', function () {
    var abrir = !nav.classList.contains('nav--aberta');
    nav.classList.toggle('nav--aberta', abrir);
    botaoMenu.setAttribute('aria-expanded', String(abrir));
    botaoMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    $('use', botaoMenu).setAttribute('href', abrir ? '#i-x' : '#i-menu');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) fecharMenu(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('nav--aberta')) { fecharMenu(); botaoMenu.focus(); }
  });

  /* ---------- Início ---------- */

  renderDestaque();
  renderTipos();
  renderEstoque();
  aplicarIntencao();
  atualizarBotaoTema();
  var destaque = ESTOQUE.filter(function (x) { return x.destaque; })[0] || ESTOQUE[0];
  if (destaque) escolherCarroNoSimulador(destaque.id);
  abrirPeloLink();
})();
