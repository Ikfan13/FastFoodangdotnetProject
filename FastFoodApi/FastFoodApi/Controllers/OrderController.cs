using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FastFoodApi.Models;
using Microsoft.AspNetCore.Authorization;

namespace FastFoodApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    
    public class OrderController : ControllerBase
    {
        private readonly FoodContext _context;

        public OrderController(FoodContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.FoodItem) // Include related FoodItem details
                .Select(o => new
                {
                    o.Id,
                    o.OrderNumber,
                    o.TotalPrice,
                    o.OrderTime,
                    o.Status,
                    OrderItems = o.OrderItems.Select(oi => new
                    {
                        oi.FoodItem.Name,
                        oi.FoodItem.ImgUrl,
                        oi.FoodItem.Price
                    }).ToList()
                })
                .ToListAsync();

            if (orders == null || orders.Count == 0)
            {
                return NotFound("No orders found.");
            }

            return Ok(orders);
        }


        [HttpPost]
        public async Task<ActionResult<OrderModel>> PostOrder([FromBody] OrderCreateModel orderCreateModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Create a new order with related order items
            var order = new OrderModel
            {
                OrderNumber = orderCreateModel.OrderNumber,
                TotalPrice = orderCreateModel.TotalPrice,
                OrderTime = orderCreateModel.OrderTime,
                Status = orderCreateModel.Status,
                UserId = orderCreateModel.UserId,
                OrderItems = orderCreateModel.FoodItemIds.Select(foodItemId => new OrderItem
                {
                    FoodItemId = foodItemId
                }).ToList()
            };

            _context.Orders.Add(order);

            // Add OrderItems in the same save operation
            await _context.SaveChangesAsync();

            // OrderItems are already associated with the Order at this point
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _context.Orders
                .Where(o => o.Id == id)
                .Select(o => new
                {
                    o.Id,
                    o.OrderNumber,
                    o.TotalPrice,
                    o.Status,
                    OrderItems = o.OrderItems.Select(oi => new
                    {
                        oi.FoodItem.Name,
                        oi.FoodItem.Price
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetOrdersByUserId(int userId)
        {
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Select(o => new
                {
                    o.Id,
                    o.OrderNumber,
                    o.TotalPrice,
                    o.Status,
                    o.OrderTime,
                    OrderItems = o.OrderItems.Select(oi => new
                    {
                        oi.FoodItem.Name,
                        oi.FoodItem.Price,
                        oi.FoodItem.ImgUrl // Ensure ImgUrl is included
                    }).ToList()
                })
                .ToListAsync();

            if (orders == null || orders.Count == 0)
            {
                return NotFound("No orders found for this user.");
            }

            return Ok(orders);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateModel updateModel)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            order.Status = updateModel.Status;
            await _context.SaveChangesAsync();

            return NoContent(); // Indicate that the update was successful
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetOrderCount()
        {
            var count = await _context.Orders.CountAsync();
            return Ok(count);
        }



        // Add additional methods (e.g., for updating, deleting orders) if needed
    }
}
