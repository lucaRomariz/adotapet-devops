Casos de teste — Cadastro de animais

- Idade 0 deve ser aceita (limite mínimo válido).
- Idade 30 deve ser aceita (limite máximo válido).
- Idade 31 deve ser rejeitada (acima do limite máximo).
- Espécie inválida (fora da lista permitida) deve ser rejeitada.
- Descrição com menos de 10 caracteres deve ser rejeitada.
- O filtro por cidade deve ignorar maiúsculas e minúsculas.

## A2 — Testes preparados

- `npm test`: regras de negócio e integração HTTP com banco temporário, cadastro, JSON inválido, saúde, interface, rota inexistente e persistência após reiniciar o processo.
- `node scripts/smoke.mjs`: saúde, interface e listagem da API; requer aplicação rodando.
- `bash scripts/verify-containers.sh`: inicialização por Compose, cadastro, persistência após recriação, falha de atualização e rollback com dados preservados. Requer Docker, Node e imagem construída.
- CI executa testes Node e valida o contêiner em PRs e pushes na main.
- CD publica no GHCR e repete a verificação usando a imagem publicada por digest.

### Registro de execução pela QA

Fernanda deve preencher depois de executar ou consultar os logs:

| Caso | Resultado observado | Link da evidência / data |
| --- | --- | --- |
| Testes Node e integração HTTP | Pendente | Pendente |
| Saúde, interface e API no contêiner | Pendente | Pendente |
| Persistência após recriar contêiner | Pendente | Pendente |
| Falha proposital detectada | Pendente | Pendente |
| Rollback com dados preservados | Pendente | Pendente |
| Cadastro manual válido e inválido (se executado) | Pendente | Pendente |
