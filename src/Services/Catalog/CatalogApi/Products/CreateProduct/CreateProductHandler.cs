
namespace CatalogApi.Products.CreateProduct;

public record CreateProductCommand(ProductDto Product) : ICommand<CreateProductResult>;

public record CreateProductResult(Guid Id);

internal class CreateProductHandler(IDocumentSession session)
    : ICommandHandler<CreateProductCommand, CreateProductResult>
{
    public async Task<CreateProductResult> Handle(CreateProductCommand command, CancellationToken cancellationToken)
    {
        //create product entity from commnd object product dto 

        var product = new Product()
        {
            Name = command.Product.Name,
            Category = command.Product.Category,
            Description = command.Product.Description,
            ImageFile = command.Product.ImageFile,
            Price = command.Product.Price,
        };

        // TODO
        //save database
        session.Store(product);
        await session.SaveChangesAsync(cancellationToken);

        //return result 
        return new CreateProductResult(product.Id);
    }
}
