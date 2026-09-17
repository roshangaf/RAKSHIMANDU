CREATE TYPE "public"."category" AS ENUM('Spirits', 'Wine', 'Beer', 'Snacks', 'Bundles', 'Vapes');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'preparing', 'out-for-delivery', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('paid', 'unpaid');--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"name" text NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"order_date" timestamp with time zone DEFAULT now() NOT NULL,
	"expected_delivery_time" timestamp with time zone,
	"payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pairings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"liquor_product_id" uuid NOT NULL,
	"snack_product_id" uuid NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"category" "category" NOT NULL,
	"image_url" text NOT NULL,
	"rating" numeric(2, 1) DEFAULT '0' NOT NULL,
	"is_age_restricted" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"store_name" text NOT NULL,
	"club_name" text,
	"contact_number" text NOT NULL,
	"support_email" text NOT NULL,
	"delivery_fee" numeric(10, 2) NOT NULL,
	"tax_rate" numeric(5, 4) NOT NULL,
	"is_open_247" boolean DEFAULT false NOT NULL,
	"prevent_admin_orders" boolean DEFAULT false,
	"logo_url" text,
	"favicon_url" text,
	"hero_image_url" text,
	"delivery_image_url" text,
	"club_image_url" text,
	"spirits_image_url" text,
	"wine_image_url" text,
	"beer_image_url" text,
	"snacks_image_url" text,
	"vapes_image_url" text,
	"instagram_url" text,
	"facebook_url" text,
	"whatsapp_number" text,
	"hero_title" text,
	"hero_subtitle" text,
	"club_description" text
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firebase_uid" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone_number" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"age_verified" boolean DEFAULT false NOT NULL,
	"loyalty_points" integer DEFAULT 0 NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pairings" ADD CONSTRAINT "pairings_liquor_product_id_products_id_fk" FOREIGN KEY ("liquor_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pairings" ADD CONSTRAINT "pairings_snack_product_id_products_id_fk" FOREIGN KEY ("snack_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;