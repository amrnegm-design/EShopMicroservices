var builder = WebApplication.CreateBuilder(args);

// add service here DI
builder.Services.AddCarter();
builder.Services.AddMediatR(config =>
{
    config.RegisterServicesFromAssembly(typeof(Program).Assembly);
});
builder.Services.AddMarten(opts =>
{
    opts.Connection(builder.Configuration.GetConnectionString("Database")!);
}).UseLightweightSessions();


var app = builder.Build();

// add http request cycle
app.MapCarter();

app.Run();
