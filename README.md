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

Os 10 testes verificam regras de validação, filtros e integração HTTP com SQLite: saúde, interface, cadastro, JSON inválido, rota inexistente e persistência após reiniciar a aplicação. O banco dos testes é temporário e isolado.

## Estratégia de Git

O projeto usa **Trunk-Based Development**:

1. `main` é a branch estável e sempre deve passar no pipeline.
2. Cada tarefa usa uma branch curta, como `feat/cadastro-animal` ou `fix/validacao-idade`.
3. A mudança retorna à `main` exclusivamente via Pull Request aprovado.
4. Commits seguem Conventional Commits, por exemplo: `feat: adiciona cadastro de animal` e `test: cobre filtro por cidade`.

### Proteção da branch `main`

A proteção da `main` está configurada no GitHub com:

- Branch name pattern: `main`;
- exigir Pull Request antes do merge;
- exigir aprovação de ao menos um integrante;
- exigir os checks **Testes automatizados** e **Build, persistência e rollback** aprovados;
- bloquear push direto e permitir apenas merge via Pull Request.

## Responsabilidades da equipe no Marco 1

| Integrante / papel | Responsabilidade no Marco 1 |
| --- | --- |
| Luca — DEV | Interface, API, banco de dados e regras de negócio |
| Fernanda — QA / Documentação / Versionamento | Casos de teste, revisão de Pull Requests, README e padronização de commits |
| Miguel — OPS / Infraestrutura | Repositório, proteção da `main` e configuração do GitHub Actions |

## Próxima fase

- **A3:** análise de segurança, métricas, logs, Grafana e documentação final.

## Entrega 2 — A2 (04/11/2026)

A implementação da A2 inclui Dockerfile com usuário sem privilégios e healthcheck, Docker Compose com SQLite em volume persistente, testes de integração e pipelines de CI/CD. Build, persistência e rollback foram executados com sucesso no GitHub Actions; as evidências estão vinculadas abaixo.

```bash
docker compose up -d --build --wait
```

Acesse `http://localhost:3000`. Para encerrar sem apagar os dados, use `docker compose down`.

O CD publica no GHCR em pushes na `main` e tags `vX.Y.Z`. A homologação é simulada em runner temporário: baixa a imagem publicada por digest e verifica saúde, interface, API, persistência e rollback. Logs ficam disponíveis como artefato da execução. O acesso ao registry usa `secrets.GITHUB_TOKEN`, sem credenciais no código.

## Evidências de infraestrutura — A2

- Release: [v1.0.0](https://github.com/lucaRomariz/adotapet-devops/releases/tag/v1.0.0)
- Imagem: `ghcr.io/lucaromariz/adotapet-devops:1.0.0`
- CD: [execução aprovada](https://github.com/lucaRomariz/adotapet-devops/actions/runs/41700010055)
- Homologação simulada executada no GitHub Actions.
- Persistência e rollback verificados pelo pipeline.

Conferência realizada por Miguel em 03/11/2026.


## Requisitos e evidências da A2

| Requisito | Implementação | Evidência |
| --- | --- | --- |
| Dockerfile otimizado | Base slim, contexto mínimo, usuário `node` e healthcheck | [CI aprovado](https://github.com/lucaRomariz/adotapet-devops/actions/runs/41750188596) |
| Orquestração / IaC | Compose declara aplicação, configurações, rede e volume SQLite | [Compose](docker-compose.yml) e teste de persistência |
| CD automático | Publica no GHCR e executa imagem por digest em outro runner | [CD aprovado](https://github.com/lucaRomariz/adotapet-devops/actions/runs/41750188663) |
| Configurações e segredos | `.env.example`, `.env` ignorado e `secrets.GITHUB_TOKEN` temporário | [Workflow de CD](.github/workflows/cd.yml) |
| Versionamento e rollback | Release `v1.0.0`, imagem `1.0.0`, tags SHA e falha simulada com restauração | [Release](https://github.com/lucaRomariz/adotapet-devops/releases/tag/v1.0.0) e [log preservado](docs/evidencia-homologacao-a2.log) |

O SQLite é embarcado na aplicação e guarda seus dados no volume `animal-data`, separado da imagem. O Compose provisiona o ambiente local e a homologação simulada. Não há dependência de Kubernetes ou Terraform nesta implementação.

A homologação roda em runner temporário do GitHub Actions. O ambiente é removido ao finalizar o job; não há servidor público permanente. O código disponível em GitHub Pages não substitui o servidor Node.js e a API com SQLite.

## Configurações e segredos

Para personalizar a execução local, copie `.env.example` para `.env`. `APP_PORT` define a porta local e `APP_IMAGE` seleciona a imagem. O padrão é `adotapet:local`; as configurações públicas do serviço estão no Compose. `DATABASE_DIR` aponta para o volume de dados dentro do contêiner.

O SQLite não usa senha de conexão. A autenticação no GHCR usa o secret temporário `GITHUB_TOKEN`, fornecido automaticamente pelo GitHub: `packages: write` apenas na publicação e `packages: read` no deploy. Não é necessário cadastrar um PAT para este fluxo. Não versionar `.env`, tokens ou credenciais.

As Actions estão fixadas por SHA de releases oficiais, com runtime atual, e os jobs usam Ubuntu 24.04. A versão Node.js da aplicação continua sendo 22.

## Versionamento das imagens

- `sha-<commit completo>`: rastreia cada publicação até o código de origem.
- `1.0.0`: versão semântica da entrega, correspondente à tag Git `v1.0.0`.
- `sha256:...`: digest usado no deploy para selecionar exatamente a imagem publicada.

Para a próxima release, alterar `package.json` por PR e, depois da aprovação e do merge, criar uma nova tag Git `vX.Y.Z`. O CD rejeita tags que não correspondam à versão do pacote. Usar PATCH para correções, MINOR para funcionalidades compatíveis e MAJOR para mudanças incompatíveis. Não mover tags de releases existentes.

## Reproduzir a simulação de rollback

Pré-requisitos: Docker com Compose 2.20+, Node.js 22.5+ e porta local 3000 disponível. Executar a partir da raiz do projeto:

```bash
docker compose config --quiet
docker build -t adotapet:local .
bash scripts/verify-containers.sh
```

O script realiza, em sequência:

1. Sobe a aplicação e verifica saúde, interface e API.
2. Cadastra um animal fictício, recria o contêiner e verifica os dados.
3. Cria a imagem `adotapet:broken`, cujo processo encerra imediatamente.
4. Detecta a falha da atualização e restaura a imagem anterior.
5. Verifica novamente a aplicação e a presença do animal cadastrado.

A mensagem final esperada é `Rollback aprovado com dados preservados.` A falha intermediária é proposital e não deve ser confundida com falha da execução completa.

O script usa o projeto Compose isolado `adotapet-check` e remove seu ambiente e volume de testes ao terminar. Não executar duas cópias simultaneamente na mesma máquina. Para a aplicação de uso normal, `docker compose down` preserva o banco; `docker compose down --volumes` o apaga.

### Restaurar uma imagem aprovada manualmente

Selecionar um digest anterior no resumo de uma execução aprovada do CD. Em um ambiente com dados, registrar a imagem atual e fazer backup do SQLite com a aplicação parada antes de atualizações que alterem o esquema. Não usar o volume de testes para dados reais.

```bash
# Substituir DIGEST_APROVADO pelo valor real do resumo do CD.
export APP_IMAGE=ghcr.io/lucaromariz/adotapet-devops@sha256:DIGEST_APROVADO
docker compose pull app
docker compose up -d --no-build --force-recreate --wait
node scripts/smoke.mjs
docker compose ps
```

Registrar o mesmo `APP_IMAGE` no `.env` para manter a seleção nos próximos comandos. Confirmar também o cadastro pela interface. O volume existente é reutilizado; rollback de imagem não reverte migrações do banco. Nesta fase, a simulação não modifica o esquema SQLite.

## Preservação das evidências

O [log original de homologação](docs/evidencia-homologacao-a2.log) foi extraído do artefato da [execução 41750188663](https://github.com/lucaRomariz/adotapet-devops/actions/runs/41750188663), referente ao commit `4e9e6dbb1b0a9e063eb804a1df083a8ce9f47e25`.

- Artefato original: `homologacao-4e9e6dbb1b0a9e063eb804a1df083a8ce9f47e25` (ID `13285707914`).
- SHA-256 do ZIP original, conferido com o digest exibido no GitHub: `c67fa14895e82f10480a9410268df721655afe92906b1aace58220b759c844bf`.
- Imagem testada: `ghcr.io/lucaromariz/adotapet-devops@sha256:4e78d83d7e9bd301f99d9c35e3cb2149c7692b3f27a8df309661ac3def09f597`.

A cópia versionada continua disponível após a expiração do artefato no Actions. Novas execuções solicitam retenção de 90 dias, sujeita ao limite configurado no repositório. Para guardar outra execução, baixar seu artefato na seção **Artifacts** e preservar o log com a identificação da execução e do commit; não substituir este registro histórico por logs de outro teste.
