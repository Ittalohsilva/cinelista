// ===== DADOS =====
// Cada filme é um objeto; a biblioteca é um array de objetos.
let filmes = [
  { id: 1, titulo: "Interestelar", genero: "Ficção científica", ano: 2014, nota: 8.7, assistido: true, favorito: true },
  { id: 2, titulo: "Parasita", genero: "Drama", ano: 2019, nota: 8.5, assistido: true, favorito: false },
  { id: 3, titulo: "Os Incríveis", genero: "Animação", ano: 2004, nota: 8.0, assistido: false, favorito: true },
  { id: 4, titulo: "Mad Max: Estrada da Fúria", genero: "Ação", ano: 2015, nota: 8.1, assistido: false, favorito: false },
  { id: 5, titulo: "Superbad", genero: "Comédia", ano: 2007, nota: 7.6, assistido: true, favorito: false },
  { id: 6, titulo: "O Iluminado", genero: "Terror", ano: 1980, nota: 8.4, assistido: false, favorito: false },
  { id: 7, titulo: "Cidade de Deus", genero: "Drama", ano: 2002, nota: 8.6, assistido: false, favorito: true },
  { id: 8, titulo: "Divertida Mente", genero: "Animação", ano: 2015, nota: 8.1, assistido: true, favorito: false }
];

let proximoId = 9;
const anoAtual = new Date().getFullYear();

// Gêneros e a cor do "pôster" de cada um
const coresGenero = {
  "Ação": "#b3412e",
  "Comédia": "#a86a00",
  "Drama": "#3b4f9a",
  "Ficção científica": "#1d6f7a",
  "Terror": "#5b2a6e",
  "Animação": "#2f7d4a"
};
const generos = Object.keys(coresGenero);

// ===== ELEMENTOS DO DOM =====
const formFilme = document.getElementById("form-filme");
const inputTitulo = document.getElementById("titulo");
const selectGenero = document.getElementById("genero");
const inputAno = document.getElementById("ano");
const inputNota = document.getElementById("nota");
const erroForm = document.getElementById("erro-form");

const inputBusca = document.getElementById("busca");
const filtroGenero = document.getElementById("filtro-genero");
const filtroStatus = document.getElementById("filtro-status");

const listaFilmes = document.getElementById("lista-filmes");
const contador = document.getElementById("contador");
const aviso = document.getElementById("aviso");
const vazio = document.getElementById("vazio");

// ===== FUNÇÕES AUXILIARES =====

// Cria um elemento com classe e texto (textContent evita injetar HTML digitado pelo usuário)
function criarElemento(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) {
    el.className = classe;
  }
  if (texto) {
    el.textContent = texto;
  }
  return el;
}

// Preenche um <select> com a lista de gêneros
function preencherGeneros(select, incluirTodos) {
  if (incluirTodos) {
    const opcaoTodos = criarElemento("option", "", "Todos os gêneros");
    opcaoTodos.value = "todos";
    select.appendChild(opcaoTodos);
  }
  generos.forEach(function (genero) {
    const opcao = criarElemento("option", "", genero);
    opcao.value = genero;
    select.appendChild(opcao);
  });
}

// Decide se um filme aparece, de acordo com busca, gênero e situação
function filmePassaNosFiltros(filme) {
  const textoBusca = semAcentos(inputBusca.value.trim());

  if (textoBusca !== "" && !semAcentos(filme.titulo).includes(textoBusca)) {
    return false;
  }
  if (filtroGenero.value !== "todos" && filme.genero !== filtroGenero.value) {
    return false;
  }
  if (filtroStatus.value === "assistidos" && !filme.assistido) {
    return false;
  }
  if (filtroStatus.value === "para-assistir" && filme.assistido) {
    return false;
  }
  if (filtroStatus.value === "favoritos" && !filme.favorito) {
    return false;
  }
  return true;
}

// Tira acentos e deixa tudo minúsculo, para "incriveis" achar "Os Incríveis"
function semAcentos(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function formatarNota(nota) {
  return nota.toFixed(1).replace(".", ",");
}

// ===== RENDERIZAÇÃO =====

// Monta o card de um filme
function criarCard(filme) {
  const li = criarElemento("li", "filme");

  const poster = criarElemento("div", "poster", filme.titulo.charAt(0).toUpperCase());
  poster.style.setProperty("--cor", coresGenero[filme.genero]);
  poster.setAttribute("aria-hidden", "true");
  if (filme.assistido) {
    poster.appendChild(criarElemento("span", "selo-visto", "Visto"));
  }

  const corpo = criarElemento("div", "filme-corpo");
  corpo.appendChild(criarElemento("h3", "filme-titulo", filme.titulo));
  corpo.appendChild(
    criarElemento("p", "filme-info", filme.genero + " · " + filme.ano + " · Nota " + formatarNota(filme.nota))
  );

  const acoes = criarElemento("div", "filme-acoes");

  const btnVisto = criarElemento("button", "btn-acao", filme.assistido ? "Já assisti" : "Marcar como visto");
  btnVisto.type = "button";
  btnVisto.dataset.id = filme.id;
  btnVisto.dataset.acao = "visto";
  btnVisto.setAttribute("aria-pressed", String(filme.assistido));
  btnVisto.addEventListener("click", function () {
    alternarAssistido(filme.id);
  });

  const btnFav = criarElemento("button", "btn-acao", filme.favorito ? "★ Favorito" : "☆ Favoritar");
  btnFav.type = "button";
  btnFav.dataset.id = filme.id;
  btnFav.dataset.acao = "favorito";
  btnFav.setAttribute("aria-pressed", String(filme.favorito));
  btnFav.addEventListener("click", function () {
    alternarFavorito(filme.id);
  });

  const btnRemover = criarElemento("button", "btn-acao remover", "Remover");
  btnRemover.type = "button";
  btnRemover.setAttribute("aria-label", "Remover " + filme.titulo);
  btnRemover.addEventListener("click", function () {
    removerFilme(filme.id);
  });

  acoes.appendChild(btnVisto);
  acoes.appendChild(btnFav);
  acoes.appendChild(btnRemover);

  corpo.appendChild(acoes);
  li.appendChild(poster);
  li.appendChild(corpo);
  return li;
}

// Redesenha a lista inteira a partir do array e dos filtros
function renderizar() {
  listaFilmes.innerHTML = "";

  const visiveis = filmes.filter(filmePassaNosFiltros);
  visiveis.forEach(function (filme) {
    listaFilmes.appendChild(criarCard(filme));
  });

  contador.textContent = "Mostrando " + visiveis.length + " de " + filmes.length + " filmes";

  if (filmes.length === 0) {
    vazio.textContent = "Sua biblioteca está vazia. Adicione um filme no formulário.";
  } else if (visiveis.length === 0) {
    vazio.textContent = "Nenhum filme encontrado com esses filtros.";
  } else {
    vazio.textContent = "";
  }
}

// ===== AÇÕES =====

function mostrarErro(texto) {
  erroForm.textContent = texto;
}

function adicionarFilme(event) {
  event.preventDefault();

  const titulo = inputTitulo.value.trim();
  const ano = Number(inputAno.value);
  const nota = Number(inputNota.value);

  // Validações: cada uma explica o problema para o usuário
  if (titulo === "") {
    mostrarErro("Digite o título do filme.");
    inputTitulo.focus();
    return;
  }
  if (inputAno.value === "" || !Number.isInteger(ano) || ano < 1888 || ano > anoAtual + 1) {
    mostrarErro("Informe um ano válido, entre 1888 e " + (anoAtual + 1) + ".");
    inputAno.focus();
    return;
  }
  if (inputNota.value === "" || nota < 0 || nota > 10) {
    mostrarErro("Informe uma nota entre 0 e 10.");
    inputNota.focus();
    return;
  }

  const jaExiste = filmes.some(function (f) {
    return semAcentos(f.titulo) === semAcentos(titulo) && f.ano === ano;
  });
  if (jaExiste) {
    mostrarErro("Esse filme já está na biblioteca.");
    inputTitulo.focus();
    return;
  }

  filmes.push({
    id: proximoId,
    titulo: titulo,
    genero: selectGenero.value,
    ano: ano,
    nota: nota,
    assistido: false,
    favorito: false
  });
  proximoId = proximoId + 1;

  // Limpa filtros para o filme novo não ficar escondido
  inputBusca.value = "";
  filtroGenero.value = "todos";
  filtroStatus.value = "todos";

  formFilme.reset();
  mostrarErro("");
  aviso.textContent = '"' + titulo + '" foi adicionado à biblioteca.';
  inputTitulo.focus();
  renderizar();
}

function buscarFilme(id) {
  return filmes.find(function (f) {
    return f.id === id;
  });
}

// Como renderizar() recria os botões, o foco do teclado se perde.
// Esta função devolve o foco ao botão que a pessoa tinha acabado de usar.
function devolverFoco(id, acao) {
  const botao = document.querySelector('button[data-id="' + id + '"][data-acao="' + acao + '"]');
  if (botao) {
    botao.focus();
  }
}

function alternarAssistido(id) {
  const filme = buscarFilme(id);
  filme.assistido = !filme.assistido;
  aviso.textContent = "";
  renderizar();
  devolverFoco(id, "visto");
}

function alternarFavorito(id) {
  const filme = buscarFilme(id);
  filme.favorito = !filme.favorito;
  aviso.textContent = "";
  renderizar();
  devolverFoco(id, "favorito");
}

function removerFilme(id) {
  const filme = buscarFilme(id);
  if (!confirm('Remover "' + filme.titulo + '" da biblioteca?')) {
    return;
  }
  filmes = filmes.filter(function (f) {
    return f.id !== id;
  });
  aviso.textContent = '"' + filme.titulo + '" foi removido.';
  renderizar();
}

// ===== EVENTOS =====
formFilme.addEventListener("submit", adicionarFilme);
formFilme.addEventListener("input", function () {
  mostrarErro("");
});
inputBusca.addEventListener("input", renderizar);
filtroGenero.addEventListener("change", renderizar);
filtroStatus.addEventListener("change", renderizar);

// ===== INÍCIO =====
preencherGeneros(selectGenero, false);
preencherGeneros(filtroGenero, true);
renderizar();
