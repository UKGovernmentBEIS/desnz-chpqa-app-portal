using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerUI;
using System.Reflection;
using System.Text;
using System.Text.Json;
using WebApi.Middleware;
using WebApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();

builder.Logging.AddConsole();

var configuration = builder.Configuration;

// Add services to the container.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = configuration["KeycloakAuthority"];
                options.Audience = configuration["KeycloakAudience"];
                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateIssuerSigningKey = true,
                    ValidateAudience = false,
                    ValidateLifetime = true,                
                    ClockSkew = TimeSpan.Zero,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("clientSecret")))

                };
                options.RequireHttpsMetadata = false;
            });

builder.Services.AddAuthorization();

builder.Services.AddSwaggerGen(_ =>
{
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml"; 
    _.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
    

    _.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer {token}' here",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    });
    _.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    new string[] { }
                }
            });
});

//builder.Services.AddTransient<IServiceClientFactory>(provider =>
//{
//    return new ServiceClientFactory(configuration.GetConnectionString("default"));
//});

builder.Services.AddTransient<IServiceClientFactory>(provider =>
{
    return new ServiceClientFactory(configuration["DynamicsUrl"], Environment.GetEnvironmentVariable("DynamicsClientId"), Environment.GetEnvironmentVariable("DynamicsClientSecret"));
});

builder.Services.AddTransient<IJwtTokenService>(provider =>
{
    return new JwtTokenService(Environment.GetEnvironmentVariable("clientSecret"));
});

builder.Services.Configure<ClamAVSettings>(builder.Configuration.GetSection("ClamAV"));
builder.Services.AddTransient<ClamAVScanner>();

builder.Services.AddControllers();
builder.Services.AddHostedService<EmailPeriodicTaskService>();

builder.Services.AddEndpointsApiExplorer();

// Add health checks services
builder.Services.AddHealthChecks()
    .AddCheck("Proxy_Health_Check", () =>
    {
        // Add logic here to check the health of the proxy service
        return HealthCheckResult.Healthy("Proxy service is healthy");
    });

var app = builder.Build();

//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();  
    app.UseSwaggerUI(_ =>
    {
        _.SwaggerEndpoint("/swagger/v1/swagger.json", "CHPQA API v1");
        _.DocExpansion(DocExpansion.List);
        _.EnableDeepLinking();

        // Enable OAuth2 authorization support in Swagger UI
        _.OAuthClientId(configuration["KeycloakAudience"]);
        _.OAuthAppName("Swagger");
    });
    app.UseDeveloperExceptionPage();
 //}

app.UseCors(builder =>builder.WithOrigins(configuration.GetSection("AllowedOrigins").Get<string[]>()).AllowAnyHeader().AllowAnyMethod());


app.UseHttpsRedirection();
app.UseStaticFiles();

// Map health checks to an API route with detailed JSON response
app.MapHealthChecks("/api/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(entry => new
            {
                check = entry.Key,
                status = entry.Value.Status.ToString(),
                description = entry.Value.Description
            }),
            totalDuration = report.TotalDuration.TotalMilliseconds
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
});

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();


// Your MapWhen logic
app.MapWhen(context => context.Request.Path.StartsWithSegments("/api/secure"), appBuilder =>
{
    appBuilder.UseMiddleware<GlobalFunctionMiddleware>();
    appBuilder.UseEndpoints(endpoints => { endpoints.MapControllers().RequireAuthorization(); });
});

app.MapWhen(context => context.Request.Path.StartsWithSegments("/api/assessors"), appBuilder =>
{
    appBuilder.UseMiddleware<AssessorsMiddleware>();
    appBuilder.UseEndpoints(endpoints => { endpoints.MapControllers().RequireAuthorization(); });
});

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers().RequireAuthorization();
}
);

app.Run();
