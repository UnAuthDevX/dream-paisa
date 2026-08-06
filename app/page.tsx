import Link from "next/link";
import Image from 'next/image';
import FlexLight from '../Asserts/FlexLight.png';
import FlexDark from '../Asserts/FlexDark.png';
import { ArrowRight, Wallet, TrendingUp, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/navbar";


export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <Navbar  />
      {/* Hero Section */}
      <section className="w-full h-full py-6 md:py-12 lg:py-24 xl:py-24 text-center bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="mx-auto flex flex-row space-y-4">
            <div className="lg:mx-30 mx-auto flex flex-col space-y-8">
              <div className="rounded-xl text-primary bg-ring/10 w-fit lg:p-2 xl:p-2 p-1">
                ✨Your Money, Your Dream, Our Mission.
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none lg:text-left xl:text-left">
                Master Your Finances 
                <br/>with <span className="text-primary">DreamPaisa</span>
              </h1>
              <p className=" max-w-[700px] text-muted-foreground md:text-xl">
                Track your expenses, build good habits, and grow your virtual pet alongside your savings.
              </p>
              <div className="space-x-4 content-start">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="lg:block xl:block hidden w-1/2">
              <Image src={FlexLight} alt='flex' className='dark:hidden rounded-xl drop-shadow-ring w-130 h-130 drop-shadow-xl'/>
              <Image src={FlexDark} alt='flex' className='hidden dark:block rounded-xl w-130 h-130 drop-shadow-ring drop-shadow-xl' />
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
