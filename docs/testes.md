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
|---|---|---|
| Testes Node e integração HTTP | Aprovado: `npm test` passou no job "Testar e publicar no GHCR" | [Execução do CD](https://github.com/lucaRomariz/adotapet-devops/actions/runs/41700010055) - 03/11/2026 |
| Saúde, interface e API no contêiner | Aprovado: contêiner `Healthy`; log: "Smoke aprovado: saúde, interface e API/banco." | [Execução do CD](https://github.com/lucaRomariz/adotapet-devops/actions/runs/41700010055) - 03/11/2026 |
| Persistência após recriar contêiner | Aprovado: contêiner recriado voltou `Healthy`; log: "Persistência aprovada após recriar container." | [Execução do CD](https://github.com/lucaRomariz/adotapet-devops/actions/runs/41700010055) - 03/11/2026 |
| Falha proposital detectada | Aprovado: atualização com a imagem `adotapet:broken` falhou ao iniciar; log: "Falha detectada; restaurando imagem anterior." | [Execução do CD](https://github.com/lucaRomariz/adotapet-devops/actions/runs/41700010055) - 03/11/2026 |
| Rollback com dados preservados | Aprovado: imagem anterior restaurada e `Healthy`; log: "Rollback aprovado com dados preservados." | [Execução do CD](https://github.com/lucaRomariz/adotapet-devops/actions/runs/41700010055) - 03/11/2026 |
| Cadastro manual válido e inválido (se executado) | Não executado manualmente; validação automatizada | [Execução do CD](https://github.com/lucaRomariz/adotapet-devops/actions/runs/41700010055) - 03/11/2026 |
