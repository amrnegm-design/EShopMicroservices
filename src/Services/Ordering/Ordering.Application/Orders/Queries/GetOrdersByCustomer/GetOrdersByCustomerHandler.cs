using Ordering.Application.Extensions;

namespace Ordering.Application.Orders.Queries.GetOrdersByCustomer;

public class GetOrdersByCustomerHandler(IApplicationDbContext dbContext)
    : IQueryHandler<GetOrdersByCustomerQuery, GetOrdersByCustomerResult>
{
    public async Task<GetOrdersByCustomerResult> Handle(GetOrdersByCustomerQuery query, CancellationToken cancellationToken)
    {
        var customerId = CustomerId.Of(query.CustomerId);

        var orders = await dbContext.Orders
            .Include(o => o.OrderItems)
            .AsNoTracking()
            .Where(o => o.CustomerId == customerId)
            .OrderBy(o => o.OrderName.Value)
            .ToListAsync(cancellationToken);

        return new GetOrdersByCustomerResult(orders.ToOrderDtoList());
    }
}
