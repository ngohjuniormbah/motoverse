-- ============================================================
-- MOTOVERSE — one clean database setup (run once in Supabase SQL Editor)
-- This DROPS any old/duplicate tables and creates the correct ones.
-- ============================================================

-- 1) Remove ALL old/duplicate tables (capitalized Prisma + lowercase)
drop table if exists "Product" cascade;
drop table if exists "Order"   cascade;
drop table if exists "Message" cascade;
drop table if exists products cascade;
drop table if exists orders   cascade;
drop table if exists messages cascade;
drop table if exists gallery  cascade;
drop table if exists reviews  cascade;

-- 2) Create the correct lowercase tables
create table products (
  id bigserial primary key,
  name text not null,
  brand text default 'Motoverse',
  make text default 'Universal',
  category text default 'Engine',
  price text not null,
  badge text default 'New',
  stock int default 10,
  featured boolean default false,
  description text default '',
  image text not null,
  created_at timestamptz default now()
);
create table orders (
  id bigserial primary key,
  name text, phone text, email text default '',
  state text default '', address text, notes text default '',
  product text, price text default '', status text default 'NEW',
  created_at timestamptz default now()
);
create table messages (
  id bigserial primary key,
  name text, email text, phone text default '',
  vehicle text default '', message text,
  created_at timestamptz default now()
);
create table gallery (
  id bigserial primary key,
  url text not null, caption text default '',
  created_at timestamptz default now()
);
create table reviews (
  id bigserial primary key,
  name text not null, location text default '',
  rating int default 5, text text not null,
  created_at timestamptz default now()
);

-- 3) Disable RLS so the service-role key has full access
alter table products disable row level security;
alter table orders   disable row level security;
alter table messages disable row level security;
alter table gallery  disable row level security;
alter table reviews  disable row level security;

-- 4) Seed starter data (uses the real photos bundled in /public/parts)
insert into products (name, brand, make, category, price, badge, stock, featured, description, image) values
('Front Lower Control Arm Pair','OEM','Mazda','Suspension','$189.99','New',12,true,'Complete front lower control arm set with ball joints and bushings. Tested and ready to ship.','/parts/car1.jpeg'),
('Front Strut & Coil Assembly','Monroe','Toyota','Suspension','$229.00','Set of 2',8,true,'Pre-assembled strut and coil spring units — direct bolt-on replacement.','/parts/car2.jpeg'),
('KW V3 Coilover Kit','KW','BMW','Suspension','$1,899.00','Performance',3,true,'Adjustable performance coilover suspension kit, inspected and complete.','/parts/car7.jpeg'),
('Complete Engine Assembly','JDM','Honda','Engine','$1,450.00','Low Mileage',4,true,'Imported low-mileage complete engine, compression tested.','/parts/car5.jpeg'),
('Engine Internals Set','OEM','Universal','Engine','$540.00','New',10,false,'Pistons, gears, and internal drivetrain components.','/parts/car6.jpeg'),
('Body Panel Lot','Mixed','Universal','Body','$2,300.00','Wholesale',2,false,'Container lot of assorted body panels — bumpers, fenders, hoods.','/parts/car3.jpeg');

insert into gallery (url, caption) values
('/parts/car4.jpeg','Warehouse stock'),
('/parts/car3.jpeg','Body panel container'),
('/parts/car5.jpeg','Complete engines'),
('/parts/car7.jpeg','Performance suspension'),
('/parts/car6.jpeg','Engine internals'),
('/parts/car1.jpeg','Control arms');

insert into reviews (name, location, rating, text) values
('Marcus T.','Columbus, OH',5,'Found a part no one else had in stock. Shipped fast and exactly as described.'),
('Diana R.','Miami, FL',5,'Smooth, professional, and they called me back quickly to confirm my order.'),
('Kevin L.','Austin, TX',5,'Great prices on hard-to-find parts. Will order again.');
