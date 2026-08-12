---
name: import-external
description: Expõe uma API externa (EDMX já importado em srv/external) no IntegrationService, editando package.json, srv/app-service.cds e srv/app-service.js com nomenclatura padronizada. Use quando o usuário pedir para expor/adicionar/integrar uma API, um EDMX ou uma Collection do C4C no app-service.
---

# import-external

Expõe uma ou mais `EntitySet` de uma API externa já importada em `srv/external/` no serviço
`IntegrationService`, aplicando sempre a mesma nomenclatura.

Esta skill **não** roda `cds import`. O arquivo `srv/external/<nome>.cds` já deve existir.

## Invocação

```
/import-external <nome-do-arquivo> <Collection1>, <Collection2>, ...
```

Exemplos:

```
/import-external ticket TicketCollection
/import-external contact ContactCollection, ContactPersonalAddressCollection
```

Se o usuário invocar sem argumentos ou incompleto, pergunte antes de agir:
qual arquivo de `srv/external/` e quais collections expor. **Não** adivinhe nem exponha
"a principal" por conta própria — os EDMX do C4C têm ~200 EntitySets e só o que foi pedido
deve ser exposto.

## REGRA RÍGIDA — arquivos do .gitignore

**Nunca** criar, editar ou remover nada coberto pelo `.gitignore`. Em especial:

`.cdsrc-private.json`, `.env`, `.env.*`, `default-*.json`, `node_modules/`, `gen/`,
`target/`, `_out/`, `@cds-models/`, `.vscode/`, `mta_archives/`, `*.sqlite*`, `*.db`, `*.log`

Se algo parecer exigir mexer num deles (ex.: cadastrar o destino/credencial da nova API em
`.cdsrc-private.json`), **pare e instrua o usuário** a fazer essa parte manualmente,
dizendo exatamente o que ele precisa configurar. Não faça você mesmo.

Os únicos arquivos que esta skill edita são:

- `package.json`
- `srv/app-service.cds`
- `srv/app-service.js`

---

## Nomenclatura

Dado o arquivo `srv/external/<nome>.cds` e cada `<Xxx>Collection`:

| Derivado | Regra | `contact` / `ContactCollection` | `employeeanduser` / `EmployeeCollection` |
|---|---|---|---|
| chave em `cds.requires` | nome do `service` declarado no `.cds` | `contact` | `employeeanduser` |
| `model` | `srv/external/<nome>` | `srv/external/contact` | `srv/external/employeeanduser` |
| alias no `.cds` | `<camelNome>Api` | `contactApi` | `employeeAndUserApi` |
| const no `.js` | `<camelNome>Service` | `contactService` | `employeeAndUserService` |
| entidade exposta | strip `Collection` + pluraliza | `Contacts` | `Employees` |

### camelNome — camelCase do nome do arquivo

- Tem separador (`-`, `_`) ou já é camel/Pascal → divida nos separadores e junte em camelCase.
  `sales-order` → `salesOrder`; `salesOrder` → `salesOrder`.
- É uma única palavra minúscula → use como está. `contact` → `contact`.
- É tudo minúsculo e **colado com mais de uma palavra** (`employeeanduser`) → você **não tem
  como** achar as fronteiras de palavra com segurança. Proponha um palpite e **peça
  confirmação** ao usuário antes de gerar qualquer coisa:

  > O arquivo se chama `employeeanduser`. Vou usar `employeeAndUserApi` / `employeeAndUserService`. Confirma essa divisão de palavras?

### Nome exposto — strip + pluralização

Remova o sufixo `Collection` e pluralize. **O prefixo é sempre preservado**
(`ContactPersonalAddressCollection` → `ContactPersonalAddresses`, nunca `PersonalAddresses`).

| Terminação após strip | Regra | Exemplo |
|---|---|---|
| já termina em `s` | mantém | `EmployeeSkills` → `EmployeeSkills` |
| `s`, `x`, `z`, `ch`, `sh` | `+es` | `ContactPersonalAddress` → `ContactPersonalAddresses` |
| consoante + `y` | `y` → `ies` | `SalesTerritory` → `SalesTerritories` |
| qualquer outra | `+s` | `ContactGenderCode` → `ContactGenderCodes` |

---

## Passo 0 — Validações

Faça todas antes de editar qualquer arquivo. Em caso de falha, **pare e pergunte**.

1. **`.cds` existe?** `srv/external/<nome>.cds` precisa existir. Se não existir, avise que a
   skill não roda `cds import` e peça para o usuário importar o EDMX primeiro.
2. **Nome do service.** Leia a linha `service <X> {` do `.cds`. Essa é a chave de
   `cds.requires` e o argumento de `cds.connect.to()`. Normalmente é igual ao nome do arquivo;
   se for diferente, avise o usuário e confirme antes de seguir.
3. **Collections existem?** Cada `<Xxx>Collection` informada precisa existir como
   `entity <Xxx>Collection {` nesse `.cds`. Se alguma não existir, liste as parecidas
   (`grep -oE 'entity \w*<termo>\w*Collection' srv/external/<nome>.cds`) e pergunte.
4. **Colisão de nome.** Se o nome exposto calculado já existe em `srv/app-service.cds`
   apontando para **outra** origem, pare e peça um nome alternativo ao usuário.
5. **Já existe (re-import)?** Se a projeção/handler/entrada já existir apontando para a
   **mesma** origem, **atualize no lugar — nunca duplique**. Se já estiver correto, não
   altere o arquivo. A skill é idempotente: rodar duas vezes com os mesmos argumentos deve
   deixar `git diff` limpo na segunda.
6. **`kind` da conexão.** Confirme que o EDMX é C4C:
   `grep -c '<Schema Namespace="c4codata"' srv/external/<nome>.edmx`.
   Se casar (ou o `.edmx` não estiver presente mas o `.cds` claramente vier de C4C), use
   `"kind": "c4c"`. Se **não** casar, **não assuma** — pergunte ao usuário qual `kind` usar.

---

## Passo 1 — `package.json`

Acrescente ao **final** de `cds.requires` (a ordem é de inserção, não alfabética).
Indentação de 2 espaços, como no arquivo.

```json
"<nome>": {
  "kind": "c4c",
  "model": "srv/external/<nome>",
  "csrf": {
    "method": "get"
  },
  "csrfInBatch": true
}
```

Se a chave `<nome>` já existir, **não** adicione outra — verifique se o conteúdo bate e
corrija só o que estiver divergente.

Estado de referência do bloco:

```json
"cds": {
  "requires": {
    "[production]": {
      "auth": "xsuaa"
    },
    "employeeanduser": { ... },
    "contact": { ... }
  }
}
```

---

## Passo 2 — `srv/app-service.cds`

Um `using` por **arquivo externo** (não por collection), logo após os `using` existentes:

```cds
using { <nome> as <camelNome>Api } from './external/<nome>';
```

Uma projeção por collection, dentro de `service IntegrationService`, indentação 2 espaços,
com linha em branco separando cada entidade:

```cds
  @readonly
  entity <Plural> as projection on <camelNome>Api.<Xxx>Collection;
```

Resultado esperado do arquivo:

```cds
using { employeeanduser as employeeApi } from './external/employeeanduser';
using { contact as contactApi } from './external/contact';
using { <nome> as <camelNome>Api } from './external/<nome>';

@path: '/employee'
service IntegrationService {
  @readonly
  entity Employees as projection on employeeApi.EmployeeCollection;

  @readonly
  entity Contacts as projection on contactApi.ContactCollection;

  @readonly
  entity <Plural> as projection on <camelNome>Api.<Xxx>Collection;
}
```

Se o `using` do arquivo já existir (você está adicionando uma segunda collection do mesmo
EDMX), **reuse o alias existente** e adicione só a projeção.

> Nota: o `using` existente de `employeeanduser` usa o alias curto `employeeApi`, anterior à
> regra atual. Não o renomeie — é código funcionando. Para arquivos novos, aplique a regra da
> tabela (`<camelNome>Api`).

---

## Passo 3 — `srv/app-service.js`

Indentação de 4 espaços. Três edições:

1. **Uma** const por arquivo externo, junto das outras no topo do `impl`:
   ```js
   const <camelNome>Service = await cds.connect.to("<nome>");
   ```
   Várias collections do mesmo EDMX **reusam a mesma const** — não crie uma por entidade.

2. Acrescente o nome exposto ao destructuring de `this.entities`.

3. Um handler por collection, após os existentes:
   ```js
   this.on("READ", <Plural>, async (req) => {
       return <camelNome>Service.run(req.query);
   });
   ```

Resultado esperado do arquivo:

```js
const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {
    const employeeAndUserService = await cds.connect.to("employeeanduser");
    const contactService = await cds.connect.to("contact");
    const <camelNome>Service = await cds.connect.to("<nome>");

    const { Employees, Contacts, <Plural> } = this.entities;

    this.on("READ", Employees, async (req) => {
        return employeeAndUserService.run(req.query);
    });

    this.on("READ", Contacts, async (req) => {
        return contactService.run(req.query);
    });

    this.on("READ", <Plural>, async (req) => {
        return <camelNome>Service.run(req.query);
    });
});
```

As entidades são `@readonly`, então só o handler de `READ` é gerado. Se o usuário pedir
escrita, isso é fora do escopo da skill — avise e trate como tarefa separada.

---

## Passo 4 — Verificação

```bash
npx cds compile srv --to edmx -s IntegrationService > /dev/null
```

O `-s IntegrationService` é obrigatório: sem ele o comando falha porque o modelo tem vários
serviços (`IntegrationService`, `employeeanduser`, `contact`, ...). Pode levar dezenas de
segundos — os modelos do C4C são grandes.

Se sair com código diferente de 0, **mostre o erro ao usuário e não declare sucesso**.
Corrija se a causa for do que você gerou.

Depois, confira o diff:

```bash
git diff --stat
```

Só `package.json`, `srv/app-service.cds` e `srv/app-service.js` devem aparecer.
Se algo do `.gitignore` aparecer, algo saiu errado.

---

## Relatório final

Reporte ao usuário:

- as collections expostas e o nome de cada uma (`<Xxx>Collection` → `<Plural>`)
- o alias e a const gerados
- o resultado real do `cds compile`
- a URL de leitura de cada entidade nova: `/employee/<Plural>`
  (o serviço usa `@path: '/employee'`)
- qualquer coisa que o usuário precise fazer à mão, como o destino em `.cdsrc-private.json`
