# Gerador de Bases para Assessorias

Automatiza a distribuição de cobrança para as 4 assessorias (On7, Setra, AMAIS, Localcred).

## Como funciona

```
Databricks SQL ──┐
                 ├──► Filtra CPFs excluídos ──► Distribui ──► 4 arquivos Excel
Excel (listas)   ┘         (Acordos SLN,          CPFs
                           Ajuizados,           existentes +
                           Escolas)               novos
```

1. Busca os dados frescos direto do Databricks
2. Remove CPFs com Acordo SLN, Ajuizados/Protesto ou Escola excluída
3. CPFs já na **Base Congelada** → mantêm a mesma assessoria
4. CPFs novos → distribuídos igualmente por CPF único e valor_atualizado
5. Gera `Base_On7_DDMMAAAA.xlsx`, `Base_Setra_DDMMAAAA.xlsx`, etc.
6. Atualiza a aba **Base congelada** no Excel de referências

---

## Configuração inicial (fazer uma vez)

### 1. Credenciais do Databricks

Edite o arquivo `.env` com suas credenciais:

```env
DATABRICKS_HOST=adb-xxxxxxxxxxxx.x.azuredatabricks.net
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/xxxxxxxxxxxx
DATABRICKS_TOKEN=dapixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

EXCEL_REFERENCIAS=C:\Users\bruno.santos\Downloads\Base para Assessorias.xlsx
PASTA_SAIDA=.\output
```

**Como obter o token Databricks:**
- No workspace Databricks → canto superior direito → seu nome → **User Settings**
- Aba **Access tokens** → **Generate new token**

**Como obter o HTTP Path:**
- No workspace → **SQL Warehouses** → clique no seu warehouse → **Connection details**
- Copie o valor de **HTTP Path**

### 2. SQL Query

Edite o arquivo `config.js` e substitua o `SQL_QUERY` pela sua query real:

```js
const SQL_QUERY = `
  SELECT
    codigo_da_fatura,
    cpf_do_rf,
    nome_do_rf,
    -- ... (cole seu SQL completo aqui)
  FROM seu_schema.sua_tabela
  WHERE ...
`;
```

A query deve retornar **exatamente** as 28 colunas listadas em `COLUNAS_SAIDA` no `config.js`.

---

## Uso (toda vez que precisar gerar as bases)

Abra o terminal na pasta do projeto e execute:

```bash
npm start
```

Ou:

```bash
node src/main.js
```

O script vai:
1. Mostrar o progresso no terminal
2. Gerar os arquivos em `.\output\`
3. Atualizar a aba **Base congelada** no Excel de referências

### Exemplo de saída no terminal

```
════════════════════════════════════════════════════
  GERADOR DE BASES PARA ASSESSORIAS
════════════════════════════════════════════════════

1/5  Lendo listas de referência...
     Acordos SLN: 1.234 CPFs carregados
     Ajuizados/Protesto: 567 CPFs carregados
     Escolas excluídas: 12 escolas carregadas
     Base congelada: 8.901 CPFs únicos com assessoria

2/5  Conectando ao Databricks...
     Executando query...
     45.678 faturas recebidas da query

3/5  Aplicando filtros de exclusão...
     Mantidos para envio : 38.901 faturas
     Excluídos (total)   : 6.777 faturas

4/5  Distribuindo CPFs entre assessorias...
     CPFs já atribuídos (Base Congelada) : 7.234
     CPFs novos distribuídos             : 892

5/5  Gerando arquivos de saída...
     ✓ Base_On7_22052026.xlsx      (9.876 faturas)
     ✓ Base_Setra_22052026.xlsx    (9.654 faturas)
     ✓ Base_AMAIS_22052026.xlsx    (9.765 faturas)
     ✓ Base_Localcred_22052026.xlsx (9.606 faturas)

────────────────────────────────────────────────────────────────────
RESUMO DA DISTRIBUIÇÃO
────────────────────────────────────────────────────────────────────
Assessoria     CPFs únicos    Faturas     Valor Atualizado
────────────────────────────────────────────────────────────────────
On7               2.031      9.876     R$ 1.234.567,89
Setra             2.028      9.654     R$ 1.198.432,10
AMAIS             2.031      9.765     R$ 1.215.876,34
Localcred         2.032      9.606     R$ 1.201.234,56
────────────────────────────────────────────────────────────────────
TOTAL             8.122     38.901     R$ 4.850.110,89
```

---

## Estrutura do projeto

```
cobranca-assessorias/
├── .env                  ← Suas credenciais (não commitar)
├── .env.example          ← Template de credenciais
├── config.js             ← SQL query + configurações
├── src/
│   ├── main.js           ← Orquestrador principal
│   ├── databricks.js     ← Conexão Databricks
│   ├── excel.js          ← Leitura/escrita Excel
│   ├── filter.js         ← Regras de exclusão
│   └── distribute.js     ← Algoritmo de distribuição
└── output/               ← Arquivos gerados (ignorado pelo git)
```

## Regras de negócio

| Condição | Ação |
|---|---|
| CPF na aba **Acordos SLN** | Excluído do envio |
| CPF na aba **Ajuizados/Protesto** | Excluído do envio |
| Escola na aba **Escolas excluídas** | Excluído do envio |
| CPF já na **Base Congelada** | Mantém a assessoria histórica |
| CPF novo (não está na Base Congelada) | Distribuído igualmente (CPFs + valor) |
