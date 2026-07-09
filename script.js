// =====================================================
// 1. CRIAR VARIÁVEIS GLOBAIS
// =====================================================
let gastos = [];
let rendaMensal = 0;
const PORCENTAGEM_META = 15; // 15% da renda

// =====================================================
// 2. FUNÇÃO QUE RODA QUANDO A PÁGINA CARREGA
// =====================================================
window.onload = function () {
  // CARREGAR GASTOS
  const salvos = localStorage.getItem("gastos");
  if (salvos) {
    gastos = JSON.parse(salvos);
    atualizarLista();
  }

  // CARREGAR RENDA
  const rendaSalva = localStorage.getItem("rendaMensal");
  if (rendaSalva) {
    rendaMensal = parseFloat(rendaSalva);
    mostrarRendaNaTela();
    atualizarLista(); // Atualiza tudo
  }

  // Atualizar o texto da meta no subtítulo
  document.getElementById("metaTexto").textContent = PORCENTAGEM_META + "%";
};

// =====================================================
// 3. FUNÇÃO PARA CALCULAR A META (15% da renda)
// =====================================================
function calcularMeta() {
  return (rendaMensal * PORCENTAGEM_META) / 100;
}

// =====================================================
// 4. FUNÇÕES DA RENDA MENSAL
// =====================================================

// Salvar a renda
function salvarRenda() {
  const input = document.getElementById("rendaMensal");
  const valor = input.value.trim();

  if (valor === "") {
    alert("Digite sua renda mensal!");
    return;
  }

  const renda = parseFloat(valor);
  if (isNaN(renda) || renda <= 0) {
    alert("Digite um valor válido (ex: 5000)");
    return;
  }

  rendaMensal = renda;
  localStorage.setItem("rendaMensal", rendaMensal);

  mostrarRendaNaTela();
  atualizarLista();
  atualizarBarraMeta();

  input.value = "";
  alert(
    "✅ Renda salva com sucesso! Meta: " +
      PORCENTAGEM_META +
      "% da renda (R$ " +
      calcularMeta().toFixed(2) +
      ")",
  );
}

// Mostrar a renda na tela
function mostrarRendaNaTela() {
  const elemento = document.getElementById("mostraRenda");
  if (rendaMensal > 0) {
    const meta = calcularMeta();
    elemento.innerHTML =
      "💰 Renda: <span>R$ " +
      rendaMensal.toFixed(2) +
      "</span> | 🎯 Meta: <span>R$ " +
      meta.toFixed(2) +
      " (" +
      PORCENTAGEM_META +
      "%)</span>";
  } else {
    elemento.innerHTML = "⚠️ Nenhuma renda cadastrada ainda.";
  }
}

// Calcular percentual da renda que está sendo gasto
function calcularPercentualRenda() {
  if (rendaMensal <= 0) {
    return 0;
  }

  let total = 0;
  for (let i = 0; i < gastos.length; i++) {
    total = total + gastos[i].valor;
  }

  return (total / rendaMensal) * 100;
}

// =====================================================
// 5. FUNÇÃO PARA ATUALIZAR A BARRA DE PROGRESSO DA META
// =====================================================
function atualizarBarraMeta() {
  const meta = calcularMeta();
  const elementoBarra = document.getElementById("barraProgresso");
  const elementoProgresso = document.getElementById("progressoTexto");
  const elementoEconomia = document.getElementById("economiaAtual");
  const elementoMeta = document.getElementById("metaNecessaria");
  const elementoMetaValor = document.getElementById("metaValor");

  if (rendaMensal <= 0) {
    elementoBarra.style.width = "0%";
    elementoProgresso.textContent = "0%";
    elementoEconomia.textContent = "R$ 0,00";
    elementoMeta.textContent = "Meta: R$ 0,00";
    elementoMetaValor.textContent = "R$ 0,00";
    return;
  }

  // Calcular quanto já foi economizado (sobra da renda)
  let totalGastos = 0;
  for (let i = 0; i < gastos.length; i++) {
    totalGastos = totalGastos + gastos[i].valor;
  }

  const sobra = rendaMensal - totalGastos;
  const metaValor = meta;

  // Mostrar meta no resumo
  elementoMetaValor.textContent = "R$ " + metaValor.toFixed(2);

  // Calcular progresso (quanto % da meta já foi atingido)
  let progresso = 0;
  if (metaValor > 0) {
    progresso = (sobra / metaValor) * 100;
    if (progresso > 100) progresso = 100; // Limitar em 100%
    if (progresso < 0) progresso = 0; // Não deixar negativo
  }

  // Atualizar barra
  elementoBarra.style.width = progresso + "%";
  elementoProgresso.textContent = progresso.toFixed(0) + "%";

  // Atualizar textos
  elementoEconomia.textContent =
    "💰 Economia: R$ " + (sobra > 0 ? sobra.toFixed(2) : "0,00");
  elementoMeta.textContent = "🎯 Meta: R$ " + metaValor.toFixed(2);

  // Mudar cor da barra conforme o progresso
  if (progresso >= 100) {
    elementoBarra.style.background = "linear-gradient(90deg, #48bb78, #38a169)"; // Verde
  } else if (progresso >= 50) {
    elementoBarra.style.background = "linear-gradient(90deg, #f6ad55, #ed8936)"; // Laranja
  } else {
    elementoBarra.style.background = "linear-gradient(90deg, #fc8181, #e53e3e)"; // Vermelho
  }
}

// =====================================================
// 6. FUNÇÃO PARA ADICIONAR UM GASTO
// =====================================================
function adicionarGasto() {
  const nome = document.getElementById("nomeGasto").value.trim();
  const valor = document.getElementById("valorGasto").value.trim();
  const prioridade = document.getElementById("prioridadeGasto").value;

  if (nome === "" || valor === "") {
    alert("Por favor, preencha o nome e o valor!");
    return;
  }

  const valorNumero = parseFloat(valor);
  if (isNaN(valorNumero) || valorNumero <= 0) {
    alert("Digite um valor válido (ex: 1500)");
    return;
  }

  const gasto = {
    id: Date.now(),
    nome: nome,
    valor: valorNumero,
    prioridade: prioridade,
    pago: false,
  };

  gastos.push(gasto);
  localStorage.setItem("gastos", JSON.stringify(gastos));
  atualizarLista();
  atualizarBarraMeta();

  document.getElementById("nomeGasto").value = "";
  document.getElementById("valorGasto").value = "";
  document.getElementById("nomeGasto").focus();
}

// =====================================================
// 7. FUNÇÃO PARA ATUALIZAR A LISTA NA TELA
// =====================================================
function atualizarLista() {
  const ul = document.getElementById("listaGastos");

  if (gastos.length === 0) {
    ul.innerHTML = '<li class="vazio">Nenhum gasto cadastrado</li>';
    atualizarResumo();
    return;
  }

  gastos.sort(function (a, b) {
    const ordem = { alta: 0, media: 1, baixa: 2 };
    return ordem[a.prioridade] - ordem[b.prioridade];
  });

  let html = "";
  gastos.forEach(function (gasto) {
    const classePago = gasto.pago ? "pago" : "";

    let labelPrioridade = "";
    if (gasto.prioridade === "alta") {
      labelPrioridade = "🔴 Alta";
    } else if (gasto.prioridade === "media") {
      labelPrioridade = "🟡 Média";
    } else {
      labelPrioridade = "🟢 Baixa";
    }

    html += `
            <li class="${classePago}">
                <div class="info-gasto">
                    <input type="checkbox" 
                           ${gasto.pago ? "checked" : ""} 
                           onchange="togglePago(${gasto.id})">
                    <span class="nome-gasto">${gasto.nome}</span>
                    <span class="valor-gasto">R$ ${gasto.valor.toFixed(2)}</span>
                    <span class="${gasto.prioridade}">${labelPrioridade}</span>
                </div>
                <button class="btn-remover" onclick="removerGasto(${gasto.id})">✕</button>
            </li>
        `;
  });

  ul.innerHTML = html;
  atualizarResumo();
  document.getElementById("boxDicas").style.display = "none";
}

// =====================================================
// 8. FUNÇÃO PARA MARCAR/ DESMARCAR COMO PAGO
// =====================================================
function togglePago(id) {
  const gasto = gastos.find(function (g) {
    return g.id === id;
  });

  if (gasto) {
    gasto.pago = !gasto.pago;
    localStorage.setItem("gastos", JSON.stringify(gastos));
    atualizarLista();
    atualizarBarraMeta();
  }
}

// =====================================================
// 9. FUNÇÃO PARA REMOVER UM GASTO
// =====================================================
function removerGasto(id) {
  if (confirm("Tem certeza que quer remover este gasto?")) {
    gastos = gastos.filter(function (g) {
      return g.id !== id;
    });
    localStorage.setItem("gastos", JSON.stringify(gastos));
    atualizarLista();
    atualizarBarraMeta();
  }
}

// =====================================================
// 10. FUNÇÃO PARA ATUALIZAR O RESUMO
// =====================================================
function atualizarResumo() {
  let total = 0;
  for (let i = 0; i < gastos.length; i++) {
    total = total + gastos[i].valor;
  }

  document.getElementById("totalGastos").textContent = "R$ " + total.toFixed(2);
  document.getElementById("totalItens").textContent = gastos.length;

  const percentual = calcularPercentualRenda();
  const elementoPercentual = document.getElementById("percentualRenda");

  if (rendaMensal > 0) {
    elementoPercentual.textContent = percentual.toFixed(1) + "%";

    if (percentual > 70) {
      elementoPercentual.style.color = "#e53e3e";
    } else if (percentual > 50) {
      elementoPercentual.style.color = "#d69e2e";
    } else {
      elementoPercentual.style.color = "#38a169";
    }
  } else {
    elementoPercentual.textContent = "❌ Sem renda";
    elementoPercentual.style.color = "#a0aec0";
  }

  // Atualizar a meta no resumo também
  const meta = calcularMeta();
  document.getElementById("metaValor").textContent = "R$ " + meta.toFixed(2);
}

// =====================================================
// 11. FUNÇÃO PARA LIMPAR TUDO
// =====================================================
function limparTudo() {
  if (confirm("Apagar todos os gastos?")) {
    gastos = [];
    localStorage.setItem("gastos", JSON.stringify(gastos));
    atualizarLista();
    atualizarBarraMeta();
    document.getElementById("boxDicas").style.display = "none";
  }
}

// =====================================================
// 12. FUNÇÃO PARA GERAR DICAS (COM BASE NA RENDA E META)
// =====================================================
function gerarDicas() {
  if (rendaMensal <= 0) {
    alert("⚠️ Primeiro cadastre sua renda mensal!");
    return;
  }

  if (gastos.length === 0) {
    alert("Adicione alguns gastos primeiro!");
    return;
  }

  const box = document.getElementById("boxDicas");
  const conteudo = document.getElementById("conteudoDicas");
  box.style.display = "block";

  // ===== CALCULAR DADOS =====
  let total = 0;
  for (let i = 0; i < gastos.length; i++) {
    total = total + gastos[i].valor;
  }

  const percentual = (total / rendaMensal) * 100;
  const sobra = rendaMensal - total;
  const meta = calcularMeta();

  // Gastos pendentes por prioridade
  let altaNaoPagos = [];
  let mediaNaoPagos = [];
  let baixaNaoPagos = [];

  for (let i = 0; i < gastos.length; i++) {
    const g = gastos[i];
    if (!g.pago) {
      if (g.prioridade === "alta") {
        altaNaoPagos.push(g);
      } else if (g.prioridade === "media") {
        mediaNaoPagos.push(g);
      } else {
        baixaNaoPagos.push(g);
      }
    }
  }

  // ===== CONSTRUIR AS DICAS =====
  let html = "";

  // 1. RESUMO COM RENDA E META
  html +=
    "<p><strong>💵 Renda mensal:</strong> R$ " +
    rendaMensal.toFixed(2) +
    "</p>";
  html +=
    "<p><strong>💰 Total de gastos:</strong> R$ " + total.toFixed(2) + "</p>";
  html +=
    "<p><strong>📊 Percentual da renda:</strong> " +
    percentual.toFixed(1) +
    "%</p>";
  html +=
    "<p><strong>🎯 Meta (15% da renda):</strong> R$ " +
    meta.toFixed(2) +
    "</p>";

  // Sobra
  if (sobra >= 0) {
    html +=
      "<p><strong>💵 Sobra do mês:</strong> R$ " + sobra.toFixed(2) + "</p>";
  } else {
    html +=
      '<p style="color: #e53e3e;"><strong>💔 Déficit:</strong> R$ ' +
      Math.abs(sobra).toFixed(2) +
      " (gastando mais do que ganha!)</p>";
  }

  // Avaliação da saúde financeira
  html += "<hr>";
  html += "<p><strong>📊 Saúde Financeira:</strong></p>";

  if (percentual <= 50) {
    html +=
      '<p class="alerta-verde">✅ Excelente! Você gasta menos da metade da sua renda.</p>';
  } else if (percentual <= 70) {
    html +=
      '<p class="alerta-amarelo">⚠️ Atenção! Você está gastando entre 50% e 70% da sua renda.</p>';
  } else {
    html +=
      '<p class="alerta-vermelho">🚨 Cuidado! Você está gastando mais de 70% da sua renda.</p>';
  }

  // Status da meta
  html +=
    "<p><strong>🎯 Status da Meta (" + PORCENTAGEM_META + "%):</strong></p>";
  if (sobra >= meta) {
    html +=
      '<p class="alerta-verde">🎉 Parabéns! Você atingiu a meta de guardar ' +
      PORCENTAGEM_META +
      "% da renda (R$ " +
      meta.toFixed(2) +
      ")!</p>";
    const extra = sobra - meta;
    if (extra > 0) {
      html +=
        '<p class="alerta-verde">🌟 Você guardou R$ ' +
        extra.toFixed(2) +
        " a mais que a meta! Incrível!</p>";
    }
  } else if (sobra > 0) {
    const falta = meta - sobra;
    const progresso = (sobra / meta) * 100;
    html +=
      '<p class="alerta-amarelo">💪 Você guardou R$ ' +
      sobra.toFixed(2) +
      " (" +
      progresso.toFixed(0) +
      "% da meta). Faltam R$ " +
      falta.toFixed(2) +
      " para atingir a meta.</p>";
  } else {
    html +=
      '<p class="alerta-vermelho">🚨 Você não está conseguindo guardar dinheiro. Precisa reduzir gastos!</p>';
  }

  html += "<hr>";

  // 2. Prioridades pendentes
  if (altaNaoPagos.length > 0) {
    html += "<p><strong>🔴 Prioridade Alta (Pague já!):</strong></p><ul>";
    for (let i = 0; i < altaNaoPagos.length; i++) {
      html +=
        "<li>" +
        altaNaoPagos[i].nome +
        " - R$ " +
        altaNaoPagos[i].valor.toFixed(2) +
        "</li>";
    }
    html += "</ul>";
  }

  if (mediaNaoPagos.length > 0) {
    html += "<p><strong>🟡 Prioridade Média (Atenção):</strong></p><ul>";
    for (let i = 0; i < mediaNaoPagos.length; i++) {
      html +=
        "<li>" +
        mediaNaoPagos[i].nome +
        " - R$ " +
        mediaNaoPagos[i].valor.toFixed(2) +
        "</li>";
    }
    html += "</ul>";
  }

  if (baixaNaoPagos.length > 0) {
    let totalBaixa = 0;
    for (let i = 0; i < baixaNaoPagos.length; i++) {
      totalBaixa = totalBaixa + baixaNaoPagos[i].valor;
    }

    html += "<p><strong>🟢 Prioridade Baixa (Pode cortar):</strong></p><ul>";
    for (let i = 0; i < baixaNaoPagos.length; i++) {
      html +=
        "<li>" +
        baixaNaoPagos[i].nome +
        " - R$ " +
        baixaNaoPagos[i].valor.toFixed(2) +
        " 💡</li>";
    }
    html += "</ul>";
    html +=
      '<p style="color: #2b6cb0;">💡 Se cortar os gastos de baixa prioridade, você economiza R$ ' +
      totalBaixa.toFixed(2) +
      " por mês!</p>";
  }

  if (
    altaNaoPagos.length === 0 &&
    mediaNaoPagos.length === 0 &&
    baixaNaoPagos.length === 0
  ) {
    html += '<p style="color: #38a169;">🎉 Todos os gastos estão pagos!</p>';
  }

  html += "<hr>";

  // 3. DICAS DE ECONOMIA (baseadas nos dados)
  html += "<p><strong>💡 Dicas de Economia:</strong></p><ul>";

  if (baixaNaoPagos.length > 0) {
    html += "<li>✂️ Corte os gastos de baixa prioridade</li>";
  }

  if (percentual > 60) {
    html +=
      "<li>🔍 Revise contas fixas (internet, telefone, streaming) - negocie descontos</li>";
  }

  if (sobra < meta) {
    const falta = meta - (sobra > 0 ? sobra : 0);
    html +=
      "<li>🎯 Foco em reduzir R$ " +
      falta.toFixed(2) +
      " para atingir a meta de " +
      PORCENTAGEM_META +
      "%</li>";
  }

  html += "<li>🛒 Pesquise preços antes de comprar (use Google Shopping)</li>";
  html += "<li>🥗 Evite comer fora, leve marmita para o trabalho</li>";
  html +=
    "<li>💡 Economize energia: troque lâmpadas por LED e desligue aparelhos</li>";
  html += "</ul>";

  // 4. OFERTAS
  html += "<p><strong>🔗 Ofertas e Promoções:</strong></p><ul>";
  html += "<li>Mercado Livre: Cupom DESCONTO10 (10% off)</li>";
  html += "<li>Ifood: Use ECONOMIA20 (20% off em restaurantes)</li>";
  html += '<li>Amazon: Seção "Ofertas Relâmpago"</li>';
  html += "<li>Buscapé: Compare preços antes de comprar</li>";
  html += "</ul>";

  // 5. RENDA EXTRA
  html += "<p><strong>🚀 Renda Extra:</strong></p><ul>";
  html += "<li>📱 Venda doces no trabalho ou faculdade</li>";
  html += "<li>🏍️ Faça entregas (Uber Eats, Rappi, iFood)</li>";
  html += "<li>💻 Trabalhe como freelancer (Workana, 99Freelas)</li>";
  html += "<li>👗 Venda roupas usadas no Enjoei ou OLX</li>";
  html += "<li>📚 Dê aulas particulares do que você sabe</li>";
  html += "</ul>";

  html += "<hr>";

  // 6. CHECKLIST
  html += "<p><strong>✅ Checklist do Mês:</strong></p><ul>";
  html += "<li>☐ Pague todos os gastos de prioridade alta</li>";
  html += "<li>☐ Avalie os gastos médios (podem ser reduzidos?)</li>";
  html += "<li>☐ Corte pelo menos um gasto de baixa prioridade</li>";
  html += "<li>☐ Pesquise preços antes de comprar</li>";
  html += "<li>☐ Comece uma atividade de renda extra</li>";
  html += "<li>☐ Acompanhe seu percentual de gastos</li>";
  html +=
    "<li>☐ Atingir a meta de " +
    PORCENTAGEM_META +
    "% da renda (R$ " +
    meta.toFixed(2) +
    ")</li>";
  html += "</ul>";

  conteudo.innerHTML = html;
}
