# DESIGN.md --- Software & Soluções

## 1. Identidade da marca

**Nome:** Software & Soluções

**Sigla / símbolo:** **SS**, representada por dois "S" estilizados e
interligados.

**Conceito:** tecnologia, integração, desenvolvimento de software e
soluções digitais. O símbolo combina dois "S" em uma construção
geométrica única, transmitindo conexão entre software e soluções.

------------------------------------------------------------------------

## 2. Paleta de cores

A identidade visual utiliza a paleta apresentada no arquivo de
referência:

  -----------------------------------------------------------------------
  Cor               HEX               RGB               Uso sugerido
  ----------------- ----------------- ----------------- -----------------
  Vermelho          `#D73220`         `215, 50, 32`     Destaques,
                                                        "Software",
                                                        elementos de ação

  Creme             `#F9ECE5`         `249, 236, 229`   Fundo, detalhes e
                                                        áreas de respiro

  Vinho / Marrom    `#68150A`         `104, 21, 10`     Variações
  escuro                                                institucionais e
                                                        contraste

  Azul              `#0B78B3`         `11, 120, 179`    Tecnologia,
                                                        informação e
                                                        interfaces

  Roxo profundo     `#1F0062`         `31, 0, 98`       "Soluções",
                                                        símbolo e
                                                        elementos
                                                        institucionais
  -----------------------------------------------------------------------

### Combinação principal da logo

-   **Vermelho `#D73220`** → primeiro "S" e a palavra **Software**
-   **Roxo `#1F0062`** → segundo "S" e a palavra **Soluções**
-   **Creme `#F9ECE5`** → elemento central de conexão e detalhes
-   **Branco** → fundo preferencial

As cores `#68150A` e `#0B78B3` funcionam como cores secundárias da
identidade e podem ser usadas em aplicações digitais, materiais
institucionais e versões alternativas.

------------------------------------------------------------------------

## 3. Tipografia

### Fonte principal

**Poppins --- Google Fonts**

A Poppins deve ser utilizada como tipografia principal da marca por seu
desenho geométrico, moderno e adequado a uma empresa de tecnologia.

### Pesos sugeridos

-   **Poppins Bold (700):** nome da marca e títulos
-   **Poppins SemiBold (600):** subtítulos e chamadas
-   **Poppins Medium (500):** textos de apoio
-   **Poppins Regular (400):** textos corridos

### Tratamento do nome

**Software & Soluções**

-   "Software" em `#D73220`
-   "&" em `#F9ECE5` ou `#D73220`, conforme o fundo
-   "Soluções" em `#1F0062`

Manter o acento de **Soluções**.

------------------------------------------------------------------------

## 4. Conceito do logotipo

### Símbolo

O símbolo principal é formado por dois **S** geométricos:

``` text
      SSSSS       SSSSS
    SS           SS
   SS           SS
    SSS        SS
      SSS    SS
         SS
      SS    SSS
    SS        SSS
   SS           SS
   SSSSS       SSSSS
```

A representação final deve ser limpa e vetorial, com os dois "S"
visualmente conectados.

### Elemento central

Um pequeno elemento em **creme `#F9ECE5`** pode funcionar como ponto de
ligação entre os dois "S", reforçando a ideia de integração.

### Assinatura

A composição principal é:

**\[símbolo SS\]**

**Software & Soluções**

O símbolo deve funcionar também de forma independente, especialmente
para:

-   favicon;
-   ícone de aplicativo;
-   foto de perfil;
-   avatar;
-   assinatura digital;
-   marca d'água;
-   ícone de sistema.

------------------------------------------------------------------------

## 5. Direção visual

A estética deve ser:

-   moderna;
-   tecnológica;
-   profissional;
-   limpa;
-   geométrica;
-   memorável;
-   com boa leitura em tamanhos pequenos.

Evitar:

-   excesso de efeitos;
-   sombras pesadas;
-   gradientes complexos;
-   excesso de elementos decorativos;
-   tipografias serifadas;
-   aparência excessivamente informal.

A preferência é por uma **logo flat/vector**, com formas sólidas e boa
reprodução tanto em tela quanto em impressão.

------------------------------------------------------------------------

## 6. Versões recomendadas

### Versão principal

Fundo branco:

**SS** em vermelho + roxo profundo, com detalhe creme.

Texto:

**Software & Soluções**

com "Software" em vermelho e "Soluções" em roxo profundo.

### Versão escura

Aplicação sobre fundo `#1F0062` ou `#68150A`.

Utilizar o símbolo e a tipografia em branco/creme, preservando pequenos
detalhes da paleta.

### Versão monocromática

Uma única cor para situações de:

-   impressão P&B;
-   carimbo;
-   documentos;
-   gravação;
-   bordado;
-   aplicações técnicas.

------------------------------------------------------------------------

## 7. Área de proteção

Manter uma área livre ao redor do símbolo equivalente, no mínimo, à
altura do elemento central do logotipo.

Nenhum texto, imagem, borda ou outro elemento deve invadir essa área.

------------------------------------------------------------------------

## 8. Redução mínima

Para preservar a legibilidade:

-   **Símbolo:** evitar utilização abaixo de aproximadamente 24 px de
    altura em interfaces digitais.
-   **Logo completa:** evitar tamanhos em que "Software & Soluções"
    deixe de ser perfeitamente legível.

Para aplicações muito pequenas, utilizar somente o símbolo **SS**.

------------------------------------------------------------------------

## 9. Hierarquia da marca

A identidade pode trabalhar com três níveis:

1.  **SS** --- símbolo principal;
2.  **Software & Soluções** --- assinatura completa;
3.  **Software & Soluções \| Tecnologia e desenvolvimento** --- versão
    institucional, quando houver necessidade de descrição complementar.

------------------------------------------------------------------------

## 10. Aplicações

A identidade foi pensada para aplicações como:

-   sistema web;
-   software desktop;
-   aplicativo;
-   site institucional;
-   redes sociais;
-   cartão de visita;
-   papel timbrado;
-   propostas comerciais;
-   contratos;
-   apresentações;
-   documentos PDF;
-   assinatura de e-mail;
-   uniforme;
-   fachada;
-   materiais promocionais.

------------------------------------------------------------------------

## 11. CSS --- variáveis da identidade

``` css
:root {
  --brand-red: #D73220;
  --brand-cream: #F9ECE5;
  --brand-brown: #68150A;
  --brand-blue: #0B78B3;
  --brand-purple: #1F0062;

  --font-brand: "Poppins", sans-serif;
}
```

### Importação da Poppins

``` html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
  rel="stylesheet"
>
```

------------------------------------------------------------------------

## 12. Diretriz para desenvolvimento futuro

Qualquer nova peça visual da **Software & Soluções** deve preservar:

-   a paleta oficial;
-   a Poppins;
-   o conceito do monograma **SS**;
-   a combinação de vermelho + roxo profundo;
-   a estética tecnológica e minimalista;
-   boa legibilidade;
-   consistência entre aplicações.

### Resumo da identidade

> **Software & Soluções**\
> **SS --- Tecnologia conectada a soluções.**

**Cores principais:** `#D73220` + `#1F0062`\
**Cor de apoio:** `#F9ECE5`\
**Cores secundárias:** `#68150A` + `#0B78B3`\
**Tipografia:** Poppins\
**Símbolo:** monograma SS interligado
