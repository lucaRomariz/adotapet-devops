# Plano de contribuições — Entrega 1

**Projeto:** AdotaPet — Sistema de adoção responsável de animais  
**Disciplina:** Integração DevOps — Ciência da Computação 2026/2

## Objetivo do Marco 1

Nesta entrega, precisamos demonstrar uma aplicação funcional com interface, banco de dados, testes automatizados, repositório organizado e Integração Contínua (CI) executando no GitHub Actions.

## Organização da equipe

| Integrante | Papel | Contribuição prática |
| --- | --- | --- |
| Luca | DEV | Exibir a data de cadastro de cada animal nos cards da interface. |
| Fernanda | QA / Documentação / Versionamento | Criar testes adicionais e documentar os casos de teste. |
| Miguel | OPS / Infraestrutura | Melhorar o pipeline de CI e configurar os controles do repositório. |

> As contribuições devem ser reais e feitas em branches próprias, com Pull Request. Não serão criados commits apenas para aumentar o histórico.

## 1. Luca — Desenvolvimento

### Tarefa

Exibir em cada card a data em que o animal foi cadastrado. O banco já armazena esse dado no campo `created_at`, então a alteração comprova a integração entre banco, backend e interface.

### Resultado esperado

Cada animal deve mostrar uma informação semelhante a:

```text
Cadastrado em: 08/09/2026
```

### Branch e commit

```bash
git checkout main
git pull origin main
git checkout -b feat/data-cadastro-animal
```

Ao finalizar:

```bash
git add public/app.js
git commit -m "feat: exibe data de cadastro dos animais"
git push -u origin feat/data-cadastro-animal
```

Abra um Pull Request para `main` e solicite a revisão de Fernanda ou Miguel.

## 2. Fernanda — Qualidade, documentação e versionamento

### Tarefa

Ampliar os testes em `test/animals.test.js` e criar `docs/testes.md` com os critérios de validação.

### Casos de teste sugeridos

- idade `0` deve ser aceita;
- idade `30` deve ser aceita;
- idade `31` deve ser rejeitada;
- espécie inválida deve ser rejeitada;
- descrição com menos de 10 caracteres deve ser rejeitada;
- filtro por cidade deve ignorar letras maiúsculas e minúsculas.

### Branch e commits

```bash
git checkout main
git pull origin main
git checkout -b test/validacao-animal
```

```bash
git add test/animals.test.js
git commit -m "test: amplia cobertura das regras de cadastro"
git add docs/testes.md
git commit -m "docs: documenta casos de teste do sistema"
git push -u origin test/validacao-animal
```

Fernanda também revisará os Pull Requests da equipe antes do merge.

## 3. Miguel — Operações e infraestrutura

### Tarefa

Adicionar uma validação de sintaxe JavaScript antes dos testes no pipeline de CI e criar um modelo de Pull Request.

### Alterações sugeridas

No `package.json`, adicionar um script `check` que execute `node --check` nos arquivos JavaScript. No workflow `.github/workflows/ci.yml`, executar `npm run check` antes de `npm test`.

Criar `.github/pull_request_template.md` com checklist de testes, documentação e aprovação do pipeline.

### Branch e commits

```bash
git checkout main
git pull origin main
git checkout -b ci/validacao-sintaxe
```

```bash
git commit -m "ci: adiciona validação de sintaxe ao pipeline"
git commit -m "docs: adiciona modelo de pull request"
git push -u origin ci/validacao-sintaxe
```

### Configurações manuais no GitHub

