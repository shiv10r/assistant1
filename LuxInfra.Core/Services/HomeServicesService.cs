using LuxInfra.Models;
using SQLite;

namespace LuxInfra.Services;

// VSR Home Services Marketplace — SQLite-backed service (doc #115-#119, #120-#122).
// Mirrors the existing BillingService/ProjectService pattern: lazy table creation
// behind DatabaseService, seed-once demo data, and async CRUD helpers. Seed data
// matches frontend/src/services/home-services/homeServicesData.ts so the React
// app can switch from localStorage to this API without reshaping.

public class HomeServicesService
{
    private readonly DatabaseService _db;
    private bool _initialized;

    public HomeServicesService(DatabaseService db) => _db = db;

    private async Task<SQLiteAsyncConnection> Conn()
    {
        var conn = await _db.GetConnectionAsync();
        if (!_initialized)
        {
            await conn.CreateTableAsync<HsCity>();
            await conn.CreateTableAsync<HsCategory>();
            await conn.CreateTableAsync<HsService>();
            await conn.CreateTableAsync<HsProfessional>();
            await conn.CreateTableAsync<HsCoupon>();
            await conn.CreateTableAsync<HsMembership>();
            await conn.CreateTableAsync<HsCustomer>();
            await conn.CreateTableAsync<HsBooking>();
            await conn.CreateTableAsync<HsReview>();
            await conn.CreateTableAsync<HsSupportTicket>();
            await conn.CreateTableAsync<HsDispute>();
            await conn.CreateTableAsync<HsNotification>();
            await conn.CreateTableAsync<HsEarning>();
            await conn.CreateTableAsync<HsPayout>();
            await conn.CreateTableAsync<HsCommissionRule>();

            if (!(await conn.Table<HsCity>().CountAsync() > 0))
                await SeedAsync(conn);

            _initialized = true;
        }
        return conn;
    }

    // ---------- seed (doc #152-#153) ----------

    private async Task SeedAsync(SQLiteAsyncConnection conn)
    {
        // Cities + localities
        var cities = new (string Id, string Name, string[] Zones, (string Id, string Name, string Pincode)[] Localities)[]
        {
            ("del", "Delhi", new[] { "Central Delhi", "South Delhi", "East Delhi", "West Delhi", "North Delhi" }, new[]
            {
                ("del-01", "Connaught Place", "110001"), ("del-02", "Karol Bagh", "110005"), ("del-03", "Lajpat Nagar", "110024"),
                ("del-04", "Saket", "110017"), ("del-05", "Dwarka Sector 12", "110078"), ("del-06", "Rohini Sector 9", "110085"),
                ("del-07", "Mayur Vihar Phase 1", "110091"), ("del-08", "Janakpuri", "110058"), ("del-09", "Vasant Kunj", "110070"),
                ("del-10", "Pitampura", "110034"),
            }),
            ("ggn", "Gurugram", new[] { "Gurugram Central", "Sector 14", "Sector 56", "Sohna Road", "Golf Course Road" }, new[]
            {
                ("ggn-01", "Sector 14", "122001"), ("ggn-02", "Sector 17", "122001"), ("ggn-03", "Sector 45", "122003"),
                ("ggn-04", "Sector 56", "122011"), ("ggn-05", "DLF Phase 2", "122002"), ("ggn-06", "Sohna Road", "122018"),
                ("ggn-07", "Golf Course Road", "122002"), ("ggn-08", "Palam Vihar", "122017"),
            }),
            ("noida", "Noida", new[] { "Sector 62", "Sector 18", "Greater Noida West", "Sector 76", "Sector 128" }, new[]
            {
                ("noida-01", "Sector 18", "201301"), ("noida-02", "Sector 62", "201309"), ("noida-03", "Sector 76", "201301"),
                ("noida-04", "Sector 128", "201304"), ("noida-05", "Sector 137", "201305"), ("noida-06", "Greater Noida West", "201306"),
                ("noida-07", "Sector 44", "201303"),
            }),
            ("ghz", "Ghaziabad", new[] { "Indirapuram", "Vaishali", "Raj Nagar", "Crossings Republik", "Kaushambi" }, new[]
            {
                ("ghz-01", "Indirapuram", "201014"), ("ghz-02", "Vaishali", "201010"), ("ghz-03", "Raj Nagar", "201002"),
                ("ghz-04", "Crossings Republik", "201016"), ("ghz-05", "Kaushambi", "201010"), ("ghz-06", "Vasundhara", "201012"),
            }),
            ("fbd", "Faridabad", new[] { "Sector 15", "Sector 21C", "Old Faridabad", "Neharpar", "Sector 86" }, new[]
            {
                ("fbd-01", "Sector 15", "121007"), ("fbd-02", "Sector 21C", "121001"), ("fbd-03", "Old Faridabad", "121002"),
                ("fbd-04", "Neharpar Faridabad", "121004"), ("fbd-05", "Sector 86", "121002"), ("fbd-06", "Ballabgarh", "121004"),
            }),
        };
        foreach (var c in cities)
        {
            await conn.InsertAsync(new HsCity
            {
                Id = c.Id,
                Name = c.Name,
                Zones = c.Zones,
                Localities = c.Localities.Select(l => new HsLocality { Id = l.Id, Name = l.Name, Pincode = l.Pincode }).ToList(),
            });
        }

        // Categories
        var categories = new (string Id, string Name, string Slug, string Tagline, string Image, string Gradient)[]
        {
            ("cat-elec", "Electrician", "electrician", "Repairs, installations & safety checks", "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&h=400&q=80", "linear-gradient(135deg,#F59E0B 0%,#DC2626 100%)"),
            ("cat-plumb", "Plumber", "plumber", "Leaks, blocks, fittings & geysers", "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&h=400&q=80", "linear-gradient(135deg,#0EA5E9 0%,#1E3A8A 100%)"),
            ("cat-ac", "AC Service & Repair", "ac-service", "Cleaning, gas refill, repair & installation", "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&h=400&q=80", "linear-gradient(135deg,#06B6D4 0%,#0F766E 100%)"),
            ("cat-app", "Appliance Repair", "appliance-repair", "Washing machines, fridges, microwaves & more", "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&h=400&q=80", "linear-gradient(135deg,#8B5CF6 0%,#4F46E5 100%)"),
            ("cat-clean", "Cleaning & Pest Control", "cleaning", "Deep cleaning, sanitisation & pest treatment", "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&h=400&q=80", "linear-gradient(135deg,#10B981 0%,#065F46 100%)"),
            ("cat-paint", "Painter", "painter", "Walls, woodwork & complete home painting", "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&h=400&q=80", "linear-gradient(135deg,#EC4899 0%,#7C3AED 100%)"),
            ("cat-carp", "Carpenter", "carpenter", "Doors, locks, furniture assembly & repair", "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&h=400&q=80", "linear-gradient(135deg,#B45309 0%,#78350F 100%)"),
            ("cat-water", "Waterproofing & Home Care", "waterproofing", "Waterproofing, grouting & home maintenance", "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&h=400&q=80", "linear-gradient(135deg,#0D9488 0%,#164E63 100%)"),
        };
        foreach (var c in categories)
        {
            await conn.InsertAsync(new HsCategory
            {
                Id = c.Id, Name = c.Name, Slug = c.Slug, Tagline = c.Tagline, Image = c.Image, Gradient = c.Gradient,
            });
        }

        // Services (doc #31-#47) — compact seed covering electrician, plumber, AC,
        // appliance, cleaning, painter, carpenter, waterproofing categories.
        var services = new[]
        {
            SeedService("svc-elec-01", "cat-elec", "Switch, Socket & Fitting Repair", "switch-socket-repair", "Repair or replace switches, sockets, regulators and light points.", 299, false, false, 0,
                (("pkg-elec-01-b", "Basic", 299, 60), (499, 799)),
                (("pkg-elec-01-s", "Standard", 499, 90), (799, 1299)),
                (("pkg-elec-01-p", "Premium", 799, 150), (1199, 1899))),
            SeedService("svc-plumb-01", "cat-plumb", "Tap, Mixer & Bathroom Fittings", "tap-mixer-repair", "Dripping taps, leaking mixers and new fitting installation.", 299, false, false, 0,
                (("pkg-plumb-01-b", "Basic", 299, 60), (549, 899)),
                (("pkg-plumb-01-s", "Standard", 549, 120), (899, 1399)),
                (("pkg-plumb-01-p", "Premium", 899, 210), (1199, 1799))),
            SeedService("svc-ac-01", "cat-ac", "AC Service & Cleaning", "ac-service", "Split AC cleaning, gas check and cooling performance service.", 499, false, false, 0,
                (("pkg-ac-01-b", "Basic", 499, 60), (799, 1299)),
                (("pkg-ac-01-s", "Standard", 799, 90), (1299, 1999)),
                (("pkg-ac-01-p", "Premium", 1299, 150), (1799, 2599))),
            SeedService("svc-app-01", "cat-app", "Washing Machine Repair", "washing-machine-repair", "Drum, motor, drainage and washing faults diagnosed and fixed.", 599, false, true, 249,
                (("pkg-app-01-b", "Basic", 599, 120), (999, 1699)),
                (("pkg-app-01-s", "Standard", 999, 180), (1499, 2299)),
                (("pkg-app-01-p", "Premium", 1699, 300), (2199, 3199))),
            SeedService("svc-clean-01", "cat-clean", "Full Home Deep Cleaning", "deep-cleaning", "Complete home deep clean — kitchen, bathrooms, floors and more.", 1499, false, false, 0,
                (("pkg-clean-01-b", "Basic", 1499, 240), (2499, 3999)),
                (("pkg-clean-01-s", "Standard", 2499, 360), (3999, 5999)),
                (("pkg-clean-01-p", "Premium", 3999, 540), (5499, 7999))),
            SeedService("svc-paint-01", "cat-paint", "Wall Painting (Single Room)", "single-room-painting", "Painting one room with putty, primer and emulsion finish.", 3499, false, true, 299,
                (("pkg-paint-01-b", "Basic", 3499, 720), (5499, 8499)),
                (("pkg-paint-01-s", "Standard", 5499, 1080), (8499, 11999)),
                (("pkg-paint-01-p", "Premium", 8499, 1440), (11999, 16999))),
            SeedService("svc-carp-01", "cat-carp", "Furniture Assembly", "furniture-assembly", "Flat-pack furniture, wardrobes and modular assembly.", 599, false, false, 0,
                (("pkg-carp-01-b", "Basic", 599, 120), (999, 1799)),
                (("pkg-carp-01-s", "Standard", 999, 210), (1499, 2299)),
                (("pkg-carp-01-p", "Premium", 1799, 360), (2299, 3299))),
            SeedService("svc-water-01", "cat-water", "Bathroom Waterproofing", "bathroom-waterproofing", "Stop seepage with professional waterproofing.", 1999, false, true, 399,
                (("pkg-water-01-b", "Basic", 1999, 480), (3499, 5999)),
                (("pkg-water-01-s", "Standard", 3499, 720), (5999, 8999)),
                (("pkg-water-01-p", "Premium", 5999, 1080), (8999, 12999))),
        };
        foreach (var s in services)
            await conn.InsertAsync(s);

        // Add-ons (doc #39)
        var addOns = new (string Id, string Name, double Price)[]
        {
            ("add-01", "Additional unit", 499), ("add-02", "Extra hour", 350), ("add-03", "Material cost (consumables)", 250),
            ("add-04", "Disposal / debris removal", 200), ("add-05", "Weekend / after-hours visit", 300),
            ("add-06", "High-rise access (above 4th floor)", 200), ("add-07", "Two-visit service (parts not in stock)", 0),
            ("add-08", "Extended warranty", 599),
        };
        var all = await conn.Table<HsService>().ToListAsync();
        foreach (var s in all)
        {
            s.AddOns = addOns.Select(a => new HsAddOn { Id = a.Id, Name = a.Name, Price = a.Price, Category = "General" }).ToList();
            await conn.UpdateAsync(s);
        }

        // Professionals (doc #55-#59)
        var pros = new (string Id, string Name, string Phone, string CityId, string[] Skills, string[] Areas, double Rating, int Reviews, int Jobs, int Exp, string Level, bool Verified, string Bio)[]
        {
            ("pro-001", "Ramesh Kumar", "98100 11223", "del", new[] { "svc-elec-01", "svc-elec-03", "svc-elec-06" }, new[] { "del-03", "del-04", "del-09" }, 4.8, 156, 340, 12, "Gold", true, "Licensed electrician specialising in home wiring, fans and inverter systems."),
            ("pro-002", "Suresh Yadav", "98200 33445", "del", new[] { "svc-elec-02", "svc-elec-04", "svc-elec-05" }, new[] { "del-01", "del-02", "del-05" }, 4.6, 98, 210, 9, "Silver", true, "Emergency electrical response specialist with MCB and DB expertise."),
            ("pro-003", "Anil Verma", "98300 55667", "del", new[] { "svc-elec-01", "svc-elec-02", "svc-elec-04" }, new[] { "del-06", "del-08", "del-10" }, 4.9, 201, 420, 15, "Elite", true, "Senior electrician, 15 years experience, whole-home audits and rewiring."),
            ("pro-004", "Mohd. Faizan", "98400 77889", "del", new[] { "svc-plumb-01", "svc-plumb-02", "svc-plumb-04" }, new[] { "del-03", "del-07", "del-09" }, 4.7, 134, 280, 10, "Gold", true, "Plumber covering fittings, drainage and geyser installation."),
            ("pro-005", "Ravi Shankar", "98500 99001", "del", new[] { "svc-plumb-02", "svc-plumb-03", "svc-plumb-06" }, new[] { "del-01", "del-05", "del-08" }, 4.5, 87, 190, 8, "Silver", true, "Pipeline and leakage specialist with concealed line detection experience."),
            ("pro-006", "Vijay Singh", "98600 22334", "del", new[] { "svc-plumb-01", "svc-plumb-04", "svc-plumb-05" }, new[] { "del-02", "del-04", "del-10" }, 4.4, 64, 150, 7, "Standard", true, "Sanitaryware and bathroom fitting specialist."),
            ("pro-007", "Arun Nair", "98700 44556", "ggn", new[] { "svc-ac-01", "svc-ac-02", "svc-ac-04" }, new[] { "ggn-01", "ggn-02", "ggn-05" }, 4.9, 178, 380, 11, "Elite", true, "AC certified technician — cleaning, gas refill, repair and AMC."),
            ("pro-008", "Deepak Bhatia", "98800 66778", "ggn", new[] { "svc-ac-02", "svc-ac-03" }, new[] { "ggn-03", "ggn-06", "ggn-07" }, 4.7, 112, 240, 9, "Gold", true, "AC installation and repair specialist for all major brands."),
            ("pro-009", "Sanjay Mehta", "98900 88990", "ggn", new[] { "svc-elec-01", "svc-elec-04", "svc-ac-01" }, new[] { "ggn-01", "ggn-04", "ggn-08" }, 4.6, 90, 200, 10, "Gold", true, "Multi-skilled electrician and AC service technician."),
            ("pro-010", "Karan Kapoor", "99000 11221", "noida", new[] { "svc-app-01", "svc-app-02", "svc-app-05" }, new[] { "noida-01", "noida-02", "noida-04" }, 4.8, 145, 310, 12, "Gold", true, "Appliance repair specialist — washing machines, fridges and chimneys."),
            ("pro-011", "Rohit Malhotra", "99100 33443", "noida", new[] { "svc-app-03", "svc-app-04" }, new[] { "noida-03", "noida-05", "noida-06" }, 4.5, 76, 165, 8, "Silver", true, "Microwave and TV repair technician."),
            ("pro-012", "Pooja Sharma", "99200 55665", "del", new[] { "svc-clean-01", "svc-clean-03", "svc-clean-05" }, new[] { "del-03", "del-04", "del-07" }, 4.9, 220, 460, 8, "Elite", true, "Professional deep cleaning lead for homes and move-in/move-out."),
            ("pro-013", "Neha Gupta", "99300 77887", "del", new[] { "svc-clean-02", "svc-clean-03" }, new[] { "del-01", "del-02", "del-06" }, 4.7, 130, 275, 6, "Gold", true, "Sofa, carpet and upholstery cleaning expert."),
            ("pro-014", "Amit Chaudhary", "99400 99009", "del", new[] { "svc-clean-04" }, new[] { "del-05", "del-08", "del-10" }, 4.6, 88, 190, 7, "Silver", true, "Certified pest control operator — gel, spray and baiting."),
            ("pro-015", "Manoj Tiwari", "99500 11220", "noida", new[] { "svc-paint-01", "svc-paint-02" }, new[] { "noida-02", "noida-04", "noida-07" }, 4.7, 102, 220, 13, "Gold", true, "Master painter with 13 years of interior finishing experience."),
            ("pro-016", "Suresh Pal", "99600 33442", "ghz", new[] { "svc-carp-01", "svc-carp-02", "svc-carp-03" }, new[] { "ghz-01", "ghz-02", "ghz-06" }, 4.8, 119, 250, 11, "Gold", true, "Carpenter for furniture assembly, doors and wood repair."),
            ("pro-017", "Rajesh Kumar", "99700 55664", "fbd", new[] { "svc-plumb-01", "svc-plumb-02", "svc-plumb-03" }, new[] { "fbd-01", "fbd-02", "fbd-05" }, 4.5, 71, 160, 9, "Silver", true, "Plumber covering all residential plumbing needs."),
            ("pro-018", "Vikram Dutt", "99800 77886", "ghz", new[] { "svc-elec-01", "svc-elec-02", "svc-elec-05" }, new[] { "ghz-03", "ghz-04", "ghz-05" }, 4.6, 93, 205, 10, "Gold", true, "Electrician for wiring, MCB and whole-home electrical work."),
            ("pro-019", "Sandeep Rao", "99900 99008", "ggn", new[] { "svc-ac-01", "svc-ac-02", "svc-ac-03" }, new[] { "ggn-02", "ggn-05", "ggn-07" }, 4.8, 141, 300, 10, "Gold", true, "AC expert — service, repair and installation for split & window units."),
            ("pro-020", "Farhan Ali", "98111 22334", "noida", new[] { "svc-clean-01", "svc-clean-04" }, new[] { "noida-01", "noida-03", "noida-06" }, 4.7, 108, 230, 7, "Gold", true, "Deep cleaning and pest control specialist."),
            ("pro-021", "Gaurav Bansal", "98222 44556", "del", new[] { "svc-app-01", "svc-app-02", "svc-app-05" }, new[] { "del-01", "del-06", "del-08" }, 4.6, 84, 180, 8, "Silver", true, "Appliance repair technician for home appliances."),
            ("pro-022", "Sunil Narang", "98333 66778", "fbd", new[] { "svc-water-01", "svc-water-02" }, new[] { "fbd-03", "fbd-04", "fbd-06" }, 4.4, 58, 130, 12, "Silver", true, "Waterproofing and tile expert."),
            ("pro-023", "Imran Khan", "98444 88990", "ghz", new[] { "svc-plumb-04", "svc-plumb-05", "svc-plumb-06" }, new[] { "ghz-01", "ghz-03", "ghz-05" }, 4.5, 79, 170, 9, "Silver", true, "Geyser, sanitaryware and bathroom plumbing specialist."),
            ("pro-024", "Priya Nair", "98555 11221", "del", new[] { "svc-clean-02", "svc-clean-05" }, new[] { "del-02", "del-05", "del-10" }, 4.8, 132, 280, 6, "Gold", true, "Move-in/move-out and upholstery cleaning expert."),
            ("pro-025", "Ashok Meena", "98666 33443", "ggn", new[] { "svc-carp-01", "svc-carp-02" }, new[] { "ggn-01", "ggn-03", "ggn-06" }, 4.6, 96, 210, 10, "Gold", true, "Furniture assembly and door repair carpenter."),
            ("pro-026", "Meena Devi", "98777 55665", "noida", new[] { "svc-clean-01", "svc-clean-03" }, new[] { "noida-02", "noida-05", "noida-07" }, 4.9, 165, 350, 7, "Elite", true, "Senior deep-cleaning professional."),
            ("pro-027", "Harish Chandra", "98888 77887", "fbd", new[] { "svc-elec-01", "svc-elec-03", "svc-elec-06" }, new[] { "fbd-01", "fbd-02", "fbd-04" }, 4.5, 67, 145, 8, "Silver", true, "Electrician for fittings, fans and inverter systems."),
            ("pro-028", "Ritu Agarwal", "98999 99007", "del", new[] { "svc-clean-01", "svc-clean-02", "svc-clean-05" }, new[] { "del-03", "del-06", "del-09" }, 0, 0, 0, 4, "Standard", false, "New professional — house cleaning and sofa shampoo."),
            ("pro-029", "Nitin Grover", "99111 22332", "ghz", new[] { "svc-app-01", "svc-app-03" }, new[] { "ghz-02", "ghz-04", "ghz-06" }, 0, 0, 0, 5, "Standard", false, "New professional — washing machine and microwave repair."),
            ("pro-030", "Rakesh Joshi", "99222 44554", "ggn", new[] { "svc-paint-01", "svc-paint-02" }, new[] { "ggn-04", "ggn-07", "ggn-08" }, 0, 0, 0, 11, "Standard", false, "New professional — interior painting."),
        };
        foreach (var p in pros)
        {
            await conn.InsertAsync(new HsProfessional
            {
                Id = p.Id, Name = p.Name, Phone = p.Phone, Email = p.Name.ToLowerInvariant().Replace(" ", ".").Replace("mohd.", "mohd.") + "@example.com",
                CityId = p.CityId, Image = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
                Skills = p.Skills, Areas = p.Areas, Status = p.Verified ? "Active" : "PendingVerification", Rating = p.Rating,
                ReviewCount = p.Reviews, CompletedJobs = p.Jobs, ExperienceYears = p.Exp, Level = p.Level, Verified = p.Verified,
                JoinedAt = p.Verified ? "2024-03-01" : "2026-08-10", Bio = p.Bio,
            });
        }

        // Coupons (doc #136)
        var coupons = new (string Id, string Code, string Title, string Type, double Value, double Min, double Max, string Until, string? Cat, bool Active)[]
        {
            ("cpn-01", "FIRST20", "20% Off Your First Service", "percent", 20, 499, 500, "2026-12-31", null, true),
            ("cpn-02", "AC200", "₹200 Off AC Service", "flat", 200, 699, 200, "2026-10-31", "cat-ac", true),
            ("cpn-03", "CLEAN250", "₹250 Off Deep Cleaning", "flat", 250, 1499, 250, "2026-11-30", "cat-clean", true),
            ("cpn-04", "WEEKEND", "Weekend Electrical Offer", "percent", 10, 599, 200, "2026-12-31", "cat-elec", true),
            ("cpn-05", "INSPECTFREE", "Free Inspection with Repair", "flat", 299, 999, 299, "2026-09-30", null, true),
        };
        foreach (var c in coupons)
        {
            await conn.InsertAsync(new HsCoupon
            {
                Id = c.Id, Code = c.Code, Title = c.Title, Type = c.Type, Value = c.Value,
                MinOrder = c.Min, MaxDiscount = c.Max, ValidUntil = c.Until, CategoryId = c.Cat, Active = c.Active,
            });
        }

        // Memberships (doc #110, #156)
        var memberships = new (string Id, string Name, double Price, int Months, double Discount, bool Waiver, bool Priority)[]
        {
            ("mem-01", "VSR Care Silver", 499, 12, 5, false, true),
            ("mem-02", "VSR Care Gold", 999, 12, 10, true, true),
            ("mem-03", "VSR Care Platinum", 1999, 12, 15, true, true),
        };
        foreach (var m in memberships)
        {
            await conn.InsertAsync(new HsMembership
            {
                Id = m.Id, Name = m.Name, Price = m.Price, ValidityMonths = m.Months,
                ServiceDiscountPct = m.Discount, PlatformFeeWaiver = m.Waiver, PrioritySupport = m.Priority,
                Benefits = m.Name == "VSR Care Silver"
                    ? new[] { "5% off all services", "Priority scheduling", "Free inspection on repairs" }
                    : m.Name == "VSR Care Gold"
                        ? new[] { "10% off all services", "Platform fee waived", "Priority support", "Free inspection on repairs" }
                        : new[] { "15% off all services", "Platform fee waived", "24x7 priority support", "Free annual AC service", "Extended warranty on repairs" },
            });
        }

        // Customers (doc #152)
        var customers = new (string Id, string Name, string Phone, string Email, string CityId, string? Mem, int Bookings)[]
        {
            ("cust-001", "Aarav Sharma", "98450 22190", "aarav.sharma@example.com", "del", "mem-02", 24),
            ("cust-002", "Meera Krishnan", "91234 56780", "meera.k@example.com", "del", null, 11),
            ("cust-003", "Kabir Malhotra", "98888 12345", "kabir.m@example.com", "del", "mem-01", 17),
            ("cust-004", "Sanya Kapoor", "97777 54321", "sanya.k@example.com", "ggn", "mem-03", 31),
        };
        foreach (var c in customers)
        {
            await conn.InsertAsync(new HsCustomer
            {
                Id = c.Id, Name = c.Name, Phone = c.Phone, Email = c.Email, CityId = c.CityId,
                MembershipId = c.Mem, MemberSince = "2024-06-01", BookingsCount = c.Bookings,
            });
        }

        // Commission rules (doc #93)
        var rules = new (string Id, string? Cat, double Pct)[]
        {
            ("cmr-01", null, 15), ("cmr-02", "cat-paint", 10), ("cmr-03", "cat-water", 12),
        };
        foreach (var r in rules)
            await conn.InsertAsync(new HsCommissionRule { Id = r.Id, CategoryId = r.Cat, CommissionPct = r.Pct, EffectiveFrom = "2026-01-01" });
    }

    private static HsService SeedService(
        string id, string categoryId, string name, string slug, string shortDescription,
        double startingPrice, bool isEmergency, bool needsInspection, double inspectionFee,
        ((string Id, string Name, double Price, int Mins) Package, (double Std, double Prem) PriceRange) basic,
        ((string Id, string Name, double Price, int Mins) Package, (double Std, double Prem) PriceRange) standard,
        ((string Id, string Name, double Price, int Mins) Package, (double Std, double Prem) PriceRange) premium)
    {
        var packages = new List<HsPackage>
        {
            new() { Id = basic.Package.Id, Name = "Basic", BasePrice = basic.Package.Price, DurationMins = basic.Package.Mins, Inclusions = ["Standard service visit"], Exclusions = ["Parts / materials"] },
            new() { Id = standard.Package.Id, Name = "Standard", BasePrice = standard.Package.Price, DurationMins = standard.Package.Mins, Inclusions = ["Standard visit + parts up to limit"], Exclusions = ["Major parts"] },
            new() { Id = premium.Package.Id, Name = "Premium", BasePrice = premium.Package.Price, DurationMins = premium.Package.Mins, Inclusions = ["Premium service + priority support"], Exclusions = ["Major parts"] },
        };
        return new HsService
        {
            Id = id, CategoryId = categoryId, Name = name, Slug = slug, ShortDescription = shortDescription,
            Description = shortDescription, Image = "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&h=400&q=80",
            StartingPrice = startingPrice, TimeEstimate = $"{basic.Package.Mins} mins", InspectionRequired = needsInspection,
            Tags = [], Active = true, Packages = packages,
        };
    }

    // ---------- catalog / location ----------

    public async Task<List<HsCity>> GetCitiesAsync()
    {
        var conn = await Conn();
        return await conn.Table<HsCity>().OrderBy(c => c.Name).ToListAsync();
    }

    public async Task<List<HsCategory>> GetCategoriesAsync()
    {
        var conn = await Conn();
        return await conn.Table<HsCategory>().OrderBy(c => c.Name).ToListAsync();
    }

    public async Task<List<HsService>> GetServicesAsync(string? categoryId = null)
    {
        var conn = await Conn();
        var q = conn.Table<HsService>();
        if (!string.IsNullOrEmpty(categoryId))
            q = q.Where(s => s.CategoryId == categoryId);
        return await q.ToListAsync();
    }

    public async Task<HsService?> GetServiceAsync(string id)
    {
        var conn = await Conn();
        return await conn.Table<HsService>().Where(s => s.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<HsAddOn>> GetAddOnsAsync()
    {
        var conn = await Conn();
        var services = await conn.Table<HsService>().ToListAsync();
        return services.SelectMany(s => s.AddOns).DistinctBy(a => a.Id).ToList();
    }

    // ---------- professionals ----------

    public async Task<List<HsProfessional>> GetProfessionalsAsync(string? cityId = null, bool activeOnly = true)
    {
        var conn = await Conn();
        var q = conn.Table<HsProfessional>();
        if (activeOnly) q = q.Where(p => p.Status != "Suspended");
        if (!string.IsNullOrEmpty(cityId)) q = q.Where(p => p.CityId == cityId);
        var rows = await q.ToListAsync();
        return rows.OrderByDescending(p => p.Verified).ThenByDescending(p => p.Rating).ToList();
    }

    public async Task<HsProfessional?> GetProfessionalAsync(string id)
    {
        var conn = await Conn();
        return await conn.Table<HsProfessional>().Where(p => p.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<HsProfessional>> GetProfessionalsForServiceAsync(string serviceId, string cityId)
    {
        var conn = await Conn();
        var all = await conn.Table<HsProfessional>()
            .Where(p => p.CityId == cityId && p.Status == "Active")
            .ToListAsync();
        return all.Where(p => p.Skills.Contains(serviceId)).OrderByDescending(p => p.Rating).ToList();
    }

    public async Task UpdateProfessionalAsync(HsProfessional pro)
    {
        var conn = await Conn();
        await conn.UpdateAsync(pro);
    }

    // ---------- customers ----------

    public async Task<List<HsCustomer>> GetCustomersAsync()
    {
        var conn = await Conn();
        return await conn.Table<HsCustomer>().OrderBy(c => c.Name).ToListAsync();
    }

    public async Task<HsCustomer?> GetCustomerAsync(string id)
    {
        var conn = await Conn();
        return await conn.Table<HsCustomer>().Where(c => c.Id == id).FirstOrDefaultAsync();
    }

    // ---------- coupons / memberships ----------

    public async Task<List<HsCoupon>> GetCouponsAsync(bool activeOnly = true)
    {
        var conn = await Conn();
        var q = conn.Table<HsCoupon>();
        if (activeOnly) q = q.Where(c => c.Active);
        return await q.ToListAsync();
    }

    public async Task<HsCoupon?> GetCouponByCodeAsync(string code)
    {
        var conn = await Conn();
        return await conn.Table<HsCoupon>()
            .Where(c => c.Active && c.Code.ToLower() == code.ToLower())
            .FirstOrDefaultAsync();
    }

    public async Task<List<HsMembership>> GetMembershipsAsync()
    {
        var conn = await Conn();
        return await conn.Table<HsMembership>().ToListAsync();
    }

    // ---------- bookings (doc #117-#119) ----------

    public async Task<List<HsBooking>> GetBookingsAsync(string? customerId = null, string? professionalId = null, string? status = null)
    {
        var conn = await Conn();
        var q = conn.Table<HsBooking>();
        if (!string.IsNullOrEmpty(customerId)) q = q.Where(b => b.CustomerId == customerId);
        if (!string.IsNullOrEmpty(professionalId)) q = q.Where(b => b.AssignedProfessionalId == professionalId);
        if (!string.IsNullOrEmpty(status)) q = q.Where(b => b.Status == status);
        var rows = await q.ToListAsync();
        return rows.OrderByDescending(b => b.CreatedAt).ToList();
    }

    public async Task<HsBooking?> GetBookingAsync(string id)
    {
        var conn = await Conn();
        return await conn.Table<HsBooking>().Where(b => b.Id == id).FirstOrDefaultAsync();
    }

    public async Task<HsBooking> CreateBookingAsync(HsBooking booking)
    {
        var conn = await Conn();
        if (string.IsNullOrEmpty(booking.Number))
        {
            var count = await conn.Table<HsBooking>().CountAsync();
            booking.Number = $"VSR-{1001 + count}";
        }
        booking.Status = "New";
        booking.PaymentStatus = "Pending";
        booking.CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss");
        booking.UpdatedAt = booking.CreatedAt;
        booking.History = new List<HsBookingHistoryEntry>
        {
            new() { From = null, To = "New", ChangedAt = booking.CreatedAt, ChangedBy = "Customer" },
        };
        await conn.InsertAsync(booking);
        return booking;
    }

    public async Task<HsBooking?> UpdateBookingStatusAsync(string id, string to, string changedBy, string? reason = null)
    {
        var conn = await Conn();
        var booking = await GetBookingAsync(id);
        if (booking is null) return null;
        var from = booking.Status;
        booking.Status = to;
        booking.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss");
        var history = booking.History.ToList();
        history.Add(new HsBookingHistoryEntry { From = from, To = to, ChangedAt = booking.UpdatedAt, ChangedBy = changedBy, Reason = reason });
        booking.History = history;
        await conn.UpdateAsync(booking);
        return booking;
    }

    public async Task<HsBooking?> UpdateBookingAsync(HsBooking booking)
    {
        var conn = await Conn();
        booking.UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss");
        await conn.UpdateAsync(booking);
        return booking;
    }

    // ---------- reviews / support / disputes ----------

    public async Task<List<HsReview>> GetReviewsAsync(string? professionalId = null)
    {
        var conn = await Conn();
        var q = conn.Table<HsReview>();
        if (!string.IsNullOrEmpty(professionalId)) q = q.Where(r => r.ProfessionalId == professionalId);
        return await q.ToListAsync();
    }

    public async Task<HsReview> CreateReviewAsync(HsReview review)
    {
        var conn = await Conn();
        review.CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss");
        await conn.InsertAsync(review);
        return review;
    }

    public async Task<List<HsSupportTicket>> GetSupportTicketsAsync(string? customerId = null)
    {
        var conn = await Conn();
        var q = conn.Table<HsSupportTicket>();
        if (!string.IsNullOrEmpty(customerId)) q = q.Where(t => t.CustomerId == customerId);
        return await q.ToListAsync();
    }

    public async Task<HsSupportTicket> CreateSupportTicketAsync(HsSupportTicket ticket)
    {
        var conn = await Conn();
        var count = await conn.Table<HsSupportTicket>().CountAsync();
        ticket.TicketNumber = $"SUP-{2001 + count}";
        ticket.Status = "Open";
        ticket.CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss");
        ticket.UpdatedAt = ticket.CreatedAt;
        await conn.InsertAsync(ticket);
        return ticket;
    }

    public async Task<List<HsDispute>> GetDisputesAsync()
    {
        var conn = await Conn();
        return await conn.Table<HsDispute>().OrderByDescending(d => d.CreatedAt).ToListAsync();
    }

    public async Task<HsDispute> CreateDisputeAsync(HsDispute dispute)
    {
        var conn = await Conn();
        var count = await conn.Table<HsDispute>().CountAsync();
        dispute.DisputeNumber = $"DSP-{3001 + count}";
        dispute.Status = "Open";
        dispute.CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss");
        dispute.UpdatedAt = dispute.CreatedAt;
        await conn.InsertAsync(dispute);
        return dispute;
    }

    public async Task<List<HsNotification>> GetNotificationsAsync(string userId)
    {
        var conn = await Conn();
        return (await conn.Table<HsNotification>().Where(n => n.UserId == userId).ToListAsync())
            .OrderByDescending(n => n.CreatedAt).ToList();
    }

    // ---------- earnings / payouts (doc #94-#95) ----------

    public async Task<List<HsEarning>> GetEarningsAsync(string professionalId)
    {
        var conn = await Conn();
        return (await conn.Table<HsEarning>().Where(e => e.ProfessionalId == professionalId).ToListAsync())
            .OrderByDescending(e => e.CreatedAt).ToList();
    }

    public async Task<HsEarning> CreateEarningAsync(HsEarning earning)
    {
        var conn = await Conn();
        earning.CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss");
        await conn.InsertAsync(earning);
        return earning;
    }

    public async Task<List<HsPayout>> GetPayoutsAsync(string? professionalId = null)
    {
        var conn = await Conn();
        var q = conn.Table<HsPayout>();
        if (!string.IsNullOrEmpty(professionalId)) q = q.Where(p => p.ProfessionalId == professionalId);
        return (await q.ToListAsync()).OrderByDescending(p => p.CreatedAt).ToList();
    }

    public async Task<HsPayout> CreatePayoutAsync(HsPayout payout)
    {
        var conn = await Conn();
        payout.CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss");
        payout.Status = "Pending";
        await conn.InsertAsync(payout);
        return payout;
    }

    public async Task<HsPayout?> UpdatePayoutAsync(HsPayout payout)
    {
        var conn = await Conn();
        if (payout.Status == "Paid" && string.IsNullOrEmpty(payout.PaidAt))
            payout.PaidAt = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss");
        await conn.UpdateAsync(payout);
        return payout;
    }

    // ---------- admin dashboard ----------

    public async Task<object> GetDashboardAsync()
    {
        var conn = await Conn();
        var bookings = await conn.Table<HsBooking>().ToListAsync();
        var pros = await conn.Table<HsProfessional>().ToListAsync();
        var customers = await conn.Table<HsCustomer>().ToListAsync();
        var payouts = await conn.Table<HsPayout>().ToListAsync();
        var tickets = await conn.Table<HsSupportTicket>().ToListAsync();
        var disputes = await conn.Table<HsDispute>().ToListAsync();

        return new
        {
            totals = new
            {
                bookings = bookings.Count,
                activeBookings = bookings.Count(b => HsStatus.IsActive(b.Status)),
                professionals = pros.Count,
                pendingVerification = pros.Count(p => p.Status == "PendingVerification"),
                customers = customers.Count,
                revenue = bookings.Where(b => b.PaymentStatus == "Paid").Sum(b => b.CurrentQuote),
                pendingPayouts = payouts.Where(p => p.Status == "Pending" || p.Status == "Processing").Sum(p => p.Amount),
                openTickets = tickets.Count(t => t.Status == "Open" || t.Status == "InProgress"),
                openDisputes = disputes.Count(d => d.Status == "Open" || d.Status == "UnderReview"),
            },
            bookingsByStatus = bookings.GroupBy(b => b.Status)
                .ToDictionary(g => g.Key, g => g.Count()),
            revenueByStatus = bookings.Where(b => b.PaymentStatus == "Paid")
                .GroupBy(b => b.Status).ToDictionary(g => g.Key, g => g.Sum(b => b.CurrentQuote)),
        };
    }
}
