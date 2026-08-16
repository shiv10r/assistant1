export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export type CommerceVariant = {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly compareAtPrice: number
  readonly stock: StockStatus
  readonly sku: string
}

export type CommerceProduct = {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly brandId: string
  readonly categoryId: string
  readonly shortDescription: string
  readonly description: string
  readonly images: readonly string[]
  readonly rating: number
  readonly reviewCount: number
  readonly badge?: 'Best Seller' | 'New' | 'Limited Deal' | 'Top Rated' | 'Exclusive'
  readonly isNewArrival?: boolean
  readonly isFeatured?: boolean
  readonly isTrending?: boolean
  readonly variants: readonly CommerceVariant[]
  readonly specs: readonly { readonly key: string; readonly value: string }[]
  readonly highlights: readonly string[]
  readonly freeDelivery?: boolean
}

export type CommerceCategory = {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly image: string
  readonly description: string
  readonly productCount: number
}

export type CommerceBrand = {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly image: string
  readonly tagline: string
}

export type CommerceReview = {
  readonly id: string
  readonly productId: string
  readonly author: string
  readonly rating: number
  readonly title: string
  readonly body: string
  readonly date: string
  readonly verified: boolean
}

export type CommerceOffer = {
  readonly id: string
  readonly title: string
  readonly code: string
  readonly description: string
  readonly appliesTo: string
  readonly endsIn: string
  readonly gradient: string
}

export const COMMERCE_CATEGORIES: readonly CommerceCategory[] = [
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=82', description: 'Audio, wearables and everyday devices', productCount: 4 },
  { id: 'cat-mobiles', name: 'Mobiles', slug: 'mobiles', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=82', description: 'Smartphones with the latest cameras and chips', productCount: 3 },
  { id: 'cat-laptops', name: 'Laptops', slug: 'laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=82', description: 'Ultrabooks, creators and gaming machines', productCount: 3 },
  { id: 'cat-fashion', name: 'Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=82', description: 'Everyday wear and statement pieces', productCount: 3 },
  { id: 'cat-home', name: 'Home & Kitchen', slug: 'home-kitchen', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=82', description: 'Appliances, cookware and decor', productCount: 3 },
  { id: 'cat-beauty', name: 'Beauty', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=82', description: 'Skincare, makeup and fragrance', productCount: 2 },
  { id: 'cat-sports', name: 'Sports', slug: 'sports', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=82', description: 'Fitness, cricket and outdoor gear', productCount: 2 },
  { id: 'cat-books', name: 'Books', slug: 'books', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=82', description: 'Bestsellers, business and learning', productCount: 2 },
] as const

export const COMMERCE_BRANDS: readonly CommerceBrand[] = [
  { id: 'br-nova', name: 'NovaTech', slug: 'novatech', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=82', tagline: 'Modern electronics for everyday life' },
  { id: 'br-axon', name: 'Axon Audio', slug: 'axon', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=82', tagline: 'Sound engineering that moves you' },
  { id: 'br-verge', name: 'Verge Mobile', slug: 'verge', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=82', tagline: 'Flagship phones, fair prices' },
  { id: 'br-core', name: 'CoreGrid', slug: 'coregrid', image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=400&q=82', tagline: 'Serious laptops for serious work' },
  { id: 'br-stitch', name: 'Stitch & Co', slug: 'stitch', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=82', tagline: 'Considered clothing, lasting style' },
  { id: 'br-hearth', name: 'Hearthline', slug: 'hearthline', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=400&q=82', tagline: 'Home essentials with heart' },
  { id: 'br-lume', name: 'Lumé Beauty', slug: 'lume', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=82', tagline: 'Clean beauty that glows' },
  { id: 'br-stride', name: 'Stride Sports', slug: 'stride', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&q=82', tagline: 'Gear that keeps you moving' },
  { id: 'br-quill', name: 'Quill Press', slug: 'quill', image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=400&q=82', tagline: 'Stories worth your shelf' },
] as const

export const COMMERCE_PRODUCTS: readonly CommerceProduct[] = [
  {
    id: 'p-aurora-buds', slug: 'nova-aurora-wireless-earbuds', name: 'NovaTech Aurora Wireless Earbuds', brandId: 'br-nova', categoryId: 'cat-electronics',
    shortDescription: 'Active noise cancellation, 30-hour battery and a pocketable charging case.',
    description: 'The Aurora earbuds pair immersive hybrid noise cancellation with rich, balanced sound. With a 30-hour total battery, IPX5 water resistance and low-latency game mode, they are built for calls, commutes and workouts alike.',
    images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=82', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=82'],
    rating: 4.6, reviewCount: 1240, badge: 'Best Seller', isTrending: true, freeDelivery: true,
    variants: [
      { id: 'v-aurora-white', name: 'White', price: 4999, compareAtPrice: 7999, stock: 'In Stock', sku: 'NA-AR-001-W' },
      { id: 'v-aurora-black', name: 'Black', price: 4999, compareAtPrice: 7999, stock: 'Low Stock', sku: 'NA-AR-001-B' },
    ],
    highlights: ['Hybrid active noise cancellation', '30-hour total playtime', 'IPX5 sweat and splash resistant'],
    specs: [
      { key: 'Driver', value: '11 mm dynamic' },
      { key: 'Battery', value: '30 h with case' },
      { key: 'Connectivity', value: 'Bluetooth 5.4' },
      { key: 'Water resistance', value: 'IPX5' },
    ],
  },
  {
    id: 'p-pulse-headphones', slug: 'axon-pulse-over-ear-headphones', name: 'Axon Pulse Over-Ear Headphones', brandId: 'br-axon', categoryId: 'cat-electronics',
    shortDescription: 'Studio-tuned over-ears with plush memory-foam cushions and wired/USB-C modes.',
    description: 'Pulse delivers reference-grade audio across wired and wireless use. Memory-foam ear cushions, a folding travel design and 45-hour battery make it the dependable choice for long listening sessions.',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=82'],
    rating: 4.5, reviewCount: 890, badge: 'Top Rated', isFeatured: true, freeDelivery: true,
    variants: [
      { id: 'v-pulse-black', name: 'Matte Black', price: 7499, compareAtPrice: 9999, stock: 'In Stock', sku: 'AX-PL-002-MB' },
      { id: 'v-pulse-sand', name: 'Sand', price: 7499, compareAtPrice: 9999, stock: 'Out of Stock', sku: 'AX-PL-002-SD' },
    ],
    highlights: ['Studio-tuned 40 mm drivers', '45-hour wireless battery', 'Multipoint Bluetooth pairing'],
    specs: [
      { key: 'Driver', value: '40 mm dynamic' },
      { key: 'Battery', value: '45 h' },
      { key: 'Connectivity', value: 'Bluetooth 5.3, USB-C, 3.5 mm' },
      { key: 'Weight', value: '254 g' },
    ],
  },
  {
    id: 'p-slate-smartwatch', slug: 'novatech-slate-smartwatch', name: 'NovaTech Slate Smartwatch', brandId: 'br-nova', categoryId: 'cat-electronics',
    shortDescription: 'AMOLED display, 10-day battery and 120+ workout modes with built-in GPS.',
    description: 'Slate tracks heart rate, SpO2, sleep and 120+ workout modes on a crisp AMOLED display. With built-in GPS, Bluetooth calling and a 10-day battery, it goes from gym to office without a charger.',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=82', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=82'],
    rating: 4.4, reviewCount: 610, badge: 'New', isNewArrival: true,
    variants: [
      { id: 'v-slate-41', name: '41 mm', price: 8999, compareAtPrice: 11999, stock: 'In Stock', sku: 'NA-SL-003-41' },
      { id: 'v-slate-45', name: '45 mm', price: 9999, compareAtPrice: 12999, stock: 'In Stock', sku: 'NA-SL-003-45' },
    ],
    highlights: ['1.43" AMOLED display', 'Built-in GPS', '10-day battery life'],
    specs: [
      { key: 'Display', value: '1.43" AMOLED' },
      { key: 'Battery', value: '10 days' },
      { key: 'Sensors', value: 'HR, SpO2, sleep' },
      { key: 'GPS', value: 'Built-in' },
    ],
  },
  {
    id: 'p-boom-speaker', slug: 'axon-boom-portable-speaker', name: 'Axon Boom Portable Speaker', brandId: 'br-axon', categoryId: 'cat-electronics',
    shortDescription: 'Big 360° sound in a rugged, waterproof body with 20-hour playtime.',
    description: 'Boom throws powerful 360° audio while surviving sand, splash and dust. Pair two for stereo, and keep the party going for up to 20 hours on a single charge.',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=82'],
    rating: 4.7, reviewCount: 420, badge: 'Limited Deal', isTrending: true,
    variants: [
      { id: 'v-boom-black', name: 'Black', price: 3999, compareAtPrice: 5999, stock: 'In Stock', sku: 'AX-BM-004-BK' },
      { id: 'v-boom-navy', name: 'Navy', price: 3999, compareAtPrice: 5999, stock: 'Low Stock', sku: 'AX-BM-004-NV' },
    ],
    highlights: ['360° sound', 'IP67 waterproof', '20-hour battery'],
    specs: [
      { key: 'Output', value: '30 W RMS' },
      { key: 'Battery', value: '20 h' },
      { key: 'Rating', value: 'IP67' },
      { key: 'Pairing', value: 'True wireless stereo' },
    ],
  },
  {
    id: 'p-verge-x1', slug: 'verge-x1-5g-smartphone', name: 'Verge X1 5G Smartphone', brandId: 'br-verge', categoryId: 'cat-mobiles',
    shortDescription: 'Flagship 6.7" AMOLED, 50 MP camera system and 5,500 mAh battery.',
    description: 'The X1 pairs a 6.7" 120 Hz AMOLED with a 50 MP OIS main camera and a 5,500 mAh battery that lasts all day. Fast 67 W charging gets you from zero to 60% in about 25 minutes.',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=82', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=82'],
    rating: 4.8, reviewCount: 2100, badge: 'Best Seller', isFeatured: true, isTrending: true, freeDelivery: true,
    variants: [
      { id: 'v-x1-128', name: '128 GB', price: 27999, compareAtPrice: 32999, stock: 'In Stock', sku: 'VG-X1-005-128' },
      { id: 'v-x1-256', name: '256 GB', price: 30999, compareAtPrice: 35999, stock: 'Low Stock', sku: 'VG-X1-005-256' },
    ],
    highlights: ['6.7" 120 Hz AMOLED', '50 MP OIS camera', '67 W fast charging'],
    specs: [
      { key: 'Display', value: '6.7" AMOLED 120 Hz' },
      { key: 'Camera', value: '50 MP OIS + 8 MP UW' },
      { key: 'Battery', value: '5,500 mAh' },
      { key: 'Charging', value: '67 W wired' },
    ],
  },
  {
    id: 'p-verge-nova-lite', slug: 'verge-nova-lite-smartphone', name: 'Verge Nova Lite Smartphone', brandId: 'br-verge', categoryId: 'cat-mobiles',
    shortDescription: 'A capable everyday 5G phone with a 90 Hz display and two-day battery.',
    description: 'Nova Lite keeps essentials fast: a smooth 90 Hz display, dependable 5,000 mAh battery and clean software that stays fluid for years. Everything you need, nothing you do not.',
    images: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=800&q=82'],
    rating: 4.3, reviewCount: 760, isNewArrival: true,
    variants: [
      { id: 'v-nl-128', name: '128 GB', price: 14999, compareAtPrice: 17999, stock: 'In Stock', sku: 'VG-NL-006-128' },
      { id: 'v-nl-256', name: '256 GB', price: 16999, compareAtPrice: 19999, stock: 'In Stock', sku: 'VG-NL-006-256' },
    ],
    highlights: ['90 Hz display', '5,000 mAh battery', '5G ready'],
    specs: [
      { key: 'Display', value: '6.5" 90 Hz LCD' },
      { key: 'Camera', value: '50 MP main' },
      { key: 'Battery', value: '5,000 mAh' },
      { key: 'Connectivity', value: '5G, dual SIM' },
    ],
  },
  {
    id: 'p-verge-cam-pro', slug: 'verge-cam-pro-5g', name: 'Verge Cam Pro 5G Smartphone', brandId: 'br-verge', categoryId: 'cat-mobiles',
    shortDescription: 'Pro-grade triple camera with 5x periscope zoom and 8K video.',
    description: 'Cam Pro is built for creators: a triple camera with 5x periscope zoom, 8K video and a dedicated night mode. The 6.8" LTPO display adapts from 1 to 120 Hz to save battery.',
    images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=82'],
    rating: 4.7, reviewCount: 540, badge: 'Exclusive', isFeatured: true,
    variants: [
      { id: 'v-cp-256', name: '256 GB', price: 44999, compareAtPrice: 49999, stock: 'In Stock', sku: 'VG-CP-007-256' },
      { id: 'v-cp-512', name: '512 GB', price: 51999, compareAtPrice: 56999, stock: 'Out of Stock', sku: 'VG-CP-007-512' },
    ],
    highlights: ['5x periscope zoom', '8K video capture', '1-120 Hz LTPO display'],
    specs: [
      { key: 'Display', value: '6.8" LTPO 120 Hz' },
      { key: 'Camera', value: '50 MP triple + 5x zoom' },
      { key: 'Video', value: '8K 30 fps' },
      { key: 'Battery', value: '5,000 mAh' },
    ],
  },
  {
    id: 'p-core-ultrabook', slug: 'coregrid-aero-14-ultrabook', name: 'CoreGrid Aero 14 Ultrabook', brandId: 'br-core', categoryId: 'cat-laptops',
    shortDescription: '1.1 kg ultrabook with a 14" OLED, all-day battery and a superb keyboard.',
    description: 'Aero 14 weighs just 1.1 kg yet packs a 14" OLED display, up to 18 hours of battery and a keyboard that is a joy to type on. A serious companion for mobile professionals.',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=82', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=82'],
    rating: 4.6, reviewCount: 380, badge: 'Top Rated', isTrending: true, freeDelivery: true,
    variants: [
      { id: 'v-aero-i5', name: 'Core i5 / 16 GB', price: 84999, compareAtPrice: 99999, stock: 'In Stock', sku: 'CG-AE-008-I5' },
      { id: 'v-aero-i7', name: 'Core i7 / 32 GB', price: 109999, compareAtPrice: 124999, stock: 'Low Stock', sku: 'CG-AE-008-I7' },
    ],
    highlights: ['14" 2.8K OLED', '18-hour battery', '1.1 kg aluminium body'],
    specs: [
      { key: 'Display', value: '14" 2.8K OLED' },
      { key: 'Processor', value: 'Intel Core i5/i7' },
      { key: 'Memory', value: '16/32 GB LPDDR5X' },
      { key: 'Weight', value: '1.1 kg' },
    ],
  },
  {
    id: 'p-core-gaming', slug: 'coregrid-vortex-16-gaming-laptop', name: 'CoreGrid Vortex 16 Gaming Laptop', brandId: 'br-core', categoryId: 'cat-laptops',
    shortDescription: '165 Hz QHD display with RTX graphics and a vapour-chamber cooling system.',
    description: 'Vortex 16 delivers smooth high-refresh gaming with an RTX GPU, QHD 165 Hz panel and a vapour-chamber cooling system that stays quiet under load.',
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=82'],
    rating: 4.5, reviewCount: 290, badge: 'Limited Deal',
    variants: [
      { id: 'v-vx-4060', name: 'RTX 4060 / 16 GB', price: 114999, compareAtPrice: 129999, stock: 'In Stock', sku: 'CG-VX-009-4060' },
      { id: 'v-vx-4070', name: 'RTX 4070 / 32 GB', price: 144999, compareAtPrice: 159999, stock: 'In Stock', sku: 'CG-VX-009-4070' },
    ],
    highlights: ['QHD 165 Hz display', 'RTX 40-series graphics', 'Vapour-chamber cooling'],
    specs: [
      { key: 'Display', value: '16" QHD 165 Hz' },
      { key: 'Graphics', value: 'RTX 4060/4070' },
      { key: 'Memory', value: '16/32 GB DDR5' },
      { key: 'Cooling', value: 'Vapour chamber' },
    ],
  },
  {
    id: 'p-core-studio', slug: 'coregrid-studio-16-creator-laptop', name: 'CoreGrid Studio 16 Creator Laptop', brandId: 'br-core', categoryId: 'cat-laptops',
    shortDescription: 'Colour-accurate 4K mini-LED screen tuned for photo and video editors.',
    description: 'Studio 16 pairs a 4K mini-LED display with 100% DCI-P3 coverage and a powerful GPU — everything a creator needs for colour-critical work, all in a portable chassis.',
    images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=82'],
    rating: 4.8, reviewCount: 175, badge: 'New', isNewArrival: true,
    variants: [
      { id: 'v-st-16', name: '16 GB / 1 TB', price: 164999, compareAtPrice: 179999, stock: 'In Stock', sku: 'CG-ST-010-16' },
      { id: 'v-st-32', name: '32 GB / 2 TB', price: 194999, compareAtPrice: 209999, stock: 'Out of Stock', sku: 'CG-ST-010-32' },
    ],
    highlights: ['4K mini-LED, 100% DCI-P3', 'Studio-grade GPU', 'SD express card slot'],
    specs: [
      { key: 'Display', value: '16" 4K mini-LED' },
      { key: 'Colour', value: '100% DCI-P3' },
      { key: 'Memory', value: '16/32 GB' },
      { key: 'Ports', value: 'Thunderbolt 4, SD Express' },
    ],
  },
  {
    id: 'p-stitch-blazer', slug: 'stitch-tailored-blazer', name: 'Stitch Tailored Blazer', brandId: 'br-stitch', categoryId: 'cat-fashion',
    shortDescription: 'A refined single-breasted blazer in breathable Italian wool blend.',
    description: 'Cut for a modern fit with a half-canvas construction, this blazer drapes cleanly from desk to dinner. The breathable wool blend keeps you comfortable across seasons.',
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=82'],
    rating: 4.4, reviewCount: 210, badge: 'Best Seller', freeDelivery: true,
    variants: [
      { id: 'v-blazer-38', name: 'Size 38', price: 8999, compareAtPrice: 11999, stock: 'In Stock', sku: 'ST-BZ-011-38' },
      { id: 'v-blazer-40', name: 'Size 40', price: 8999, compareAtPrice: 11999, stock: 'Low Stock', sku: 'ST-BZ-011-40' },
      { id: 'v-blazer-42', name: 'Size 42', price: 8999, compareAtPrice: 11999, stock: 'In Stock', sku: 'ST-BZ-011-42' },
    ],
    highlights: ['Half-canvas construction', 'Breathable wool blend', 'Modern tailored fit'],
    specs: [
      { key: 'Material', value: 'Wool blend' },
      { key: 'Fit', value: 'Tailored' },
      { key: 'Closure', value: 'Single-breasted, two-button' },
      { key: 'Care', value: 'Dry clean only' },
    ],
  },
  {
    id: 'p-stitch-oxford', slug: 'stitch-oxford-shirt', name: 'Stitch Oxford Shirt', brandId: 'br-stitch', categoryId: 'cat-fashion',
    shortDescription: 'The everyday Oxford in soft, garment-washed cotton.',
    description: 'A wardrobe staple with a soft garment-washed finish, mother-of-pearl buttons and a fit that works layered or alone. Made from 100% combed cotton.',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=82'],
    rating: 4.5, reviewCount: 640, isFeatured: true, freeDelivery: true,
    variants: [
      { id: 'v-oxford-s', name: 'Size S', price: 2499, compareAtPrice: 3499, stock: 'In Stock', sku: 'ST-OX-012-S' },
      { id: 'v-oxford-m', name: 'Size M', price: 2499, compareAtPrice: 3499, stock: 'In Stock', sku: 'ST-OX-012-M' },
      { id: 'v-oxford-l', name: 'Size L', price: 2499, compareAtPrice: 3499, stock: 'Low Stock', sku: 'ST-OX-012-L' },
    ],
    highlights: ['100% combed cotton', 'Garment-washed softness', 'Mother-of-pearl buttons'],
    specs: [
      { key: 'Material', value: '100% cotton' },
      { key: 'Fit', value: 'Regular' },
      { key: 'Collar', value: 'Button-down' },
      { key: 'Care', value: 'Machine wash cold' },
    ],
  },
  {
    id: 'p-stitch-sneakers', slug: 'stitch-court-sneakers', name: 'Stitch Court Sneakers', brandId: 'br-stitch', categoryId: 'cat-fashion',
    shortDescription: 'Clean leather court sneakers with a cushioned footbed.',
    description: 'Minimal leather sneakers that go with everything. A padded collar and cushioned footbed keep them comfortable from morning meetings to weekend walks.',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=82'],
    rating: 4.6, reviewCount: 730, badge: 'Top Rated', isTrending: true,
    variants: [
      { id: 'v-court-8', name: 'UK 8', price: 4299, compareAtPrice: 5499, stock: 'In Stock', sku: 'ST-CR-013-8' },
      { id: 'v-court-9', name: 'UK 9', price: 4299, compareAtPrice: 5499, stock: 'In Stock', sku: 'ST-CR-013-9' },
      { id: 'v-court-10', name: 'UK 10', price: 4299, compareAtPrice: 5499, stock: 'Out of Stock', sku: 'ST-CR-013-10' },
    ],
    highlights: ['Full-grain leather upper', 'Cushioned footbed', 'Durable rubber outsole'],
    specs: [
      { key: 'Upper', value: 'Full-grain leather' },
      { key: 'Sole', value: 'Rubber cupsole' },
      { key: 'Closure', value: 'Lace-up' },
      { key: 'Care', value: 'Wipe clean' },
    ],
  },
  {
    id: 'p-hearth-airfryer', slug: 'hearthline-pro-air-fryer', name: 'Hearthline Pro Air Fryer', brandId: 'br-hearth', categoryId: 'cat-home',
    shortDescription: '5.5 L digital air fryer with 8 presets and a dishwasher-safe basket.',
    description: 'Cook crispy favourites with up to 85% less oil. The 5.5 L basket feeds a family, 8 one-touch presets handle the guesswork, and the non-stick basket is dishwasher-safe.',
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=82'],
    rating: 4.5, reviewCount: 980, badge: 'Best Seller', isTrending: true, freeDelivery: true,
    variants: [
      { id: 'v-af-55', name: '5.5 L', price: 5999, compareAtPrice: 8999, stock: 'In Stock', sku: 'HL-AF-014-55' },
      { id: 'v-af-75', name: '7.5 L', price: 7499, compareAtPrice: 9999, stock: 'Low Stock', sku: 'HL-AF-014-75' },
    ],
    highlights: ['8 one-touch presets', '85% less oil', 'Dishwasher-safe basket'],
    specs: [
      { key: 'Capacity', value: '5.5/7.5 L' },
      { key: 'Power', value: '1,800 W' },
      { key: 'Controls', value: 'Digital touch' },
      { key: 'Wattage', value: '1800 W' },
    ],
  },
  {
    id: 'p-hearth-kettle', slug: 'hearthline-glass-kettle', name: 'Hearthline Glass Kettle', brandId: 'br-hearth', categoryId: 'cat-home',
    shortDescription: '1.7 L borosilicate kettle with rapid boil and auto shut-off.',
    description: 'Boil water in minutes in a food-safe borosilicate glass body with a soft blue interior light. Auto shut-off and boil-dry protection make it safe for everyday use.',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=82'],
    rating: 4.3, reviewCount: 420, isNewArrival: true,
    variants: [
      { id: 'v-kt-17', name: '1.7 L', price: 1999, compareAtPrice: 2999, stock: 'In Stock', sku: 'HL-KT-015-17' },
    ],
    highlights: ['Borosilicate glass body', 'Rapid boil in ~5 min', 'Auto shut-off'],
    specs: [
      { key: 'Capacity', value: '1.7 L' },
      { key: 'Power', value: '1,500 W' },
      { key: 'Material', value: 'Borosilicate glass' },
      { key: 'Safety', value: 'Auto shut-off, boil-dry' },
    ],
  },
  {
    id: 'p-hearth-knife', slug: 'hearthline-chef-knife-set', name: 'Hearthline Chef Knife Set', brandId: 'br-hearth', categoryId: 'cat-home',
    shortDescription: 'Six high-carbon stainless knives with a self-sharpening block.',
    description: 'A complete kitchen kit: chef, bread, utility, paring and santoku knives in high-carbon stainless steel, held in a self-sharpening block that keeps every edge ready.',
    images: ['https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=82'],
    rating: 4.6, reviewCount: 310, badge: 'Limited Deal',
    variants: [
      { id: 'v-kn-6', name: '6-piece set', price: 3499, compareAtPrice: 5499, stock: 'In Stock', sku: 'HL-KN-016-6' },
    ],
    highlights: ['High-carbon stainless steel', 'Self-sharpening block', '6 essential knives'],
    specs: [
      { key: 'Pieces', value: '6 knives' },
      { key: 'Material', value: 'High-carbon stainless' },
      { key: 'Block', value: 'Self-sharpening acacia' },
      { key: 'Care', value: 'Hand wash recommended' },
    ],
  },
  {
    id: 'p-lume-serum', slug: 'lume-vitamin-c-serum', name: 'Lumé Vitamin C Brightening Serum', brandId: 'br-lume', categoryId: 'cat-beauty',
    shortDescription: '15% vitamin C with hyaluronic acid for visibly brighter skin.',
    description: 'A stable 15% vitamin C formula with hyaluronic acid and vitamin E that targets dullness, dark spots and fine lines. Non-greasy, fragrance-free and suitable for daily use.',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=82'],
    rating: 4.7, reviewCount: 1180, badge: 'Best Seller', isTrending: true,
    variants: [
      { id: 'v-serum-30', name: '30 ml', price: 1299, compareAtPrice: 1799, stock: 'In Stock', sku: 'LU-SR-017-30' },
      { id: 'v-serum-50', name: '50 ml', price: 1999, compareAtPrice: 2699, stock: 'Low Stock', sku: 'LU-SR-017-50' },
    ],
    highlights: ['15% stabilised vitamin C', 'Hyaluronic acid + vitamin E', 'Fragrance-free'],
    specs: [
      { key: 'Key actives', value: '15% Vitamin C, HA, E' },
      { key: 'Size', value: '30/50 ml' },
      { key: 'Skin type', value: 'All' },
      { key: 'Cruelty-free', value: 'Yes' },
    ],
  },
  {
    id: 'p-lume-sunscreen', slug: 'lume-daily-sunscreen-spf50', name: 'Lumé Daily Sunscreen SPF 50+', brandId: 'br-lume', categoryId: 'cat-beauty',
    shortDescription: 'Invisible, weightless SPF 50+ protection with zero white cast.',
    description: 'A featherlight gel sunscreen that disappears into all skin tones while providing broad-spectrum SPF 50+ protection. Hydrating enough to double as your morning moisturiser.',
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=82'],
    rating: 4.4, reviewCount: 520, badge: 'New', isNewArrival: true,
    variants: [
      { id: 'v-sun-50', name: '50 g', price: 899, compareAtPrice: 1199, stock: 'In Stock', sku: 'LU-SN-018-50' },
    ],
    highlights: ['SPF 50+ broad spectrum', 'Zero white cast', 'Weightless gel texture'],
    specs: [
      { key: 'SPF', value: '50+' },
      { key: 'Size', value: '50 g' },
      { key: 'Finish', value: 'Invisible, matte' },
      { key: 'Water resistance', value: '80 min' },
    ],
  },
  {
    id: 'p-stride-runner', slug: 'stride-feather-runner', name: 'Stride Feather Running Shoes', brandId: 'br-stride', categoryId: 'cat-sports',
    shortDescription: 'Featherlight daily trainers with responsive foam and a breathable knit.',
    description: 'Feather pairs a responsive foam midsole with a breathable engineered knit for easy daily miles. The 8 mm drop suits most runners, and the outsole grips confidently on wet roads.',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=82'],
    rating: 4.6, reviewCount: 850, badge: 'Top Rated', isFeatured: true, freeDelivery: true,
    variants: [
      { id: 'v-runner-8', name: 'UK 8', price: 5499, compareAtPrice: 6999, stock: 'In Stock', sku: 'ST-RN-019-8' },
      { id: 'v-runner-9', name: 'UK 9', price: 5499, compareAtPrice: 6999, stock: 'In Stock', sku: 'ST-RN-019-9' },
      { id: 'v-runner-10', name: 'UK 10', price: 5499, compareAtPrice: 6999, stock: 'Low Stock', sku: 'ST-RN-019-10' },
    ],
    highlights: ['Responsive foam midsole', 'Breathable engineered knit', '8 mm drop'],
    specs: [
      { key: 'Midsole', value: 'Responsive EVA foam' },
      { key: 'Upper', value: 'Engineered knit' },
      { key: 'Drop', value: '8 mm' },
      { key: 'Weight', value: '238 g (UK 9)' },
    ],
  },
  {
    id: 'p-stride-cricket', slug: 'stride-pro-cricket-bat', name: 'Stride Pro Cricket Bat', brandId: 'br-stride', categoryId: 'cat-sports',
    shortDescription: 'Grade 1 English willow bat with a balanced pick-up and sweet spot.',
    description: 'Handcrafted from grade 1 English willow, the Pro offers a generous sweet spot and balanced pick-up for powerful, controlled strokes. Knocked-in and ready for the nets.',
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=82'],
    rating: 4.5, reviewCount: 190, isFeatured: true,
    variants: [
      { id: 'v-bat-sh', name: 'Short Handle', price: 7999, compareAtPrice: 9999, stock: 'In Stock', sku: 'ST-CB-020-SH' },
      { id: 'v-bat-lh', name: 'Long Handle', price: 8299, compareAtPrice: 10299, stock: 'Out of Stock', sku: 'ST-CB-020-LH' },
    ],
    highlights: ['Grade 1 English willow', 'Knocked-in and ready', 'Balanced pick-up'],
    specs: [
      { key: 'Willow', value: 'Grade 1 English' },
      { key: 'Handle', value: 'Short/Long' },
      { key: 'Weight', value: '1.15-1.2 kg' },
      { key: 'Extras', value: 'Grip included' },
    ],
  },
  {
    id: 'p-quill-lean', slug: 'quill-lean-startup-book', name: 'The Lean Startup — Eric Ries', brandId: 'br-quill', categoryId: 'cat-books',
    shortDescription: 'The classic playbook for building products customers actually want.',
    description: 'Eric Ries redefines how startups are built: validated learning, the build-measure-learn loop and innovation accounting. A must-read for founders and product teams.',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=82'],
    rating: 4.8, reviewCount: 2400, badge: 'Best Seller', freeDelivery: true,
    variants: [
      { id: 'v-lean-pb', name: 'Paperback', price: 499, compareAtPrice: 699, stock: 'In Stock', sku: 'QP-LN-021-PB' },
    ],
    highlights: ['Build-measure-learn loop', 'Validated learning', 'Innovation accounting'],
    specs: [
      { key: 'Author', value: 'Eric Ries' },
      { key: 'Format', value: 'Paperback' },
      { key: 'Pages', value: '336' },
      { key: 'Publisher', value: 'Crown Business' },
    ],
  },
  {
    id: 'p-quill-atomic', slug: 'quill-atomic-habits-book', name: 'Atomic Habits — James Clear', brandId: 'br-quill', categoryId: 'cat-books',
    shortDescription: 'Tiny changes, remarkable results — the system for lasting habits.',
    description: 'James Clear distils the science of habit formation into a practical system: make it obvious, attractive, easy and satisfying. The definitive guide to building better habits.',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=82'],
    rating: 4.9, reviewCount: 3100, badge: 'Top Rated', isTrending: true, freeDelivery: true,
    variants: [
      { id: 'v-atomic-pb', name: 'Paperback', price: 599, compareAtPrice: 799, stock: 'In Stock', sku: 'QP-AT-022-PB' },
      { id: 'v-atomic-hb', name: 'Hardcover', price: 1099, compareAtPrice: 1399, stock: 'Low Stock', sku: 'QP-AT-022-HB' },
    ],
    highlights: ['Four laws of behaviour change', 'Habit stacking framework', 'Practical implementation guides'],
    specs: [
      { key: 'Author', value: 'James Clear' },
      { key: 'Format', value: 'Paperback/Hardcover' },
      { key: 'Pages', value: '320' },
      { key: 'Publisher', value: 'Random House' },
    ],
  },
] as const

export const COMMERCE_REVIEWS: readonly CommerceReview[] = [
  { id: 'r-1', productId: 'p-aurora-buds', author: 'Rahul M.', rating: 5, title: 'Best earbuds under 5k', body: 'Noise cancellation is surprisingly good and the case is genuinely pocketable. Battery easily lasts my work week.', date: '2026-07-18', verified: true },
  { id: 'r-2', productId: 'p-aurora-buds', author: 'Priya S.', rating: 4, title: 'Great sound, average mic', body: 'Music and calls sound great. The mic picks up some background noise in traffic but that is the only gripe.', date: '2026-07-02', verified: true },
  { id: 'r-3', productId: 'p-verge-x1', author: 'Amit K.', rating: 5, title: 'Flagship feel, mid-range price', body: 'Display is stunning, camera is reliable in daylight and the battery genuinely lasts a full day.', date: '2026-07-25', verified: true },
  { id: 'r-4', productId: 'p-verge-x1', author: 'Neha R.', rating: 5, title: 'Upgraded from a 3-year-old phone', body: 'Massive step up. Fast, smooth, and the 67 W charging is a lifesaver before morning meetings.', date: '2026-07-11', verified: true },
  { id: 'r-5', productId: 'p-core-ultrabook', author: 'Sandeep V.', rating: 4, title: 'Excellent ultrabook', body: 'Keyboard and screen are superb. Battery is close to the claimed 18 hours with light use. Fans stay quiet.', date: '2026-06-29', verified: true },
  { id: 'r-6', productId: 'p-lume-serum', author: 'Ananya D.', rating: 5, title: 'Visible brightness in 3 weeks', body: 'Skin looks noticeably brighter and more even. No irritation, and it layers well under sunscreen.', date: '2026-07-15', verified: true },
  { id: 'r-7', productId: 'p-stride-runner', author: 'Karan T.', rating: 5, title: 'Perfect daily trainer', body: 'Light, comfortable and grippy. Done 200 km in them and the foam still feels responsive.', date: '2026-07-05', verified: true },
  { id: 'r-8', productId: 'p-quill-atomic', author: 'Meera P.', rating: 5, title: 'Life-changing read', body: 'Simple frameworks that are easy to apply. I have gifted this book three times already.', date: '2026-06-20', verified: false },
] as const

export const COMMERCE_OFFERS: readonly CommerceOffer[] = [
  { id: 'off-1', title: 'Summer Tech Sale', code: 'TECH40', description: 'Up to 40% off selected electronics & mobiles', appliesTo: 'cat-electronics', endsIn: '2 days', gradient: 'linear-gradient(125deg, #7C2D12 0%, #EA580C 60%, #F59E0B 130%)' },
  { id: 'off-2', title: 'Style Week', code: 'STYLE25', description: 'Flat 25% off fashion from Stitch & Co', appliesTo: 'br-stitch', endsIn: '4 days', gradient: 'linear-gradient(125deg, #065F46 0%, #10B981 60%, #34D399 130%)' },
  { id: 'off-3', title: 'Home Refresh', code: 'HOME15', description: '15% off home & kitchen essentials', appliesTo: 'cat-home', endsIn: '6 days', gradient: 'linear-gradient(125deg, #1E3A8A 0%, #3B82F6 60%, #60A5FA 130%)' },
  { id: 'off-4', title: 'First Order', code: 'WELCOME10', description: 'Extra 10% off your first order above ₹1,499', appliesTo: 'all', endsIn: 'Always', gradient: 'linear-gradient(125deg, #4C1D95 0%, #8B5CF6 60%, #A78BFA 130%)' },
] as const

export function commerceProductBySlug(slug: string | undefined): CommerceProduct | null {
  return COMMERCE_PRODUCTS.find((product) => product.slug === slug) ?? null
}

export function commerceProductById(id: string | undefined): CommerceProduct | null {
  return COMMERCE_PRODUCTS.find((product) => product.id === id) ?? null
}

export function commerceCategoryById(id: string | undefined): CommerceCategory | null {
  return COMMERCE_CATEGORIES.find((category) => category.id === id) ?? null
}

export function commerceBrandById(id: string | undefined): CommerceBrand | null {
  return COMMERCE_BRANDS.find((brand) => brand.id === id) ?? null
}

export function commerceProductsInCategory(categoryId: string): readonly CommerceProduct[] {
  return COMMERCE_PRODUCTS.filter((product) => product.categoryId === categoryId)
}

export function commerceReviewsFor(productId: string): readonly CommerceReview[] {
  return COMMERCE_REVIEWS.filter((review) => review.productId === productId)
}

export function commerceBestPrice(product: CommerceProduct): number {
  return Math.min(...product.variants.map((variant) => variant.price))
}

export function commerceBestCompareAt(product: CommerceProduct): number {
  return Math.max(...product.variants.map((variant) => variant.compareAtPrice))
}

export function commerceDiscountPercent(product: CommerceProduct): number {
  const price = commerceBestPrice(product)
  const compareAt = commerceBestCompareAt(product)
  if (compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export function commerceAvailability(product: CommerceProduct): StockStatus {
  const statuses = product.variants.map((variant) => variant.stock)
  if (statuses.every((status) => status === 'Out of Stock')) return 'Out of Stock'
  if (statuses.some((status) => status === 'Low Stock')) return 'Low Stock'
  return 'In Stock'
}

export function commerceSearchProducts(query: string, categoryId: string | null, brandId: string | null, maxPrice: number | null): readonly CommerceProduct[] {
  const normalizedQuery = query.trim().toLowerCase()
  return COMMERCE_PRODUCTS.filter((product) => {
    const matchesQuery = !normalizedQuery || `${product.name} ${product.shortDescription} ${product.brandId} ${product.categoryId}`.toLowerCase().includes(normalizedQuery)
    const matchesCategory = !categoryId || product.categoryId === categoryId
    const matchesBrand = !brandId || product.brandId === brandId
    const matchesPrice = maxPrice == null || commerceBestPrice(product) <= maxPrice
    return matchesQuery && matchesCategory && matchesBrand && matchesPrice
  })
}