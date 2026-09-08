# AdotaPet

MVP de um sistema de adoção responsável de animais, desenvolvido para a disciplina **Integração DevOps — Ciência da Computação 2026/2**.

## Equipe do projeto

O projeto definido pela equipe é o **AdotaPet**, um sistema para divulgar e cadastrar animais disponíveis para adoção responsável.

| Integrante | Função |
| :---: | :--- |
| 🧑‍💻 **Luca** | **DEV** |
| 🧪 **Fernanda** | **QA / Documentação / Versionamento** |
| ⚙️ **Miguel** | **OPS / Infraestrutura** |

## Entrega 1 — Marco 1 (CI)

Esta versão atende aos requisitos iniciais da disciplina:

- Aplicação web funcional para listar e cadastrar animais disponíveis;
- API HTTP com validação dos dados;
- Banco de dados SQLite local, criado automaticamente na primeira execução;
- Testes unitários com o executor nativo do Node.js;
- Pipeline de Integração Contínua com GitHub Actions em pushes e Pull Requests para `main`.

## Tecnologias

- Node.js 22 (sem dependências externas);
- `node:sqlite` para persistência;
- HTML, CSS e JavaScript para a interface;
- GitHub Actions para CI.

## Executar localmente

Pré-requisito: Node.js 22.5 ou superior.

```bash
npm test
npm start
```

Abra `http://localhost:3000` no navegador. O arquivo do banco é gerado em `database/adota-pet.sqlite` e não é versionado.

## Testes

```bash
npm test
```

Os testes verificam as regras de validação de animais e os filtros da listagem.

## Estratégia de Git

O projeto usa **Trunk-Based Development**:

1. `main` é a branch estável e sempre deve passar no pipeline.
2. Cada tarefa usa uma branch curta, como `feat/cadastro-animal` ou `fix/validacao-idade`.
3. A mudança retorna à `main` exclusivamente via Pull Request aprovado.
4. Commits seguem Conventional Commits, por exemplo: `feat: adiciona cadastro de animal` e `test: cobre filtro por cidade`.

### Proteção da branch `main`

Após publicar o repositório no GitHub, configure em **Settings → Branches → Add branch protection rule**:

- Branch name pattern: `main`;
- exigir Pull Request antes do merge;
- exigir aprovação de ao menos um integrante;
- exigir que o check **Testes automatizados** seja aprovado;
- bloquear push direto e permitir apenas merge via Pull Request.

## Responsabilidades da equipe no Marco 1

| Integrante / papel | Responsabilidade no Marco 1 |
| --- | --- |
| Luca — DEV | Interface, API, banco de dados e regras de negócio |
| Fernanda — QA / Documentação / Versionamento | Casos de teste, revisão de Pull Requests, README e padronização de commits |
| Miguel — OPS / Infraestrutura | Repositório, proteção da `main` e configuração do GitHub Actions |

## Próximas fases

- **A2:** Dockerfile, Docker Compose, publicação de imagem e CD;
- **A3:** análise de segurança, métricas, logs, Grafana e documentação final.
