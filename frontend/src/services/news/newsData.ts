export type NewsCategory = 'India' | 'World' | 'Business' | 'Technology' | 'Sports' | 'Entertainment'

export type NewsStory = {
  readonly slug: string
  readonly category: NewsCategory
  readonly headline: string
  readonly summary: string
  readonly author: string
  readonly published: string
  readonly readMinutes: number
  readonly imageUrl: string
  readonly imageAlt: string
  readonly breaking?: boolean
  readonly trending?: boolean
  readonly body: readonly string[]
}

export const NEWS_STORIES: readonly NewsStory[] = [
  {
    slug: 'india-clean-energy-corridor-expands',
    category: 'India',
    headline: 'India expands clean-energy corridor across five states',
    summary: 'The next transmission phase will connect new solar and wind capacity to high-demand industrial regions.',
    author: 'Meera Nair', published: '18 min ago', readMinutes: 4, breaking: true,
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Solar panels and wind turbines across a green landscape',
    body: [
      'India has approved the next phase of its clean-energy transmission corridor, linking renewable projects across Rajasthan, Gujarat, Maharashtra, Karnataka and Tamil Nadu.',
      'The programme focuses on grid stability, storage-ready substations and faster connections for new solar and wind capacity. State utilities will coordinate construction schedules with industrial demand forecasts.',
      'Energy analysts expect the corridor to reduce curtailment during peak generation and improve the reliability of renewable supply for manufacturing centres.',
    ],
  },
  {
    slug: 'semiconductor-lab-opens-bengaluru', category: 'Technology', trending: true,
    headline: 'New semiconductor research lab opens in Bengaluru',
    summary: 'The industry-backed centre will focus on low-power chips, packaging and advanced materials.',
    author: 'Arjun Rao', published: '42 min ago', readMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Close view of an electronic circuit board',
    body: ['A new semiconductor research centre has opened in Bengaluru with backing from universities and domestic technology firms.', 'Its first programmes will study low-power chip design, advanced packaging and materials suited to high-temperature industrial systems.', 'The centre will also host a shared prototyping facility for early-stage hardware companies.'],
  },
  {
    slug: 'markets-rise-on-manufacturing-data', category: 'Business',
    headline: 'Markets rise as manufacturing data beats forecasts',
    summary: 'Banking, engineering and consumer shares led gains after stronger domestic factory activity.',
    author: 'Kavya Shah', published: '1 hr ago', readMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Market data displayed on trading monitors',
    body: ['Indian equities closed higher after factory output and new-order data exceeded market expectations.', 'Banking and engineering companies led the advance, while energy shares traded in a narrow range.', 'Analysts said upcoming inflation data will guide the next major move.'],
  },
  {
    slug: 'coastal-cities-climate-plan', category: 'World', trending: true,
    headline: 'Coastal cities agree on shared climate resilience plan',
    summary: 'Mayors from 18 cities will pool flood modelling, emergency planning and resilient infrastructure standards.',
    author: 'Daniel Thomas', published: '2 hrs ago', readMinutes: 6,
    imageUrl: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Dense coastal city beside blue water',
    body: ['Eighteen coastal cities have agreed to share flood modelling and emergency-response practices.', 'The partnership creates common standards for drainage upgrades, waterfront development and public warning systems.', 'The first joint risk assessment is due early next year.'],
  },
  {
    slug: 'india-series-young-bowlers', category: 'Sports',
    headline: 'Young bowlers shape India’s series-winning performance',
    summary: 'A disciplined final-session spell secured the match after a closely contested five days.',
    author: 'Rohan Menon', published: '3 hrs ago', readMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Cricket players competing on a sunlit field',
    body: ['India’s younger bowling group delivered a controlled final-session spell to seal the series.', 'The attack combined short, aggressive bursts with patient lines outside off stump.', 'The captain credited the result to preparation and the depth of the squad.'],
  },
  {
    slug: 'independent-films-regional-stories', category: 'Entertainment',
    headline: 'Independent films bring regional stories to wider audiences',
    summary: 'A new festival circuit is helping smaller productions find theatres and streaming distribution.',
    author: 'Sana Kapoor', published: '4 hrs ago', readMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Rows of seats inside a classic cinema',
    body: ['A growing festival circuit is connecting regional filmmakers with distributors and audiences beyond their home states.', 'Organisers are pairing screenings with subtitling support and meetings with independent theatre owners.', 'Several titles have already secured wider releases and streaming agreements.'],
  },
  {
    slug: 'rail-freight-corridor-milestone', category: 'India',
    headline: 'Freight corridor reaches major capacity milestone',
    summary: 'Longer electric trains are cutting transit times between industrial hubs and western ports.',
    author: 'Vikram Joshi', published: '5 hrs ago', readMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Freight train travelling through an open landscape',
    body: ['The western freight corridor has crossed a major monthly capacity milestone.', 'Operators attribute the increase to longer electric trains and coordinated terminal slots.', 'Exporters report more predictable transit times to ports.'],
  },
  {
    slug: 'ai-language-tools-indian-classrooms', category: 'Technology',
    headline: 'Language technology reaches more Indian classrooms',
    summary: 'Open speech and translation tools are helping teachers prepare lessons in regional languages.',
    author: 'Neha Iyer', published: '6 hrs ago', readMinutes: 7,
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Students learning together in a bright classroom',
    body: ['Schools are testing open language tools that help teachers translate and narrate lessons in regional languages.', 'The pilot keeps educators in control of final material and avoids collecting student voice recordings.', 'Researchers will measure comprehension before expanding the programme.'],
  },
] as const

export function storyBySlug(slug: string | undefined): NewsStory | null {
  return NEWS_STORIES.find((story) => story.slug === slug) ?? null
}
