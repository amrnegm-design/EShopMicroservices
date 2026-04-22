using BuildingBlocks.Exceptions;

namespace BasketApi.Exceptions;

public class BasketNotFoundException : NotFoundException
{
    public BasketNotFoundException(string userName) : base("Basket", userName)
    {
    }
}
