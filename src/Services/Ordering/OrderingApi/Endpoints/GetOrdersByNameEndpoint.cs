using Ordering.Application.Orders.Queries.GetOrdersByName;

namespace Ordering.Api.Endpoints;

public record GetOrdersByNameResponse(IEnumerable<OrderDto> Orders);

public class GetOrdersByNameEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // Steps:
        // 1. Bind the {orderName} route segment into the orderName string.
        // 2. Build a GetOrdersByNameQuery from the orderName.
        // 3. Send through MediatR — handler filters IApplicationDbContext.Orders by OrderName.Value and projects to OrderDto.
        // 4. Map the GetOrdersByNameResult to a GetOrdersByNameResponse.
        // 5. Return 200 OK with the matching orders.
        app.MapGet("/orders/{orderName}", async (string orderName, ISender sender) =>
        {
            var result = await sender.Send(new GetOrdersByNameQuery(orderName));

            var response = result.Adapt<GetOrdersByNameResponse>();

            return Results.Ok(response);
        })
        .WithName("GetOrdersByName")
        .Produces<GetOrdersByNameResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Get Orders By Name")
        .WithDescription("Get Orders By Name");
    }
}
