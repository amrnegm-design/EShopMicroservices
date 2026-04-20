# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Solution layout

Early-stage .NET 10 microservices solution for an eShop-style system. Defined by `eshop-microservices.slnx` (the new XML-based solution format — not a `.sln`).

Current projects:
- `Services/Catalog/CatalogApi` — ASP.NET Core Web API (`Microsoft.NET.Sdk.Web`, `net10.0`, nullable + implicit usings enabled). Scaffold only — `Program.cs` is the minimal `WebApplication.CreateBuilder` template with placeholder comments for DI registration and HTTP pipeline configuration. `Models/` exists but is empty.

Additional services (Basket, Ordering, etc.) are expected to be added as sibling folders under `Services/<Domain>/<DomainApi>/` and registered in `eshop-microservices.slnx` under a matching `<Folder Name="/Services/<Domain>/">` element.

## Common commands

Run from the `src/` directory (where `eshop-microservices.slnx` lives).

Build the whole solution:
```
dotnet build eshop-microservices.slnx
```

Restore/build/run a single service:
```
dotnet run --project Services/Catalog/CatalogApi/CatalogApi.csproj
```

Launch profiles (see `Services/Catalog/CatalogApi/Properties/launchSettings.json`):
- `http` → http://localhost:5000
- `https` → https://localhost:5050 + http://localhost:5000
- `Container (Dockerfile)` → builds via the per-service Dockerfile, exposing 8080 (HTTP) / 8081 (HTTPS)

Pick a profile with `--launch-profile <name>`.

Docker build for a single service (run from `src/`, the Dockerfile's `COPY . .` expects the solution root as context):
```
docker build -f Services/Catalog/CatalogApi/Dockerfile -t catalogapi .
```

No test projects exist yet; there is no lint/format configuration beyond defaults.

## Conventions worth preserving

- Target framework is `net10.0` across services — match this when adding new projects.
- Each service ships its own multi-stage `Dockerfile` that assumes `src/` as the build context and `Services/<Domain>/<DomainApi>/` as the project subpath. New services should follow the same path shape so the solution-relative `COPY` lines keep working.
- The solution uses the `.slnx` XML format; add new projects by editing `eshop-microservices.slnx` directly (or via `dotnet sln eshop-microservices.slnx add ...`), not by creating a legacy `.sln`.
