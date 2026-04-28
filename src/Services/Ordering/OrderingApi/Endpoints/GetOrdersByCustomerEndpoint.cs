using Ordering.Application.Orders.Queries.GetOrdersByCustomer;

namespace Ordering.Api.Endpoints;

public record GetOrdersByCustomerResponse(IEnumerable<OrderDto> Orders);

public class GetOrdersByCustomerEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // Steps:
        // 1. Bind the {customerId:guid} route segment into the customerId parameter.
        // 2. Build a GetOrdersByCustomerQuery from the customerId.
        // 3. Send through MediatR — handler filters IApplicationDbContext.Orders by CustomerId and projects to OrderDto.
        // 4. Map the GetOrdersByCustomerResult to a GetOrdersByCustomerResponse.
        // 5. Return 200 OK with the matching orders.
        app.MapGet("/orders/customer/{customerId:guid}", async (Guid customerId, ISender sender) =>
        {
            var result = await sender.Send(new GetOrdersByCustomerQuery(customerId));

            var response = result.Adapt<GetOrdersByCustomerResponse>();

            return Results.Ok(response);
        })
        .WithName("GetOrdersByCustomer")
        .Produces<GetOrdersByCustomerResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Get Orders By Customer")
        .WithDescription("Get Orders By Customer");
    }
}
