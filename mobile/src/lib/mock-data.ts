// Placeholder data so screens render before the shared Postgres backend is wired in.
// Images reused from ../../../src/lib/placeholder-images.json for visual consistency with the website.
import type { Order, Pairing, Product } from './types';

export const products: Product[] = [
  {
    id: 'spirit-1',
    name: 'Premium Aged Whiskey',
    brand: 'Highland Reserve',
    description: 'A smooth, oak-aged single malt with notes of caramel and smoke.',
    price: 4500,
    category: 'Spirits',
    imageUrl:
      'https://images.unsplash.com/photo-1613952936180-bd8fdf8c069b?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0',
    rating: 4.8,
    isAgeRestricted: true,
    isFeatured: true,
    stockStatus: 'in-stock',
    stockQuantity: 24,
  },
  {
    id: 'wine-1',
    name: 'Deep Red Cabernet',
    brand: 'Valley Vineyards',
    description: 'Full-bodied cabernet sauvignon with dark berry and pepper notes.',
    price: 3200,
    category: 'Wine',
    imageUrl:
      'https://images.unsplash.com/photo-1562601579-599dec564e06?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0',
    rating: 4.6,
    isAgeRestricted: true,
    isFeatured: true,
    stockStatus: 'in-stock',
    stockQuantity: 15,
  },
  {
    id: 'beer-1',
    name: 'Craft IPA 6-Pack',
    brand: 'Nightcap Brewing Co.',
    description: 'Bold, hoppy IPA brewed in small batches.',
    price: 1800,
    category: 'Beer',
    imageUrl:
      'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0',
    rating: 4.4,
    isAgeRestricted: true,
    stockStatus: 'in-stock',
    stockQuantity: 40,
  },
  {
    id: 'snack-1',
    name: 'Gourmet Snacks Selection',
    description: 'A curated mix of savory snacks, perfect for pairing.',
    price: 950,
    category: 'Snacks',
    imageUrl:
      'https://images.unsplash.com/photo-1614735241165-6756e1df61ab?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0',
    rating: 4.7,
    isAgeRestricted: false,
    isFeatured: true,
    stockStatus: 'in-stock',
    stockQuantity: 60,
  },
  {
    id: 'snack-2',
    name: 'Artisan Cheese Plate',
    description: 'Aged cheeses and crackers, ready to serve.',
    price: 1400,
    category: 'Snacks',
    imageUrl: 'https://picsum.photos/seed/snack2/600/800',
    rating: 4.5,
    isAgeRestricted: false,
    stockStatus: 'in-stock',
    stockQuantity: 18,
  },
  {
    id: 'vape-1',
    name: 'Vape and Cigarettes',
    description: 'Assorted vape and tobacco products.',
    price: 1200,
    category: 'Vapes',
    imageUrl:
      'https://images.unsplash.com/photo-1530745342582-0795f23ec976?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0',
    rating: 4.1,
    isAgeRestricted: true,
    stockStatus: 'in-stock',
    stockQuantity: 30,
  },
];

export const pairings: Pairing[] = [
  {
    id: 'pairing-1',
    name: 'Whiskey & Artisan Cheese',
    description: 'The smoky depth of aged whiskey cuts through rich, aged cheese.',
    liquorProductId: 'spirit-1',
    snackProductId: 'snack-2',
    imageUrl:
      'https://images.unsplash.com/photo-1600003014615-fe8e7fa22007?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0',
  },
  {
    id: 'pairing-2',
    name: 'Craft IPA & Gourmet Snacks',
    description: "A hoppy IPA's bitterness balances salty, savory bites.",
    liquorProductId: 'beer-1',
    snackProductId: 'snack-1',
  },
];

export const orders: Order[] = [
  {
    id: 'order-1',
    userId: 'demo-user',
    customerName: 'Demo Customer',
    totalAmount: 5450,
    status: 'out-for-delivery',
    orderDate: new Date().toISOString(),
    expectedDeliveryTime: new Date(Date.now() + 22 * 60 * 1000).toISOString(),
    paymentStatus: 'unpaid',
    items: [
      { productId: 'spirit-1', name: 'Premium Aged Whiskey', quantity: 1, price: 4500 },
      { productId: 'snack-1', name: 'Gourmet Snacks Selection', quantity: 1, price: 950 },
    ],
  },
];
