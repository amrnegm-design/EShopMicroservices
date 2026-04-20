var builder = WebApplication.CreateBuilder(args);

// add service here DI

var app = builder.Build();

// add http request cycle 

app.Run();
