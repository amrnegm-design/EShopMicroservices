using DiscountGrpc;

namespace BasketApi.Basket.StoreBasket;

public record StoreBasketCommand(ShoppingCart Cart) : ICommand<StoreBasketResult>;

public record StoreBasketResult(string UserName);

public class StoreBasketCommandValidator : AbstractValidator<StoreBasketCommand>
{
    public StoreBasketCommandValidator()
    {
        RuleFor(x => x.Cart).NotNull().WithMessage("Cart is required");
        RuleFor(x => x.Cart.UserName)
            .NotEmpty().WithMessage("UserName is required")
            .When(x => x.Cart is not null);
    }
}

internal class StoreBasketHandler(IBasketRepository repository, DiscountProtoService.DiscountProtoServiceClient discountProto)
    : ICommandHandler<StoreBasketCommand, StoreBasketResult>
{
    public async Task<StoreBasketResult> Handle(StoreBasketCommand command, CancellationToken cancellationToken)
    {
        // Communicate with Discount.Grpc and calculate latest prices of products in the shopping cart
        await DeductDiscount(command.Cart, cancellationToken);

        await repository.StoreBasket(command.Cart, cancellationToken);

        return new StoreBasketResult(command.Cart.UserName);
    }

    private async Task DeductDiscount(ShoppingCart cart, CancellationToken cancellationToken)
    {
        foreach (var item in cart.Items)
        {
            var discount = await discountProto.GetDiscountAsync(new GetDiscountRequest { ProductName = item.ProductName }, cancellationToken: cancellationToken);
            item.Price = item.Price - (decimal)discount.Amount;
        }
    }
}
