# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Solution layout

.NET 10 microservices solution for an eShop-style system. Defined by `eshop-microservices.slnx` (XML-based, not legacy `.sln`).

Current projects:
- `BuildingBlocks/BuildingBlocks` — shared class library (`Microsoft.NET.Sdk` with `FrameworkReference Include="Microsoft.AspNetCore.App"`). Houses cross-cutting abstractions reused by every service: `CQRS/` (ICommand, IQuery, handler interfaces — thin wrappers over MediatR's IRequest/IRequestHandler), `Behaviors/` (MediatR pipeline behaviors: `ValidationBehavior`, `LoggingBehavior`), `Exceptions/` (`NotFoundException`, `BadRequestException`, `InternalServerException` + `Handler/CustomExceptionHandler` that maps them to ProblemDetails). Every Web API service references this project — check it for an existing abstraction before pulling in an external library.
- `Services/Catalog/CatalogApi` — ASP.NET Core Web API (`Microsoft.NET.Sdk.Web`, `net10.0`, nullable + implicit usings). Packages: Carter, Marten, Mapster, MediatR (via BuildingBlocks), FluentValidation (via BuildingBlocks), HealthChecks.NpgSql/UI.Client. Handlers inject `IDocumentSession` directly.
- `Services/Basket/BasketApi` — same stack as Catalog. Adds an `IBasketRepository` abstraction (`Data/IBasketRepository.cs` + `BasketRepository : IBasketRepository` wrapping `IDocumentSession`); handlers inject the repository instead of the session. Aggregate is `ShoppingCart` keyed by `UserName` (not Guid) — registered with `opts.Schema.For<ShoppingCart>().Identity(x => x.UserName)` so `LoadAsync<ShoppingCart>(userName, ...)` works.

Additional services should follow `Services/<Domain>/<DomainApi>/` and be registered in `eshop-microservices.slnx` under a matching `<Folder Name="/Services/<Domain>/">`.

## Architecture

**Vertical slice CQRS.** One folder per use case under `<AggregateRoot>/<UseCase>/` (e.g. `Products/CreateProduct/` in Catalog, `Basket/StoreBasket/` in Basket — plural for collection aggregates, singular for single-per-user aggregates). Each slice holds two files:
- `<UseCase>Handler.cs` — contains the `Command`/`Query` record (implements `ICommand<TResult>` or `IQuery<TResult>` from BuildingBlocks), the `Result` record, optional `Validator : AbstractValidator<TCommand>`, and the internal `Handler` class. All four types share the feature's namespace.
- `<UseCase>Endpoint.cs` — contains `Request`/`Response` records and a `public class <UseCase>Endpoint : ICarterModule` that maps a single HTTP route, dispatches via `ISender`, and uses `Mapster.Adapt<>()` for Request→Command and Result→Response mapping.

Keep the transport shape (Request/Response) separate from the CQRS shape (Command/Result) even when the fields overlap — the DTO boundary lets the two evolve independently.

**MediatR pipeline** (registered in `Program.cs`, runs in this order):
1. `ValidationBehavior<TRequest, TResponse>` — constrained to `ICommand<TResponse>`, resolves `IEnumerable<IValidator<TRequest>>` and aggregates failures into a `FluentValidation.ValidationException`.
2. `LoggingBehavior<TRequest, TResponse>` — constrained to `IRequest<TResponse>` (both commands and queries), logs START/END, Stopwatch-times the handler, warns on >3s. Handlers should **not** add their own entry-log calls.

**Persistence: Marten document store on Postgres.** Connection string `ConnectionStrings:Database`. Registered with `.UseLightweightSessions()` (no identity map / dirty tracking). Catalog handlers inject `IDocumentSession` directly and call `session.Store/Update/Delete/LoadAsync/Query<T>()/ToListAsync/ToPagedListAsync` (Marten.Pagination). Basket uses a repository abstraction (`IBasketRepository`) over the session so handlers stay persistence-agnostic — match that shape when a service needs to wrap Marten calls or layer caching on top. `CatalogInitialData : IInitialData` under `Data/` seeds products — **wired in only when `builder.Environment.IsDevelopment()`**.

**Non-Guid document identities.** Marten defaults to `Guid`/`int`/`long`/`string` identity conventions on a property named `Id`. For aggregates keyed by something else (e.g. `ShoppingCart.UserName`), declare it in the `AddMarten` options: `opts.Schema.For<T>().Identity(x => x.UserName)`. Without this, `LoadAsync<T>(stringKey, ...)` will not resolve.

**Exception handling.** Handlers throw BuildingBlocks exceptions (or service-specific subclasses like `ProductNotFoundException : NotFoundException`). `CustomExceptionHandler : IExceptionHandler` pattern-matches on exception type, returns `ProblemDetails` with appropriate status (400/404/500) plus `traceId` and — for `ValidationException` — a `ValidationErrors` extension. Registered via `AddExceptionHandler<CustomExceptionHandler>()` + `app.UseExceptionHandler(_ => {})`.

**GlobalUsings.cs** per service covers the recurring namespaces (`BuildingBlocks.CQRS`, `Carter`, `<Service>.Exceptions`, `<Service>.Models`, Mapster, MediatR, Marten, FluentValidation, plus `<Service>.Data` in services that use a repository abstraction). Feature files start directly with `namespace ...;` — don't add per-file `using` lines for these.

**Health checks.** `/health` exposed via `app.MapHealthChecks(...)` (endpoint routing — **not** `UseHealthChecks`, which doesn't hook into the Carter/MapX pipeline and will 404). Uses `AddNpgSql(...)` plus `UIResponseWriter.WriteHealthCheckUIResponse` for structured JSON output.

## Common commands

Run from `src/`.

Build the whole solution:
```
dotnet build eshop-microservices.slnx
```

Run the API locally (outside Docker — requires local Postgres on `localhost:5432`):
```
dotnet run --project Services/Catalog/CatalogApi/CatalogApi.csproj
```

Launch profiles (`Services/Catalog/CatalogApi/Properties/launchSettings.json`): `http` → `localhost:5000`, `https` → `localhost:5050` + `localhost:5000`, `Container (Dockerfile)` → VS-driven container debug (ports 8080/8081).

Docker compose (preferred — brings up Postgres + API together):
```
docker compose up -d --build
```
Maps `catalogapi` to host `6000` (HTTP) / `6060` (HTTPS), `catalogdb` (postgres) to `5432`. Inside the compose network the API reaches Postgres via `Server=catalogdb;...` (overridden in `docker-compose.override.yml`); outside, `appsettings.json` points at `localhost`.

Docker image build only:
```
docker compose build catalogapi
```

No test projects exist yet; no lint/format config beyond defaults.

## Conventions worth preserving

- Target framework is `net10.0` across services.
- New feature = new folder under `<ServiceApi>/<AggregateRoot>s/<UseCase>/` with exactly two files (handler + endpoint). Don't split records into separate files.
- Handlers are `internal`; endpoints, commands, results, requests, responses, validators are `public`.
- DTO/record naming: `<UseCase>Command`/`Query`, `<UseCase>Result`, `<UseCase>Request`, `<UseCase>Response`, `<UseCase>Validator`.
- `postgres:17` is pinned in `docker-compose.yml` — `postgres:18+` changed its data-volume layout and won't start against older volume contents. Don't bump without a migration plan.
- Dockerfiles assume `src/` as build context and `COPY` both the service `.csproj` and `BuildingBlocks.csproj` before `dotnet restore`. When adding a service, match that pattern or restore will fail.
- Solution uses `.slnx`; add projects with `dotnet sln eshop-microservices.slnx add ...` or edit the XML directly, not by creating a legacy `.sln`.
