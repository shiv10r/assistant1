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
- [x] Add the third VSR Jobs frontend slice: candidate profile, four-step application flow with resume metadata and saved drafts, screening questions, and live application tracking.

## Next service work

- [ ] Connect VSR News to the planned ASP.NET Core API, SQL Server data model, authentication, search, and editorial workflow.
- [ ] Connect VSR Jobs to the planned ASP.NET Core API, SQL Server data model, profiles, resumes, applications, recruiter workflows, and administration.

## Service-specific UX

- [x] Remove generic Assistant, Business, More, Plan, weather, and business-dashboard UI from News, Travel, Hotel, and Jobs portal workspaces.
- [x] Remove Dashboard, Analytics, Activity (Assistant group) and Insights (Business group) from the sidebar of every workspace; the News, Hotel, Jobs, and Travel portals never rendered them, and the shared sidebar no longer shows them in business workspaces either.
- [x] Add streaming-style focus, scale, glow, and sibling de-emphasis to workspace cards with keyboard and reduced-motion support.
- [x] Redesign the VSR logo and luxury login presentation for stronger white/gold contrast, real icons, and staggered entrance motion.
- [x] Keep the shared assistant available only in business workspaces where it currently supports operational data: Interiors, Warehouse, and School.
- [ ] Customize assistant context and suggested actions separately for Interiors, Warehouse, and School instead of serving identical prompts.

## Data sourcing

- [x] Document current VSR News sourcing: the frontend currently renders typed local fixtures from `frontend/src/services/news/newsData.ts`; it does not fetch live news yet.
- [ ] Replace News fixtures with the planned ASP.NET Core API plus licensed RSS/API aggregation, attribution, duplicate detection, and editorial review.


## Here is todo

- [x] Remove dashboard, analytics, activity from assistant section and insights from business, in the news app, hotel app, job app, and hotel travel app.
- [x] Restore all previous features for the hotel service (sidebar groups, topbar controls, assistant, weather, broadcast, plans, search) — hotel is a full workspace again, not a stripped portal shell.
- [x] Fix the workspace chooser on mobile: cards were invisible because the reduced-motion override disabled the entrance animation but left the cards at opacity 0; cards now always render visible.
- [ ] Enhance the VSR Travel, VSR News, and VSR Jobs portal UIs so each is customized to its purpose instead of sharing the same generic layout.