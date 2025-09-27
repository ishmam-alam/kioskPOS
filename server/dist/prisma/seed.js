// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    console.log("Seeding database...");
    // USERS - Use upsert to handle existing users
    const admin = await prisma.user.upsert({
        where: { user_id: 1001 },
        update: {
            pin: 1234,
            name: "Admin User",
            role: 419,
            active: true,
        },
        create: {
            user_id: 1001,
            pin: 1234,
            name: "Admin User",
            role: 419,
            active: true,
        },
    });
    const owner = await prisma.user.upsert({
        where: { user_id: 1002 },
        update: {
            pin: 2345,
            name: "Owner User",
            role: 1,
            active: true,
        },
        create: {
            user_id: 1002,
            pin: 2345,
            name: "Owner User",
            role: 1,
            active: true,
        },
    });
    const manager = await prisma.user.upsert({
        where: { user_id: 1003 },
        update: {
            pin: 3456,
            name: "Manager User",
            role: 2,
            active: true,
        },
        create: {
            user_id: 1003,
            pin: 3456,
            name: "Manager User",
            role: 2,
            active: true,
        },
    });
    const employee = await prisma.user.upsert({
        where: { user_id: 1004 },
        update: {
            pin: 4567,
            name: "Employee User",
            role: 3,
            active: true,
        },
        create: {
            user_id: 1004,
            pin: 4567,
            name: "Employee User",
            role: 3,
            active: true,
        },
    });
    // Hardcoded admin user as requested - user_id: 1416, PIN: 0611
    // Use upsert to handle both creation and update scenarios
    const hardcodedAdmin = await prisma.user.upsert({
        where: { user_id: 1416 },
        update: {
            pin: 611, // PIN 0611 (stored as 611 since leading zeros are not preserved in numbers)
            name: "Hardcoded Admin",
            role: 419,
            active: true,
        },
        create: {
            user_id: 1416,
            pin: 611, // PIN 0611 (stored as 611 since leading zeros are not preserved in numbers)
            name: "Hardcoded Admin",
            role: 419,
            active: true,
        },
    });
    // PRODUCTS
    const product1 = await prisma.product.create({
        data: {
            sku: "SKU001",
            name: "Product One",
            price_cents: 1000,
            stock_qty: 50,
            tax_rate: 0.19,
            active: true,
        },
    });
    const product2 = await prisma.product.create({
        data: {
            sku: "SKU002",
            name: "Product Two",
            price_cents: 2000,
            stock_qty: 20,
            tax_rate: 0.07,
            active: true,
        },
    });
    // REGISTERS
    const register1 = await prisma.register.create({
        data: {
            register_number: 1,
            name: "Front Desk",
            location: "Store 1",
        },
    });
    // TSE DEVICES
    const tse1 = await prisma.tSEDevice.create({
        data: {
            serial_number: "TSE-12345",
            vendor: "Vendor A",
        },
    });
    // SALES
    const sale1 = await prisma.sale.create({
        data: {
            receipt_number: "RCPT-1001",
            register_id: register1.id,
            user_id: admin.user_id,
            total_cents: 3000,
            payment_method: "cash",
            items: [
                { product_id: product1.id, qty: 1, unit_price_cents: 1000, tax_rate: 0.19 },
                { product_id: product2.id, qty: 1, unit_price_cents: 2000, tax_rate: 0.07 },
            ],
        },
    });
    // SALE ITEMS
    await prisma.saleItem.createMany({
        data: [
            { receipt_number: sale1.receipt_number, product_id: product1.id, qty: 1, unit_price_cents: 1000, tax_rate: 0.19 },
            { receipt_number: sale1.receipt_number, product_id: product2.id, qty: 1, unit_price_cents: 2000, tax_rate: 0.07 },
        ],
    });
    // CANCELLATIONS
    await prisma.cancellation.create({
        data: {
            receipt_number: sale1.receipt_number,
            register_id: register1.id,
            user_id: manager.user_id,
            reason: "Customer return",
            amount_cents: 1000,
            payment_method: "cash",
            stock_adjusted: true,
        },
    });
    // STOCK IN
    await prisma.stockIn.create({
        data: {
            product_id: product1.id,
            added_qty: 10,
            supplier: "Supplier A",
            user_id: owner.user_id,
            stock_adjusted: true,
        },
    });
    // TURNOVER
    await prisma.turnover.create({
        data: {
            register_id: register1.id,
            total_sales_cents: 3000,
            total_refunds_cents: 1000,
            net_turnover_cents: 2000,
        },
    });
    // REGISTER REPORTING
    await prisma.registerReporting.create({
        data: {
            register_id: register1.id,
            tse_id: tse1.id,
            report_type: "daily",
            status: "completed",
        },
    });
    // DSFINV-K EXPORTS
    await prisma.dSFinvKExport.create({
        data: {
            period_start: new Date("2025-08-01"),
            period_end: new Date("2025-08-31"),
            file_path: "/exports/august.xml",
        },
    });
    // AUDIT LOGS
    await prisma.auditLog.create({
        data: {
            table_name: "users",
            record_id: admin.id,
            action: "create",
            user_id: admin.user_id,
            old_value: 0,
            new_value: { name: admin.name },
        },
    });
    // INVENTORY MOVEMENTS
    await prisma.inventoryMovement.create({
        data: {
            product_id: product1.id,
            user_id: owner.user_id,
            change_qty: 10,
            resulting_qty: 60,
            movement_type: "stock_in",
            reference_table: "stock_in",
            reference_id: 1,
            note: "Initial stock",
        },
    });
    // DAILY SALES SUMMARY
    await prisma.dailySalesSummary.create({
        data: {
            date: new Date("2025-08-28"),
            total_sales_euro: 30.0,
        },
    });
    console.log("Seeding completed.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map