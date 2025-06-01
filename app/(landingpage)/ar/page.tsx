"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

export default function LandingPage() {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col" dir="rtl">
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
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              لوحة التحكم
            </Link>
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
                احصل على أفضل كشف لامراض الجلد مع DermoXpert AI
              </h1>
              <div className="mt-8">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-bold">+10</h2>
                    <p className="text-sm text-muted-foreground">
                      سنوات من الخبرة مع تقنية الذكاء الاصطناعي في اكتشاف أمراض
                      الجلد.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold">مرضانا</h3>
                  <p className="text-sm text-muted-foreground">
                    حوالي 250 ألف+ مريض وثقوا بنا وهم راضون عن تحليل الجلد
                    والكشف المبكر لدينا.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-muted-foreground">
                  ارفع صورة للتحليل بالذكاء الاصطناعي واتصل بأطباء الجلدية من
                  خلال منصتنا
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    سجل الآن
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
            <h2 className="text-3xl font-bold mb-8">سنخدمك بخدمات صحة الجلد</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border bg-card text-card-foreground shadow p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-4">
                  تحليل الجلد بالذكاء الاصطناعي
                </h3>
                <p className="text-muted-foreground mb-4">
                  ارفع صور مشاكل الجلد واحصل على تقييم المخاطر بالذكاء الاصطناعي
                  للكشف المبكر.
                </p>
                <div className="mt-4 flex-1 flex justify-center items-center w-full relative aspect-square">
                  <Image
                    src="https://img.freepik.com/free-photo/scientist-working-laboratory-analysing-test-trial-vaccine-checking-drug-data-standing-front-pc_482257-515.jpg?t=st=1748109342~exp=1748112942~hmac=0e8ff52b9bf9b1c18d936338bb80e30f44a824272e3ba28841abde88d18b0237&w=2000"
                    alt="تحليل الجلد بالذكاء الاصطناعي"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg border bg-blue-600 dark:bg-blue-800 text-white shadow p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-4">طبيب افتراضي</h3>
                <p className="text-blue-100 mb-4">
                  تواصل مع أطباء الجلدية المعتمدين من خلال استشارات نصية أو
                  مرئية للتشخيص المهني.
                </p>
                <div className="mt-4 flex-1 flex justify-center items-center w-full relative aspect-square">
                  <Image
                    src="https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="استشارة افتراضية"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-4">تتبع صحة الجلد</h3>
                <p className="text-muted-foreground mb-4">
                  راقب التغييرات في جلدك مع مرور الوقت مع نظام التتبع والمتابعة
                  الشامل لدينا.
                </p>
                <div className="mt-4 flex-1 flex justify-center items-center w-full relative aspect-square">
                  <Image
                    src="https://img.freepik.com/photos-gratuite/test-reaction-allergique-cutanee-bras_23-2149140483.jpg?t=st=1748108848~exp=1748112448~hmac=54b80c7a08873021914751e52a047961e7fccda6da183eb56490f432ee33900d&w=2000"
                    alt="تتبع صحة الجلد"
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
              <h2 className="text-3xl font-bold">كيف يعمل DermoXpert AI</h2>
              <p className="text-muted-foreground mt-2">
                ابدأ مع تحليل الجلد بالذكاء الاصطناعي في خطوات بسيطة
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  1
                  <div className="absolute w-12 h-1 bg-blue-600 left-0 top-1/2 -translate-x-full hidden md:block"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">التقط صورة</h3>
                <p className="text-muted-foreground">
                  التقط صورة واضحة لمشكلة الجلد باستخدام تطبيقنا
                </p>
              </div>

              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  2
                  <div className="absolute w-12 h-1 bg-blue-600 left-0 top-1/2 -translate-x-full hidden md:block"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  تحليل الذكاء الاصطناعي
                </h3>
                <p className="text-muted-foreground">
                  يحلل الذكاء الاصطناعي الصورة للبحث عن علامات أمراض الجلد
                  المحتملة
                </p>
              </div>

              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  3
                  <div className="absolute w-12 h-1 bg-blue-600 left-0 top-1/2 -translate-x-full hidden md:block"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">احصل على النتائج</h3>
                <p className="text-muted-foreground">
                  احصل على تقييم مفصل للمخاطر مع تحليل ABCDE
                </p>
              </div>

              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                  4
                </div>
                <h3 className="text-xl font-bold mb-2">تواصل مع الأطباء</h3>
                <p className="text-muted-foreground">
                  استشر أطباء الجلدية للتشخيص المهني
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
                <p>سنوات من تطوير الذكاء الاصطناعي</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">%95</div>
                <p>دقة الكشف</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">230K+</div>
                <p>تحليل جلد تم إجراؤه</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">+500</div>
                <p>طبيب جلدية على المنصة</p>
              </div>
            </div>
          </div>
        </section>

        {/* App Features */}
        <section className="py-12 md:py-24">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-2">
              الميزات التي ستحصل عليها من تطبيقنا
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              تقدم منصتنا أدوات شاملة لمراقبة وإدارة صحة الجلد
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
              <div className="rounded-lg bg-muted p-6 flex flex-col aspect-[19/15]">
                <h3 className="text-xl font-bold mb-4">تحليل الصور المتقدم</h3>
                <p className="text-muted-foreground mb-6">
                  تحلل تقنية الذكاء الاصطناعي صور الجلد باستخدام طريقة ABCDE
                  لاكتشاف علامات الإنذار المحتملة للميلانوما.
                </p>
                <div className="relative h-full">
                  <Image
                    src="/gr/Dermatologist-online-consultation.jpg"
                    alt="تحليل الصور"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6  flex flex-col aspect-[19/15]">
                <h3 className="text-xl font-bold mb-4">
                  استشارات أطباء الجلدية
                </h3>
                <p className="text-muted-foreground mb-6">
                  تواصل مع أطباء الجلدية المعتمدين من خلال مكالمات نصية أو مرئية
                  للتشخيص المهني وخطط العلاج.
                </p>
                <div className="relative h-full">
                  <Image
                    src="https://img.freepik.com/free-photo/doctor-nurses-special-equipment_23-2148980721.jpg?t=st=1748754535~exp=1748758135~hmac=814818f45a84e6240ee2d560b900d5fdd37f7d721d812ea6bb10bde6fe7bd0fa&w=826"
                    alt="تحليل الصور"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6 flex flex-col aspect-[19/15]">
                <h3 className="text-xl font-bold mb-4">تتبع صحة الجلد</h3>
                <p className="text-muted-foreground mb-6">
                  راقب التغييرات في جلدك مع مرور الوقت مع التتبع الزمني لجميع
                  الفحوصات وتقييمات المخاطر.
                </p>
                <div className="relative h-full">
                  <Image
                    src="https://img.freepik.com/free-photo/doctor-with-stethoscope-hands-hospital-background_1423-1.jpg?t=st=1748754988~exp=1748758588~hmac=1fcd188b288f653bce4d5166c5c6eb907db01405b8a2e2cfc3fde63ce82bdd58&w=826"
                    alt="تحليل الصور"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6 flex flex-col aspect-[19/15]">
                <h3 className="text-xl font-bold mb-4">إدارة المواعيد</h3>
                <p className="text-muted-foreground mb-6">
                  احجز مواعيد شخصية أو افتراضية مع أطباء الجلدية واحصل على
                  تذكيرات لفحوصات المتابعة.
                </p>
                <div className="relative h-full">
                  <Image
                    src="https://img.freepik.com/free-photo/medical-banner-with-doctor-patient_23-2149611238.jpg?t=st=1748755170~exp=1748758770~hmac=c66e59390d7323f5455a57ff6881be99431c0ce1c2235a9c606548fcb0827edf&w=826"
                    alt="إدارة المواعيد"
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
                  حمل الآن
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Download CTA */}
        <section className="py-12 md:py-24 bg-muted">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">
              حمل تطبيق DermoXpert AI اليوم وتحكم في صحة جلدك.
            </h2>
            <p className="text-muted-foreground mb-8">
              متوفر على متجر Google Play ومتجر التطبيقات
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              حمل التطبيق
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
            <p>© 2025 DermoXpert AI. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
const plans = [
  {
    id: "basic",
    title: "أساسي",
    subtitle: "لفحوصات الجلد العرضية",
    price: "0 DA",
    period: "/شهر",
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
    adsLabel: "إعلانات",
  },
  {
    id: "standard",
    title: "قياسي",
    subtitle: "لمراقبة الجلد المنتظمة",
    price: "1000 DA",
    period: "/شهر",
    analysisCount: 15,
    popular: true,
    badgeText: "الأكثر شعبية",
    bgClass: "bg-blue-600 dark:bg-blue-800 text-white",
    buttonClass: "bg-white text-blue-600 hover:bg-blue-50",
    featureEnabled: {
      risk: true,
      textConsult: true,
      videoConsult: true,
      advancedTracking: true,
      ads: true,
    },
    adsLabel: "إعلانات أقل",
  },
  {
    id: "premium",
    title: "مميز",
    subtitle: "للعناية الشاملة بالجلد",
    price: "1500 DA",
    period: "/شهر",
    analysisCount: "غير محدودة",
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
    adsLabel: "بدون إعلانات",
  },
];

const features = [
  { key: "risk", label: "تقييم المخاطر" },
  { key: "textConsult", label: "استشارات نصية" },
  { key: "videoConsult", label: "استشارات مرئية" },
  { key: "advancedTracking", label: "تتبع متقدم" },
  { key: "ads", labelKey: "adsLabel" },
];

function PricingSection() {
  return (
    <section className="py-12 md:py-24 bg-muted">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">اختر الخطة المناسبة لك</h2>
          <p className="text-muted-foreground mt-2">
            نقدم خيارات تسعير مرنة لتلبية احتياجات صحة الجلد الخاصة بك
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
                      className="w-5 h-5 ml-2 text-green-500 dark:text-green-400"
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
                    <span>
                      {plan.analysisCount} تحليل جلد بالذكاء الاصطناعي/شهر
                    </span>
                  </li>
                  {features.map((f) => (
                    <li key={f.key} className="flex items-center">
                      <svg
                        className={`w-5 h-5 ml-2 ${
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
                  ابدأ الآن
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
