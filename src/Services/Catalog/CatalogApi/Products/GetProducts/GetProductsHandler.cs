namespace CatalogApi.Products.GetProducts;

public record GetProductsQuery() : IQuery<GetProductsResult>;

public record GetProductsResult(IEnumerable<Product> Products);

internal class GetProductsHandler(IDocumentSession session)
    : IQueryHandler<GetProductsQuery, GetProductsResult>
{
    public async Task<GetProductsResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
    {
        // load products from database
        var products = await session.Query<Product>().ToListAsync(cancellationToken);

        // return result
        return new GetProductsResult(products);
    }
}
