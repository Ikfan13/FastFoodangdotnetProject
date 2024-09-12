using FastFoodApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class JwtTokenService
{
    private readonly IConfiguration _configuration;
    private readonly FoodContext _context;  // Use your DbContext to interact with the database

    public JwtTokenService(IConfiguration configuration, FoodContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    // Method to authenticate user and generate token
    public async Task<string> AuthenticateAndGenerateTokenAsync(string username, string password)
    {
        // Query the database to find the user by username
        var user = await _context.Users
            .Where(u => u.Username == username && u.Password == password)  // Adjust as per your schema
            .FirstOrDefaultAsync();

        if (user == null)
        {
            // Return null if the user is not found or password doesn't match
            return null;
        }

        // Generate a JWT token for the authenticated user
        return GenerateToken(user);
    }

    // Method to generate JWT token
    public string GenerateToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("UserId", user.Id.ToString()) // Add UserId as a claim if needed
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(double.Parse(_configuration["JwtSettings:ExpiresInMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
