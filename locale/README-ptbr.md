
# [GrapesJS](http://grapesjs.com)

[![Status de Construção](https://github.com/artf/grapesjs/actions/workflows/build.yml/badge.svg)](https://github.com/artf/grapesjs/actions)
[![Chat](https://img.shields.io/badge/chat-discord-7289da.svg)](https://discord.gg/QAbgGXq)
[![CDNJS](https://img.shields.io/cdnjs/v/grapesjs.svg)](https://cdnjs.com/libraries/grapesjs)
[![npm](https://img.shields.io/npm/v/grapesjs.svg)](https://www.npmjs.com/package/grapesjs)


<p align="center"><<img src="http://grapesjs.com/img/grapesjs-front-page-m.jpg" alt="GrapesJS" width="500" align="center"/></p>


GrapesJS é um Web Builder Framework gratuito e de código aberto que ajuda a construir modelos HTML, mais rápida e facilmente, para ser entregue em sites, boletins informativos ou aplicativos móveis. Principalmente, o GrapesJS foi projetado para ser usado dentro de um [CMS] para acelerar a criação de templates dinâmicos. Para entender melhor este conceito, verifique a imagem abaixo

<br/>
<p align="center"><img src="http://grapesjs.com/img/gjs-concept.png" alt="GrapesJS - Style Manager" height="400" align="center"/></p>
<br/>

Geralmente qualquer 'sistema de template', que você encontrará em várias aplicações como CMS, é composto pela **estrutura** (HTML), **estilo*** (CSS) e **variáveis**, que são então substituídos por outros templates e conteúdos no lado do servidor e renderizados no cliente.

Esta demonstração mostra exemplos do que é possível alcançar:<br/>
Demonstração da página web - http://grapesjs.com/demo.html<br/>
Demonstração do Boletim Informativo - http://grapesjs.com/demo-newsletter-editor.html<br/>





## Tabela de conteúdo

* [Características](#características)
* [Download](#download)
* [Utilização](#utilização)
* [Desenvolvimento](#desenvolvimento)
* [Documentação](#documentação)
* [API](#api)
* [Testando](#testando)
* [Plugins](#plugins)
* [Suporte](#suporte)
* [Registro de mudanças](https://github.com/artf/grapesjs/releases)
* [Contribuidores](https://github.com/artf/grapesjs/blob/master/CONTRIBUTING.md)
* [Licença](#licença)




## Características

| Blocos | Gerente de Estilo | Gerente de Camadas |
|--|--|--|
|<img src="http://grapesjs.com/img/sc-grapesjs-blocks-prp.jpg" alt="GrapesJS - Block Manager" height="400" align="center"/>|<img src="http://grapesjs.com/img/sc-grapesjs-style-2.jpg" alt="GrapesJS - Style Manager" height="400" align="center"/>|<img src="http://grapesjs.com/img/sc-grapesjs-layers-2.jpg" alt="GrapesJS - Layer Manager" height="400" align="center"/>|

| Visualizador de códigos | Gerente de ativos |
|--|--|
|<img src="http://grapesjs.com/img/sc-grapesjs-code.jpg" alt="GrapesJS - Code Viewer" height="300" align="center"/>|<img src="http://grapesjs.com/img/sc-grapesjs-assets-1.jpg" alt="GrapesJS - Asset Manager" height="250" align="center"/>|

* Armazenamento local e remoto

* Comandos embutidos padrão (basicamente para criar e gerenciar diferentes componentes)





## Download

* CDNs
  * UNPKG (resolve para a versão mais recente)
    * `https://unpkg.com/grapesjs`
    * `https://unpkg.com/grapesjs/dist/css/grapes.min.css`
  * CDNJS (substituir `X.X.X` pela versão atual)
    * `https://cdnjs.cloudflare.com/ajax/libs/grapesjs/X.X.X/grapes.min.js`
    * `https://cdnjs.cloudflare.com/ajax/libs/grapesjs/X.X.X/css/grapes.min.css`
* NPM
  * `npm i grapesjs`
* GIT
  * `git clone https://github.com/artf/grapesjs.git`

Para a finalidade de desenvolvimento, você deve seguir as instruções abaixo.





## Uso

```html
<link rel="stylesheet" href="path/to/grapes.min.css">
<script src="path/to/grapes.min.js"></script>

<div id="gjs"></div>

<script type="text/javascript">
  var editor = grapesjs.init({
      container : '#gjs',
      components: '<div class="txt-red">Hello world!</div>',
      style: '.txt-red{color: red}',
  });
</script>
```

Para um exemplo mais prático, sugiro que se procure o código dentro desta demonstração: http://grapesjs.com/demo.html


## Desenvolvimento

Clonar o repositório e instalar todas as dependências necessárias (é altamente recomendado)

```sh
$ git clone https://github.com/artf/grapesjs.git
$ cd grapesjs
$ yarn
```

Iniciar o servidor dev

```sh
$ yarn start
```

Uma vez iniciado o servidor de desenvolvimento, você deve ser capaz de chegar à página de demonstração (por exemplo, `http://localhost:8080`)





## Documentação

Confira o guia de iniciação aqui: [Documentação]





## API

As referências API podem ser encontradas aqui: [Referência API]





## Testes

```sh
$ yarn test
```






## Plugins

### Extensões
* [grapejs-plugin-export](https://github.com/artf/grapesjs-plugin-export) - Modelos de exportação de GrapesJS em um arquivo zip
* [grapejs-plugin-filestack](https://github.com/artf/grapesjs-plugin-filestack) - Adicionar o uploader Filestack no Asset Manager
* [grapejs-plugin-ckeditor](https://github.com/artf/grapesjs-plugin-ckeditor) - Substitui o RTE embutido por CKEditor
* [grapesjs-aviary](https://github.com/artf/grapesjs-aviary) - Adicione o Editor Aviary Image (dispensado, use o plugin abaixo em seu lugar)
* [grapesjs-tui-image-editor](https://github.com/artf/grapesjs-tui-image-editor) - GrapesJS TOAST UI Image Editor
* [grapejs-blocks-basic](https://github.com/artf/grapesjs-blocks-basic) - Conjunto básico de blocos
* [grapejs-plugin-forms](https://github.com/artf/grapesjs-plugin-forms) - Conjunto de componentes e blocos de forma
* [grapesjs-navbar](https://github.com/artf/grapesjs-navbar) - Componente simples de navbar
* [contagem regressiva dos componentes da uvajs](https://github.com/artf/grapesjs-component-countdown) - Componente de contagem regressiva simples
* [grapejs-style-gradient](https://github.com/artf/grapesjs-style-gradient) - Adicionar entrada do tipo `gradient` ao Style Manager
* [grapejs-style-filter](https://github.com/artf/grapesjs-style-filter) - Acrescentar entrada do tipo `filtro` ao Style Manager
* [grapejs-style-bg](https://github.com/artf/grapesjs-style-bg) - Tipo de propriedade estilo de fundo Full-stack, com a possibilidade de adicionar imagens, cores e gradientes
* [grapejs-blocks-flexbox](https://github.com/artf/grapesjs-blocks-flexbox) - Adicionar o bloco flexbox
* [grapejs-lory-slider](https://github.com/artf/grapesjs-lory-slider) - Componente deslizante usando [lory](https://github.com/meandmax/lory)
* [grapesjs-tabs](https://github.com/artf/grapesjs-tabs) - Componente de abas simples
* [grapejs-tooltip](https://github.com/artf/grapesjs-tooltip) - Simples, apenas CSS, componente de ponta de ferramenta para GrapesJS
* [grapejs-custom-code](https://github.com/artf/grapesjs-custom-code) - Embutir código personalizado
* [grapesjs-touch](https://github.com/artf/grapesjs-touch) - Habilitar o suporte ao toque
* [grapejs-indexeddb](https://github.com/artf/grapesjs-indexeddb) - Wrapper de armazenamento para IndexedDB
* [grapesjs-firestore](https://github.com/artf/grapesjs-firestore) - Wrapper de armazenamento para [Cloud Firestore](https://firebase.google.com/docs/firestore)
* [grapejs-parser-postcss](https://github.com/artf/grapesjs-parser-postcss) - Analisador CSS personalizado para GrapesJS usando [PostCSS](https://github.com/postcss/postcss)
* [grapejs-typed](https://github.com/artf/grapesjs-typed) - Componente datilografado feito por meio de wrapping da biblioteca Typed.js

### Predefinições
* [grapesjs-preset-webpage](https://github.com/artf/grapesjs-preset-webpage) - Construtor de páginas da Web
* [grapesjs-preset-newsletter](https://github.com/artf/grapesjs-preset-newsletter) - Construtor de boletins informativos
* [grapesjs-mjml](https://github.com/artf/grapesjs-mjml) - Construtor de boletins informativos com componentes MJML


Saiba mais sobre os plugins aqui: [Criando plugins](https://grapesjs.com/docs/modules/Plugins.html)





## Apoio

Se você gosta do projeto e deseja vê-lo crescer, por favor, considere apoiar-nos com uma doação de sua escolha ou torne-se um apoiador/patrocinador através do [Open Collective](https://opencollective.com/grapesjs)

[![PayPalMe](http://grapesjs.com/img/ppme.png)](https://paypal.me/grapesjs)
[![Bitcoin](https://user-images.githubusercontent.com/11614725/52977952-87235f80-33cf-11e9-9607-7a9a354e1155.png)](https://commerce.coinbase.com/checkout/fc90b940-558d-408b-a166-28a823c98173)

<a href="https://opencollective.com/grapesjs"><img src="https://opencollective.com/grapesjs/tiers/sponsors.svg?avatarHeight=64"><</a>
<a href="https://opencollective.com/grapesjs"><img src="https://opencollective.com/grapesjs/tiers/backers.svg?avatarHeight=64"></a>

<br>

[![BrowserStack](https://user-images.githubusercontent.com/11614725/39406324-4ef89c40-4bb5-11e8-809a-113d9432e5a5.png)](https://www.browserstack.com)<br/>
Graças ao [BrowserStack](https://www.browserstack.com) por nos fornecer serviços de teste de navegador


## Licença

BSD 3-clause


[Documentação]: <https://grapesjs.com/docs/>
[API-Reference]: <https://grapesjs.com/docs/api/>
[CMS]: <https://en.wikipedia.org/wiki/Content_management_system>