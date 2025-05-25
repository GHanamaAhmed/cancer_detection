import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
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
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              من نحن
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              كيف يعمل
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              الأطباء
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              اتصل بنا
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
                احصل على أفضل كشف لسرطان الجلد مع DermoXpert AI
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
                  {/* <div className="flex -space-x-2">
                    <Avatar className="border-2 border-background">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt="مريض"
                      />
                      <AvatarFallback>م1</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-background">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt="مريض"
                      />
                      <AvatarFallback>م2</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-background">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt="مريض"
                      />
                      <AvatarFallback>م3</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-background bg-blue-600 text-white">
                      <AvatarFallback>+</AvatarFallback>
                    </Avatar>
                  </div> */}
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
                  <Button variant="outline">اعرف المزيد</Button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-[280px] h-[560px]">
                <Image
                  src="/gr/photo_1_2025-05-24_16-22-23.jpg"
                  alt="تطبيق الهاتف المحمول"
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
            <div className="mt-8 text-left">
              <Button variant="link" className="text-blue-600">
                اعرف المزيد
              </Button>
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
              <div className="rounded-lg bg-muted p-6">
                <h3 className="text-xl font-bold mb-4">تحليل الصور المتقدم</h3>
                <p className="text-muted-foreground mb-6">
                  تحلل تقنية الذكاء الاصطناعي صور الجلد باستخدام طريقة ABCDE
                  لاكتشاف علامات الإنذار المحتملة للميلانوما.
                </p>
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=240&width=160"
                    alt="تحليل الصور"
                    width={160}
                    height={240}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6">
                <h3 className="text-xl font-bold mb-4">
                  استشارات أطباء الجلدية
                </h3>
                <p className="text-muted-foreground mb-6">
                  تواصل مع أطباء الجلدية المعتمدين من خلال مكالمات نصية أو مرئية
                  للتشخيص المهني وخطط العلاج.
                </p>
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=240&width=160"
                    alt="استشارة طبيب"
                    width={160}
                    height={240}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6">
                <h3 className="text-xl font-bold mb-4">تتبع صحة الجلد</h3>
                <p className="text-muted-foreground mb-6">
                  راقب التغييرات في جلدك مع مرور الوقت مع التتبع الزمني لجميع
                  الفحوصات وتقييمات المخاطر.
                </p>
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=240&width=160"
                    alt="تتبع الصحة"
                    width={160}
                    height={240}
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-muted p-6">
                <h3 className="text-xl font-bold mb-4">إدارة المواعيد</h3>
                <p className="text-muted-foreground mb-6">
                  احجز مواعيد شخصية أو افتراضية مع أطباء الجلدية واحصل على
                  تذكيرات لفحوصات المتابعة.
                </p>
                <div className="flex justify-center">
                  <Image
                    src="/placeholder.svg?height=240&width=160"
                    alt="إدارة المواعيد"
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
                موثوق من قبل مقدمي الرعاية الصحية الرائدين
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
                    alt={`شريك الرعاية الصحية ${partner}`}
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
                قصص النجاح
              </span>
              <h2 className="text-3xl font-bold mt-2">ماذا يقول مرضانا عنا</h2>
              <p className="text-muted-foreground mt-2">
                تجارب حقيقية من أشخاص اكتشفوا أمراض الجلد مبكراً مع DermoXpert
                AI
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
              <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src="/placeholder.svg?height=40&width=40"
                        alt="مريض"
                      />
                      <AvatarFallback>ك م</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">كريستينا كيم</p>
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
                  "اكتشف DermoXpert AI شامة غير منتظمة لم ألاحظها. ربطني التطبيق
                  بطبيب جلدية أكد أنها تحتاج إلى إزالة. الكشف المبكر أحدث كل
                  الفرق. أنا ممتنة جداً لهذه التقنية!"
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  عرض المزيد
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">الأسئلة الشائعة</h2>
              <p className="text-muted-foreground mt-2">
                اعثر على إجابات للأسئلة الشائعة حول خدماتنا
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  ما مدى دقة تحليل الذكاء الاصطناعي؟
                </h3>
                <p className="text-muted-foreground">
                  تم تدريب الذكاء الاصطناعي لدينا على أكثر من 100,000 صورة تم
                  التحقق منها من قبل أطباء الجلدية ويحقق معدل دقة 95% في اكتشاف
                  مؤشرات سرطان الجلد المحتملة. ومع ذلك، فهو مصمم كأداة فحص وليس
                  بديلاً للتشخيص الطبي المهني.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  كيف ألتقط أفضل صورة للتحليل؟
                </h3>
                <p className="text-muted-foreground">
                  استخدم إضاءة جيدة، حافظ على ثبات الكاميرا، تأكد من أن مشكلة
                  الجلد في البؤرة، وأدرج كائناً مألوفاً كمرجع للحجم. يوفر
                  تطبيقنا إرشادات في الوقت الفعلي لمساعدتك في التقاط أفضل صورة
                  ممكنة للتحليل.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  من هم أطباء الجلدية على المنصة؟
                </h3>
                <p className="text-muted-foreground">
                  جميع أطباء الجلدية على DermoXpert AI معتمدون من المجلس مع
                  تخصصات في اكتشاف وعلاج سرطان الجلد. نتحقق من الأوراق الاعتماد
                  والخبرة قبل السماح للأطباء بالانضمام إلى منصتنا.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  هل بياناتي الطبية آمنة؟
                </h3>
                <p className="text-muted-foreground">
                  نعم، نستخدم التشفير من طرف إلى طرف ونلتزم بجميع لوائح خصوصية
                  الرعاية الصحية. يتم تخزين بياناتك بأمان ولا يمكن الوصول إليها
                  إلا من قبلك ومقدمي الرعاية الصحية الذين تخولهم صراحة.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  هل يمكنني استخدام DermoXpert AI لجميع أمراض الجلد؟
                </h3>
                <p className="text-muted-foreground">
                  DermoXpert AI مصمم أساساً لفحص سرطان الجلد، مع التركيز على
                  الميلانوما وسرطانات الجلد الأخرى. بينما قد يكتشف أمراض جلد
                  أخرى، فإن غرضه الأساسي هو الكشف المبكر لسرطان الجلد.
                </p>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="text-xl font-bold mb-2">
                  كم سرعة التواصل مع طبيب جلدية؟
                </h3>
                <p className="text-muted-foreground">
                  يمكن لمعظم المرضى جدولة استشارات نصية في نفس اليوم. بالنسبة
                  للاستشارات المرئية، تعتمد التوفر على جدول طبيب الجلدية، لكن
                  الحالات العاجلة تحصل على أولوية بناءً على تقييم مخاطر الذكاء
                  الاصطناعي.
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
          <nav className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              من نحن
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              كيف يعمل
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              الأطباء
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              اتصل بنا
            </Link>
          </nav>
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
