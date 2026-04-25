# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Solution layout

.NET 10 microservices solution for an eShop-style system. Defined by `eshop-microservices.slnx` (XML-based, not legacy `.sln`).

Current projects:
- `BuildingBlocks/BuildingBlocks` — shared class library (`Microsoft.NET.Sdk` with `FrameworkReference Include="Microsoft.AspNetCore.App"`). Houses cross-cutting abstractions reused by every service: `CQRS/` (ICommand, IQuery, handler interfaces — thin wrappers over MediatR's IRequest/IRequestHandler), `Behaviors/` (MediatR pipeline behaviors: `ValidationBehavior`, `LoggingBehavior`), `Exceptions/` (`NotFoundException`, `BadRequestException`, `InternalServerException` + `Handler/CustomExceptionHandler` that maps them to ProblemDetails). Every Web API service references this project — check it for an existing abstraction before pulling in an external library.
- `Services/Catalog/CatalogApi` — ASP.NET Core Web API (`Microsoft.NET.Sdk.Web`, `net10.0`, nullable + implicit usings). Packages: Carter, Marten, Mapster, MediatR (via BuildingBlocks), FluentValidation (via BuildingBlocks), HealthChecks.NpgSql/UI.Client. Handlers inject `IDocumentSession` directly.
- `Services/Basket/BasketApi` — same stack as Catalog. Adds an `IBasketRepository` abstraction (`Data/IBasketRepository.cs` + `BasketRepository : IBasketRepository` wrapping `IDocumentSession`); handlers inject the repository instead of the session. Aggregate is `ShoppingCart` keyed by `UserName` (not Guid) — registered with `opts.Schema.For<ShoppingCart>().Identity(x => x.UserName)` so `LoadAsync<ShoppingCart>(userName, ...)` works. **Cache-aside via decorator:** `CachedBasketRepository : IBasketRepository` wraps the real repo over `IDistributedCache` (Redis, `AddStackExchangeRedisCache`, connection string `ConnectionStrings:Redis`) and is wired via `services.Decorate<IBasketRepository, CachedBasketRepository>()` (Scrutor) so handlers keep injecting `IBasketRepository` unchanged. **gRPC client:** registers `DiscountProtoService.DiscountProtoServiceClient` via `AddGrpcClient<>` against `GrpcSettings:DiscountUrl`, with `DangerousAcceptAnyServerCertificateValidator` for local dev.
- `Services/Discount/DiscountGrpc` — gRPC service (`Microsoft.NET.Sdk.Web`, `net10.0`). Uses **EF Core** (not Marten) with `DiscountContext` + migrations under `Migrations/`, `Data/Extensions/DatabaseExtensions.cs` for seed/migrate-on-startup. Proto contract in `Protos/discount.proto` generates `DiscountProtoService` consumed by BasketApi.
- `Services/Ordering/` — **clean-architecture layering** (4 projects, not vertical-slice like Catalog/Basket). Currently a scaffold; DI extension methods return services unchanged — fill them in as features arrive. Layers:
  - `Ordering.Domain` (`Microsoft.NET.Sdk`) — no dependencies. Entities, value objects, domain events.
  - `Ordering.Application` (`Microsoft.NET.Sdk`) — references `BuildingBlocks` + `Ordering.Domain`. Exposes `DependencyInjection.AddApplicationServices(this IServiceCollection)` — MediatR handlers, pipeline behaviors, validators register here.
  - `Ordering.Infrastructure` (`Microsoft.NET.Sdk`) — references `Ordering.Application`. Exposes `DependencyInjection.AddInfrastructureServices(this IServiceCollection, IConfiguration)` — DbContext, repositories, external integrations register here.
  - `OrderingApi` (`Microsoft.NET.Sdk.Web`) — references Application + Infrastructure. Namespace is `Ordering.Api` (not `OrderingApi`). Exposes `AddApiServices(IServiceCollection, IConfiguration)` and `UseApiServices(WebApplication)`. `Program.cs` chains `AddApplicationServices().AddInfrastructureServices(cfg).AddApiServices(cfg)` then `app.UseApiServices()` — preserve this chain when adding wiring.

Additional services should follow `Services/<Domain>/<DomainApi>/` (vertical-slice) or `Services/<Domain>/Ordering.*` (clean-arch) and be registered in `eshop-microservices.slnx` under a matching `<Folder Name="/Services/<Domain>/">`.

## Architecture

Two styles coexist: **vertical-slice CQRS** in Catalog/Basket and **clean-architecture layering** in Ordering. Pick the one that matches the service you're editing — don't mix shapes within a single service.

**Vertical slice CQRS (Catalog, Basket).** One folder per use case under `<AggregateRoot>/<UseCase>/` (e.g. `Products/CreateProduct/` in Catalog, `Basket/StoreBasket/` in Basket — plural for collection aggregates, singular for single-per-user aggregates). Each slice holds two files:
- `<UseCase>Handler.cs` — contains the `Command`/`Query` record (implements `ICommand<TResult>` or `IQuery<TResult>` from BuildingBlocks), the `Result` record, optional `Validator : AbstractValidator<TCommand>`, and the internal `Handler` class. All four types share the feature's namespace.
- `<UseCase>Endpoint.cs` — contains `Request`/`Response` records and a `public class <UseCase>Endpoint : ICarterModule` that maps a single HTTP route, dispatches via `ISender`, and uses `Mapster.Adapt<>()` for Request→Command and Result→Response mapping.

Keep the transport shape (Request/Response) separate from the CQRS shape (Command/Result) even when the fields overlap — the DTO boundary lets the two evolve independently.

**MediatR pipeline** (registered in `Program.cs`, runs in this order):
1. `ValidationBehavior<TRequest, TResponse>` — constrained to `ICommand<TResponse>`, resolves `IEnumerable<IValidator<TRequest>>` and aggregates failures into a `FluentValidation.ValidationException`.
2. `LoggingBehavior<TRequest, TResponse>` — constrained to `IRequest<TResponse>` (both commands and queries), logs START/END, Stopwatch-times the handler, warns on >3s. Handlers should **not** add their own entry-log calls.

**Clean-architecture layering (Ordering).** Four projects — Domain → Application → Infrastructure → Api — with dependencies pointing inward. Each non-Domain layer ships a `DependencyInjection.cs` with a single public extension method (`AddApplicationServices` / `AddInfrastructureServices` / `AddApiServices`, plus `UseApiServices` for middleware); `Program.cs` is just the composition chain. When adding to Ordering, register new services inside the owning layer's extension method rather than in `Program.cs`. MediatR/FluentValidation/Carter registrations belong in `Ordering.Application`; DbContext/repos/caches/gRPC clients in `Ordering.Infrastructure`; exception handlers, Carter mapping, health checks, auth in `OrderingApi`.

**Persistence: Marten document store on Postgres** (Catalog, Basket). Connection string `ConnectionStrings:Database`. Registered with `.UseLightweightSessions()` (no identity map / dirty tracking). Catalog handlers inject `IDocumentSession` directly and call `session.Store/Update/Delete/LoadAsync/Query<T>()/ToListAsync/ToPagedListAsync` (Marten.Pagination). Basket uses a repository abstraction (`IBasketRepository`) over the session so handlers stay persistence-agnostic — match that shape when a service needs to wrap Marten calls or layer caching on top. `CatalogInitialData : IInitialData` under `Data/` seeds products — **wired in only when `builder.Environment.IsDevelopment()`**. Ordering and Discount use **EF Core** instead — don't assume Marten across the whole solution.

**Cache-aside via decorator (Basket).** Don't put caching logic inside the real repository. Write a second `IBasketRepository` implementation (`CachedBasketRepository`) that takes `IBasketRepository, IDistributedCache` in its primary constructor and delegates; register both with `AddScoped<IBasketRepository, BasketRepository>()` then `services.Decorate<IBasketRepository, CachedBasketRepository>()` (Scrutor). Handlers stay unchanged. Apply the same pattern when any other service needs caching.

**Non-Guid document identities.** Marten defaults to `Guid`/`int`/`long`/`string` identity conventions on a property named `Id`. For aggregates keyed by something else (e.g. `ShoppingCart.UserName`), declare it in the `AddMarten` options: `opts.Schema.For<T>().Identity(x => x.UserName)`. Without this, `LoadAsync<T>(stringKey, ...)` will not resolve.

**Exception handling.** Handlers throw BuildingBlocks exceptions (or service-specific subclasses like `ProductNotFoundException : NotFoundException`). `CustomExceptionHandler : IExceptionHandler` pattern-matches on exception type, returns `ProblemDetails` with appropriate status (400/404/500) plus `traceId` and — for `ValidationException` — a `ValidationErrors` extension. Registered via `AddExceptionHandler<CustomExceptionHandler>()` + `app.UseExceptionHandler(_ => {})`.

**Inter-service communication: gRPC.** Contracts live in the producer (`Services/<Domain>/<DomainGrpc>/Protos/*.proto`); consumers reference the producer project and register a typed client via `builder.Services.AddGrpcClient<TClient>(o => o.Address = new Uri(cfg["GrpcSettings:<Name>Url"]!))`. For local/dev over self-signed TLS, chain `.ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator })` — **dev only**; do not carry that into prod config.

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
- **Vertical-slice services (Catalog, Basket):** new feature = new folder under `<ServiceApi>/<AggregateRoot>s/<UseCase>/` with exactly two files (handler + endpoint). Don't split records into separate files. Handlers are `internal`; endpoints, commands, results, requests, responses, validators are `public`. DTO/record naming: `<UseCase>Command`/`Query`, `<UseCase>Result`, `<UseCase>Request`, `<UseCase>Response`, `<UseCase>Validator`.
- **Clean-arch services (Ordering):** keep each concern in its owning layer (Domain/Application/Infrastructure/Api). New DI registrations go into the layer's `DependencyInjection.cs` extension method — not `Program.cs`. Don't introduce upstream references (Domain must never see Application; Application must never see Infrastructure or Api).
- `postgres:17` is pinned in `docker-compose.yml` — `postgres:18+` changed its data-volume layout and won't start against older volume contents. Don't bump without a migration plan.
- Dockerfiles assume `src/` as build context and `COPY` both the service `.csproj` and `BuildingBlocks.csproj` before `dotnet restore`. When adding a service, match that pattern or restore will fail. Ordering's multi-project layout means its Dockerfile must COPY all four `.csproj` files before restore.
- Solution uses `.slnx`; add projects with `dotnet sln eshop-microservices.slnx add ...` or edit the XML directly, not by creating a legacy `.sln`.
