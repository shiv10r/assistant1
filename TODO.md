There are lot of services  being  duplicated  or used twise unnecesayr used  refactor the code base  and ui without loss of current features and  ui also put the common  services in seprate folder 

Reduce the numebr of  fiels used across the  application many things coud be handled in single  files only  delte them  

Make the application  industry grade and use the advance react concepts so that its interview reayd  for 4 year expreicnedeveoper  i can  proudly say this 

you  can  rewanp the ui abseod  on your reaosning and make it lie kstadnard  applicaiton   lek smae card used across many palces so can make sinel code lie kthat 
Rarrange the folder and docs and md fiels liek a real repository

## Completed frontend slices

- [x] Make the workspace chooser show every registered service at 100% zoom with compact responsive cards and scroll-safe short-viewport behavior.
- [x] Restyle the login experience with a scoped midnight-and-champagne VSR luxury palette.
- [x] Add the first VSR News frontend slice: top stories, breaking ticker, latest feed, article reading, local bookmarks, responsive layout, and application navigation.
- [x] Standardize workspace names as VSR Interiors, VSR Warehouse, VSR School, VSR Hotels, VSR Travel, and VSR News; remove the incorrect School coming-soon state.
- [x] Add the first VSR Jobs frontend slice: discover page, professional search and work-mode filters, job details, application-start state, saved jobs, responsive cards, and application navigation.
- [x] Give VSR News a dedicated portal shell by removing generic business navigation, plan controls, weather, and assistant UI; add Trending, Search, category desks, Latest, and Saved navigation.
- [x] Add the second VSR Jobs frontend slice: company directory, company profiles, open roles, and application status tracking.

## Next service work

- [ ] Connect VSR News to the planned ASP.NET Core API, SQL Server data model, authentication, search, and editorial workflow.
- [ ] Connect VSR Jobs to the planned ASP.NET Core API, SQL Server data model, profiles, resumes, applications, recruiter workflows, and administration.

## Service-specific UX

- [x] Remove generic Assistant, Business, More, Plan, weather, and business-dashboard UI from News, Travel, Hotel, and Jobs portal workspaces.
- [x] Add streaming-style focus, scale, glow, and sibling de-emphasis to workspace cards with keyboard and reduced-motion support.
- [x] Redesign the VSR logo and luxury login presentation for stronger white/gold contrast, real icons, and staggered entrance motion.
- [x] Keep the shared assistant available only in business workspaces where it currently supports operational data: Interiors, Warehouse, and School.
- [ ] Customize assistant context and suggested actions separately for Interiors, Warehouse, and School instead of serving identical prompts.

## Data sourcing

- [x] Document current VSR News sourcing: the frontend currently renders typed local fixtures from `frontend/src/services/news/newsData.ts`; it does not fetch live news yet.
- [ ] Replace News fixtures with the planned ASP.NET Core API plus licensed RSS/API aggregation, attribution, duplicate detection, and editorial review.


Here is todo:
remove dashbaord  analytics activity from assitent section insights  from bunsiness from news app hotel app and job app and hotel travelapp

use your  reasoning abilities remove  the features whihc arre deuplictae in the application across the three apps

workon job app frommd file

VSR
SYSTEMS
Help

A
Admin
Welcome to VSR Systems
Choose the workspace for this session


VSR Interiors
Spaces, projects, AI designs & estimates
Open workspace

VSR Warehouse
Inventory, suppliers, orders & fulfilment
Open workspace

VSR School
Students, academics, fees & attendance
Open workspace

VSR Hotels
Reservations, rooms, guests & housekeeping
Open workspace

VSR Travel
Destinations, packages, group trips & custom journeys
Open workspace

VSR News
Breaking stories, trusted reporting & saved reads
Open workspace

VSR Jobs
Search roles, compare employers & save opportunities
Open 
these are cards not accessible in mobile device i cant see them  only footer i am seeing 
i want  all the previous features resotred for hotel  service i ncer told u u od why u  did 
travel news and job services are fine for now 

Work on  ecommerseapp now architecture added 

## New app workspaces (pending)

- [x] Build the VSR Commerce frontend slice per `docs/services/VSR_Ecommerce_Application_Architecture_React_DotNet_SQL.md` — registered launcher workspace with a purpose-customized storefront shell, card-heavy home (hero, categories, trending, deals, offers, new arrivals, featured, brands), category/brand/offer pages, filterable product listing, product detail with gallery + variants + reviews, localStorage cart with coupons and checkout flow (address → shipping → payment simulator → confirmation), and wishlist.
- [ ] Connect VSR Commerce to the planned ASP.NET Core API and SQL Server data model (catalog, cart, checkout, orders, payments, inventory).
- [ ] Build the VSR Baking frontend slice.
- [ ] Build the VSR Medical frontend slice. 