using CatalogApi.Models;
using MediatR;

namespace CatalogApi.Products.CreateProduct;

public record CreateProductCommand(ProductDto Product) : IRequest<CreateProductResult>;

public record CreateProductResult(Guid Id);

internal class CreateProductHandler : IRequestHandler<CreateProductCommand, CreateProductResult>
{
    public Task<CreateProductResult> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        //create product logic
        throw new NotImplementedException();
    }
}
