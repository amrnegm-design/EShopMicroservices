using Ordering.Application.Orders.Commands.CreateOrder;

namespace Ordering.Api.Endpoints;

public record CreateOrderRequest(OrderDto Order);

public record CreateOrderResponse(Guid Id);

public class CreateOrderEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // Steps:
        // 1. Bind the incoming JSON body into a CreateOrderRequest DTO.
        // 2. Map the request DTO to the CreateOrderCommand (CQRS shape).
        // 3. Send the command through MediatR — pipeline runs ValidationBehavior then LoggingBehavior, then the handler persists the order via IApplicationDbContext.
        // 4. Map the CreateOrderResult back to a CreateOrderResponse DTO.
        // 5. Return 201 Created with a Location header pointing at the new order.
        app.MapPost("/orders", async (CreateOrderRequest request, ISender sender) =>
        {
            var command = request.Adapt<CreateOrderCommand>();

            var result = await sender.Send(command);

            var response = result.Adapt<CreateOrderResponse>();

            return Results.Created($"/orders/{response.Id}", response);
        })
        .WithName("CreateOrder")
        .Produces<CreateOrderResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Create Order")
        .WithDescription("Create Order");
    }
}
