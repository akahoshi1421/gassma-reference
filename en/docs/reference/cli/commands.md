
# CLI Commands

Once the `gassma` package is installed, you can run the CLI with `npx gassma <command>`.

```
$ npm i gassma
```

| Command | Description |
| --- | --- |
| [`bootstrap`](/docs/reference/bootstrap) | Set up a local development environment (clasp + esbuild + TypeScript + GASsma) in one shot |
| [`init`](#gassma-init) | Generate a schema file and a config file |
| [`generate`](#gassma-generate) | Generate type files and client code from the schema |
| [`migrate dev` / `migrate deploy` / `db push`](/docs/reference/migrate) | Generate a GAS function that syncs sheets and columns with the schema |
| [`validate`](#gassma-validate) | Check the schema file's syntax and consistency |
| [`format`](#gassma-format) | Format `.prisma` files |
| [`studio`](#gassma-studio) | Open the target spreadsheet in your browser |
| [`version`](#gassma-version) | Display the CLI version |

## gassma generate

Generates type files and client code.

```
$ npx gassma generate
```

By default, `.prisma` files in the `./gassma` directory are searched. You can specify a particular schema file or directory using the `--schema` option (equivalent to Prisma's `prisma generate --schema`).

```
$ npx gassma generate --schema gassma/user.prisma
$ npx gassma generate --schema ./schemas
```

The `--watch` option monitors schema file changes and automatically regenerates.

```
$ npx gassma generate --watch
```

It can also be combined with `--schema`.

The `--config` option lets you explicitly specify the path to the config file (equivalent to Prisma's `--config`).

```
$ npx gassma generate --config configs/gassma.config.ts
```

If the specified file does not exist, a `ConfigFileNotFoundError` is thrown. When omitted, the default locations are searched (see "Config File Search Rules" in [Config File](/docs/reference/cli/config)).

### Generated Files

The following files are generated based on the schema file name. For example, for `schema.prisma`:

| File | Content |
| --- | --- |
| `schema.d.ts` | Type definitions (model types, query types, common types) |
| `schemaClient.js` | Client implementation (with auto-injected relation definitions) |
| `schemaClient.d.ts` | Client type definitions |

The output directory is the directory specified by the `generator` block's `output`.

### Overview of Generated Types

The generated `.d.ts` includes the following types:

- **Model types**: Type definitions for each field (`GassmaUserUse`, etc.)
- **Query types**: `FindData`, `CreateData`, `UpdateData`, `DeleteData`, `UpsertData`, etc.
- **Select / Omit types**: Types for field selection and exclusion
- **Filter types**: `WhereUse`, `FilterConditions` (including `FieldRef` support)
- **OrderBy types**: Sort conditions (relation sort, `_count` sort, nulls control included)
- **Include types**: Types for relation fetching (including `_count`)
- **Nested Write types**: Create, connect, update, and delete operations for related records
- **Numeric operation types**: `NumberOperation` (increment / decrement / multiply / divide)
- **Common types**: `FieldRef`, `GassmaClientOptions`, error class group
- **Configuration types**: `DefaultsConfig`, `UpdatedAtConfig`, `IgnoreConfig`, `AutoincrementConfig`, `MapConfig`, etc.
- **Controller types**: Argument and return value types for all methods

For how to use the generated client, see [Basics](/docs/reference/basic).

## gassma init

Initializes a project and auto-generates a schema file and configuration file.

```
$ npx gassma init
```

The following files are generated:

- `gassma/schema.prisma` -- Initial schema
- `gassma.config.ts` -- Configuration file

| Option | Description |
| --- | --- |
| `--output <path>` | Customize the output path |
| `--with-model` | Generate a schema with a sample User model |

If `schema.prisma` already exists, it safely stops with an error.

When starting a new project, [`gassma bootstrap`](/docs/reference/bootstrap) is convenient: in addition to what `init` produces, it also sets up clasp, esbuild, and TypeScript.

## gassma validate

Performs syntax checking and consistency checking of the schema file (equivalent to Prisma's `prisma validate`).

```
$ npx gassma validate
```

```
$ npx gassma validate --schema gassma/test.prisma
```

You can also specify the path to the config file with the `--config` option.

Check items:

- Syntax errors (parser error detection)
- `generator` block existence check
- `output` field required check
- At least one model is defined

On success, the following is output:

```
The schema at /path/to/gassma/test.prisma is valid 🚀
```

## gassma format

Formats `.prisma` files with the same formatting as the official Prisma formatter (uses `@prisma/internals`' `formatSchema`).

```
$ npx gassma format
```

| Option | Description |
| --- | --- |
| `--schema <path>` | Format only a specific file |
| `--config <path>` | Specify the path to the config file |
| `--check` | Check if already formatted (for CI; exits with code 1 if unformatted) |

## gassma studio

Opens the spreadsheet configured in `datasource` in your OS's default browser.

```
$ npx gassma studio
```

| Option | Description |
| --- | --- |
| `--config <path>` | Specify the path to the config file |

The URL is resolved in the following order:

1. The `url` of the `datasource` block in the schema
2. `datasource.url` in `gassma.config.ts`
3. `parentId` in `.clasp.json` in the current directory

A full URL (`https://...`) is opened as-is; a spreadsheet ID is turned into `https://docs.google.com/spreadsheets/d/<id>/edit` and opened. If none of them has a URL, a `NoDatasourceUrlError` occurs.

`parentId` in `.clasp.json` is the ID of the spreadsheet the GAS project is bound to. It may be either a string or an array; the first element is used for an array.

```json
{
  "scriptId": "XXXXX",
  "rootDir": "dist",
  "parentId": ["SPREAD_SHEET_ID"]
}
```

`.clasp.json` is read only when neither the schema nor `gassma.config.ts` has a URL. If `.clasp.json` exists at that point but cannot be read as a JSON object, an `InvalidClaspJsonError` occurs.

## gassma version

Displays the GASsma CLI version.

```
$ npx gassma version
```

You can also check with the `--version` / `-V` flag.

| Option | Description |
| --- | --- |
| `--json` | Output version information as JSON |

With `--json`, the version is output as JSON (`{"gassma":"<version>"}`).

```
$ npx gassma version --json
{"gassma":"1.2.3"}
```
