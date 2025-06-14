"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";
import { signIn, useSession } from "next-auth/react";

export default function LandingPage() {
  const { theme } = useTheme();
  const sessoin = useSession();
  return (
    <div className="flex min-h-screen flex-col" dir="ltr">
      {" "}
      {/* Changed dir to ltr */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded">
              <Image
                src={"/logo.svg"}
                alt="DermoXpert AI Logo"
                width={24}
                height={24}
              />
            </div>
            <span className="text-xl font-bold text-blue-600">
              DermoXpert AI
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => {
                if (sessoin.status === "unauthenticated") {
                  signIn("google", {
                    redirect: true,
                    callbackUrl: "/dashboard",
                  });
                } else {
                  window.location.href = "/dashboard";
                }
              }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {sessoin.status === "unauthenticated" ? "Sign In" : "Dashboard"}
            </button>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/50 py-12 md:py-24">
          <div className="container grid gap-6 md:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Get the Best Skin Disease Detection with DermoXpert AI
              </h1>
              <div className="mt-8">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold">+10</h2>
                    <p className="text-sm text-muted-foreground">
                      Years of experience with AI technology in detecting skin
                      diseases.
                    </p>
                  </div>
                  {/* <div className="flex -space-x-2">
                    <Avatar className="border-2 border-background">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt="Patient"
                      />
                      <AvatarFallback>P1</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-background">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt="Patient"
                      />
                      <AvatarFallback>P2</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-background">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt="Patient"
                      />
                      <AvatarFallback>P3</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-background bg-blue-600 text-white">
                      <AvatarFallback>+</AvatarFallback>
                    </Avatar>
                  </div> */}
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold">Our Patients</h3>
                  <p className="text-sm text-muted-foreground">
                    Around 250K+ patients have trusted us and are satisfied with
                    our skin analysis and early detection.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-muted-foreground">
                  Upload an image for AI analysis and connect with
                  dermatologists through our platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Sign Up Now
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-[280px] h-[560px]">
                <Image
                  src={
                    theme === "dark" ? "/gr/en_dark.png" : "/gr/en_light.png"
                  }
                  alt="Mobile Application"
                  width={280}
                  height={560}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 md:py-24">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8">
              We Will Serve You with Skin Health Services
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-card text-card-foreground shadow p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-4">AI Skin Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Upload photos of skin problems and get an AI risk assessment
                  for early detection.
                </p>
                <div className="mt-4 flex-1 flex justify-center items-center w-full relative aspect-square">
                  <Image
                    src="https://img.freepik.com/free-photo/scientist-working-laboratory-analysing-test-trial-vaccine-checking-drug-data-standing-front-pc_482257-515.jpg?t=st=1748109342~exp=1748112942~hmac=0e8ff52b9bf9b1c18d936338bb80e30f44a824272e3ba28841abde88d18b0237&w=2000"
                    alt="AI Skin Analysis"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg border bg-blue-600 dark:bg-blue-800 text-white shadow p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-4">Virtual Doctor</h3>
                <p className="text-blue-100 mb-4">
                  Connect with certified dermatologists through text or video
                  consultations for professional diagnosis.
                </p>
                <div className="mt-4 flex-1 flex justify-center items-center w-full relative aspect-square">
                  <Image
                    src="https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="Virtual Consultation"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-4">Skin Health Tracking</h3>
                <p className="text-muted-foreground mb-4">
                  Monitor changes in your skin over time with our comprehensive
                  tracking and follow-up system.
                </p>
                <div className="mt-4 flex-1 flex justify-center items-center w-full relative aspect-square">
                  <Image
                    src="https://img.freepik.com/photos-gratuite/test-reaction-allergique-cutanee-bras_23-2149140483.jpg?t=st=1748108848~exp=1748112448~hmac=54b80c7a08873021914751e52a047961e7fccda6da183eb56490f432ee33900d&w=2000"
                    alt="Skin Health Tracking"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection />

        {/* How It Works Section */}
        <section className="py-12 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">How DermoXpert AI Works</h2>
              <p className="text-muted-foreground mt-2">
                Get started with AI skin analysis in simple steps
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  1
                  {/* Changed left to right and -translate-x-full to translate-x-full */}
                </div>
                <h3 className="text-xl font-bold mb-2">Take a Photo</h3>
                <p className="text-muted-foreground">
                  Take a clear photo of the skin problem using our app
                </p>
              </div>

              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  2
                  {/* Changed left to right and -translate-x-full to translate-x-full */}
                </div>
                <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
                <p className="text-muted-foreground">
                  AI analyzes the image for signs of potential skin diseases
                </p>
              </div>

              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  3
                  {/* Changed left to right and -translate-x-full to translate-x-full */}
                </div>
                <h3 className="text-xl font-bold mb-2">Get Results</h3>
                <p className="text-muted-foreground">
                  Receive a detailed risk assessment with ABCDE analysis
                </p>
              </div>

              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  4
                </div>
                <h3 className="text-xl font-bold mb-2">Connect with Doctors</h3>
                <p className="text-muted-foreground">
                  Consult dermatologists for professional diagnosis
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-12 md:py-16 bg-blue-600 dark:bg-blue-800 text-white">
          <div className="container">
            <div className="grid gap-6 md:grid-cols-4 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">+10</div>
                <p>Years of AI Development</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">95%</div>
                <p>Detection Accuracy</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">230K+</div>
                <p>Skin Analyses Performed</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">+500</div>
                <p>Dermatologists on Platform</p>
              </div>
            </div>
          </div>
        </section>

        {/* App Features */}
        <section className="py-12 md:py-24">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-2">
              Features You'll Get From Our App
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Our platform offers comprehensive tools for monitoring and
              managing skin health
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
              <div className="rounded-lg bg-muted p-6 flex flex-col aspect-[19/15]">
                <h3 className="text-xl font-bold mb-4">
                  Advanced Image Analysis
                </h3>
                <p className="text-muted-foreground mb-6">
                  AI technology analyzes skin images using the ABCDE method to
                  detect potential warning signs of melanoma.
                </p>
                <div className="relative h-full">
                  <Image
                    src="/gr/Dermatologist-online-consultation.jpg"
                    alt="Image Analysis"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6  flex flex-col aspect-[19/15]">
                <h3 className="text-xl font-bold mb-4">
                  Dermatologist Consultations
                </h3>
                <p className="text-muted-foreground mb-6">
                  Connect with certified dermatologists via text or video calls
                  for professional diagnosis and treatment plans.
                </p>
                <div className="relative h-full">
                  <Image
                    src="https://img.freepik.com/free-photo/doctor-nurses-special-equipment_23-2148980721.jpg?t=st=1748754535~exp=1748758135~hmac=814818f45a84e6240ee2d560b900d5fdd37f7d721d812ea6bb10bde6fe7bd0fa&w=826"
                    alt="Image Analysis" // Consider changing alt text if image is different
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6 flex flex-col aspect-[19/15]">
                <h3 className="text-xl font-bold mb-4">Skin Health Tracking</h3>
                <p className="text-muted-foreground mb-6">
                  Monitor changes in your skin over time with chronological
                  tracking of all examinations and risk assessments.
                </p>
                <div className="relative h-full">
                  <Image
                    src="https://img.freepik.com/free-photo/doctor-with-stethoscope-hands-hospital-background_1423-1.jpg?t=st=1748754988~exp=1748758588~hmac=1fcd188b288f653bce4d5166c5c6eb907db01405b8a2e2cfc3fde63ce82bdd58&w=826"
                    alt="Image Analysis" // Consider changing alt text if image is different
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6 flex flex-col aspect-[19/15]">
                <h3 className="text-xl font-bold mb-4">
                  Appointment Management
                </h3>
                <p className="text-muted-foreground mb-6">
                  Book in-person or virtual appointments with dermatologists and
                  get reminders for follow-up checks.
                </p>
                <div className="relative h-full">
                  <Image
                    src="https://img.freepik.com/free-photo/medical-banner-with-doctor-patient_23-2149611238.jpg?t=st=1748755170~exp=1748758770~hmac=c66e59390d7323f5455a57ff6881be99431c0ce1c2235a9c606548fcb0827edf&w=826"
                    alt="Appointment Management"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download Banner */}
        <section className="bg-blue-600 dark:bg-blue-800 py-4 overflow-hidden">
          <div className="container">
            <div className="flex items-center justify-between overflow-x-auto whitespace-nowrap">
              {[1, 2, 3, 4, 5].map((item) => (
                <Button key={item} variant="link" className="text-white">
                  Download Now
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Download CTA */}
        <section className="py-12 md:py-24 bg-muted">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">
              Download the DermoXpert AI app today and take control of your skin
              health.
            </h2>
            <p className="text-muted-foreground mb-8">
              Available on the Google Play Store and App Store
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Download App
            </Button>
          </div>
        </section>
      </main>
      <footer className="bg-muted py-6 border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="bg-blue-600 p-1 rounded">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M8 12L11 15L16 9"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-blue-600">
              DermoXpert AI
            </span>
          </div>
          <div>
            <p>© 2025 DermoXpert AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
const plans = [
  {
    id: "basic",
    title: "Basic",
    subtitle: "For occasional skin checks",
    price: "0 DA",
    period: "/month",
    analysisCount: 5,
    popular: false,
    bgClass: "bg-card text-card-foreground",
    buttonClass: "",
    featureEnabled: {
      risk: true,
      textConsult: true,
      videoConsult: false,
      advancedTracking: false,
      ads: false,
    },
    adsLabel: "Ads",
  },
  {
    id: "standard",
    title: "Standard",
    subtitle: "For regular skin monitoring",
    price: "1000 DA",
    period: "/month",
    analysisCount: 15,
    popular: true,
    badgeText: "Most Popular",
    bgClass: "bg-blue-600 dark:bg-blue-800 text-white",
    buttonClass: "bg-white text-blue-600 hover:bg-blue-50",
    featureEnabled: {
      risk: true,
      textConsult: true,
      videoConsult: true,
      advancedTracking: true,
      ads: true,
    },
    adsLabel: "Fewer Ads",
  },
  {
    id: "premium",
    title: "Premium",
    subtitle: "For comprehensive skin care",
    price: "1500 DA",
    period: "/month",
    analysisCount: "Unlimited",
    popular: false,
    bgClass: "bg-card text-card-foreground",
    buttonClass: "",
    featureEnabled: {
      risk: true,
      textConsult: true,
      videoConsult: true,
      advancedTracking: true,
      ads: true,
    },
    adsLabel: "Ad-Free",
  },
];

const features = [
  { key: "risk", label: "Risk Assessment" },
  { key: "textConsult", label: "Text Consultations" },
  { key: "videoConsult", label: "Video Consultations" },
  { key: "advancedTracking", label: "Advanced Tracking" },
  { key: "ads", labelKey: "adsLabel" },
];

function PricingSection() {
  return (
    <section className="py-12 md:py-24 bg-muted">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Choose the Right Plan for You</h2>
          <p className="text-muted-foreground mt-2">
            We offer flexible pricing options to meet your skin health needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border shadow-lg transition-all hover:shadow-xl ${plan.bgClass} relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-br-lg rounded-tl-lg text-blue-900">
                  {plan.badgeText}
                </div>
              )}
              <div className="p-6 flex flex-col h-full">
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{plan.title}</h3>
                  <p
                    className={`${
                      plan.popular ? "text-blue-100" : "text-muted-foreground"
                    }`}
                  >
                    {plan.subtitle}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span
                    className={
                      plan.popular ? "text-blue-100" : "text-muted-foreground"
                    }
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-2 mb-6 flex-grow">
                  <li className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" // Changed ml-2 to mr-2
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span>{plan.analysisCount} AI skin analyses/month</span>
                  </li>
                  {features.map((f) => (
                    <li key={f.key} className="flex items-center">
                      <svg
                        className={`w-5 h-5 mr-2 ${
                          // Changed ml-2 to mr-2
                          // @ts-ignore
                          plan.featureEnabled[f.key]
                            ? plan.popular
                              ? "text-white"
                              : "text-green-500 dark:text-green-400"
                            : plan.popular
                            ? "text-blue-200"
                            : "text-muted-foreground"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/*@ts-ignore*/}
                        {plan.featureEnabled[f.key] ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        )}
                      </svg>
                      <span
                        className={`${
                          // @ts-ignore
                          plan.featureEnabled[f.key]
                            ? ""
                            : plan.popular
                            ? "text-blue-100"
                            : "text-muted-foreground"
                        }`}
                      >
                        {f.key === "ads" ? plan.adsLabel : f.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.buttonClass}`}>
                  Get Started
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
