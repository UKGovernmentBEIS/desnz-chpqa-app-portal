using WebApi.Services;

namespace WebApi.Middleware
{
    using Microsoft.AspNetCore.Http;
    using System.Text;
    using System.Text.Json;
    using System.Threading.Tasks;

    public class AssessorsMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceClientFactory _serviceClientFactory;  
        public AssessorsMiddleware(RequestDelegate next, IServiceClientFactory serviceClientFactory)
        {
            _next = next;
            _serviceClientFactory = serviceClientFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Short-circuit for GET or other methods that don't need body buffering
            if (context.Request.Method == HttpMethods.Post || context.Request.Method == HttpMethods.Put || context.Request.Method == HttpMethods.Delete)
            {
                // Enable buffering for the request body only when needed
                context.Request.EnableBuffering();
            }

            // Extract value from query string, headers, or form body (for POST/PUT)
            var value = await GetRequestValueAsync(context);

            //todo if SubmissionId provided 


            // Extract user claims only if required for validation
            var userClaim = GetUserClaim(context, "preferred_username");

            // Validate request (presumably with value and user claim)
            bool validated = await YourGlobalFunction(value, userClaim);

            // If validation fails, return 401 and short-circuit
            if (!validated)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Unauthorized");
                return; // End request here, do not call next middleware
            }

            // Call the next middleware in the pipeline
            await _next(context);
        }


        private async Task<string> GetRequestValueAsync(HttpContext context)
        {
            // Array of possible query and form parameter names (more efficient than List for fixed size)
            var parameterNames = new[] { "submissionId", "idSubmission", "SubmissionId" };

            // Check query parameters first
            foreach (var param in parameterNames)
            {
                if (context.Request.Query.TryGetValue(param, out var queryValue) && !string.IsNullOrEmpty(queryValue))
                {
                    return queryValue; // Return first non-empty query value
                }
            }

            // Only process form and JSON body for POST/PUT/DELETE requests
            if (context.Request.Method == HttpMethods.Post || context.Request.Method == HttpMethods.Put || context.Request.Method == HttpMethods.Delete)
            {
                if (context.Request.HasFormContentType)
                {
                    // Process form data
                    foreach (var param in parameterNames)
                    {
                        if (context.Request.Form.TryGetValue(param, out var formValue) && !string.IsNullOrEmpty(formValue))
                        {
                            return formValue; // Return first non-empty form value
                        }
                    }
                }
                else if (context.Request.ContentType?.StartsWith("application/json") == true)
                {
                    // Process JSON body
                    context.Request.EnableBuffering(); // Enable re-reading the body stream
                    using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
                    var body = await reader.ReadToEndAsync();
                    context.Request.Body.Position = 0; // Reset the stream position

                    using var jsonDocument = JsonDocument.Parse(body);

                    foreach (var param in parameterNames)
                    {
                        if (jsonDocument.RootElement.TryGetProperty(param, out var jsonElement) &&
                            jsonElement.ValueKind == JsonValueKind.String &&
                            !string.IsNullOrEmpty(jsonElement.GetString()))
                        {
                            return jsonElement.GetString(); // Return first non-empty JSON value
                        }
                    }
                }
            }

            return null; // Return null if no matching parameter is found
        }
        private async Task<bool> YourGlobalFunction(string value, string userClaim)
        {
            //todo validate SubmissionId also 

            using (var serviceClient = _serviceClientFactory.CreateServiceClient())
            {               
                return await AuthorizationService.ValidateTAssessorRole(userClaim, serviceClient);
            }
        }
        // Extract specific user claim (e.g., "sub", "email", etc.)
        private string GetUserClaim(HttpContext context, string claimType)
        {
            return context.User?.Claims?.FirstOrDefault(c => c.Type == claimType)?.Value ?? string.Empty;
        }
    }
}

