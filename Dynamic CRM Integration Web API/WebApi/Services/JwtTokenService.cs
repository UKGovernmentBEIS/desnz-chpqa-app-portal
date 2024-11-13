using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace WebApi.Services
{
    public interface IJwtTokenService
    {
        string GenerateToken(string usage, string claimName, string claimValue, long expirationInterval);
        string VerifyToken(string token, string subject, string claimValue);
    }

    public class JwtTokenService : IJwtTokenService
    {
        private readonly string _clientSecret;

        public JwtTokenService(string clientSecret)
        {
            _clientSecret = clientSecret;
        }

        public string GenerateToken(string usage, string claimName, string claimValue, long expirationInterval)
        {
            var now = DateTime.Now;
            var issued = now;
            var expires = now.AddMinutes(expirationInterval);

            byte[] keyBytes = Encoding.UTF8.GetBytes(_clientSecret);

            // Create a SHA-256 hash of the key
            using (var sha256 = SHA256.Create())
            {
                keyBytes = sha256.ComputeHash(keyBytes);
            }

            // Create a symmetric security key using the generated key bytes
            var key = new SymmetricSecurityKey(keyBytes);

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim(claimName, claimValue), new Claim("usage", usage) }),
                Expires = DateTime.UtcNow.AddMinutes(expirationInterval),
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature),
                Audience = "uk-pmrv-web-app"
            };

            var handler = new JwtSecurityTokenHandler();
            var token = handler.CreateToken(tokenDescriptor);
            return handler.WriteToken(token);
        }

        public string VerifyToken(string token, string subject, string claimValue)
        {

            if (token == null)
                return null;

            var tokenHandler = new JwtSecurityTokenHandler();


            byte[] keyBytes = Encoding.UTF8.GetBytes(_clientSecret);


            using (var sha256 = SHA256.Create())
            {
                keyBytes = sha256.ComputeHash(keyBytes);
            }

            var key = new SymmetricSecurityKey(keyBytes);
            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var email = jwtToken.Claims.First(x => x.Type == "user_email").Value;


                return email;
            }
            catch (SecurityTokenExpiredException)
            {
                throw new BusinessException(ErrorCode.VerificationLinkExpired);
            }
            catch (SecurityTokenValidationException)
            {
                throw new BusinessException(ErrorCode.InvalidToken);
            }
        }
    }

    public class BusinessException : Exception
    {
        public ErrorCode ErrorCode { get; }

        public BusinessException(ErrorCode errorCode)
        {
            ErrorCode = errorCode;
        }

        public BusinessException(ErrorCode errorCode, string message) : base(message)
        {
            ErrorCode = errorCode;
        }

        public BusinessException(ErrorCode errorCode, string message, Exception innerException) : base(message, innerException)
        {
            ErrorCode = errorCode;
        }
    }

    public enum ErrorCode
    {
        InvalidToken,
        VerificationLinkExpired
    }
}
