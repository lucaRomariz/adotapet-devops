# A2 — Infraestrutura como Código e Entrega Contínua

Entrega prevista: **04/11/2026**. Este documento descreve a implementação e o roteiro de validação. Só marcar itens como executados depois de obter evidência real.

## O que foi preparado

| Exigência | Implementação | Evidência a obter |
| --- | --- | --- |
| Dockerfile otimizado | Node 22 slim, apenas código de execução, sem dependências externas, usuário `node`, healthcheck | Build aprovado no CI |
| Orquestração/IaC | `docker-compose.yml` descreve serviço, rede implícita, porta, volume, configurações e restrições | Log do Compose e teste de persistência |
| CD automático | Push em `main` publica no GHCR e sobe a imagem publicada por digest em outro runner | Execução verde do CD e pacote no GHCR |
| Segredos | `secrets.GITHUB_TOKEN` temporário, permissões mínimas por job; `.env` ignorado | Conferência do workflow, sem exibir token |
| Versionamento | Imagem `sha-<commit>` e tag `X.Y.Z` quando houver push de `vX.Y.Z` | Tags do pacote e tag Git |
| Rollback | Imagem deliberadamente defeituosa, falha detectada, restauração da imagem anterior e teste dos dados | Artefato `homologacao-<commit>` |

SQLite é embarcado: aplicação e banco ficam integrados no mesmo serviço, com dados em volume Docker separado da imagem. Não há senha de banco nem necessidade de criar uma credencial artificial. O volume continua existindo quando o contêiner é recriado. Confirmar com o professor se ele exige, adicionalmente, um banco em serviço separado ou Terraform; o enunciado fornecido aceita Compose.

A homologação é **temporária**, dentro do runner hospedado do GitHub. Ao terminar o job, ela é removida. Não há URL pública permanente. O CD baixa a imagem realmente publicada no GHCR, executa saúde, interface, API, persistência e rollback e guarda o log por 30 dias.

## Execução local

Pré-requisitos: Node 22.5+ e Docker com plugin Compose 2.20+.

```bash
npm test
cp .env.example .env
docker compose config --quiet
docker compose up -d --build --wait
node scripts/smoke.mjs
docker compose ps
```

Abrir http://localhost:3000, cadastrar um animal e executar:

```bash
docker compose up -d --force-recreate --wait
```

Atualizar a página: o animal deve continuar cadastrado. Para encerrar preservando o banco:

```bash
docker compose down
```

`docker compose down --volumes` apaga o banco daquele projeto Compose. Não usar no ambiente com dados que se deseja manter.

## Teste automatizado de rollback

Em terminal sem outra aplicação na porta 3000:

```bash
docker build -t adotapet:local .
bash scripts/verify-containers.sh
```

O script usa um projeto Compose separado (`adotapet-check`), cadastra um animal de teste, recria o contêiner, cria uma imagem com saída imediata, confirma a falha e restaura a imagem original. No final remove **somente o ambiente e o volume de testes**. A falha intermediária é proposital; o resultado final deve ser `Rollback aprovado com dados preservados.`

Não executar duas instâncias desse script simultaneamente na mesma máquina/porta.

## CD e versionamento

1. Abrir PR e aguardar os checks de CI: testes e build/persistência/rollback.
2. Após revisão e merge em `main`, o CD executa seus próprios testes antes de publicar.
3. O pacote recebe `ghcr.io/lucaromariz/adotapet-devops:sha-<commit completo>`.
4. A homologação usa o digest `sha256:...`, evitando depender de uma tag mutável.
5. A versão `1.0.0` já está preparada no `package.json`. Depois de aprovar o CI e integrar este trabalho em `main`, publicar a primeira entrega semântica:

```bash
git switch main
git pull --ff-only
git tag -a v1.0.0 -m 'Entrega A2: CI, containers e CD'
git push origin v1.0.0
```

O CD valida que `v1.0.0` corresponde à versão do `package.json`, publica a tag `1.0.0` e executa a homologação novamente. Não criar a tag antes do merge nem marcar como concluído antes de o CD ficar verde.

Convenção: correções PATCH, funcionalidades compatíveis MINOR e mudanças incompatíveis MAJOR. Nunca reutilizar uma tag Git ou de release já publicada para código diferente.

### Rollback manual para imagem anterior

Usar uma imagem/digest de execução anterior aprovada, obtido no resumo do CD. Em ambiente persistente, fazer backup do SQLite com a aplicação parada antes de atualização que altere esquema.

```bash
# Exemplo: substituir pelo digest real aprovado; não executar o placeholder.
APP_IMAGE=ghcr.io/lucaromariz/adotapet-devops@sha256:DIGEST_ANTERIOR docker compose pull app
APP_IMAGE=ghcr.io/lucaromariz/adotapet-devops@sha256:DIGEST_ANTERIOR docker compose up -d --no-build --force-recreate --wait
node scripts/smoke.mjs
```

Atualizar também `APP_IMAGE` no `.env` para manter a seleção em comandos futuros. Se o pacote for privado, autenticar no GHCR com credencial autorizada via entrada padrão; nunca escrever tokens no repositório. Rollback de imagem não reverte migrações de banco; esta fase não altera o esquema.

## Divisão simples das contribuições

A implementação base de containers, CI/CD, testes de integração e scripts fica com **Luca — DEV**, com auxílio da ferramenta. Fernanda e Miguel devem executar suas tarefas e registrar suas próprias contribuições, sem atribuir a eles código que não produziram.

### Fernanda — QA / documentação (aproximadamente 20–30 minutos)

1. Criar branch `docs/evidencias-qa-a2` a partir da `main` atualizada.
2. Acompanhar um CI e um CD completos no GitHub e abrir o artefato de homologação.
3. Conferir no log as mensagens de smoke, persistência e rollback aprovados.
4. Se tiver Docker, testar pela interface um cadastro válido e um inválido; se não tiver, registrar apenas o que foi verificado pelos logs, sem afirmar teste manual.
5. Preencher a tabela abaixo e a seção A2 de `docs/testes.md` com data, resultado e link da execução. Só usar dados fictícios nos testes.
6. Fazer commit `docs: registra evidencias de qualidade da A2`, abrir PR e pedir revisão de Luca.

Entrega de Fernanda: **um PR curto de evidências de QA**. Ela deve conseguir explicar o que cada verificação comprova.

### Miguel — OPS / infraestrutura (aproximadamente 20–30 minutos)

1. Conferir **Settings → Actions → General**: Actions permitido e ações usadas no workflow autorizadas. Os jobs declaram explicitamente as permissões necessárias ao `GITHUB_TOKEN`; não é necessário dar escrita global a todos os workflows.
2. Conferir proteção da `main`: PR, aprovação e checks `Testes automatizados` e `Build, persistência e rollback`. Registrar o estado real; se o plano do GitHub não permitir aplicar a regra, documentar a limitação e combinar o fluxo com o professor.
3. Após o merge, acompanhar o CD e conferir o pacote GHCR. Não tornar o pacote público nem criar PAT se isso não for necessário.
4. Executar a release pelo roteiro acima, em conjunto com Luca, quando a versão estiver definida e o CI aprovado.
5. Criar branch `docs/evidencias-ops-a2`, registrar links da execução, pacote e tag na tabela abaixo e fazer commit `docs: registra evidencias de infraestrutura da A2`.
6. Abrir PR e pedir revisão de Luca.

Entrega de Miguel: **um PR curto com a conferência de infraestrutura** e demonstração do pipeline. Não precisa implementar Dockerfile, YAML nem scripts.

### Luca — DEV / integração

- Revisar os PRs de Fernanda e Miguel, corrigir eventuais falhas do CI/CD e integrar as contribuições.
- Demonstrar cadastro, explicar o volume SQLite, o pipeline, as tags e o rollback.
- Conferir que os registros de evidência correspondem a execuções reais antes da apresentação.

## Registro de evidências — preencher após execução

| Verificação | Responsável | Data | Resultado | Link/evidência |
| --- | --- | --- | --- | --- |
| CI: testes e build | Fernanda | Pendente | Pendente | Pendente |
| Persistência e rollback | Fernanda | Pendente | Pendente | Pendente |
| Cadastro pela interface, se executado | Fernanda | Pendente | Pendente | Pendente |
| Proteção da main | Miguel | Pendente | Pendente | Pendente |
| Publicação GHCR e deploy simulado | Miguel | Pendente | Pendente | Pendente |
| Tag semântica | Miguel / Luca | Pendente | Pendente | Pendente |

## Roteiro de apresentação (5 minutos)

1. Luca apresenta aplicação/interface e cadastro no SQLite (1 min).
2. Miguel mostra Dockerfile, Compose e o volume (1 min).
3. Miguel mostra execução do CD, imagem SHA/digest e versão semântica no GHCR (1 min).
4. Fernanda mostra testes e evidência de persistência (1 min).
5. Fernanda mostra falha simulada e rollback aprovado; equipe explica que homologação é temporária (1 min).

## Referências

- GitHub: https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images
- Compose: https://docs.docker.com/reference/compose-file/services/
