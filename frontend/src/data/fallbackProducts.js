// Static products shown when backend/DB is unavailable
// Prices chosen as reasonable INR amounts for mid-range items
export const FALLBACK_PRODUCTS = [
  {
    id: 'fb-1',
    name: 'Wireless Noise-Canceling Headphones',
    price: 3999,
    stock: 15,
    description:
      'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
    image_url: '/images/headphones.png',
    Category: { name: 'Electronics' },
  },
  {
    id: 'fb-2',
    name: 'Minimalist Analog Watch',
    price: 2499,
    stock: 20,
    description:
      'Elegant analog watch with leather strap and water-resistant design for everyday use.',
    image_url: '/images/watch.png',
    Category: { name: 'Fashion' },
  },
  {
    id: 'fb-3',
    name: 'Everyday Running Sneakers',
    price: 3499,
    stock: 18,
    description:
      'Lightweight running shoes with cushioned sole, perfect for daily runs and gym sessions.',
    image_url: '/images/sneakers.png',
    Category: { name: 'Fashion' },
  },
  {
    id: 'fb-4',
    name: 'Soft Cotton Hoodie',
    price: 1299,
    stock: 25,
    description: 'Comfortable oversized hoodie made from 100% soft cotton.',
    image_url: '/images/hoodie.png',
    Category: { name: 'Fashion' },
  },
  {
    id: 'fb-5',
    name: 'Premium Coffee Maker',
    price: 5499,
    stock: 8,
    description:
      'Programmable drip coffee maker with thermal carafe that brews up to 12 cups.',
    image_url: '/images/coffee_maker.png',
    Category: { name: 'Home & Living' },
  },
  {
    id: 'fb-6',
    name: 'Designer Sunglasses',
    price: 1799,
    stock: 30,
    description: 'UV-protected polarized lenses in a classic aviator frame.',
    image_url: '/images/sunglasses.png',
    Category: { name: 'Fashion' },
  },
  {
    id: 'fb-7',
    name: 'Bluetooth Speaker',
    price: 2499,
    stock: 22,
    description:
      'Portable wireless speaker with 20-hour battery life and splash-proof design.',
    image_url: '/images/speaker.png',
    Category: { name: 'Electronics' },
  },
  {
    id: 'fb-8',
    name: 'Leather Backpack',
    price: 2199,
    stock: 12,
    description:
      'Durable leather backpack with padded laptop compartment and multiple pockets.',
    image_url: '/images/leather_backpack.png',
    Category: { name: 'Fashion' },
  },
  {
    id: 'fb-9',
    name: 'Skincare Essentials Set',
    price: 999,
    stock: 40,
    description:
      'Complete skincare routine including cleanser, toner and moisturizer for daily care.',
    image_url: '/images/skincare.png',
    Category: { name: 'Beauty' },
  },
  {
    id: 'fb-10',
    name: 'Smart Fitness Band',
    price: 2999,
    stock: 18,
    description:
      'Fitness band that tracks steps, heart rate and sleep with 7-day battery life.',
    image_url: '/images/fitness_tracker.png',
    Category: { name: 'Electronics' },
  },
  {
    id: 'fb-11',
    name: 'Ceramic Vase Set',
    price: 1499,
    stock: 14,
    description:
      'Handcrafted ceramic vases in neutral tones, perfect for modern living rooms.',
    image_url: '/images/ceramic_vase.png',
    Category: { name: 'Home & Living' },
  },
  {
    id: 'fb-12',
    name: 'Wireless Earbuds',
    price: 1999,
    stock: 35,
    description:
      'True wireless earbuds with charging case and up to 24 hours total playtime.',
    image_url: '/images/earbuds.png',
    Category: { name: 'Electronics' },
  },
  {
    id: 'fb-13',
    name: 'Smartphone Pro (64GB)',
    price: 19999,
    stock: 10,
    description:
      'Latest generation smartphone with OLED display and triple-camera setup.',
    image_url: '/images/smartphone.png',
    Category: { name: 'Electronics' },
  },
  {
    id: 'fb-14',
    name: 'All-Season Travel Backpack',
    price: 2599,
    stock: 22,
    description:
      'Water-resistant travel backpack with padded laptop sleeve and ergonomic straps.',
    image_url: '/images/travel_backpack.png',
    Category: { name: 'Fashion' },
  },
  {
    id: 'fb-15',
    name: 'Makeup Palette',
    price: 899,
    stock: 45,
    description:
      'Highly-pigmented eyeshadow palette with matte and shimmer shades.',
    image_url: '/images/makeup_palette.png',
    Category: { name: 'Beauty' },
  },
  {
    id: 'fb-16',
    name: 'Accent Armchair',
    price: 6999,
    stock: 6,
    description:
      'Comfortable accent chair with hardwood legs and soft upholstery.',
    image_url: '/images/accent_armchair.png',
    Category: { name: 'Home & Living' },
  },
  {
    id: 'fb-17',
    name: 'Modular Sofa Couch',
    price: 24999,
    stock: 3,
    description:
      'Spacious modular couch with removable covers and sturdy frame.',
    image_url: '/images/sofa_couch.png',
    Category: { name: 'Home & Living' },
  },
  {
    id: 'fb-18',
    name: 'Handheld Fitness Tracker Band',
    price: 1299,
    stock: 40,
    description:
      'Slim fitness tracker band with heart-rate monitoring and step tracking.',
    image_url: '/images/handheld_fitness_tracker.png',
    Category: { name: 'Electronics' },
  },
  // Electronics - Additional
];

export const getFallbackProduct = (id) =>
  FALLBACK_PRODUCTS.find((p) => p.id === id);

// Deterministic fallback reviews for a product when backend is unavailable
export const getFallbackReviews = (productId) => {
  const sampleComments = [
    'Great product, exceeded my expectations!',
    'Good value for money. Would recommend.',
    'Arrived on time and well packaged.',
    'Works as described but battery life is average.',
    'Fantastic build quality and easy to use.',
    'Decent performance but customer support was slow.',
    'Lovely design but the sizing runs small.',
    'Excellent sound and noise cancellation.',
    'Comfortable and durable — using daily.',
    'Not satisfied — had an issue after a week.',
    'Stylish look and fits true to size.',
    'Battery lasted longer than I expected.',
    'Solid build; feels premium for the price.',
    'Perfect as a gift — packaging was lovely.',
  ];

  // Simple deterministic pseudo-random based on productId
  let seed = 0;
  for (let i = 0; i < productId.length; i++) seed += productId.charCodeAt(i);
  const reviews = [];
  const count = 6 + (seed % 7); // 6-12 reviews
  for (let i = 0; i < count; i++) {
    const idx = (seed + i * 13) % sampleComments.length;
    const rating = 3 + ((seed + i) % 3); // 3..5
    const reviewerId = (seed + i * 7) % 100;
    const daysAgo = ((seed + i * 11) % 120) + 1;
    reviews.push({
      id: `${productId}-rev-${i}`,
      user: { name: `User ${reviewerId}`, email: `user${reviewerId}@example.com` },
      rating,
      comment: sampleComments[idx],
      created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return reviews;
};
