/*
  ESTOQUE DA RM MOTORS
  --------------------
  Para colocar um carro novo no site:
    1. Salve a foto em img/carros/ (de preferência quadrada, 1200 x 1200 px).
    2. Copie um dos blocos { ... } abaixo, cole no início da lista e troque os dados.
  Para tirar um carro vendido: apague o bloco dele.

  Campos:
    id           nome curto, sem espaços nem acentos (vira o link do carro: site/#carro-id)
    preco, km    só números, sem pontos (ex.: 193900)
    categoria    'Hatch', 'Sedã', 'SUV' ou 'Picape'
    combustivel  pode ficar null se não quiser mostrar
    fipe         valor da tabela Fipe, ou null
    itens        o que o carro tem de bom (aparece nos detalhes)
    destaque     true em UM carro só: ele aparece grande no topo da página
*/
window.ESTOQUE = [
  {
    id: 's10-ltz-2024',
    marca: 'Chevrolet',
    modelo: 'S10',
    versao: 'LTZ 2.8 Diesel 4x4',
    ano: '2023/2024',
    km: 92000,
    cambio: 'Automático',
    combustivel: 'Diesel',
    categoria: 'Picape',
    preco: 193900,
    fipe: null,
    foto: 'img/carros/s10-ltz-2024.jpg',
    itens: ['Pneus novos', 'IPVA 2026 pago'],
    destaque: true
  },
  {
    id: 'tiguan-rline-2019',
    marca: 'Volkswagen',
    modelo: 'Tiguan',
    versao: 'R-Line 2.0 TSI 220 cv',
    ano: '2019/2019',
    km: 88000,
    cambio: 'Automático',
    combustivel: null,
    categoria: 'SUV',
    preco: 130000,
    fipe: 140000,
    foto: 'img/carros/tiguan-rline-2019.jpg',
    itens: ['7 lugares', 'Teto solar panorâmico', 'Painel digital TFT', 'Molas esportivas', 'Pneus novos', 'IPVA 2026 pago']
  },
  {
    id: 'strada-volcano-2024',
    marca: 'Fiat',
    modelo: 'Strada',
    versao: 'Volcano 1.3 Flex',
    ano: '2024/2024',
    km: 132000,
    cambio: 'Automático',
    combustivel: 'Flex',
    categoria: 'Picape',
    preco: 112900,
    fipe: null,
    foto: 'img/carros/strada-vulcano-2024.jpg',
    itens: ['Completa']
  },
  {
    id: 's10-ltz-2014',
    marca: 'Chevrolet',
    modelo: 'S10',
    versao: 'LTZ 2.4 Flex 4x2',
    ano: '2014/2014',
    km: 176000,
    cambio: 'Manual',
    combustivel: 'Flex',
    categoria: 'Picape',
    preco: 90900,
    fipe: null,
    foto: 'img/carros/s10-ltz-2014.jpg',
    itens: ['Rodas aro 20']
  },
  {
    id: 'pulse-drive-2022',
    marca: 'Fiat',
    modelo: 'Pulse',
    versao: 'Drive 1.3 Flex',
    ano: '2021/2022',
    km: 75000,
    cambio: 'Manual',
    combustivel: 'Flex',
    categoria: 'SUV',
    preco: 80900,
    fipe: null,
    foto: 'img/carros/pulse-drive-2022.jpg',
    itens: ['Único dono', 'Todas as revisões na concessionária', 'Sem retoque de pintura', 'IPVA 2026 pago']
  },
  {
    id: 'civic-exl-2011',
    marca: 'Honda',
    modelo: 'Civic',
    versao: 'EXL 1.8',
    ano: '2011/2011',
    km: 129000,
    cambio: 'Automático',
    combustivel: null,
    categoria: 'Sedã',
    preco: 57900,
    fipe: null,
    foto: 'img/carros/civic-exl-2011.jpg',
    itens: ['Segundo dono', 'Manual e chave reserva', 'Recibo verde em mãos', 'Pneus novos', 'IPVA 2026 pago']
  },
  {
    id: 'hb20-2019',
    marca: 'Hyundai',
    modelo: 'HB20',
    versao: '1.0 Flex',
    ano: '2019/2019',
    km: 118000,
    cambio: 'Manual',
    combustivel: 'Flex',
    categoria: 'Hatch',
    preco: 53900,
    fipe: null,
    foto: 'img/carros/hb20-2019.jpg',
    itens: ['Completo', 'Sem passagem por leilão', 'Sem sinistro', 'Pneus novos', 'IPVA 2026 pago']
  },
  {
    id: 'voyage-g6-2015',
    marca: 'Volkswagen',
    modelo: 'Voyage',
    versao: 'G6 1.0 Flex',
    ano: '2014/2015',
    km: 167000,
    cambio: 'Manual',
    combustivel: 'Flex',
    categoria: 'Sedã',
    preco: 39900,
    fipe: null,
    foto: 'img/carros/voyage-g6-2015.jpg',
    itens: ['Direção hidráulica', 'Vidros elétricos', 'Trava e alarme', 'Rodas aro 17', 'Pneus novos', 'IPVA 2026 pago', 'Não tem ar-condicionado']
  },
  {
    id: 'fiesta-2014',
    marca: 'Ford',
    modelo: 'Fiesta',
    versao: '1.0 Flex',
    ano: '2013/2014',
    km: 135000,
    cambio: 'Manual',
    combustivel: 'Flex',
    categoria: 'Hatch',
    preco: 33000,
    fipe: null,
    foto: 'img/carros/fiesta-2014.jpg',
    itens: ['Completo', 'IPVA 2026 pago']
  },
  {
    id: 'ka-2013',
    marca: 'Ford',
    modelo: 'Ka',
    versao: '1.0 Flex',
    ano: '2012/2013',
    km: 132000,
    cambio: 'Manual',
    combustivel: 'Flex',
    categoria: 'Hatch',
    preco: 24900,
    fipe: null,
    foto: 'img/carros/ka-2013.jpg',
    itens: ['Versão básica', 'IPVA 2026 pago']
  },
  {
    id: 'celta-ls-2012',
    marca: 'Chevrolet',
    modelo: 'Celta',
    versao: 'LS 1.0 Flex',
    ano: '2011/2012',
    km: 201000,
    cambio: 'Manual',
    combustivel: 'Flex',
    categoria: 'Hatch',
    preco: 22900,
    fipe: null,
    foto: 'img/carros/celta-ls-2012.jpg',
    itens: ['Pneus novos']
  }
];

window.LOJA = {
  nome: 'RM Motors',
  whatsappLoja: '5564999034679',
  contatos: [
    { nome: 'Loja', fone: '(64) 99903-4679', whatsapp: '5564999034679' },
    { nome: 'Raphael', fone: '(64) 99604-6850', whatsapp: '5564996046850' },
    { nome: 'Maykon', fone: '(64) 99923-3144', whatsapp: '5564999233144' }
  ],
  instagram: 'https://www.instagram.com/rm_motorsgo/'
};
