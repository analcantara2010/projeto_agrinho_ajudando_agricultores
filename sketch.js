
// inputs de formulário
let cropInput, areaInput, dateInput;
let seedPriceInput, fertPriceInput, salePriceInput;

// botões
let submitButton, exportButton;

// lista dos registros do agricultor
let records = [];

// mensagens de erro ou sucesso
let message = "";

// variáveis para "sementes caindo"
let fallingSeeds = [];           // lista de objetos de sementes caindo
let currentSeedType = null;      // tipo de semente  (milho, soja, etc.)
let seedStartTime = 0;           // tempo do início da animação
let seedDuration = 10000;        // duração da chuva (10 segundos)
let seedActive = false;          // flag para ativar e desativar a chuva

//inicio
function setup() {
  createCanvas(800, 600);        // área de desenho
  textFont('Arial');             // fonte que foi usada
  textSize(14);                  // tamanho do texto
  textAlign(LEFT, TOP);          // texto alinhado
  background(245);               // cor do fundo

  createForm();                  // cria o formulário com inputs e botões
}

//função draw
function draw() {
  background(245);               // limpa e redesenha o fundo

  // Se a chuva de sementes estiver ativa e dentro do tempo
  if (seedActive && millis() - seedStartTime < seedDuration) {
    for (let seed of fallingSeeds) {
      seed.update();             // atualiza posição da semente
      seed.display();            // desenha a semente
    }
  }

  drawFormTitle();               // mostra o título
  displayMessage();              // mostra as mensagens ao usuário
  displayRecords();              // lista os registros salvos
  displayStats();                // mostra as estatísticas de área e lucro
}

//formulários e os botões
function createForm() {
  createElement('h2', 'Registro de Plantio - Agricultor Conectado');

  // campos de entrada
  cropInput = createInput().attribute('placeholder', 'Nome da cultura (ex: Milho)');
  areaInput = createInput().attribute('placeholder', 'Área plantada (hectares)');
  dateInput = createInput().attribute('placeholder', 'Data de plantio (ex: 23/04/2025)');
  seedPriceInput = createInput().attribute('placeholder', 'Preço da semente por ha (R$)');
  fertPriceInput = createInput().attribute('placeholder', 'Preço do fertilizante por ha (R$)');
  salePriceInput = createInput().attribute('placeholder', 'Valor de venda por ha (R$)');

  // botões
  submitButton = createButton('Salvar Registro');
  exportButton = createButton('Exportar Dados');

  // agrupa inputs e botões para aplicar os estilos
  let inputs = [
    cropInput, areaInput, dateInput,
    seedPriceInput, fertPriceInput, salePriceInput,
    submitButton, exportButton
  ];

  // estilo dos inputs
  for (let input of inputs) {
    input.style('margin', '5px');
    input.style('padding', '6px');
    input.style('font-size', '14px');
  }

  // define as ações dos botões
  submitButton.mousePressed(handleSubmit);   // quando clicar em "Salvar Registro"
  exportButton.mousePressed(exportData);     // quando clicar em "Exportar Dados"

  createElement('hr'); // separar linha
}

// título da seção
function drawFormTitle() {
  fill(50);
  textSize(16);
  text("Registros do Agricultor", 20, 200);
}

// mostra as mensagens de erro ou sucesso
function displayMessage() {
  fill(message.includes("⚠️") ? 'red' : 'green');
  textSize(14);
  text(message, 20, 230);
}

// para salvar os registros
function handleSubmit() {
  // lê os dados do formulário
  let crop = cropInput.value().trim();
  let area = parseFloat(areaInput.value());
  let dateStr = dateInput.value().trim();
  let dateObj = parseBrazilianDate(dateStr);

  let seedPrice = parseFloat(seedPriceInput.value());
  let fertPrice = parseFloat(fertPriceInput.value());
  let salePrice = parseFloat(salePriceInput.value());

  // verifica se todos os dados estão preenchidos corretamente
  if (!crop || isNaN(area) || !dateObj ||
      isNaN(seedPrice) || isNaN(fertPrice) || isNaN(salePrice)) {
    message = "⚠️ Preencha todos os campos corretamente!";
    return;
  }

  // calcula os lucros com base nos dados preenchidos
  let custoPorHectare = seedPrice + fertPrice;
  let lucroPorHectare = salePrice - custoPorHectare;
  let lucroTotal = lucroPorHectare * area;

  // adiciona novo registro ao array
  records.push({
    crop,
    area,
    date: dateObj,
    dateStr,
    lucroTotal
  });

  sortRecordsByDate(); // arruma por data

  // limpa os campos do formulário
  cropInput.value('');
  areaInput.value('');
  dateInput.value('');
  seedPriceInput.value('');
  fertPriceInput.value('');
  salePriceInput.value('');
  message = "✅ Registro salvo com sucesso!";

  // inicia a animação da semente correspondente
  let type = getSeedType(crop);
  startSeedRain(type);
}

//arruma a data para (dd/mm/aaaa)
function parseBrazilianDate(dateStr) {
  let parts = dateStr.split('/');
  if (parts.length === 3) {
    let day = parseInt(parts[0]);
    let month = parseInt(parts[1]) - 1;
    let year = parseInt(parts[2]);
    let date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

//arruma os registros por data
// =======================
function sortRecordsByDate() {
  records.sort((a, b) => b.date - a.date); // os mais recentes por primeiro
}

//identifica o tipo de semente 
function getSeedType(crop) {
  let lower = crop.toLowerCase();
  if (lower.includes("milho")) return "milho";
  if (lower.includes("soja")) return "soja";
  if (lower.includes("trigo")) return "trigo";
  if (lower.includes("feijão") || lower.includes("feijao")) return "feijao";
  return "outro"; // genérico
}

//exibe na tela
function displayRecords() {
  let y = 260;
  for (let rec of records) {
    fill(0);
    text(`• ${rec.crop} | ${rec.area} ha | Plantado em: ${rec.dateStr} | Lucro: R$ ${rec.lucroTotal.toFixed(2)}`, 20, y);
    y += 20;
  }
}

//exibe o final
function displayStats() {
  let totalArea = 0;
  let totalLucro = 0;

  for (let rec of records) {
    totalArea += rec.area;
    totalLucro += rec.lucroTotal;
  }

  fill(30, 100, 30);
  textSize(14);
  text(`Área total plantada: ${totalArea.toFixed(2)} hectares`, 20, height - 60);
  text(`Lucro total estimado: R$ ${totalLucro.toFixed(2)}`, 20, height - 40);
}

///exporta os dados em csv para o computador
function exportData() {
  let data = ["Cultura,Área (ha),Data,Lucro (R$)"];
  for (let rec of records) {
    data.push(`${rec.crop},${rec.area},${rec.dateStr},${rec.lucroTotal.toFixed(2)}`);
  }
  saveStrings(data, 'registros_agricolas.csv');
}

//começa as "sementes caindo"
function startSeedRain(type) {
  currentSeedType = type;
  seedStartTime = millis(); // momento do inicio
  seedActive = true;
  fallingSeeds = []; // limpa as sementes anterior

  // cria 30 sementes com posições e velocidades aleatórias
  for (let i = 0; i < 30; i++) {
    fallingSeeds.push(new SeedDrop(random(width), random(-200, 0), type));
  }
}

//define cada semente na animação
class SeedDrop {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = random(10, 18);
    this.speed = random(1, 2.5);
  }

  update() {
    this.y += this.speed; // move para baixo
    if (this.y > height) {
      this.y = random(-100, -20); // reinicia lá em cima
      this.x = random(width);
    }
  }

  display() {
    noStroke();
    switch (this.type) {
      case 'milho':
        fill(255, 215, 0); // semente amarela
        ellipse(this.x, this.y, this.size, this.size * 1.5);
        break;
      case 'soja':
        fill(100, 200, 100); // semente verde claro
        ellipse(this.x, this.y, this.size);
        break;
      case 'trigo':
        fill(222, 184, 135); // semente bege
        beginShape();
        vertex(this.x, this.y);
        vertex(this.x + this.size / 2, this.y + this.size);
        vertex(this.x, this.y + this.size * 1.5);
        vertex(this.x - this.size / 2, this.y + this.size);
        endShape(CLOSE);
        break;
      case 'feijao':
        fill(139, 69, 19); // semente marrom
        ellipse(this.x, this.y, this.size + 2, this.size);
        fill(80, 40, 0); // Olhinho escuro
        ellipse(this.x + 2, this.y, 3, 3);
        break;
      default:
        fill(120); // cinza para as sementes desconhecidas
        ellipse(this.x, this.y, this.size);
    }
  }
}