namespace Ordering.Infrastructure.Data.Extensions
{
    internal class InitialData
    {
        public static IEnumerable<Customer> Customers =>
            new List<Customer>
            {
                Customer.Create(CustomerId.Of(new Guid("58c49479-ec65-4de2-86e7-033c546291aa")), "mehmet", "mehmet@mehmet.com"),
                Customer.Create(CustomerId.Of(new Guid("c4bbc4a2-4555-45d8-97cc-2a99b2167bff")), "amr", "amr@amr.com")
            };

        public static IEnumerable<Product> Products =>
            new List<Product>
            {
                Product.Create(ProductId.Of(new Guid("5334c996-8457-4cf0-815c-ed2b77c4ff61")), "IPhone X", 500),
                Product.Create(ProductId.Of(new Guid("c67d6323-e8b1-4bdf-9a75-b0dd01fbd3ab")), "Samsung 10", 400)
            };

        public static IEnumerable<Order> OrdersWithItems
        {
            get
            {
                var address1 = Address.Of("mehmet", "ozkaya", "mehmet@gmail.com", "Egypt", "Cairo", "Cairo", "12345");
                var address2 = Address.Of("amr", "negm", "amr@gmail.com", "Egypt", "Giza", "Giza", "54321");

                var payment1 = Payment.Of("mehmet", "1234567890", "12/26", "123", 1);
                var payment2 = Payment.Of("amr", "0987654321", "11/27", "456", 2);

                var order1 = Order.Create(
                    OrderId.Of(new Guid("5334c996-8457-4cf0-815c-ed2b77c4ff62")),
                    CustomerId.Of(new Guid("58c49479-ec65-4de2-86e7-033c546291aa")),
                    OrderName.Of("ORD_1"),
                    shippingAddress: address1,
                    billingAddress: address1,
                    payment: payment1);

                order1.Add(ProductId.Of(new Guid("5334c996-8457-4cf0-815c-ed2b77c4ff61")), 2, 500);
                order1.Add(ProductId.Of(new Guid("c67d6323-e8b1-4bdf-9a75-b0dd01fbd3ab")), 1, 400);

                var order2 = Order.Create(
                    OrderId.Of(new Guid("c67d6323-e8b1-4bdf-9a75-b0dd01fbd3ac")),
                    CustomerId.Of(new Guid("c4bbc4a2-4555-45d8-97cc-2a99b2167bff")),
                    OrderName.Of("ORD_2"),
                    shippingAddress: address2,
                    billingAddress: address2,
                    payment: payment2);

                order2.Add(ProductId.Of(new Guid("5334c996-8457-4cf0-815c-ed2b77c4ff61")), 1, 500);
                order2.Add(ProductId.Of(new Guid("c67d6323-e8b1-4bdf-9a75-b0dd01fbd3ab")), 2, 400);

                return new List<Order> { order1, order2 };
            }
        }
    }
}
