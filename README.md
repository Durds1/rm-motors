# RM Motors

Site da RM Motors, loja de carros seminovos em Catalão-GO (Rua L-1, 2.440, Bairro JK).

**Ver o site:** https://durds1.github.io/rm-motors/

## O que tem

- Estoque com fotos reais, ano, quilometragem, câmbio e preço, com filtros por tipo e faixa de preço
- Detalhes de cada carro com link próprio, parcela estimada e botão de interesse no WhatsApp
- Simulador de financiamento que envia a simulação pelo WhatsApp
- Formulário de troca ou encomenda, que abre o WhatsApp com a mensagem pronta
- Endereço, horário, mapa, contatos e perguntas frequentes
- Tema claro e escuro

## Como atualizar o estoque

Tudo fica em [`js/estoque.js`](js/estoque.js). As instruções estão no topo do arquivo:

1. Salve a foto do carro em `img/carros/` (de preferência quadrada, 1200 x 1200 px).
2. Copie um bloco de carro, cole no início da lista e troque os dados.
3. Para tirar um carro vendido, apague o bloco dele.

O site é HTML, CSS e JavaScript puros, sem instalação. Para ver no computador, basta abrir o `index.html`.
