import { PrismaClient, Role, CustomerType, CustomerStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("Password123!", 10);

  const roles: { name: string; email: string; role: Role }[] = [
    { name: "Admin User", email: "admin@erp.test", role: Role.ADMIN },
    { name: "Sales User", email: "sales@erp.test", role: Role.SALES },
    { name: "Warehouse User", email: "warehouse@erp.test", role: Role.WAREHOUSE },
    { name: "Accounts User", email: "accounts@erp.test", role: Role.ACCOUNTS },
  ];

  const users = [];
  for (const r of roles) {
    const user = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: {
        name: r.name,
        email: r.email,
        passwordHash: password,
        role: r.role,
      },
    });
    users.push(user);
  }

  const admin = users.find((u) => u.role === Role.ADMIN)!;

  // Sample products
  const productsData = [
    { name: "Steel Hinge 3-inch", sku: "SH-001", category: "Hardware", unitPrice: 45.0, currentStock: 500, minStockAlertQty: 50, location: "Warehouse A - Rack 1" },
    { name: "PVC Pipe 1-inch (10ft)", sku: "PVC-010", category: "Plumbing", unitPrice: 220.0, currentStock: 8, minStockAlertQty: 20, location: "Warehouse A - Rack 5" },
    { name: "LED Bulb 9W", sku: "LED-009", category: "Electrical", unitPrice: 90.0, currentStock: 300, minStockAlertQty: 40, location: "Warehouse B - Rack 2" },
  ];

  const products = [];
  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
    products.push(product);
  }

  // Sample customers
  const customersData = [
    {
      name: "Ramesh Traders",
      mobile: "9876543210",
      email: "ramesh@traders.test",
      businessName: "Ramesh Traders Pvt Ltd",
      gstNumber: "03ABCDE1234F1Z5",
      customerType: CustomerType.WHOLESALE,
      address: "Shop 12, Industrial Area, Ludhiana, Punjab",
      status: CustomerStatus.ACTIVE,
      createdById: admin.id,
    },
    {
      name: "Sunrise Distributors",
      mobile: "9123456780",
      email: "contact@sunrise.test",
      businessName: "Sunrise Distributors",
      customerType: CustomerType.DISTRIBUTOR,
      address: "Plot 4, GT Road, Ludhiana, Punjab",
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdById: admin.id,
    },
  ];

  for (const c of customersData) {
    const existing = await prisma.customer.findFirst({ where: { mobile: c.mobile } });
    if (!existing) await prisma.customer.create({ data: c });
  }

  console.log("Seed complete.");
  console.log("Test login credentials (all use password: Password123!):");
  roles.forEach((r) => console.log(`  ${r.role.padEnd(10)} -> ${r.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
