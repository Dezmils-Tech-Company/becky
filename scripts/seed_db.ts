
/**
 * scripts/seed-db.ts
 *
 * Wipes all existing Product documents and inserts a fresh, varied set of
 * sample products across every storefront category, for UI and visual
 * compatibility testing. Each product gets an optimized real-world image
 * from Unsplash, falling back to a deterministic picsum.photos placeholder.
 *
 * IMPORTANT: images.unsplash.com must be allowlisted in next.config.ts under
 * images.remotePatterns, or next/image will reject these URLs at render time.
 *
 * Usage:
 * npx tsx -r dotenv/config scripts/seed-db.ts dotenv_config_path=.env.local
 */

import { connectDB } from '../src/lib/mongodb/client'
import { Product } from '../src/models'
import mongoose from 'mongoose'

type Category =
  | 'Skincare'
  | 'Fragrance'
  | 'Bath & Body'
  | 'Hair Accessories'
  | 'Outfit and clothing'

interface SeedProductInput {
  name: string
  description: string
  price: number // smallest currency unit (e.g. KES cents)
  currency: 'KES' | 'USD'
  category: Category
  stock: number
  isActive: boolean
}

const SKINCARE: SeedProductInput[] = [
  { name: 'Hydrating Face Serum', description: 'A lightweight serum with hyaluronic acid for deep hydration and a dewy finish.', price: 250000, currency: 'KES', category: 'Skincare', stock: 40, isActive: true },
  { name: 'Vitamin C Brightening Cream', description: 'Daily brightening cream that fades dark spots and evens skin tone.', price: 320000, currency: 'KES', category: 'Skincare', stock: 25, isActive: true },
  { name: 'Gentle Foaming Cleanser', description: 'Sulfate-free cleanser that removes impurities without stripping the skin.', price: 180000, currency: 'KES', category: 'Skincare', stock: 60, isActive: true },
  { name: 'Niacinamide 10% Concentrate', description: 'Pore-refining concentrate that balances oil production and reduces blemishes.', price: 290000, currency: 'KES', category: 'Skincare', stock: 35, isActive: true },
  { name: 'SPF 50 Daily Sunscreen', description: 'Broad-spectrum, non-greasy sunscreen suitable for daily wear under makeup.', price: 220000, currency: 'KES', category: 'Skincare', stock: 50, isActive: true },
  { name: 'Retinol Night Repair Cream', description: 'Overnight treatment cream that smooths fine lines and improves texture.', price: 410000, currency: 'KES', category: 'Skincare', stock: 18, isActive: true },
  { name: 'Clay Detox Face Mask', description: 'Mineral-rich clay mask that draws out impurities and tightens pores.', price: 195000, currency: 'KES', category: 'Skincare', stock: 45, isActive: true },
  { name: 'Rose Water Toner', description: 'Alcohol-free toner that soothes and preps skin before serums and moisturizer.', price: 150000, currency: 'KES', category: 'Skincare', stock: 55, isActive: true },
  { name: 'Eye Contour Gel', description: 'Cooling gel that reduces puffiness and visibly brightens the under-eye area.', price: 275000, currency: 'KES', category: 'Skincare', stock: 22, isActive: true },
]

const FRAGRANCE: SeedProductInput[] = [
  { name: 'Amber Oud Eau de Parfum', description: 'A warm, woody fragrance with notes of amber, oud, and soft musk.', price: 650000, currency: 'KES', category: 'Fragrance', stock: 20, isActive: true },
  { name: 'Citrus Bloom Eau de Toilette', description: 'A fresh, energizing scent layered with bergamot, neroli, and white tea.', price: 480000, currency: 'KES', category: 'Fragrance', stock: 30, isActive: true },
  { name: 'Velvet Rose Perfume Oil', description: 'A long-lasting alcohol-free perfume oil centered on rich Damask rose.', price: 390000, currency: 'KES', category: 'Fragrance', stock: 28, isActive: true },
  { name: 'Sandalwood & Vanilla Mist', description: 'A cozy, comforting body mist with creamy vanilla and soft sandalwood.', price: 220000, currency: 'KES', category: 'Fragrance', stock: 42, isActive: true },
  { name: 'Sea Salt & Jasmine Cologne', description: 'A breezy, oceanic fragrance with jasmine petals and a salty mineral edge.', price: 510000, currency: 'KES', category: 'Fragrance', stock: 24, isActive: true },
  { name: 'Spiced Cedar Eau de Parfum', description: 'A bold, masculine-leaning scent built on cedarwood, black pepper, and cardamom.', price: 590000, currency: 'KES', category: 'Fragrance', stock: 19, isActive: true },
  { name: 'Pink Peony Roll-On Oil', description: 'A travel-friendly roll-on with soft floral peony and a hint of pear.', price: 165000, currency: 'KES', category: 'Fragrance', stock: 50, isActive: true },
  { name: 'Tobacco Vanille Candle Spray', description: 'A rich room and linen spray inspired by warm tobacco and sweet vanilla.', price: 240000, currency: 'KES', category: 'Fragrance', stock: 33, isActive: true },
]

const BATH_AND_BODY: SeedProductInput[] = [
  { name: 'Shea Butter Body Cream', description: 'Ultra-rich body cream made with whipped shea butter for 24-hour moisture.', price: 210000, currency: 'KES', category: 'Bath & Body', stock: 48, isActive: true },
  { name: 'Coconut Milk Bath Soak', description: 'A relaxing bath soak that softens skin with coconut milk and oat extract.', price: 175000, currency: 'KES', category: 'Bath & Body', stock: 36, isActive: true },
  { name: 'Exfoliating Sugar Scrub', description: 'A gentle sugar scrub that buffs away dry, flaky skin and leaves it glowing.', price: 195000, currency: 'KES', category: 'Bath & Body', stock: 40, isActive: true },
  { name: 'Lavender Bubble Bath', description: 'A calming, fragrant bubble bath designed to ease tension before bed.', price: 160000, currency: 'KES', category: 'Bath & Body', stock: 44, isActive: true },
  { name: 'Whipped Body Butter Trio', description: 'Three travel-size whipped body butters in mango, vanilla, and cocoa.', price: 280000, currency: 'KES', category: 'Bath & Body', stock: 25, isActive: true },
  { name: 'Charcoal Detox Bar Soap', description: 'Activated charcoal soap bar that deep-cleans without over-drying skin.', price: 95000, currency: 'KES', category: 'Bath & Body', stock: 60, isActive: true },
  { name: 'Hand & Foot Repair Cream', description: 'Intensive repair cream for cracked, rough hands and heels.', price: 145000, currency: 'KES', category: 'Bath & Body', stock: 38, isActive: true },
  { name: 'Energizing Body Wash', description: 'A citrus-mint body wash designed to wake up tired mornings.', price: 130000, currency: 'KES', category: 'Bath & Body', stock: 52, isActive: true },
  { name: 'Body Oil Shimmer Mist', description: 'A lightweight, fast-absorbing oil with a subtle golden shimmer finish.', price: 230000, currency: 'KES', category: 'Bath & Body', stock: 30, isActive: true },
]

const HAIR_ACCESSORIES: SeedProductInput[] = [
  { name: 'Wig Espanol', description: 'Versatile lace-front wig with a natural hairline and soft wave texture.', price: 200000, currency: 'KES', category: 'Hair Accessories', stock: 78, isActive: true },
  { name: 'Satin Hair Bonnet', description: 'A satin-lined bonnet that protects curls and reduces frizz overnight.', price: 85000, currency: 'KES', category: 'Hair Accessories', stock: 70, isActive: true },
  { name: 'Pearl Hair Clip Set', description: 'A set of five pearl-embellished clips for everyday or special-occasion styling.', price: 65000, currency: 'KES', category: 'Hair Accessories', stock: 90, isActive: true },
  { name: 'Silk Scrunchie Pack (4-Piece)', description: 'Gentle silk scrunchies that hold style without snagging or breaking hair.', price: 70000, currency: 'KES', category: 'Hair Accessories', stock: 85, isActive: true },
  { name: 'Curly Clip-In Extensions', description: 'Heat-resistant curly clip-ins that blend seamlessly for instant length and volume.', price: 350000, currency: 'KES', category: 'Hair Accessories', stock: 22, isActive: true },
  { name: 'Wide-Tooth Detangling Comb', description: 'A flexible wide-tooth comb designed for gentle detangling on curly and coily hair.', price: 45000, currency: 'KES', category: 'Hair Accessories', stock: 100, isActive: true },
  { name: 'Headwrap Scarf — Ankara Print', description: 'A bold Ankara-print headwrap for protective styling or everyday wear.', price: 90000, currency: 'KES', category: 'Hair Accessories', stock: 60, isActive: true },
  { name: 'Edge Control Brush Set', description: 'A dual-sided edge brush set for sleek baby hairs and clean partings.', price: 55000, currency: 'KES', category: 'Hair Accessories', stock: 75, isActive: true },
  { name: 'Braiding Hair Bundle — Jet Black', description: 'Pre-stretched synthetic braiding hair, lightweight and tangle-resistant.', price: 120000, currency: 'KES', category: 'Hair Accessories', stock: 55, isActive: true },
]

const OUTFIT_AND_CLOTHING: SeedProductInput[] = [
  { name: 'Ankara Wrap Dress', description: 'A flattering wrap dress in vibrant Ankara print, perfect for daytime events.', price: 450000, currency: 'KES', category: 'Outfit and clothing', stock: 20, isActive: true },
  { name: 'Linen Co-ord Set', description: 'A breathable two-piece linen set for warm-weather everyday wear.', price: 380000, currency: 'KES', category: 'Outfit and clothing', stock: 26, isActive: true },
  { name: 'High-Waist Tailored Trousers', description: 'Wide-leg tailored trousers with a flattering high-waist fit.', price: 320000, currency: 'KES', category: 'Outfit and clothing', stock: 32, isActive: true },
  { name: 'Satin Slip Dress', description: 'An elegant bias-cut satin slip dress that drapes effortlessly.', price: 410000, currency: 'KES', category: 'Outfit and clothing', stock: 18, isActive: true },
  { name: 'Oversized Denim Jacket', description: 'A classic oversized denim jacket that layers over almost anything.', price: 470000, currency: 'KES', category: 'Outfit and clothing', stock: 24, isActive: true },
  { name: 'Ribbed Knit Bodysuit', description: 'A figure-hugging ribbed bodysuit that pairs well with jeans or skirts.', price: 195000, currency: 'KES', category: 'Outfit and clothing', stock: 50, isActive: true },
  { name: 'Pleated Midi Skirt', description: 'A flowy pleated midi skirt with a comfortable elastic waistband.', price: 260000, currency: 'KES', category: 'Outfit and clothing', stock: 35, isActive: true },
  { name: 'Cropped Blazer — Camel', description: 'A structured cropped blazer that elevates casual outfits instantly.', price: 520000, currency: 'KES', category: 'Outfit and clothing', stock: 16, isActive: true },
  { name: 'Boho Maxi Dress', description: 'A relaxed-fit floral maxi dress with billowy sleeves, ideal for warm days.', price: 360000, currency: 'KES', category: 'Outfit and clothing', stock: 28, isActive: true },
  { name: 'Classic Trench Coat', description: 'A timeless double-breasted trench coat in water-resistant fabric.', price: 680000, currency: 'KES', category: 'Outfit and clothing', stock: 14, isActive: true },
]

const ALL_SEED_PRODUCTS: SeedProductInput[] = [
  ...SKINCARE,
  ...FRAGRANCE,
  ...BATH_AND_BODY,
  ...HAIR_ACCESSORIES,
  ...OUTFIT_AND_CLOTHING,
]

const PRODUCT_IMAGES: Record<string, string> = {
  // ===== SKINCARE =====
  'Hydrating Face Serum': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  'Vitamin C Brightening Cream': 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=800&q=80',
  'Gentle Foaming Cleanser': 'https://images.unsplash.com/photo-1556228578-dd6c8f6992af?auto=format&fit=crop&w=800&q=80',
  'Niacinamide 10% Concentrate': 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80',
  'SPF 50 Daily Sunscreen': 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
  'Retinol Night Repair Cream': 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=800&q=80',
  'Clay Detox Face Mask': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80',
  'Rose Water Toner': 'https://images.unsplash.com/photo-1601612628452-9e99ced43524?auto=format&fit=crop&w=800&q=80',
  'Eye Contour Gel': 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=800&q=80',

  // ===== FRAGRANCE =====
  'Amber Oud Eau de Parfum': 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
  'Citrus Bloom Eau de Toilette': 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  'Velvet Rose Perfume Oil': 'https://images.unsplash.com/photo-1615634262417-2e29fcb4f5a6?auto=format&fit=crop&w=800&q=80',
  'Sandalwood & Vanilla Mist': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  'Sea Salt & Jasmine Cologne': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  'Spiced Cedar Eau de Parfum': 'https://images.unsplash.com/photo-1619994403073-2cec1e799a5f?auto=format&fit=crop&w=800&q=80',
  'Pink Peony Roll-On Oil': 'https://images.unsplash.com/photo-1615634262417-2e29fcb4f5a6?auto=format&fit=crop&w=800&q=80',
  'Tobacco Vanille Candle Spray': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',

  // ===== BATH & BODY =====
  'Shea Butter Body Cream': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',
  'Coconut Milk Bath Soak': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80',
  'Exfoliating Sugar Scrub': 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80',
  'Lavender Bubble Bath': 'https://images.unsplash.com/photo-1607006483225-7e7f0c0fb89c?auto=format&fit=crop&w=800&q=80',
  'Whipped Body Butter Trio': 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=80',
  'Charcoal Detox Bar Soap': 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=800&q=80',
  'Hand & Foot Repair Cream': 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?auto=format&fit=crop&w=800&q=80',
  'Energizing Body Wash': 'https://images.unsplash.com/photo-1556228578-dd6c8f6992af?auto=format&fit=crop&w=800&q=80',
  'Body Oil Shimmer Mist': 'https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?auto=format&fit=crop&w=800&q=80',

  // ===== HAIR =====
  'Wig Espanol': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'Satin Hair Bonnet': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'Pearl Hair Clip Set': 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80',
  'Silk Scrunchie Pack (4-Piece)': 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80',
  'Curly Clip-In Extensions': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
  'Wide-Tooth Detangling Comb': 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&w=800&q=80',
  'Headwrap Scarf — Ankara Print': 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=800&q=80',
  'Edge Control Brush Set': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  'Braiding Hair Bundle — Jet Black': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',

  // ===== CLOTHING =====
  'Ankara Wrap Dress': 'https://images.unsplash.com/photo-1496747611176-843222e1e57?auto=format&fit=crop&w=800&q=80',
  'Linen Co-ord Set': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
  'High-Waist Tailored Trousers': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
  'Satin Slip Dress': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  'Oversized Denim Jacket': 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
  'Ribbed Knit Bodysuit': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
  'Pleated Midi Skirt': 'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=800&q=80',
  'Cropped Blazer — Camel': 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
  'Boho Maxi Dress': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
  'Classic Trench Coat': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
}

function getProductImage(name: string, slug: string): string {
  return PRODUCT_IMAGES[name] || `https://picsum.photos/seed/${slug}/600/600`
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  console.log('Connecting to MongoDB...')
  await connectDB()

  console.log('Wiping existing Product documents...')
  const deleted = await Product.deleteMany({})
  console.log(`Deleted ${deleted.deletedCount} existing product(s).`)

  console.log(`Seeding ${ALL_SEED_PRODUCTS.length} products across 5 categories...`)

  const docs = ALL_SEED_PRODUCTS.map((p) => {
    const slug = slugify(p.name)
    return {
      ...p,
      slug,
      images: [getProductImage(p.name, slug)],
    }
  })

  const inserted = await Product.insertMany(docs)
  console.log(`Inserted ${inserted.length} products.`)

  // Print a per-category breakdown so it's easy to confirm at a glance
  const counts: Record<string, number> = {}
  for (const doc of inserted) {
    counts[doc.category] = (counts[doc.category] ?? 0) + 1
  }
  console.log('\nProducts per category:')
  for (const [category, count] of Object.entries(counts)) {
    console.log(`  ${category}: ${count}`)
  }

  console.log(
    '\nNote: "All" is a UI filter, not a stored category — it should show every product above, not a separate seeded set.'
  )
  console.log(
    'Reminder: images.unsplash.com must be allowlisted in next.config.ts under images.remotePatterns for these placeholder images to render via next/image.'
  )
}

main()
  .then(async () => {
    await mongoose.connection.close()
    console.log('\nDone. Connection closed.')
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('Seeding failed:', error)
    await mongoose.connection.close()
    process.exit(1)
  })

