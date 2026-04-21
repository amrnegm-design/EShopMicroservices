namespace CatalogApi.Products.GetProducts;

public record GetProductsQuery() : IQuery<GetProductsResult>;

public record GetProductsResult(IEnumerable<Product> Products);

internal class GetProductsHandler(IDocumentSession session, ILogger<GetProductsHandler> logger)
    : IQueryHandler<GetProductsQuery, GetProductsResult>
{
    public async Task<GetProductsResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
    {
        logger.LogInformation("GetProductsHandler.Handle called with {@Query}", query);

        // load products from database
        var products = await session.Query<Product>().ToListAsync(cancellationToken);

        // return result
        return new GetProductsResult(products);
    }
}
