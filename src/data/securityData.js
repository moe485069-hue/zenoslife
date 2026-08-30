// Comprehensive Cyber Security, OPSEC & Mental Defense Academy Data

export const SECURITY_ACADEMY_MODULES = [
  {
    id: 'threat-modeling-basics',
    titleFa: 'مدل‌سازی تهدید و تحلیل سطح آسیب‌پذیری فردی (Personal Threat Modeling)',
    titleEn: 'Personal Threat Modeling: Identifying Vectors of Vulnerability',
    categoryFa: 'معماری امنیت و OPSEC',
    categoryEn: 'Security Architecture & OPSEC',
    icon: '🛡️',
    readTimeFa: '۶ دقیقه مطالعه',
    readTimeEn: '6 min read',
    summaryFa: 'شناخت دارایی‌های باارزش، مهاجمان احتمالی و روش‌های کاهش سطح حمله (Attack Surface).',
    summaryEn: 'Mapping critical assets, adversary capabilities and minimizing attack surface.',
    contentFa: `مدل‌سازی تهدید یعنی پاسخ به ۴ سوال استراتژیک امنیتی:

۱. **دارایی‌های ارزشمند من چیست؟**
رمزهای عبور، ایمیل اصلی، داده‌های مالی، فایل‌های ژورنال شخصی، حریم خصوصی ارتباطات و آرامش روانی.

۲. **مهاجمان احتمالی چه کسانی هستند؟**
هکرهای خودکار در اینترنت، صفحات فیشینگ، بدافزارهای جاسوسی، افراد دستکاری‌کننده (Manipulators) و شرکت‌های جمع‌آوری‌کننده کلان‌داده.

۳. **آسیب‌پذیری‌های کلیدی من کجاست؟**
استفاده از رمزهای تکراری، نبود احراز هویت دومرحله‌ای، کلیک روی لینک‌های ناشناس، و اعتماد بیش از حد به غریبه‌ها در فضای مجازی.

۴. **اقدام مقابله‌ای (Mitigation):**
پیاده‌سازی اصل «کمترین دسترسی ممکن» و تفکیک هویت دیجیتال به صورت لایه‌لایه.`,
    keyTakeawayFa: 'امنیت ۱۰۰٪ وجود ندارد؛ هدف ما افزایش هزینه و سختی نفوذ برای مهاجم تا حد غیرممکن است.'
  },
  {
    id: 'digital-hygiene-checklist',
    titleFa: 'بهداشت دیجیتال و پروتکل‌های رمزنگاری نفوذناپذیر',
    titleEn: 'Digital Hygiene: Password Vaults, 2FA & Encryption Standard',
    categoryFa: 'امنیت سایبری کاربردی',
    categoryEn: 'Cybersecurity Hygiene',
    icon: '⚡',
    readTimeFa: '۵ دقیقه مطالعه',
    readTimeEn: '5 min read',
    summaryFa: 'گام‌های عملی برای قفل کردن هویت دیجیتال و محافظت از حساب‌های حیاتی.',
    summaryEn: 'Practical blueprints for password managers, hardware keys and zero-knowledge storage.',
    contentFa: `پروتکل ۳ مرحله‌ای برای امنیت سایبری شخصی:

۱. **استفاده از پسورد منیجر مستقل (مانند Bitwarden یا KeePassXC):**
هرگز رمزی را در ذهن خود ذخیره نکنید. برای هر سایت یک رمز تصادفی و منحصر‌به‌فرد ۱۶ تا ۳۲ کاراکتری تولید کنید. تنها یک Master Password طولانی و قوی را حفظ کنید.

۲. **احراز هویت دو مرحله‌ای سخت‌افزاری/اپلیکیشنی (2FA via TOTP):**
پیامک (SMS) ناامن‌ترین روش 2FA است (به دلیل حملات SIM Swapping). همیشه از اپلیکیشن‌های تولید کد (مثل Aegis یا Google Authenticator) یا کلید سخت‌افزاری (YubiKey) استفاده کنید.

۳. **پشتیبان‌گیری رمزنگاری‌شده با قانون ۳-۲-۱:**
۳ نسخه از داده‌های مهم، روی ۲ نوع رسانه مختلف (هارد اکسترنال + فضای ابری رمزگذاری‌شده)، و ۱ نسخه خارج از محل سکونت (Offsite).`,
    keyTakeawayFa: 'یک پسورد تکراری، کلید ورود به تمام زندگی دیجیتال شماست؛ آن را همین امروز از بین ببرید.'
  },
  {
    id: 'psychological-gaslighting-defense',
    titleFa: 'سپر روانی در برابر مهندسی اجتماعی و دستکاری ذهنی (Gaslighting Defense)',
    titleEn: 'Mental Security: Defense Against Social Engineering & Gaslighting',
    categoryFa: 'امنیت روانی و شناختی',
    categoryEn: 'Psychological Defense',
    icon: '🧠',
    readTimeFa: '۷ دقیقه مطالعه',
    readTimeEn: '7 min read',
    summaryFa: 'چگونه علائم مهندسی اجتماعی، باج‌گیری عاطفی و القای تردید را شناسایی و مهار کنیم.',
    summaryEn: 'Identifying psychological manipulation, emotional blackmail and false urgencies.',
    contentFa: `هکرها همیشه دیوار آتش را هک نمی‌کنند؛ آن‌ها انسان‌ها را هک می‌کنند:

۱. **تکنیک ایجاد فوریت دروغین (False Urgency):**
هر پیام، ایمیل یا فردی که شما را مجبور می‌کند «همین الان و بدون فکر کردن» تصمیم بگیرید یا پولی منتقل کنید، در حال اجرای حمله مهندسی اجتماعی است. قانون طلایی: «هر وقت فوریت احساس کردی، ۲۴ ساعت توقف کن».

۲. **شناسایی گس‌لایتینگ (Gaslighting):**
تلاش فرد متخاصم برای اینکه شما به حافظه، سلامت عقل و احساسات خود شک کنید («تو دیوونه شدی، من هیچ‌وقت چنین حرفی نزدم!»).
پادزهر: وقایع مهم و توافقات را تاریخ‌زده و مکتوب کنید (Reality Journaling).

۳. **مرزبندی اطلاعاتی شخصی (Information Boundary):**
اطلاعات حساس مالی، نقاط ضعف و اسرار زندگی خود را با افرادی که سابقه اثبات‌شده وفاداری ندارند در میان نگذارید.`,
    keyTakeawayFa: 'بزرگترین دیوار آتش شما، آرامش خونسردانه و شک سالم در برابر درخواست‌های اضطراری است.'
  },
  {
    id: 'passkeys-zero-trust-fido2',
    titleFa: 'انقلاب Passkey و ورود بدون پسورد ضد فیشینگ (FIDO2 Standard)',
    titleEn: 'Passkeys & Phishing-Proof Authentication Standard',
    categoryFa: 'فناوری‌های نوین امنیت',
    categoryEn: 'Modern Auth & Cryptography',
    icon: '🔑',
    readTimeFa: '۶ دقیقه مطالعه',
    readTimeEn: '6 min read',
    summaryFa: 'چگونه پس‌کی‌ها با امضای دیجیتال نامتقارن، حملات فیشینگ را از نظر ریاضی غیرممکن می‌سازند.',
    summaryEn: 'How asymmetric cryptographic passkeys eliminate phishing and stolen credential risks.',
    contentFa: `پس‌کی (Passkey) جایگزین مدرن و نفوذناپذیر رمز عبورهای سنتی است:

۱. **مکانیسم رمزنگاری نامتقارن (Public/Private Key):**
- کلید خصوصی (Private Key) فقط و فقط در تراشه امنیتی گوشی یا سخت‌افزار شما ذخیره می‌شود و هرگز به سرور ارسال نمی‌گردد.
- کلید عمومی (Public Key) روی سرور ذخیره می‌شود. حتی اگر سرور سایت هک شود، هیچ پسوردی برای سرقت وجود ندارد!

۲. **مصونیت ۱۰۰٪ در برابر فیشینگ:**
حتی اگر فریب بخورید و وارد یک وبسایت جعلی با ظاهر بانک یا گوگل شوید، مرورگر کلید خصوصی را برای دامنه جعلی فعال نمی‌کند؛ در نتیجه فیشینگ غیرممکن است.

۳. **نحوه فعال‌سازی:**
روی حساب‌های گوگل، اپل، مایکروسافت و صرافی‌های معتبر وارد تنظیمات امنیت شوید و «Create a Passkey» را انتخاب کنید و آن را با اثر انگشت یا Face ID احراز هویت کنید.`,
    keyTakeawayFa: 'Passkey آینده امنیت اینترنت است؛ با فعال کردن آن، کابوس لو رفتن پسورد برای همیشه به پایان می‌رسد.'
  },
  {
    id: 'digital-footprint-osint-erasure',
    titleFa: 'پاکسازی ردپای دیجیتال و حفاظت از داده‌های هویتی (Data Privacy OSINT)',
    titleEn: 'Digital Footprint Erasure & Metadata Protection',
    categoryFa: 'حریم خصوصی و گمنامی',
    categoryEn: 'Privacy & Metadata Hygiene',
    icon: '🕵️',
    readTimeFa: '۶ دقیقه مطالعه',
    readTimeEn: '6 min read',
    summaryFa: 'روش‌های حذف متادیتا از تصاویر، محدودسازی ردیاب‌های وبسایت‌ها و جداسازی هویت‌های آنلاین.',
    summaryEn: 'Stripping EXIF metadata, blocking browser fingerprinting, and compartmentalizing online personas.',
    contentFa: `هر عکسی که با گوشی می‌گیرید، متادیتای EXIF شامل لوکیشن دقیق GPS، مدل گوشی و ساعت را در خود ذخیره می‌کند:

۱. **پاکسازی متادیتا (Metadata Stripping):**
قبل از ارسال عکس در فضاهای عمومی، لوکیشن GPS را در تنظیمات دوربین خاموش کنید یا از ابزارهای حذف متادیتا استفاده کنید.

۲. **تفکیک ایمیل‌ها با سیستم Alias (Alias Compartmentalization):**
از سرویس‌هایی مثل SimpleLogin یا Proton Pass Aliases استفاده کنید تا برای ثبت‌نام در هر سایت یک ایمیل مجازی تولید شود. این کار باعث می‌شود ایمیل اصلی شما هرگز فاش نشود و اسپم‌ها و نشت اطلاعات به صفر برسد.

۳. **مرورگرهای مقاوم در برابر انگشت‌نگاری (Anti-Fingerprinting):**
استفاده از افزونه uBlock Origin و مرورگرهایی مانند Brave یا Firefox با تنظیمات حریم خصوصی سخت‌گیرانه مانع از ردیابی کوکی‌ها در وب می‌شود.`,
    keyTakeawayFa: 'حریم خصوصی چیزی برای پنهان کردن نیست؛ حریم خصوصی حفظ اختیار و کنترل بر حریم زیستن است.'
  }
];
