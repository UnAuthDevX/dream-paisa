import Link from "next/link";
import { ArrowRight, Wallet, TrendingUp, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 text-center bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Master Your Finances with <span className="text-primary">DreamPaisa</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Track your expenses, build good habits, and grow your virtual pet alongside your savings.
            </p>
            <div className="space-x-4">
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Track Expenses</h2>
              <p className="text-muted-foreground">
                Easily log your daily transactions and see exactly where your money goes.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Smart Insights</h2>
              <p className="text-muted-foreground">
                Visualize your financial health with intuitive charts and category breakdowns.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Secure & Private</h2>
              <p className="text-muted-foreground">
                Your data is encrypted and securely stored. We prioritize your privacy above all.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
