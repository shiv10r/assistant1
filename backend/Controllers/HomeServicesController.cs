using LuxInfra.Models;
using LuxInfra.Services;
using Microsoft.AspNetCore.Mvc;

namespace LuxInfra.Api.Controllers;

// VSR Home Services Marketplace API (doc #120-#122).
// Customer, professional and admin endpoint groups backed by HomeServicesService.
// All routes require the API bearer token (enforced globally by TokenAuthMiddleware
// except /api/auth/login).

[ApiController]
[Route("api/home-services")]
public class HomeServicesController : ControllerBase
{
    private readonly HomeServicesService _hs;

    public HomeServicesController(HomeServicesService hs) => _hs = hs;

    // ---------------------------------------------------------------------
    // Catalog & location (customer discovery)
    // ---------------------------------------------------------------------

    [HttpGet("cities")]
    public async Task<List<HsCity>> Cities() => await _hs.GetCitiesAsync();

    [HttpGet("categories")]
    public async Task<List<HsCategory>> Categories() => await _hs.GetCategoriesAsync();

    [HttpGet("services")]
    public async Task<List<HsService>> Services([FromQuery] string? categoryId = null) =>
        await _hs.GetServicesAsync(categoryId);

    [HttpGet("services/{id}")]
    public async Task<ActionResult> Service(string id)
    {
        var s = await _hs.GetServiceAsync(id);
        return s is null ? NotFound() : Ok(s);
    }

    [HttpGet("addons")]
    public async Task<List<HsAddOn>> AddOns() => await _hs.GetAddOnsAsync();

    [HttpGet("coupons")]
    public async Task<List<HsCoupon>> Coupons() => await _hs.GetCouponsAsync();

    [HttpGet("coupons/{code}")]
    public async Task<ActionResult> Coupon(string code)
    {
        var c = await _hs.GetCouponByCodeAsync(code);
        return c is null ? NotFound(new { error = "Invalid or inactive coupon" }) : Ok(c);
    }

    [HttpGet("memberships")]
    public async Task<List<HsMembership>> Memberships() => await _hs.GetMembershipsAsync();

    [HttpGet("professionals")]
    public async Task<List<HsProfessional>> Professionals([FromQuery] string? cityId = null) =>
        await _hs.GetProfessionalsAsync(cityId);

    [HttpGet("professionals/{id}")]
    public async Task<ActionResult> Professional(string id)
    {
        var p = await _hs.GetProfessionalAsync(id);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpGet("professionals/for-service/{serviceId}")]
    public async Task<List<HsProfessional>> ProfessionalsForService(string serviceId, [FromQuery] string cityId) =>
        await _hs.GetProfessionalsForServiceAsync(serviceId, cityId);

    [HttpGet("search")]
    public async Task<ActionResult> Search([FromQuery] string q = "", [FromQuery] string? categoryId = null)
    {
        var services = await _hs.GetServicesAsync(categoryId);
        var pros = await _hs.GetProfessionalsAsync();
        var query = q.Trim().ToLowerInvariant();
        var matches = string.IsNullOrEmpty(query)
            ? services
            : services.Where(s =>
                  s.Name.ToLowerInvariant().Contains(query) ||
                  s.ShortDescription.ToLowerInvariant().Contains(query)).ToList();
        var proMatches = string.IsNullOrEmpty(query)
            ? pros.Take(6).ToList()
            : pros.Where(p =>
                  p.Name.ToLowerInvariant().Contains(query) ||
                  p.Skills.Any(sk => services.Any(s => s.Id == sk && s.Name.ToLowerInvariant().Contains(query)))).Take(6).ToList();
        return Ok(new { services = matches, professionals = proMatches });
    }

    // ---------------------------------------------------------------------
    // Bookings (customer) — doc #117-#119
    // ---------------------------------------------------------------------

    [HttpGet("bookings")]
    public async Task<List<HsBooking>> Bookings([FromQuery] string? customerId = null, [FromQuery] string? status = null) =>
        await _hs.GetBookingsAsync(customerId, status: status);

    [HttpGet("bookings/{id}")]
    public async Task<ActionResult> Booking(string id)
    {
        var b = await _hs.GetBookingAsync(id);
        return b is null ? NotFound() : Ok(b);
    }

    [HttpPost("bookings")]
    public async Task<ActionResult> CreateBooking([FromBody] HsBooking booking)
    {
        var saved = await _hs.CreateBookingAsync(booking);
        return Ok(saved);
    }

    [HttpPost("bookings/{id}/status")]
    public async Task<ActionResult> UpdateBookingStatus(string id, [FromBody] StatusChange req)
    {
        var updated = await _hs.UpdateBookingStatusAsync(id, req.To, req.ChangedBy, req.Reason);
        return updated is null ? NotFound() : Ok(updated);
    }

    // ---------------------------------------------------------------------
    // Reviews / support / disputes / notifications
    // ---------------------------------------------------------------------

    [HttpGet("reviews")]
    public async Task<List<HsReview>> Reviews([FromQuery] string? professionalId = null) =>
        await _hs.GetReviewsAsync(professionalId);

    [HttpPost("reviews")]
    public async Task<ActionResult> CreateReview([FromBody] HsReview review) => Ok(await _hs.CreateReviewAsync(review));

    [HttpGet("support")]
    public async Task<List<HsSupportTicket>> Support([FromQuery] string? customerId = null) =>
        await _hs.GetSupportTicketsAsync(customerId);

    [HttpPost("support")]
    public async Task<ActionResult> CreateSupport([FromBody] HsSupportTicket ticket) => Ok(await _hs.CreateSupportTicketAsync(ticket));

    [HttpGet("disputes")]
    public async Task<List<HsDispute>> Disputes() => await _hs.GetDisputesAsync();

    [HttpPost("disputes")]
    public async Task<ActionResult> CreateDispute([FromBody] HsDispute dispute) => Ok(await _hs.CreateDisputeAsync(dispute));

    [HttpGet("notifications/{userId}")]
    public async Task<List<HsNotification>> Notifications(string userId) => await _hs.GetNotificationsAsync(userId);

    // ---------------------------------------------------------------------
    // Professional area — doc #121
    // ---------------------------------------------------------------------

    [HttpGet("professional/{id}/bookings")]
    public async Task<List<HsBooking>> ProBookings(string id, [FromQuery] string? status = null) =>
        await _hs.GetBookingsAsync(professionalId: id, status: status);

    [HttpGet("professional/{id}/earnings")]
    public async Task<List<HsEarning>> ProEarnings(string id) => await _hs.GetEarningsAsync(id);

    [HttpPost("professional/{id}/earnings")]
    public async Task<ActionResult> CreateEarning(string id, [FromBody] HsEarning earning)
    {
        earning.ProfessionalId = id;
        return Ok(await _hs.CreateEarningAsync(earning));
    }

    [HttpGet("professional/{id}/payouts")]
    public async Task<List<HsPayout>> ProPayouts(string id) => await _hs.GetPayoutsAsync(id);

    [HttpPost("professional/{id}/payouts")]
    public async Task<ActionResult> RequestPayout(string id, [FromBody] HsPayout payout)
    {
        payout.ProfessionalId = id;
        return Ok(await _hs.CreatePayoutAsync(payout));
    }

    [HttpGet("professional/{id}/reviews")]
    public async Task<List<HsReview>> ProReviews(string id) => await _hs.GetReviewsAsync(id);

    // ---------------------------------------------------------------------
    // Admin area — doc #122
    // ---------------------------------------------------------------------

    [HttpGet("admin/dashboard")]
    public async Task<object> AdminDashboard() => await _hs.GetDashboardAsync();

    [HttpGet("admin/customers")]
    public async Task<List<HsCustomer>> AdminCustomers() => await _hs.GetCustomersAsync();

    [HttpGet("admin/bookings")]
    public async Task<List<HsBooking>> AdminBookings([FromQuery] string? status = null) =>
        await _hs.GetBookingsAsync(status: status);

    [HttpGet("admin/professionals")]
    public async Task<List<HsProfessional>> AdminProfessionals() => await _hs.GetProfessionalsAsync(activeOnly: false);

    [HttpPost("admin/professionals/{id}/verify")]
    public async Task<ActionResult> VerifyProfessional(string id)
    {
        var pro = await _hs.GetProfessionalAsync(id);
        if (pro is null) return NotFound();
        pro.Verified = true;
        pro.Status = "Active";
        await _hs.UpdateProfessionalAsync(pro);
        return Ok(pro);
    }

    [HttpPost("admin/professionals/{id}/status")]
    public async Task<ActionResult> SetProfessionalStatus(string id, [FromBody] StatusChange req)
    {
        var pro = await _hs.GetProfessionalAsync(id);
        if (pro is null) return NotFound();
        pro.Status = req.To;
        if (req.To == "Active") pro.Verified = true;
        await _hs.UpdateProfessionalAsync(pro);
        return Ok(pro);
    }

    [HttpGet("admin/payouts")]
    public async Task<List<HsPayout>> AdminPayouts() => await _hs.GetPayoutsAsync();

    [HttpPost("admin/payouts/{id}/process")]
    public async Task<ActionResult> ProcessPayout(string id, [FromBody] PayoutProcess req)
    {
        var payout = (await _hs.GetPayoutsAsync()).FirstOrDefault(p => p.Id == id);
        if (payout is null) return NotFound();
        payout.Status = req.Status;
        payout.Reference = req.Reference ?? payout.Reference;
        return Ok(await _hs.UpdatePayoutAsync(payout));
    }
}

public record StatusChange(string To, string ChangedBy, string? Reason = null);
public record PayoutProcess(string Status, string? Reference = null);
