
Estou desenvolvendo um TCC em grupo do curso técnico de Desenvolvimento de Sistemas (ensino médio). O projeto já está definido e NÃO quero sugestões de novas ideias — apenas aprofundar e desenvolver essa ideia.

## 📌 Nome do projeto

**Veridion**

## 🎯 Ideia principal

Criar uma **extensão de navegador** que analisa automaticamente a confiabilidade de sites e conteúdos da internet, ajudando o usuário a identificar:

* Fake news
* Golpes
* Sites maliciosos
* Empresas não confiáveis
* Conteúdos manipulativos
* Imagens geradas por IA

O sistema gera um **Trust Score (pontuação de confiabilidade)**.

---

## 🧠 Como o sistema funciona

A extensão coleta dados da página e envia para um backend que realiza análises em múltiplas camadas:

### 🔎 1. Análise técnica

* HTTPS
* Idade do domínio
* Dados públicos (ex: CNPJ)

### 🤖 2. Análise por IA

* Linguagem sensacionalista
* Padrões de fake news
* Conteúdo manipulativo

### 🖼️ 3. Análise de imagens

* Possível geração por IA
* Indícios de manipulação

### 🛒 4. Reputação

* Avaliações de empresas
* Dados externos (ex: reputação de marketplaces)

### 👥 5. Sistema comunitário

* Usuários podem votar:

  * confiável
  * suspeito
  * golpe
* Comentários e relatos

---

## ⭐ Diferenciais do projeto

### 1. Trust Breakdown (explicação do score)

O sistema mostra **por que** o site recebeu aquela pontuação.

Exemplo:

* Domínio antigo (+)
* HTTPS válido (+)
* Usuários confiam (+)
* Relatos de fake news (-)
* Conteúdo suspeito (-)

---

### 2. Web Consensus (comparação com outras fontes)

O sistema verifica se a informação aparece em outras fontes confiáveis.

Exemplo:

* 6 fontes confirmam
* 2 fontes divergem

Ou alerta:

* Informação não encontrada em outras fontes

---

## 🧩 Stack definida

### Frontend (extensão)

* Javascript
* CSS
* html
* Manifest V3

### Backend

* Node.js
* Express
* TypeScript

### Banco

* PostgreSQL
* Redis (cache)

### IA

* API de modelo de linguagem (ou microserviço em Python)

### Infraestrutura

* Docker
* VPS Linux
* Nginx

---

## 🏗️ Arquitetura

Extensão → API → Banco + IA → cálculo de score → retorno

---

## 🔐 Minha função no projeto

Sou responsável por:

* Backend
* Segurança

---

## 🛡️ Segurança planejada

* Rate limiting
* Validação de inputs
* Helmet
* CORS controlado
* Sistema anti-spam de votos
* Possível sistema de reputação de usuários

---

## 📊 Funcionalidades principais da API

* POST /analyze → analisa site
* POST /vote → voto do usuário
* POST /report → reportar problema
* GET /domain → dados do domínio

---

## 🧮 Trust Score (base)

Combinação de:

* IA
* comunidade
* reputação
* fatores técnicos

---

## 🎤 Contexto adicional

* Já fiz apresentação em dupla
* Já temos slides prontos
* Já fizemos pesquisa de campo
* Projeto precisa parecer profissional e inovador (nível startup)

---

## ⚠️ Instruções importantes

* NÃO sugerir novas ideias de projeto
* Focar em melhorar, desenvolver e estruturar o Veridon
* Respostas devem ser claras, práticas e aplicáveis
* Priorizar backend, segurança, arquitetura e implementação
