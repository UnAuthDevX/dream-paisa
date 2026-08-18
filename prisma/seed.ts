import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

type CategoryType = "Income" | "Expense";

interface DefaultCategory {
  name: string;
  type: CategoryType;
  icon: string;        // Lucide icon name
  color: string;       // Tailwind-friendly Hex Color
  emoji: string;
  description: string;
  isDefault: boolean;
}

export const defaultCategories: DefaultCategory[] = [
  // =======================
  // INCOME
  // =======================
  {
    name: "Salary",
    type: "Income",
    icon: "Wallet",
    emoji: "💰",
    color: "#22C55E",
    description: "Monthly salary or wages",
    isDefault: true,
  },
  {
    name: "Bonus",
    type: "Income",
    icon: "BadgeDollarSign",
    emoji: "🎁",
    color: "#16A34A",
    description: "Performance bonus",
    isDefault: true,
  },
  {
    name: "Business",
    type: "Income",
    icon: "BriefcaseBusiness",
    emoji: "🏢",
    color: "#15803D",
    description: "Business earnings",
    isDefault: true,
  },
  {
    name: "Freelancing",
    type: "Income",
    icon: "Laptop",
    emoji: "💻",
    color: "#10B981",
    description: "Freelance projects",
    isDefault: true,
  },
  {
    name: "Investments",
    type: "Income",
    icon: "TrendingUp",
    emoji: "📈",
    color: "#0EA5E9",
    description: "Investment returns",
    isDefault: true,
  },
  {
    name: "Dividends",
    type: "Income",
    icon: "Landmark",
    emoji: "🏦",
    color: "#3B82F6",
    description: "Dividend income",
    isDefault: true,
  },
  {
    name: "Interest",
    type: "Income",
    icon: "PiggyBank",
    emoji: "🏛️",
    color: "#6366F1",
    description: "Bank interest",
    isDefault: true,
  },
  {
    name: "Rental Income",
    type: "Income",
    icon: "Home",
    emoji: "🏠",
    color: "#8B5CF6",
    description: "Rental property income",
    isDefault: true,
  },
  {
    name: "Cashback",
    type: "Income",
    icon: "RotateCcw",
    emoji: "💸",
    color: "#14B8A6",
    description: "Cashback rewards",
    isDefault: true,
  },
  {
    name: "Gift Received",
    type: "Income",
    icon: "Gift",
    emoji: "🎉",
    color: "#EC4899",
    description: "Money received as gifts",
    isDefault: true,
  },
  {
    name: "Refund",
    type: "Income",
    icon: "Undo2",
    emoji: "↩️",
    color: "#06B6D4",
    description: "Refunded payments",
    isDefault: true,
  },
  {
    name: "Other Income",
    type: "Income",
    icon: "CircleDollarSign",
    emoji: "💵",
    color: "#84CC16",
    description: "Other income sources",
    isDefault: true,
  },

  // =======================
  // FOOD
  // =======================
  {
    name: "Food & Dining",
    type: "Expense",
    icon: "UtensilsCrossed",
    emoji: "🍽️",
    color: "#F97316",
    description: "Restaurants & dining",
    isDefault: true,
  },
  {
    name: "Groceries",
    type: "Expense",
    icon: "ShoppingBasket",
    emoji: "🛒",
    color: "#FB923C",
    description: "Daily groceries",
    isDefault: true,
  },
  {
    name: "Coffee",
    type: "Expense",
    icon: "Coffee",
    emoji: "☕",
    color: "#A16207",
    description: "Coffee & beverages",
    isDefault: true,
  },

  // =======================
  // TRANSPORT
  // =======================
  {
    name: "Transportation",
    type: "Expense",
    icon: "Bus",
    emoji: "🚌",
    color: "#3B82F6",
    description: "General transportation",
    isDefault: true,
  },
  {
    name: "Fuel",
    type: "Expense",
    icon: "Fuel",
    emoji: "⛽",
    color: "#2563EB",
    description: "Fuel expenses",
    isDefault: true,
  },
  {
    name: "Taxi",
    type: "Expense",
    icon: "CarTaxiFront",
    emoji: "🚕",
    color: "#60A5FA",
    description: "Taxi & ride sharing",
    isDefault: true,
  },
  {
    name: "Vehicle Maintenance",
    type: "Expense",
    icon: "Wrench",
    emoji: "🔧",
    color: "#0284C7",
    description: "Vehicle service",
    isDefault: true,
  },

  // =======================
  // HOME
  // =======================
  {
    name: "Rent",
    type: "Expense",
    icon: "House",
    emoji: "🏠",
    color: "#7C3AED",
    description: "House rent",
    isDefault: true,
  },
  {
    name: "Utilities",
    type: "Expense",
    icon: "Lightbulb",
    emoji: "💡",
    color: "#FACC15",
    description: "Electricity, water, gas",
    isDefault: true,
  },
  {
    name: "Internet",
    type: "Expense",
    icon: "Wifi",
    emoji: "📶",
    color: "#06B6D4",
    description: "Internet bills",
    isDefault: true,
  },

  // =======================
  // SHOPPING
  // =======================
  {
    name: "Shopping",
    type: "Expense",
    icon: "ShoppingBag",
    emoji: "🛍️",
    color: "#EC4899",
    description: "General shopping",
    isDefault: true,
  },
  {
    name: "Clothing",
    type: "Expense",
    icon: "Shirt",
    emoji: "👕",
    color: "#F472B6",
    description: "Clothes",
    isDefault: true,
  },
  {
    name: "Electronics",
    type: "Expense",
    icon: "Laptop2",
    emoji: "💻",
    color: "#8B5CF6",
    description: "Electronic gadgets",
    isDefault: true,
  },

  // =======================
  // HEALTH
  // =======================
  {
    name: "Health",
    type: "Expense",
    icon: "HeartPulse",
    emoji: "❤️",
    color: "#EF4444",
    description: "Healthcare expenses",
    isDefault: true,
  },
  {
    name: "Medicine",
    type: "Expense",
    icon: "Pill",
    emoji: "💊",
    color: "#DC2626",
    description: "Medicines",
    isDefault: true,
  },
  {
    name: "Gym",
    type: "Expense",
    icon: "Dumbbell",
    emoji: "🏋️",
    color: "#B91C1C",
    description: "Fitness expenses",
    isDefault: true,
  },

  // =======================
  // ENTERTAINMENT
  // =======================
  {
    name: "Entertainment",
    type: "Expense",
    icon: "Popcorn",
    emoji: "🎬",
    color: "#F43F5E",
    description: "Movies & fun",
    isDefault: true,
  },
  {
    name: "Games",
    type: "Expense",
    icon: "Gamepad2",
    emoji: "🎮",
    color: "#9333EA",
    description: "Gaming",
    isDefault: true,
  },
  {
    name: "Subscriptions",
    type: "Expense",
    icon: "MonitorPlay",
    emoji: "📺",
    color: "#4F46E5",
    description: "Netflix, Spotify, etc.",
    isDefault: true,
  },

  // =======================
  // EDUCATION
  // =======================
  {
    name: "Education",
    type: "Expense",
    icon: "GraduationCap",
    emoji: "🎓",
    color: "#0EA5E9",
    description: "Education expenses",
    isDefault: true,
  },
  {
    name: "Books",
    type: "Expense",
    icon: "BookOpen",
    emoji: "📚",
    color: "#0284C7",
    description: "Books & learning",
    isDefault: true,
  },

  // =======================
  // FINANCE
  // =======================
  {
    name: "Savings",
    type: "Expense",
    icon: "PiggyBank",
    emoji: "🐷",
    color: "#16A34A",
    description: "Money saved",
    isDefault: true,
  },
  {
    name: "Investments",
    type: "Expense",
    icon: "ChartCandlestick",
    emoji: "📊",
    color: "#059669",
    description: "Investment purchases",
    isDefault: true,
  },
  {
    name: "Loan EMI",
    type: "Expense",
    icon: "Landmark",
    emoji: "🏦",
    color: "#DC2626",
    description: "Loan repayments",
    isDefault: true,
  },
  {
    name: "Insurance",
    type: "Expense",
    icon: "ShieldCheck",
    emoji: "🛡️",
    color: "#2563EB",
    description: "Insurance premiums",
    isDefault: true,
  },

  // =======================
  // LIFESTYLE
  // =======================
  {
    name: "Travel",
    type: "Expense",
    icon: "Plane",
    emoji: "✈️",
    color: "#0EA5E9",
    description: "Travel expenses",
    isDefault: true,
  },
  {
    name: "Gift",
    type: "Expense",
    icon: "Gift",
    emoji: "🎁",
    color: "#E11D48",
    description: "Gift purchases",
    isDefault: true,
  },
  {
    name: "Charity",
    type: "Expense",
    icon: "HandHeart",
    emoji: "❤️",
    color: "#F43F5E",
    description: "Donations",
    isDefault: true,
  },
  {
    name: "Personal Care",
    type: "Expense",
    icon: "Sparkles",
    emoji: "✨",
    color: "#D946EF",
    description: "Salon & grooming",
    isDefault: true,
  },
  {
    name: "Miscellaneous",
    type: "Expense",
    icon: "CircleEllipsis",
    emoji: "📦",
    color: "#6B7280",
    description: "Other expenses",
    isDefault: true,
  },
];




async function main() {
  console.log("🌱 Start seeding categories...");

  for (const cat of defaultCategories) {
    const category = await prisma.category.upsert({
      where: {
        name_type: {
          name: cat.name,
          type: cat.type,
        },
      },
      update: {
        icon: cat.icon,
        emoji: cat.emoji,
        color: cat.color,
        description: cat.description,
        isDefault: cat.isDefault,
        isActive: true,
      },
      create: {
        ...cat,
        isActive: true,
      },
    });

    console.log(`✅ ${category.name} (${category.type}) seeded`);
  }

  console.log("🎉 Categories seeded successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

