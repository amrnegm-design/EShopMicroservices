using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace BasketApi.Data;

public class CachedBasketRepository(IBasketRepository repository, IDistributedCache cache) : IBasketRepository
{
    public async Task<ShoppingCart> GetBasket(string userName, CancellationToken cancellationToken = default)
    {
        var cachedBasket = await cache.GetStringAsync(userName, cancellationToken);
        if (!string.IsNullOrEmpty(cachedBasket))
            return JsonSerializer.Deserialize<ShoppingCart>(cachedBasket)!;

        var basket = await repository.GetBasket(userName, cancellationToken); //db call
        await cache.SetStringAsync(userName, JsonSerializer.Serialize(basket), cancellationToken);

        return basket;
    }

    public async Task<ShoppingCart> StoreBasket(ShoppingCart basket, CancellationToken cancellationToken = default)
    {
        await repository.StoreBasket(basket, cancellationToken); //store in db

        await cache.SetStringAsync(basket.UserName, JsonSerializer.Serialize(basket), cancellationToken);

        return basket;
    }

    public async Task<bool> DeleteBasket(string userName, CancellationToken cancellationToken = default)
    {
        var deleted = await repository.DeleteBasket(userName, cancellationToken); //remove from db

        await cache.RemoveAsync(userName, cancellationToken);

        return deleted;
    }
}
