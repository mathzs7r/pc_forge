# Catálogo completo — 50 produtos por categoria

## O que foi adicionado

| Item | Descrição |
|------|-----------|
| `migrations/005_catalogo_completo.sql` | 3 lojas parceiras (Pichau, Kabum, Terabyte) + **400 produtos** (50 × 8 categorias) |
| `backend/seed-fotos-catalogo.js` | Gera fotos placeholder (PNG colorido por categoria) e grava no BLOB |
| `backend/gerar-catalogo.js` | Regenera o SQL da migração 005 se precisar alterar nomes/preços |
| Scripts npm | `migrate:catalogo`, `seed:fotos`, `gerar:catalogo` |

### Categorias (50 produtos cada)
- Processadores  
- Placas de Vídeo  
- Memória RAM  
- Armazenamento  
- Placas-mãe  
- Fontes  
- Periféricos  
- Acessórios  

## Como aplicar no seu projeto

1. Copie os arquivos novos/alterados para a pasta do seu PC Forge:
   - `database/migrations/005_catalogo_completo.sql`
   - `backend/seed-fotos-catalogo.js`
   - `backend/gerar-catalogo.js`
   - `backend/package.json` (scripts novos)
   - `backend/migration.js` (mensagem de dica)

2. No terminal, dentro de `backend/`:

```bash
# Aplica schema + migrações pendentes (incluindo a 005)
npm run migrate

# Grava as fotos placeholder nos produtos
npm run seed:fotos
```

Ou tudo de uma vez:

```bash
npm run migrate:catalogo
```

3. Suba a API de novo:

```bash
npm start
```

## Login das lojas parceiras (senha: `senha123`)

| Loja | E-mail |
|------|--------|
| Pichau | parceiro@pichau.com.br |
| Kabum | parceiro@kabum.com.br |
| Terabyte | parceiro@terabyte.com.br |

## Observações

- A migração 005 é **idempotente** (pode rodar de novo sem duplicar).
- As fotos são PNG gerados no Node (cor por categoria). No painel da loja você pode trocar por fotos reais.
- Sem `seed:fotos`, os produtos aparecem com o **ícone da categoria** (comportamento normal do front quando `TEM_IMAGEM = 0`).
