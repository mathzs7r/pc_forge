# Catálogo de produtos

Este diretório contém o schema, seeds e migrações do banco PC Forge.

## Ordem recomendada

1. `schema.sql` — estrutura base
2. `seed.sql` — dados mínimos de teste
3. Migrações numeradas em ordem (`001` ... `009`)
4. Opcional: `dump/pc_forge_dump.sql` para restaurar um estado completo

## Scripts de apoio no backend

- `node migration.js` — aplica migrações pendentes
- `node gerar-catalogo.js` — gera catálogo
- `node seed-fotos-catalogo.js` / `seed-fotos-reais.js` — preenche imagens
