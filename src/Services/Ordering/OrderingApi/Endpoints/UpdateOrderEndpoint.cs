using Ordering.Application.Orders.Commands.UpdateOrder;

namespace Ordering.Api.Endpoints;

public record UpdateOrderRequest(OrderDto Order);

public record UpdateOrderResponse(bool IsSuccess);

public class UpdateOrderEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        // Steps:
        // 1. Bind the incoming JSON body into an UpdateOrderRequest DTO.
        // 2. Map the request DTO to the UpdateOrderCommand.
        // 3. Send the command through MediatR — ValidationBehavior runs first; the handler then loads the existing order, applies Update(), and SaveChangesAsync triggers the domain-event interceptor.
        // 4. Map the UpdateOrderResult to an UpdateOrderResponse.
        // 5. Return 200 OK. CustomExceptionHandler maps OrderNotFoundException to 404 if the id doesn't exist.
        app.MapPut("/orders", async (UpdateOrderRequest request, ISender sender) =>
        {
            var command = request.Adapt<UpdateOrderCommand>();

            var result = await sender.Send(command);

            var response = result.Adapt<UpdateOrderResponse>();

            return Results.Ok(response);
        })
        .WithName("UpdateOrder")
        .Produces<UpdateOrderResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .WithSummary("Update Order")
        .WithDescription("Update Order");
    }
}
