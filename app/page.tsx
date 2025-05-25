import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
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
                  d="M9 12H15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 9V15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-blue-600">
              DermoXpert AI
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About us
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              How it works
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Doctors
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Contact us
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted py-12 md:py-24">
          <div className="container grid gap-6 md:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Get the best skin cancer detection at DermoXpert AI
              </h1>
              <div className="mt-8">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold">10+</h2>
                    <p className="text-sm text-muted-foreground">
                      Years of experience with our AI technology in detecting
                      skin conditions.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-muted-foreground">
                  Upload a photo for AI analysis and get connected with
                  dermatologists through our platform
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/auth">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Register Now
                    </Button>
                  </Link>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-[280px] h-[560px]">
                <Image
                  src="/placeholder.svg?height=560&width=280"
                  alt="Mobile App"
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
              We will serve you with skin health services
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
                <h3 className="text-xl font-bold mb-4">AI Skin Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Upload photos of skin concerns and get AI-powered risk
                  assessment for early detection.
                </p>
                <div className="mt-4">
                  <Image
                    src="/placeholder.svg?height=160&width=240"
                    alt="AI Skin Analysis"
                    width={240}
                    height={160}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg border bg-blue-600 dark:bg-blue-800 text-white shadow p-6">
                <h3 className="text-xl font-bold mb-4">
                  Virtual Dermatologist
                </h3>
                <p className="text-blue-100 mb-4">
                  Connect with certified dermatologists through text or video
                  consultations for professional diagnosis.
                </p>
                <div className="mt-4">
                  <Image
                    src="/placeholder.svg?height=160&width=240"
                    alt="Virtual Consultation"
                    width={240}
                    height={160}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
                <h3 className="text-xl font-bold mb-4">Skin Health Tracking</h3>
                <p className="text-muted-foreground mb-4">
                  Monitor changes in your skin over time with our comprehensive
                  tracking and follow-up system.
                </p>
                <div className="mt-4">
                  <Image
                    src="/placeholder.svg?height=160&width=240"
                    alt="Skin Health Tracking"
                    width={240}
                    height={160}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 text-right">
              <Button variant="link" className="text-blue-600">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-12 md:py-24 bg-muted">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">
                Choose the right plan for you
              </h2>
              <p className="text-muted-foreground mt-2">
                We offer flexible pricing options to meet your skin health needs
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Basic Plan */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-lg transition-all hover:shadow-xl">
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">Basic</h3>
                    <p className="text-muted-foreground">
                      For occasional skin checks
                    </p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$19</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-grow">
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500 dark:text-green-400"
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
                      <span>5 AI skin analyses/month</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500 dark:text-green-400"
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
                      <span>Basic risk assessment</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500 dark:text-green-400"
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
                      <span>Text consultations</span>
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <svg
                        className="w-5 h-5 mr-2 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                      <span>Video consultations</span>
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <svg
                        className="w-5 h-5 mr-2 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                      <span>Advanced tracking</span>
                    </li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </div>
              </div>

              {/* Standard Plan */}
              <div className="rounded-lg border bg-blue-600 dark:bg-blue-800 text-white shadow-lg transition-all hover:shadow-xl relative">
                <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg text-blue-900">
                  POPULAR
                </div>
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">Standard</h3>
                    <p className="text-blue-100">For regular skin monitoring</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$49</span>
                    <span className="text-blue-100">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-grow">
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-white"
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
                      <span>15 AI skin analyses/month</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-white"
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
                      <span>Detailed ABCDE analysis</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-white"
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
                      <span>Text & video consultations</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-white"
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
                      <span>Skin health tracking</span>
                    </li>
                    <li className="flex items-center text-blue-100">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                      <span>Wearable integrations</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                    Get Started
                  </Button>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-lg transition-all hover:shadow-xl">
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold">Premium</h3>
                    <p className="text-muted-foreground">
                      For comprehensive skin care
                    </p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-grow">
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500 dark:text-green-400"
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
                      <span>Unlimited AI skin analyses</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500 dark:text-green-400"
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
                      <span>Priority dermatologist access</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500 dark:text-green-400"
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
                      <span>Advanced image processing tools</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500 dark:text-green-400"
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
                      <span>Full health record integration</span>
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-green-500 dark:text-green-400"
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
                      <span>Wearable device integrations</span>
                    </li>
                  </ul>
                  <Button className="w-full">Get Started</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">How DermoXpert AI Works</h2>
              <p className="text-muted-foreground mt-2">
                Get started with AI-powered skin analysis in just a few simple
                steps
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  1
                  <div className="absolute w-12 h-1 bg-blue-600 right-0 top-1/2 translate-x-full hidden md:block"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">Take a Photo</h3>
                <p className="text-muted-foreground">
                  Capture a clear image of your skin concern using our app
                </p>
              </div>

              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  2
                  <div className="absolute w-12 h-1 bg-blue-600 right-0 top-1/2 translate-x-full hidden md:block"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes the image for signs of potential skin
                  conditions
                </p>
              </div>

              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  3
                  <div className="absolute w-12 h-1 bg-blue-600 right-0 top-1/2 translate-x-full hidden md:block"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">Get Results</h3>
                <p className="text-muted-foreground">
                  Receive a detailed risk assessment with ABCDE breakdown
                </p>
              </div>

              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  4
                </div>
                <h3 className="text-xl font-bold mb-2">Connect with Doctors</h3>
                <p className="text-muted-foreground">
                  Consult with dermatologists for professional diagnosis
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
                <div className="text-4xl font-bold mb-2">10+</div>
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
                <div className="text-4xl font-bold mb-2">500+</div>
                <p>Dermatologists on Platform</p>
              </div>
            </div>
          </div>
        </section>

        {/* App Features */}
        <section className="py-12 md:py-24">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-2">
              Features you will get from our app
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Our platform offers comprehensive tools for skin health monitoring
              and management
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
              <div className="rounded-lg bg-muted p-6">
                <h3 className="text-xl font-bold mb-4">
                  Advanced Image Analysis
                </h3>
                <p className="text-muted-foreground mb-6">
                  Our AI technology analyzes skin images using the ABCDE method
                  to detect potential melanoma warning signs.
                </p>
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=240&width=160"
                    alt="Image Analysis"
                    width={160}
                    height={240}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6">
                <h3 className="text-xl font-bold mb-4">
                  Dermatologist Consultations
                </h3>
                <p className="text-muted-foreground mb-6">
                  Connect with certified dermatologists through text or video
                  calls for professional diagnosis and treatment plans.
                </p>
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=240&width=160"
                    alt="Doctor Consultation"
                    width={160}
                    height={240}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6">
                <h3 className="text-xl font-bold mb-4">Skin Health Tracking</h3>
                <p className="text-muted-foreground mb-6">
                  Monitor changes in your skin over time with chronological
                  tracking of all scans and risk assessments.
                </p>
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=240&width=160"
                    alt="Health Tracking"
                    width={160}
                    height={240}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6">
                <h3 className="text-xl font-bold mb-4">
                  Appointment Management
                </h3>
                <p className="text-muted-foreground mb-6">
                  Schedule in-person or virtual appointments with dermatologists
                  and receive reminders for follow-up exams.
                </p>
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=240&width=160"
                    alt="Appointment Management"
                    width={160}
                    height={240}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">
                Trusted by Leading Healthcare Providers
              </h2>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {[1, 2, 3, 4, 5].map((partner) => (
                <div
                  key={partner}
                  className="grayscale hover:grayscale-0 transition-all"
                >
                  <Image
                    src={`/placeholder.svg?height=60&width=120&text=Partner${partner}`}
                    alt={`Healthcare Partner ${partner}`}
                    width={120}
                    height={60}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 md:py-24 bg-muted">
          <div className="container">
            <div className="mb-8">
              <span className="text-sm font-medium text-blue-600">
                SUCCESS STORIES
              </span>
              <h2 className="text-3xl font-bold mt-2">
                What our patients say about us
              </h2>
              <p className="text-muted-foreground mt-2">
                Real experiences from people who detected skin conditions early
                with DermoXpert AI
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
              <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src="/placeholder.svg?height=40&width=40"
                        alt="Patient"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Christina Kim</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="italic">
                  "DermoXpert AI detected an irregular mole that I hadn't
                  noticed. The app connected me with a dermatologist who
                  confirmed it needed removal. Early detection made all the
                  difference. I'm so grateful for this technology!"
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mt-2">
                Find answers to common questions about our services
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  How accurate is the AI analysis?
                </h3>
                <p className="text-muted-foreground">
                  Our AI has been trained on over 100,000 dermatologist-verified
                  images and achieves a 95% accuracy rate in detecting potential
                  skin cancer indicators. However, it's designed as a screening
                  tool and not a replacement for professional medical diagnosis.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  How do I take the best photo for analysis?
                </h3>
                <p className="text-muted-foreground">
                  Use good lighting, keep the camera steady, ensure the skin
                  concern is in focus, and include a common object for size
                  reference. Our app provides real-time guidance to help you
                  capture the best possible image for analysis.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  Who are the dermatologists on the platform?
                </h3>
                <p className="text-muted-foreground">
                  All dermatologists on DermoXpert AI are board-certified with
                  specializations in skin cancer detection and treatment. We
                  verify credentials and experience before allowing doctors to
                  join our platform.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  Is my medical data secure?
                </h3>
                <p className="text-muted-foreground">
                  Yes, we use end-to-end encryption and comply with all
                  healthcare privacy regulations. Your data is stored securely
                  and is only accessible to you and the healthcare providers you
                  explicitly authorize.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  Can I use DermoXpert AI for all skin conditions?
                </h3>
                <p className="text-muted-foreground">
                  DermoXpert AI is primarily designed for skin cancer screening,
                  focusing on melanoma and other skin cancers. While it may
                  detect other skin conditions, its primary purpose is early
                  skin cancer detection.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  How quickly can I connect with a dermatologist?
                </h3>
                <p className="text-muted-foreground">
                  Most patients can schedule same-day text consultations. For
                  video consultations, availability depends on the
                  dermatologist's schedule, but urgent cases are prioritized
                  based on AI risk assessment.
                </p>
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
              Available on Google Play Store and App Store
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
          <nav className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About us
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              How it works
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Doctors
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Contact us
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
