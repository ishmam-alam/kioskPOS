import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Simple test route
app.get("/test", (req, res) => {
  res.json({ message: "Test route working" });
});

// Test if we can import the products route
try {
  const productsRouter = await import("./routes/products.ts");
  console.log("✅ Products route imported successfully");
  app.use("/api/products", productsRouter.default);
} catch (error) {
  console.error("❌ Error importing products route:", error);
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
});
