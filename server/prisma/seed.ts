// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  process.stdout.write("🌱 Starting seed...\n")

  // --- USERS ---
  process.stdout.write("Seeding users...\n")
  await prisma.user.createMany({
    data: [
      { user_id: 1001, pin: 1234, name: "Admin User", role: 1 },
      { user_id: 1002, pin: 1111, name: "Cashier One", role: 0 },
      { user_id: 1003, pin: 2222, name: "Manager", role: 2 },
      { user_id: 1004, pin: 3333, name: "Auditor", role: 3 },
    ],
    skipDuplicates: true,
  })

  // --- PRODUCTS ---
  process.stdout.write("Seeding products...\n")
  await prisma.product.createMany({
    data: [
      { sku: 1000001, name: "Cola 0.5L", price_cents: 150, piece: true },
      { sku: 1000002, name: "Orange Juice 1L", price_cents: 250, piece: true },
      { sku: 1000003, name: "Apple (per kg)", price_cents: 300, piece: false },
      { sku: 1000004, name: "Banana (per kg)", price_cents: 220, piece: false },
      { sku: 1000005, name: "Bread Roll", price_cents: 60, piece: true },
      { sku: 1000006, name: "Milk 1L", price_cents: 120, piece: true },
      { sku: 1000007, name: "Butter 250g", price_cents: 180, piece: true },
      { sku: 1000008, name: "Eggs (10-pack)", price_cents: 300, piece: true },
      { sku: 1000009, name: "Cheese 200g", price_cents: 250, piece: true },
      { sku: 1000010, name: "Tomatoes (per kg)", price_cents: 280, piece: false },
      { sku: 1000011, name: "Potatoes (per kg)", price_cents: 100, piece: false },
      { sku: 1000012, name: "Onions (per kg)", price_cents: 90, piece: false },
      { sku: 1000013, name: "Mineral Water 1.5L", price_cents: 70, piece: true },
      { sku: 1000014, name: "Energy Drink 250ml", price_cents: 130, piece: true },
      { sku: 1000015, name: "Chocolate Bar", price_cents: 120, piece: true },
      { sku: 1000016, name: "Chips 200g", price_cents: 150, piece: true },
      { sku: 1000017, name: "Coffee 500g", price_cents: 450, piece: true },
      { sku: 1000018, name: "Tea 20 bags", price_cents: 200, piece: true },
      { sku: 1000019, name: "Sugar 1kg", price_cents: 150, piece: true },
      { sku: 1000020, name: "Salt 500g", price_cents: 50, piece: true },
    ],
    skipDuplicates: true,
  })

  // --- REGISTER ---
  process.stdout.write("Seeding register...\n")
  const register = await prisma.register.create({
    data: {
      register_number: 1,
      name: "Front Counter",
      location: "Main Store",
    },
  })

  // --- TSE DEVICE ---
  process.stdout.write("Seeding TSE device...\n")
  const tse = await prisma.tSEDevice.create({
    data: {
      serial_number: "TSE123456",
      vendor: "FiskalTech",
    },
  })

  // --- SALE + SALE ITEMS ---
  process.stdout.write("Seeding sale with sale items...\n")
  const sale = await prisma.sale.create({
    data: {
      receipt_number: "R10001",
      register_id: register.id,
      user_id: 1002,
      total_cents: 420,
      payment_method: "cash",
      saleItems: {
        create: [
          { product_id: 1000001, qty: 2, unit_price_cents: 150 },
          { product_id: 1000005, qty: 2, unit_price_cents: 60 },
        ],
      },
    },
  })

  // --- CANCELLATION ---
  process.stdout.write("Seeding a cancellation...\n")
  await prisma.cancellation.create({
    data: {
      receipt_number: sale.receipt_number,
      register_id: register.id,
      user_id: 1002,
      reason: "Customer request",
      amount_cents: 60,
      payment_method: "cash",
    },
  })

  // --- STOCK IN ---
  process.stdout.write("Seeding stock-in...\n")
  await prisma.stockIn.create({
    data: {
      product_id: 1000001,
      added_qty: 100,
      supplier: "DrinkSupplier GmbH",
      user_id: 1003,
    },
  })

  // --- INVENTORY MOVEMENT ---
  process.stdout.write("Seeding inventory movements...\n")
  await prisma.inventoryMovement.create({
    data: {
      product_id: 1000001,
      user_id: 1003,
      change_qty: 100,
      resulting_qty: 100,
      movement_type: "stock_in",
      reference_table: "StockIn",
      reference_id: 1,
      note: "Initial stock",
    },
  })

  // --- TURNOVER ---
  process.stdout.write("Seeding turnover...\n")
  await prisma.turnover.create({
    data: {
      register_id: register.id,
      date: new Date(),
      total_sales_cents: 420,
      net_turnover_cents: 420,
    },
  })

  // --- AUDIT LOG ---
  process.stdout.write("Seeding audit logs...\n")
  await prisma.auditLog.create({
    data: {
      table_name: "User",
      record_id: 1001,
      action: "CREATE",
      user_id: 1001,
      old_value: {},
      new_value: { name: "Admin User" },
    },
  })

  // --- REGISTER REPORTING ---
  process.stdout.write("Seeding register reporting...\n")
  await prisma.registerReporting.create({
    data: {
      tse_id: tse.id,
      register_id: register.id,
      report_type: "Z-Report",
      reported_at: new Date(),
      status: "completed",
    },
  })

  // --- DSFinV-K EXPORT ---
  process.stdout.write("Seeding DSFinV-K export...\n")
  await prisma.dSFinvKExport.create({
    data: {
      period_start: new Date("2025-01-01"),
      period_end: new Date("2025-01-31"),
      file_path: "/exports/january2025.xml",
    },
  })

  // --- DAILY SALES SUMMARY ---
  process.stdout.write("Seeding daily sales summary...\n")
  await prisma.dailySalesSummary.create({
    data: {
      date: new Date(),
      total_sales_euro: 4.20,
    },
  })

  process.stdout.write("✅ Seed complete!\n")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
