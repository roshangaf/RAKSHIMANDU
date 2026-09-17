import {
  pgEnum,
  pgTable,
  uuid,
  smallint,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  date,
} from 'drizzle-orm/pg-core';

export const categoryEnum = pgEnum('category', [
  'Spirits',
  'Wine',
  'Beer',
  'Snacks',
  'Bundles',
  'Vapes',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'preparing',
  'out-for-delivery',
  'completed',
  'cancelled',
]);

export const paymentStatusEnum = pgEnum('payment_status', ['paid', 'unpaid']);

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  brand: text('brand'),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  category: categoryEnum('category').notNull(),
  imageUrl: text('image_url').notNull(),
  rating: numeric('rating', { precision: 2, scale: 1 }).notNull().default('0'),
  isAgeRestricted: boolean('is_age_restricted').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  stockQuantity: integer('stock_quantity').notNull().default(0),
});

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  firebaseUid: text('firebase_uid'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phoneNumber: text('phone_number').notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  ageVerified: boolean('age_verified').notNull().default(false),
  loyaltyPoints: integer('loyalty_points').notNull().default(0),
  isAdmin: boolean('is_admin').notNull().default(false),
  isBlocked: boolean('is_blocked').notNull().default(false),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => userProfiles.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  orderDate: timestamp('order_date', { withTimezone: true }).notNull().defaultNow(),
  expectedDeliveryTime: timestamp('expected_delivery_time', { withTimezone: true }),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('unpaid'),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  name: text('name').notNull(),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
});

export const pairings = pgTable('pairings', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  liquorProductId: uuid('liquor_product_id')
    .notNull()
    .references(() => products.id),
  snackProductId: uuid('snack_product_id')
    .notNull()
    .references(() => products.id),
  imageUrl: text('image_url'),
});

export const storeSettings = pgTable('store_settings', {
  id: smallint('id').primaryKey().default(1),
  storeName: text('store_name').notNull(),
  clubName: text('club_name'),
  contactNumber: text('contact_number').notNull(),
  supportEmail: text('support_email').notNull(),
  deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 }).notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 4 }).notNull(),
  isOpen247: boolean('is_open_247').notNull().default(false),
  preventAdminOrders: boolean('prevent_admin_orders').default(false),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  heroImageUrl: text('hero_image_url'),
  deliveryImageUrl: text('delivery_image_url'),
  clubImageUrl: text('club_image_url'),
  spiritsImageUrl: text('spirits_image_url'),
  wineImageUrl: text('wine_image_url'),
  beerImageUrl: text('beer_image_url'),
  snacksImageUrl: text('snacks_image_url'),
  vapesImageUrl: text('vapes_image_url'),
  instagramUrl: text('instagram_url'),
  facebookUrl: text('facebook_url'),
  whatsappNumber: text('whatsapp_number'),
  heroTitle: text('hero_title'),
  heroSubtitle: text('hero_subtitle'),
  clubDescription: text('club_description'),
});
