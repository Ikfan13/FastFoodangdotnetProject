using FastFoodApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FastFoodApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    
    public class FoodItemsController : ControllerBase
    {
        private readonly FoodContext _context;

        public FoodItemsController(FoodContext context)
        {
            _context = context;
        }

        [AllowAnonymous]

        [HttpGet]
        public async Task<IActionResult> GetFoodItems()
        {
            var foodItems = await _context.FoodItems.ToListAsync();
            return Ok(foodItems);
        }



        [HttpGet("{id}")]
        public async Task<IActionResult> GetFoodItemById(int id)
        {
            var foodItem = await _context.FoodItems.FindAsync(id);
            if (foodItem == null)
            {
                return NotFound();
            }
            return Ok(foodItem);
        }

        [HttpPost]
        public async Task<IActionResult> CreateFoodItem([FromBody] FoodItem foodItem)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.FoodItems.Add(foodItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFoodItemById), new { id = foodItem.Id }, foodItem);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFoodItem(int id, [FromBody] FoodItem updatedFoodItem)
        {
            if (id != updatedFoodItem.Id)
            {
                return BadRequest("FoodItem ID mismatch.");
            }

            var foodItem = await _context.FoodItems.FindAsync(id);
            if (foodItem == null)
            {
                return NotFound("FoodItem not found.");
            }

            foodItem.Name = updatedFoodItem.Name;
            foodItem.Description = updatedFoodItem.Description;
            foodItem.Price = updatedFoodItem.Price;
            foodItem.ImgUrl = updatedFoodItem.ImgUrl;
            foodItem.FoodType = updatedFoodItem.FoodType;

            try
            {
                _context.Entry(foodItem).State = EntityState.Modified;
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.FoodItems.Any(e => e.Id == id))
                {
                    return NotFound("FoodItem not found.");
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFoodItem(int id)
        {
            var foodItem = await _context.FoodItems.FindAsync(id);
            if (foodItem == null)
            {
                return NotFound("FoodItem not found.");
            }

            _context.FoodItems.Remove(foodItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
