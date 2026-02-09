# Aetherium

<div align="center">

![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-success?logo=github)
![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF?logo=vite)
![Tests](https://img.shields.io/badge/Tests-92%20passing-brightgreen?logo=vitest)

**Plataforma completa para o sistema de RPG Spirit and Caos**

[🌐 Demo ao Vivo](https://gaaaybe.github.io/Aetherium/) | [📖 Documentação](#-funcionalidades) | [🐛 Reportar Bug](https://github.com/Gaaaybe/Spirit-and-Caos-system/issues)

</div>

---

## 🎯 Sobre o Projeto

**Aetherium** é uma suite de ferramentas digitais para o sistema de RPG **Spirit and Caos** (inspirado em Mutants & Masterminds). Desenvolvida com foco em usabilidade e precisão, oferece:

- ⚡ **Criador de Poderes** - Motor completo de construção de poderes com 41 efeitos e 123 modificações
- 🐉 **Gerenciador de Criaturas** - Board interativo para controlar NPCs e encontros
- 📚 **Biblioteca de Poderes** - Sistema de salvamento e organização
- 🎭 **Fichas de Personagem** *(em breve)*
- 🎲 **Gerenciador de Campanhas** *(em breve)*

## ✨ Funcionalidades

### ⚡ Criador de Poderes

Sistema completo de construção de poderes com:

- ✅ **41 Efeitos Base** (Dano, Afligir, Ilusão, Teleporte, etc.)
- ✅ **123 Modificações** (Extras e Falhas)
- ✅ Cálculo automático de **PdA, PE e Espaços**
- ✅ Modificações globais e locais
- ✅ Sistema de parâmetros hierárquico
- ✅ Efeitos e modificações customizados
- ✅ Validação em tempo real

#### Sistema de Parâmetros Hierárquico

A arquitetura é baseada em **herança de parâmetros**:

```typescript
// Poder contém múltiplos Efeitos
Poder: "Rajada Flamejante"
├─ Dano (grau 5)        {acao:1, alcance:1, duracao:0}
└─ Afligir (grau 2)     {acao:1, alcance:1, duracao:0}

// Regra: Poder herda o PIOR parâmetro (mais restritivo)
Parâmetros do Poder: {acao:1, alcance:1, duracao:0}

// Override manual aplica-se a TODOS os efeitos
Se mudar Alcance → 2 (À Distância):
  Modificador Global: +1/grau em TODOS os efeitos
```

**Fórmula de Custo:**
```
CustoPorGrau = CustoBase 
             + Σ(Modificações_Globais) 
             + Σ(Modificações_Locais) 
             + ModificadorParametrosGlobal

Custo Mínimo: 1 PdA (sempre)
```

### 🐉 Gerenciador de Criaturas

Board interativo com React Flow para combate tático:

- ✅ Canvas drag & drop com zoom/pan
- ✅ Calculadora de stats por role (Tanque, Artilheiro, Suporte, etc.)
- ✅ Sistema de Boss Mechanics (Soberania)
- ✅ Gerenciamento de HP/PE em tempo real
- ✅ Status de combate (Ativo, Oculto, Derrotado)
- ✅ Biblioteca de criaturas salvas
- ✅ Exportar/Importar JSON

### 📚 Biblioteca de Poderes

Gestão completa de poderes salvos:

- ✅ Busca e filtros avançados
- ✅ Sistema de favoritos
- ✅ Duplicação e edição rápida
- ✅ Exportar/Importar individual ou em lote
- ✅ Persistência local (LocalStorage)
- ✅ Sistema de versionamento (hydration)

### 🎨 Experiência do Usuário

- ✅ **Interface Responsiva** - Mobile e desktop otimizados
- ✅ **Tema Claro/Escuro** - Alternância automática/manual
- ✅ **Atalhos de Teclado** - Ctrl+S (salvar), Ctrl+N (novo), etc.
- ✅ **Page Transitions** - Animações suaves entre rotas
- ✅ **Toast System** - Feedback visual consistente
- ✅ **Empty States** - Guias para começar

## 🚀 Tecnologias

- **React 19.2.0** - Framework UI moderno
- **TypeScript 5.9.3** - Tipagem estática robusta
- **Vite 7.2.2** (Rolldown) - Build ultrarrápido
- **Tailwind CSS 3.4** - Estilização utility-first
- **React Router 7.9** - Navegação SPA
- **React Flow 11.11** - Canvas interativo de criaturas
- **Zod 4.1** - Validação de schemas
- **Vitest 4.0** - Framework de testes (92 testes passando)

## 📂 Estrutura do Projeto
                     # Base de dados JSON
│   ├── efeitos.json          # 41 efeitos base
│   ├── modificacoes.json     # 123 modificações
│   ├── escalas.json          # Escalas de parâmetros
│   └── tabelaUniversal.json  # 20 graus de poder
├── features/
│   ├── criador-de-poder/
│   │   ├── components/       # UI do criador
│   │   ├── hooks/            # Lógica de negócio
│   │   ├── regras/           # Motor de cálculo
│   │   ├── schemas/          # Validação Zod
│   │   └── utils/            # Hydration e helpers
│   └── gerenciador-criaturas/
│       ├─eçando

### Pré-requisitos

- Node.js 18+ e npm/pnpm/yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Gaaaybe/Spirit-and-Caos-system.git
cd Spirit-and-Caos-system

# Instale dependências
npm install

# Inicie servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:5173`

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Verificar código
npm test             # Rodar testes
npm test:ui          # Interface visual de testes
npm test:coverage    # Relatório de cobertura
```

### Build para Produção

```🧪 Testes

O projeto possui **92 testes** cobrindo:

- ✅ Validação de estrutura de dados (efeitos.json, modificacoes.json)
- ✅ Motor de cálculo de custos (100% das regras testadas)
- ✅ Sistema de hydration (migrações de versão)
- ✅ Casos extremos e edge cases
- ✅ Componentes UI críticos

```bash
# Rodar todos os testes
npm test

# Modo watch (desenvolvimento)
npm test -- --watch

# Interface visual
npm test:ui
```

## 🌐 Deploy

### GitHub Pages (Automático)

O projeto está configurado para **deploy automático**:

- ✅ Push no `master` → CI/CD executa testes → Deploy
- ✅ Build otimizado com Vite
- 🌐 **Produção:** [gaaaybe.github.io/Aetherium](https://gaaaybe.github.io/Aetherium/)

**Configuração manual (primeira vez):**
1. Vá em **Settings** → **Pages** no GitHub
2. Em **Source**, selecione **GitHub Actions**
3. Faça push no master e aguarde (~2 min)

## ⌨️ Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| `Ctrl/⌘ + S` | Salvar poder |
| `Ctrl/⌘ + N` | Novo poder |
| `Ctrl/⌘ + B` | Abrir biblioteca |
| `Ctrl/⌘ + E` | Adicionar efeito |
| `Ctrl/⌘ + M` | Adicionar modificação |
| `Ctrl/⌘ + R` | Ver resumo |
| `Esc` | Fechar modal |
| `?` | Mostrar ajuda |

## 📖 Documentação

### Base de Dados

- **41 Efeitos** - De Afligir a Voo
- **123 Modificações** - Extras (aumentam custo) e Falhas (reduzem custo)
- **20 Graus de Poder** - Tabela Universal com progressão balanceada
- **3 Escalas de Parâmetros** - Ação, Alcance, Duração

### Regras de Negócio

#### RN-01: Herança de Parâmetros
O Poder herda o **pior** (mais restritivo) parâmetro entre seus efeitos.

#### RN-02: Override Global
Modificar parâmetros do Poder aplica a **todos** os efeitos.

## 📊 Status do Projeto

![GitHub last commit](https://img.shields.io/github/last-commit/Gaaaybe/Spirit-and-Caos-system)
![GitHub issues](https://img.shields.io/github/issues/Gaaaybe/Spirit-and-Caos-system)
![GitHub stars](https://img.shields.io/github/stars/Gaaaybe/Spirit-and-Caos-system)

---

<div align="center">

**Versão:** 1.0.0  
**Última atualização:** 24 de janeiro de 2026

Desenvolvido com ⚡ por [Gaaaybe](https://github.com/Gaaaybe)

</div>

#### RN-04: Custo Mínimo
Todo poder custa **no mínimo 1 PdA**, independente de falhas.

#### RN-05: PE de Ativação
```
PE = max(1, CustoPdATotal / 2)
```

## 🗺️ Roadmap

### ✅ Concluído (v1.0)
- [x] Criador de Poderes funcional
- [x] Gerenciador de Criaturas com board interativo
- [x] Biblioteca de Poderes
- [x] Sistema de hydration e versionamento
- [x] 92 testes automatizados
- [x] Landing page e navegação
- [x] Tema claro/escuro
- [x] Deploy automático

### 🚧 Em Desenvolvimento (v1.1)
- [ ] Fichas de Personagem completas
- [ ] Sistema de Campanhas
- [ ] Tutorial interativo (onboarding)
- [ ] Configuração de coverage de testes

### 🔮 Futuro (v2.0+)
- [ ] Backend + persistência na nuvem
- [ ] Sistema de contas de usuário
- [ ] Chat em tempo real para jogadores
- [ ] Sistema de rolagem de dados
- [ ] Templates de poderes populares
- [ ] App mobile (React Native)

## 🤝 Contribuindo

Contribuições são bem-vindas! Para mudanças importantes:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Convenções

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **Code Style:** ESLint + Prettier (automático)
- **Testes:** Adicione testes para novas features

### RN-06: Modificadores de Parâmetros
```
Modificador = ParametroAtual - ParametroPadrão
- Valor positivo = parâmetro melhorado = custo AUMENTA
- Valor negativo = parâmetro piorado = custo DIMINUI
```

## 🎨 Funcionalidades

- ✅ Criação de poderes com múltiplos efeitos
- ✅ Cálculo automático de custos (PdA, PE, Espaços)
- ✅ Sistema de parâmetros hierárquico
- ✅ Modificações globais e locais
- ✅ Biblioteca de poderes salvos
- ✅ Exportação/importação JSON
- ✅ Interface responsiva (mobile + desktop)
- ✅ Tema claro/escuro

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

---

**Versão:** 1.0.0  
**Última atualização:** 16 de novembro de 2025
