using Ordering.Application.Orders.Queries.GetOrders;

namespace Ordering.Api.Endpoints;

public record GetOrdersResponse(PaginatedResult<OrderDto> Orders);

public class GetOrdersEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // Steps:
        // 1. Bind ?PageIndex=&PageSize= query string into a PaginationRequest via [AsParameters] (defaults: 0 / 10).
        // 2. Wrap the PaginationRequest in a GetOrdersQuery.
        // 3. Send through MediatR — handler counts total rows, takes the requested page from IApplicationDbContext.Orders, projects to OrderDto.
        // 4. Map the GetOrdersResult into a GetOrdersResponse (carries the PaginatedResult<OrderDto>).
        // 5. Return 200 OK with the page payload.
        app.MapGet("/orders", async ([AsParameters] PaginationRequest request, ISender sender) =>
        {
            var result = await sender.Send(new GetOrdersQuery(request));

            var response = result.Adapt<GetOrdersResponse>();

            return Results.Ok(response);
        })
        .WithName("GetOrders")
        .Produces<GetOrdersResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Get Orders")
        .WithDescription("Get Orders");
    }
}
