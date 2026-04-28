using Ordering.Application.Orders.Commands.DeleteOrder;

namespace Ordering.Api.Endpoints;

public record DeleteOrderResponse(bool IsSuccess);

public class DeleteOrderEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // Steps:
        // 1. Bind the {id:guid} route segment into the id parameter.
        // 2. Build the DeleteOrderCommand directly from the id (no Request DTO needed — single primitive).
        // 3. Send through MediatR — ValidationBehavior checks id is non-empty; the handler removes the order and SaveChangesAsync commits.
        // 4. Map the DeleteOrderResult to a DeleteOrderResponse.
        // 5. Return 200 OK. Missing order surfaces as a 404 via CustomExceptionHandler.
        app.MapDelete("/orders/{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new DeleteOrderCommand(id));

            var response = result.Adapt<DeleteOrderResponse>();

            return Results.Ok(response);
        })
        .WithName("DeleteOrder")
        .Produces<DeleteOrderResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Delete Order")
        .WithDescription("Delete Order");
    }
}
