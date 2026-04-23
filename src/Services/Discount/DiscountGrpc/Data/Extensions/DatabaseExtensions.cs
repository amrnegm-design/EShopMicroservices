using Microsoft.EntityFrameworkCore;

namespace DiscountGrpc.Data.Extensions;

public static class DatabaseExtensions
{
    public static async Task<IApplicationBuilder> UseMigrationAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DiscountContext>();

        await dbContext.Database.MigrateAsync();

        return app;
    }
}
