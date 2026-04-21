using Marten.Schema;

namespace CatalogApi.Data;

public class CatalogInitialData : IInitialData
{
    public async Task Populate(IDocumentStore store, CancellationToken cancellation)
    {
        using var session = store.LightweightSession();

        if (await session.Query<Product>().AnyAsync())
            return;

        session.Store<Product>(GetPreconfiguredProducts());
        await session.SaveChangesAsync();
    }

    private static IEnumerable<Product> GetPreconfiguredProducts() => new List<Product>()
    {
        new()
        {
            Id = new Guid("5334c996-8457-4cf0-815c-ed2b77c4ff61"),
            Name = "IPhone X",
            Description = "This phone is the company's biggest change to its flagship smartphone in years. It has a 5.8-inch screen, near bezel-less design, and overall sleeker look.",
            ImageFile = "product-1.png",
            Price = 950.00M,
            Category = new List<string> { "Smart Phone" }
        },
        new()
        {
            Id = new Guid("c67d6323-e8b1-4bdf-9a75-b0dd3fbe3059"),
            Name = "Samsung 10",
            Description = "The Samsung Galaxy S10 is a smartphone in the Samsung Galaxy S series, succeeding the Samsung Galaxy S9. Galaxy S10 phones have features like a hole-punch camera cutout, ultrasonic fingerprint sensor, triple rear camera, and more.",
            ImageFile = "product-2.png",
            Price = 840.00M,
            Category = new List<string> { "Smart Phone" }
        },
        new()
        {
            Id = new Guid("4f136e9f-ff8c-4c1f-9a33-d12f689bdab8"),
            Name = "Huawei Plus",
            Description = "Huawei's Ascend Plus is a dual-SIM smartphone that offers excellent value for money.",
            ImageFile = "product-3.png",
            Price = 650.00M,
            Category = new List<string> { "White Appliances" }
        },
        new()
        {
            Id = new Guid("6ec1297b-ec0a-4aa1-be25-6726e3b51a27"),
            Name = "Xiaomi Mi 9",
            Description = "Xiaomi Mi 9 features a triple rear camera, an AMOLED display with an in-display fingerprint sensor, and Qualcomm Snapdragon 855 SoC.",
            ImageFile = "product-4.png",
            Price = 470.00M,
            Category = new List<string> { "White Appliances" }
        },
        new()
        {
            Id = new Guid("b786103d-c621-4f5a-b498-23452610f88c"),
            Name = "HTC U11+ Plus",
            Description = "The HTC U11+ is a refreshed flagship from HTC. It comes with an all-new 6-inch Quad HD+ display, Snapdragon 835 processor, and a powerful 12 MP UltraPixel rear camera.",
            ImageFile = "product-5.png",
            Price = 380.00M,
            Category = new List<string> { "Smart Phone" }
        },
        new()
        {
            Id = new Guid("c4bbc448-04ee-4c4e-a3fd-364cdb43cbc8"),
            Name = "LG G7 ThinQ",
            Description = "LG G7 ThinQ is the flagship smartphone from LG for the year 2018. It features a 6.1-inch QHD+ FullVision display with a notch and dual rear cameras.",
            ImageFile = "product-6.png",
            Price = 240.00M,
            Category = new List<string> { "Home Kitchen" }
        }
    };
}
