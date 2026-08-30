// Comprehensive Language Learning Data Bank for Stroll (English, French, Japanese)

export const speakLanguagePhrase = (text, ttsCode = 'en-US') => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    // Clean text removing parentheses/romaji explanations for natural speech
    const cleanText = text.replace(/\(.*?\)/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = ttsCode;
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('TTS error:', e);
  }
};

export const LANGUAGE_OPTIONS = [
  // ─────────────────────────────────────────────
  //  1. JAPANESE (日本語) — 🇯🇵
  // ─────────────────────────────────────────────
  {
    id: 'ja',
    ttsCode: 'ja-JP',
    nameFa: 'ژاپنی (日本語)',
    nameEn: 'Japanese',
    flag: '🇯🇵',
    color: 'from-rose-600/30 via-red-600/20 to-amber-600/20 border-rose-500/40',
    accent: 'rose',
    descFa: 'زبان هارمونی، احترام متقابل (وا)، ذن، مفاهیم ژرف ایچی‌گو ایچی‌ئه و ظرافت‌های گفت‌وگوی روزمره',
    descEn: 'The language of zen harmony, deep respect (wa), mindfulness and aesthetic connection.',
    cultureTipFa: 'در فرهنگ ژاپن، مفهوم «ایچی‌گو ایچی‌ئه (一期一会)» می‌گوید هر دیدار در زندگی موهبتی یکتا و تکرارناپذیر است؛ از این رو حتی ساده‌ترین احوالپرسی یا سفارش چای با تمام حضور قلب ادا می‌شود.',
    cultureTipEn: 'The concept of "Ichigo Ichie" teaches that every encounter is a once-in-a-lifetime treasure.',
    greetings: [
      {
        id: 'ja_1',
        phrase: 'はじめまして、どうぞよろしくお願いします (Hajimemashite, douzo yoroshiku onegaishimasu)',
        phoneticFa: 'هاجیمه‌ماشیته، دوزو یوروشیکو اونگای‌شیماس',
        meaningFa: 'از آشنایی با شما بسیار خوشبختم؛ امیدوارم رابطه و دوستی نیکویی داشته باشیم.',
        meaningEn: 'Nice to meet you; please treat me favorably.',
        categoryFa: 'معرفی اول (عبارت طلایی)',
        categoryEn: 'Golden Introduction',
        contextFa: 'نخستین و مهم‌ترین جمله هنگام معرفی به هر فرد ژاپنی',
        contextEn: 'The essential polite phrase for every first encounter'
      },
      {
        id: 'ja_2',
        phrase: 'こんにちは！今日はお元気ですか？ (Konnichiwa! Kyou wa o-genki desu ka?)',
        phoneticFa: 'کونیچیوا! کیوئو وا او-گِنکی دِس کا؟',
        meaningFa: 'سلام روز بخیر! امروز حالتان چطور است و سرحال هستید؟',
        meaningEn: 'Hello! How are you doing today?',
        categoryFa: 'احوالپرسی روزانه',
        categoryEn: 'Daily Greeting',
        contextFa: 'احوالپرسی عمومی و محترمانه در طول روز',
        contextEn: 'Standard polite midday greeting'
      },
      {
        id: 'ja_3',
        phrase: 'おはようございます！今日も良い一日を！ (Ohayou gozaimasu! Kyou mo yoi ichinichi o!)',
        phoneticFa: 'اوهایو گوزایماس! کیوئو مو یوئی ایچی‌نیچی او!',
        meaningFa: 'صبح بخیر! امروز هم روز فوق‌العاده‌ای داشته باشید!',
        meaningEn: 'Good morning! Have a wonderful day ahead!',
        categoryFa: 'صبح بخیر پرانرژی',
        categoryEn: 'Morning Energy',
        contextFa: 'هنگام شروع روز با همکاران، خانواده و دوستان',
        contextEn: 'Polite and cheerful morning greeting'
      },
      {
        id: 'ja_4',
        phrase: 'こんばんは！今日はどんな一日でしたか？ (Konbanwa! Kyou wa donna ichinichi deshita ka?)',
        phoneticFa: 'کونبانوا! کیوئو وا دونا ایچی‌نیچی دِشیتا کا؟',
        meaningFa: 'عصر و شب بخیر! امروز چطور گذشت؟',
        meaningEn: 'Good evening! How was your day?',
        categoryFa: 'عصر و شب بخیر',
        categoryEn: 'Evening Reflection',
        contextFa: 'دیدار در ساعات پایانی روز و شروع گپ شامگاهی',
        contextEn: 'Warm greeting for evening meetups'
      },
      {
        id: 'ja_5',
        phrase: 'やあ！最近どう？元気にしてた？ (Yaa! Saikin dou? Genki ni shiteta?)',
        phoneticFa: 'یاا! سایکین دو؟ گِنکی نی شیتِتا؟',
        meaningFa: 'هی سلام! این روزا چطوری؟ روبه‌راه و سلامت بودی؟',
        meaningEn: 'Hey! How have you been lately?',
        categoryFa: 'صمیمی و دوستانه',
        categoryEn: 'Casual & Friendly',
        contextFa: 'بین دوستان نزدیک، هم‌سن‌ها یا افراد خودمانی',
        contextEn: 'Warm greeting between close buddies'
      },
      {
        id: 'ja_6',
        phrase: 'お久しぶりです！お変わりないですか？ (Ohisashiburi desu! Okawari nai desu ka?)',
        phoneticFa: 'اوهیساشیبوری دِس! اوکاواری نای دِس کا؟',
        meaningFa: 'خیلی وقت بود ندیده بودمتان! همه چیز بر وفق مراد است؟',
        meaningEn: 'Long time no see! Has everything been well with you?',
        categoryFa: 'دیدار پس از غیبت',
        categoryEn: 'Long Time Reunion',
        contextFa: 'دیدن دوستی که مدت‌ها از او بی‌خبر بوده‌اید',
        contextEn: 'Warm reunion phrase when meeting after weeks/months'
      },
      {
        id: 'ja_7',
        phrase: '今日もお疲れ様でした！ (Kyou mo otsukaresama deshita!)',
        phoneticFa: 'کیوئو مو اوتسوکارِه‌ساما دِشیتا!',
        meaningFa: 'امروز هم خسته نباشید و دست‌مریزاد به همت و تلاشتان!',
        meaningEn: 'Thank you for your hard work and effort today!',
        categoryFa: 'قدردانی و خسته‌نباشید',
        categoryEn: 'Appreciation of Effort',
        contextFa: 'خداحافظی در پایان روز کاری، تمرین ورزشی یا پروژه مشترک',
        contextEn: 'Sacred cultural sign-off acknowledging teamwork'
      },
      {
        id: 'ja_8',
        phrase: 'これをお願いします。いくらですか？ (Kore o onegaishimasu. Ikura desu ka?)',
        phoneticFa: 'کوره او اونگای‌شیماس. ایکورا دِس کا؟',
        meaningFa: 'لطفاً این را برای من بیاورید. قیمتش چقدر می‌شود؟',
        meaningEn: 'This one please. How much is it?',
        categoryFa: 'سفارش و خرید',
        categoryEn: 'Shopping & Dining',
        contextFa: 'هنگام خرید در فروشگاه یا سفارش در کافه و رستوران',
        contextEn: 'Essential survival phrase in shops and restaurants'
      },
      {
        id: 'ja_9',
        phrase: 'とても美味しいです！ごちそうさまでした！ (Totemo oishii desu! Gochisousama deshita!)',
        phoneticFa: 'توتِمو اویشی دِس! گوچیسوساما دِشیتا!',
        meaningFa: 'بسیار خوشمزه و لذیذ بود! سپاس فراوان بابت این خوراک عالی!',
        meaningEn: 'It is delicious! Thank you for the wonderful meal!',
        categoryFa: 'تحسین خوراک و شکرگزاری',
        categoryEn: 'Meal Gratitude',
        contextFa: 'هنگام میل کردن غذا و پس از اتمام غذا در رستوران یا منزل میزبان',
        contextEn: 'Expressing joy during and after eating'
      },
      {
        id: 'ja_10',
        phrase: 'すみません、おすすめは何ですか？ (Sumimasen, osusume wa nan desu ka?)',
        phoneticFa: 'سومیماسِن، اوسوسومه وا نان دِس کا؟',
        meaningFa: 'ببخشید، پیشنهاد ویژه و توصیه محبوب شما چیست؟',
        meaningEn: 'Excuse me, what do you recommend?',
        categoryFa: 'درخواست پیشنهاد',
        categoryEn: 'Asking Recommendation',
        contextFa: 'پرسش از سرآشپز، باریستا یا کتاب‌فروش برای بهترین انتخاب',
        contextEn: 'Great icebreaker when exploring new places'
      },
      {
        id: 'ja_11',
        phrase: '本当にありがとうございます！助かりました。(Hontou ni arigatou gozaimasu! Tasakarimashita.)',
        phoneticFa: 'هونتو نی آریگاتو گوزایماس! تاساکاری‌ماشیتا.',
        meaningFa: 'واقعاً از صمیم قلب متشکرم! کمکتان برایم بسیار ارزشمند و نجات‌بخش بود.',
        meaningEn: 'Thank you so much! That was a huge help.',
        categoryFa: 'تشکر قلبی و عمیق',
        categoryEn: 'Heartfelt Thanks',
        contextFa: 'هنگامی که کسی در خیابان، کار یا فرودگاه به شما کمکی کرده است',
        contextEn: 'Deep appreciation when receiving helpful guidance'
      },
      {
        id: 'ja_12',
        phrase: '大丈夫ですよ、気にしないでください。(Daijoubu desu yo, ki ni shinaide kudasai.)',
        phoneticFa: 'دایجوبو دِس یو، کی نی شینایده کوداسای.',
        meaningFa: 'هیچ اشکالی ندارد و روبه‌راهم، اصلاً نگران نباشید و به دل نگیرید.',
        meaningEn: 'It is all good, please do not worry about it.',
        categoryFa: 'اطمینان‌بخشی و دلداری',
        categoryEn: 'Reassurance',
        contextFa: 'پاسخ محترمانه به کسی که عذرخواهی کرده یا نگران است',
        contextEn: 'Calming response to put the other person at ease'
      },
      {
        id: 'ja_13',
        phrase: 'すごいですね！さすがです！ (Sugoi desu ne! Sasuga desu!)',
        phoneticFa: 'سوگوی دِس نه! ساسوگا دِس!',
        meaningFa: 'فوق‌العاده و شگفت‌انگیزه! دقیقاً همان انتظاری که از مهارت شما می‌رفت!',
        meaningEn: 'That is incredible! As expected of you!',
        categoryFa: 'تشویق و تحسین',
        categoryEn: 'Compliment & Praise',
        contextFa: 'تحسین کار درخشان یک دوست یا همکار در دستاوردها',
        contextEn: 'High praise celebrating someone talent'
      },
      {
        id: 'ja_14',
        phrase: 'また近いうちにお会いしましょう！ (Mata chikai uchi ni o-ai shimashou!)',
        phoneticFa: 'ماتا چیکای اوچی نی او-آی شیماشو!',
        meaningFa: 'به امید دیداری دیگر در همین روزهای آینده!',
        meaningEn: 'Let us definitely catch up again soon!',
        categoryFa: 'بدرقه گرم و آینده‌نگر',
        categoryEn: 'Future Meetup',
        contextFa: 'خداحافظی دلنشین با امید به دیدار مجدد',
        contextEn: 'Friendly farewell sealing future connection'
      },
      {
        id: 'ja_15',
        phrase: 'お体に気をつけて、お元気で！ (O-karada ni ki o tsukete, o-genki de!)',
        phoneticFa: 'او-کارادا نی کی او تسوکِته، او-گِنکی دِه!',
        meaningFa: 'مراقب سلامتی ارزشمندتان باشید و شاداب و تندرست بمانید!',
        meaningEn: 'Take good care of your health and stay well!',
        categoryFa: 'آرزوی سلامتی و تندرستی',
        categoryEn: 'Health Blessing',
        contextFa: 'بدرقه در فصول سرد یا هنگام خداحافظی برای سفر',
        contextEn: 'Caring sign-off wishing longevity and health'
      }
    ],
    dialogues: [
      {
        id: 'ja_d1',
        titleFa: '🍵 در چای‌خانه سنتی کیوتو و سفارش ماچا',
        titleEn: '🍵 In a Traditional Kyoto Matcha Tea House',
        scenarioFa: 'وارد یک چای‌خانه باصفا در کیوتو می‌شوید و ماچای گرم همراه با شیرینی سنتی سفارش می‌دهید.',
        lines: [
          { speaker: '店員 (Staff A)', text: 'いらっしゃいませ！何名様ですか？ (Irasshaimase! Nan-mei sama desu ka?)', fa: 'خوش آمدید! چند نفر تشریف دارید؟' },
          { speaker: 'あなた (You B)', text: '一人です。窓側の席は空いていますか？ (Hitori desu. Madogiwa no seki wa aite imasu ka?)', fa: 'یک نفر هستم. صندلی کنار پنجره رو به باغچه خالی است؟' },
          { speaker: '店員 (Staff A)', text: 'はい、どうぞ！本日のおすすめは抹茶ラテです。(Hai, douzo! Honjitsu no osusume wa Matcha Latte desu.)', fa: 'بله بفرمایید! پیشنهاد ویژه امروز ما ماچا لاته سنتی است.' },
          { speaker: 'あなた (You B)', text: '美味しそうですね！それをお願いします。(Oishisou desu ne! Sore o onegaishimasu.)', fa: 'بسیار هوس‌انگیز به نظر می‌رسد! لطفاً همان را بیاورید.' },
          { speaker: '店員 (Staff A)', text: 'かしこまりました。少々お待ちください。(Kashikomarimashita. Shou-shou omachi kudasai.)', fa: 'چشم با کمال میل. لطفاً چند لحظه تأمل بفرمایید.' }
        ]
      },
      {
        id: 'ja_d2',
        titleFa: '🌸 گپ درباره سرگرمی‌ها، انیمه و فصل شکوفه‌ها',
        titleEn: '🌸 Talking About Hobbies and Sakura Season',
        scenarioFa: 'با یک دوست ژاپنی درباره علایق شخصی، انیمه و زیبایی بهار گفت‌وگو می‌کنید.',
        lines: [
          { speaker: '友人 (Friend A)', text: '休みの日はいつも何をしていますか？ (Yasumi no hi wa itsumo nani o shite imasu ka?)', fa: 'روزهای تعطیل معمولاً چه کارهایی انجام می‌دهید؟' },
          { speaker: 'あなた (You B)', text: 'アニメを見たり、散歩したりするのが好きです。(Anime o mitari, sanpo shitari suru no ga suki desu.)', fa: 'انیمه دیدن و قدم زدن در طبیعت را خیلی دوست دارم.' },
          { speaker: '友人 (Friend A)', text: 'いいですね！桜がとても綺麗ですね。(Ii desu ne! Sakura ga totemo kirei desu ne.)', fa: 'چه عالی! این روزها شکوفه‌های گیلاس (ساکورا) واقعاً تماشایی هستند.' },
          { speaker: 'あなた (You B)', text: 'はい、日本の春の景色は素晴らしいですね。(Hai, Nihon no haru no keshiki wa subarashii desu ne.)', fa: 'بله، منظره بهار در ژاپن واقعاً شگفت‌انگیز و الهام‌بخش است.' }
        ]
      },
      {
        id: 'ja_d3',
        titleFa: '🏮 در رستوران ایزاکایا و چشیدن طعم‌های اصیل',
        titleEn: '🏮 At a Cozy Izakaya Restaurant',
        scenarioFa: 'شامگاهی دلپذیر در ایزاکایا و سفارش رامن و چای سبز گرم.',
        lines: [
          { speaker: '店主 (Master A)', text: 'こんばんは！今日はお仕事帰りですか？ (Konbanwa! Kyou wa oshigoto kaeri desu ka?)', fa: 'عصر بخیر! بعد از یک روز کاری پربار تشریف آوردید؟' },
          { speaker: 'あなた (You B)', text: 'はい！温かいラーメンと緑茶をください。(Hai! Atatakai raamen to ryokucha o kudasai.)', fa: 'بله! لطفاً یک کاسه رامن داغ و چای سبز گرم برایم بیاورید.' },
          { speaker: '店主 (Master A)', text: '喜んで！特製の自家製スープですよ。(Yorokonde! Tokusei no jikasei suupu desu yo.)', fa: 'با کمال میل! سوپ دست‌ساز ویژه و اصیل ماست.' },
          { speaker: 'あなた (You B)', text: '楽しみです！いただきます！ (Tanoshimi desu! Itadakimasu!)', fa: 'بی‌صبرانه مشتاقم! با فروتنی نوش جان می‌کنم!' }
        ]
      },
      {
        id: 'ja_d4',
        titleFa: '🗺️ پرسیدن آدرس و ایستگاه مترو در توکیو',
        titleEn: '🗺️ Asking for Directions in Tokyo',
        scenarioFa: 'در تقاطع شیبویا از رهگذری مهربان آدرس نزدیک‌ترین ایستگاه را جویا می‌شوید.',
        lines: [
          { speaker: 'あなた (You B)', text: 'すみません、一番近い駅はどこですか？ (Sumimasen, ichiban chikai eki wa doko desu ka?)', fa: 'ببخشید، نزدیک‌ترین ایستگاه قطار کجاست؟' },
          { speaker: '通行人 (Local A)', text: 'あの交差点を右に曲がるとすぐですよ。(Ano kousaten o migi ni magaru to sugu desu yo.)', fa: 'اگر آن تقاطع را به سمت راست بپیچید، درست روبروی شماست.' },
          { speaker: 'あなた (You B)', text: '分かりました！本当にありがとうございます。(Wakarimashita! Hontou ni arigatou gozaimasu.)', fa: 'متوجه شدم! بی‌نهایت از راهنمایی‌تان سپاسگزارم.' },
          { speaker: '通行人 (Local A)', text: 'いいえ、お気をつけて！ (Iie, o-ki o tsukete!)', fa: 'خواهش می‌کنم، سفر و روز خوبی داشته باشید!' }
        ]
      }
    ],
    idioms: [
      {
        phrase: '一期一会 (Ichigo Ichie)',
        meaningFa: 'هر دیدار و لحظه در زندگی، موهبتی یکتا و تکرارناپذیر است.',
        example: 'Treat every encounter with the precious spirit of Ichigo Ichie.'
      },
      {
        phrase: '七転び八起き (Nana korobi ya oki)',
        meaningFa: 'هفت بار زمین خوردن، هشت بار برخاستن / نماد اراده و استقامت تسلیم‌ناپذیر',
        example: 'Never lose hope in adversity: Nana korobi ya oki.'
      },
      {
        phrase: '木漏れ日 (Komorebi)',
        meaningFa: 'پرتوهای رقصان نور خورشید که از لابلای برگ‌های درختان عبور می‌کنند.',
        example: 'Enjoying the gentle warmth of komorebi on a mindful walk.'
      },
      {
        phrase: '生きがい (Ikigai)',
        meaningFa: 'دلیل و شوق برخاستن از خواب در هر صبح؛ رسالت و معنای زندگی',
        example: 'Finding your Ikigai brings boundless peace and deep fulfillment.'
      },
      {
        phrase: '幽玄 (Yugen)',
        meaningFa: 'آگاهی عمیق و حسی سرشار از راز و زیبایی نهفته در کائنات',
        example: 'The mist over Mount Fuji evokes a profound sense of Yugen.'
      },
      {
        phrase: '侘寂 (Wabi-Sabi)',
        meaningFa: 'یافتن زیبایی و کمال در سادگی، ناتمامی و گذر طبیعی زمان',
        example: 'The cracked tea bowl with gold repair embodies Wabi-Sabi.'
      },
      {
        phrase: '初心 (Shoshin)',
        meaningFa: 'ذهن مبتدی؛ داشتن ذهنی باز، کنجکاو و خالی از غرور در یادگیری',
        example: 'In the beginner mind (Shoshin) there are many possibilities.'
      },
      {
        phrase: 'いただきます (Itadakimasu)',
        meaningFa: 'با فروتنی و سپاس از طبیعت و آفرینش، این خوراک را دریافت می‌کنم.',
        example: 'Said respectfully with hands clasped together before every meal.'
      }
    ],
    quiz: {
      questionFa: 'کدام عبارت در فرهنگ ژاپن هنگام اولین دیدار ادا می‌شود و به معنی «از آشنایی با شما خوشبختم؛ هوای مرا داشته باشید» است؟',
      questionEn: 'Which phrase is essential when meeting someone for the first time in Japan?',
      options: [
        { text: 'Hajimemashite, douzo yoroshiku onegaishimasu', correct: true, feedbackFa: 'عالی و دقیق! این جمله طلایی نشان‌دهنده ادب، تواضع و آغاز پیوند نیکوست.' },
        { text: 'Otsukaresama deshita', correct: false, feedbackFa: 'این برای تشکر و خسته‌نباشید در پایان روز کاری است!' },
        { text: 'Itadakimasu', correct: false, feedbackFa: 'این جمله قبل از میل کردن غذا گفته می‌شود!' }
      ]
    }
  },

  // ─────────────────────────────────────────────
  //  2. ENGLISH (English) — 🇬🇧
  // ─────────────────────────────────────────────
  {
    id: 'en',
    ttsCode: 'en-US',
    nameFa: 'انگلیسی (English)',
    nameEn: 'English',
    flag: '🇬🇧',
    color: 'from-blue-600/30 via-indigo-600/20 to-sky-600/20 border-blue-500/40',
    accent: 'blue',
    descFa: 'زبان بین‌المللی گفت‌وگو، شبکه‌سازی کاری، هنر Small Talk، گپ‌های قهوه و احوالپرسی‌های پرانرژی',
    descEn: 'Global lingua franca for warm greetings, business networking and casual small talk.',
    cultureTipFa: 'در فرهنگ انگلیسی‌زبانان، "Small Talk" (گپ کوتاه درباره آب‌وهوا، آخر هفته یا قهوه) یک پل ارتباطی حیاتی قبل از ورود به هر موضوع جدی است.',
    cultureTipEn: 'In English culture, small talk about weather, weekends or coffee is the essential social bridge before deep conversation.',
    greetings: [
      {
        id: 'en_1',
        phrase: 'How is everything going with you lately?',
        phoneticFa: 'هاوز اِوری‌ثینگ گوئینگ ویث یو لِیتلی؟',
        meaningFa: 'اوضاع و احوالت این روزها چطور پیش می‌رود؟',
        meaningEn: 'How are things in your life recently?',
        categoryFa: 'دوستانه و پرانرژی',
        categoryEn: 'Casual & Warm',
        contextFa: 'ایده‌آل برای شروع گپ با همکاران، دوستان و آشنایان',
        contextEn: 'Perfect for greeting friends or coworkers'
      },
      {
        id: 'en_2',
        phrase: 'It is really great to finally meet you in person!',
        phoneticFa: 'ایتس ریلی گرِیت تو فاینِلی میت یو این پِرسِن!',
        meaningFa: 'واقعاً عالیه که بالاخره حضوری با شما ملاقات می‌کنم!',
        meaningEn: 'Wonderful to meet you face-to-face!',
        categoryFa: 'رسمی و شبکه‌سازی',
        categoryEn: 'Professional Networking',
        contextFa: 'اولین دیدار با فردی که قبلاً آنلاین یا کاری با او در ارتباط بوده‌اید',
        contextEn: 'First in-person encounter with a colleague or client'
      },
      {
        id: 'en_3',
        phrase: 'Long time no see! What have you been up to?',
        phoneticFa: 'لانگ تایم نو سی! وات هَو یو بین آپ تو؟',
        meaningFa: 'خیلی وقته ندیدمت! این مدت چه خبرا بودی چیکارا کردی؟',
        meaningEn: 'Have not seen you in ages! What is new?',
        categoryFa: 'دیدار مجدد',
        categoryEn: 'Reconnection',
        contextFa: 'دیدن دوستی قدیمی پس از چند ماه یا سال',
        contextEn: 'Running into someone after a long period'
      },
      {
        id: 'en_4',
        phrase: 'Could not be better, thanks for asking! How about yourself?',
        phoneticFa: 'کودِنت بی بِتِر، ثَنکس فور اَسکینگ! هاو اِباوت یورسِلف؟',
        meaningFa: 'از این بهتر نمی‌شه، ممنون که حالم را پرسیدی! خودت چطوری؟',
        meaningEn: 'Things are fantastic, thank you! How are you?',
        categoryFa: 'پاسخ مثبت و صمیمی',
        categoryEn: 'Positive Response',
        contextFa: 'پاسخی شاداب و مثبت که مکالمه را به سمت طرف مقابل برمی‌گرداند',
        contextEn: 'An upbeat reply that keeps the conversation rolling'
      },
      {
        id: 'en_5',
        phrase: 'I really appreciate your time and kind support today.',
        phoneticFa: 'آی ریلی اَپریشی‌اِیت یور تایم اَند کایند ساپورت تودِی.',
        meaningFa: 'واقعاً بابت وقت ارزشمند و حمایت مهربانانه‌تان قدردانم.',
        meaningEn: 'Deeply thankful for your time and help.',
        categoryFa: 'قدردانی محترمانه',
        categoryEn: 'Polite Gratitude',
        contextFa: 'در پایان جلسات کاری، مشاوره یا پس از دریافت راهنمایی',
        contextEn: 'Professional and heartfelt expression of thanks'
      },
      {
        id: 'en_6',
        phrase: 'What a lovely surprise to run into you here!',
        phoneticFa: 'وات اِ لاولی سورپرایز تو ران اینتو یو هیر!',
        meaningFa: 'دیدنت در اینجا چه غافلگیری دوست‌داشتنی و قشنگیه!',
        meaningEn: 'Such a delightful surprise to bump into you!',
        categoryFa: 'دیدار تصادفی و دلنشین',
        categoryEn: 'Delightful Coincidence',
        contextFa: 'برخورد اتفاقی با یک دوست در کافه، فرودگاه یا خیابان',
        contextEn: 'Encountering a friend unexpectedly in public'
      },
      {
        id: 'en_7',
        phrase: 'Catch you later! Take it easy and have a wonderful day.',
        phoneticFa: 'کَچ یو لِیتِر! تِیک ایت ایزی اَند هَو اِ واندِرفول دِی.',
        meaningFa: 'بعداً می‌بینمت! سخت نگیر و روز فوق‌العاده‌ای داشته باش.',
        meaningEn: 'See you soon! Relax and enjoy your day.',
        categoryFa: 'خداحافظی شیک',
        categoryEn: 'Warm Farewell',
        contextFa: 'پایان دوستانه و دلنشین یک گفت‌وگوی روزمره',
        contextEn: 'A friendly and cheerful sign-off'
      },
      {
        id: 'en_8',
        phrase: 'I could not agree more with your perspective on this.',
        phoneticFa: 'آی کودِنت اَگری مور ویث یور پِرسپِکتیو آن دیس.',
        meaningFa: 'کاملاً با دیدگاه و نظر شما در این باره هم‌نظرم.',
        meaningEn: 'I totally share your viewpoint.',
        categoryFa: 'همدلی و توافق نظر',
        categoryEn: 'Agreement & Connection',
        contextFa: 'نشان دادن همدلی عمیق در گفت‌وگوهای فکری و کاری',
        contextEn: 'Expressing shared vision in intellectual discourse'
      }
    ],
    dialogues: [
      {
        id: 'en_d1',
        titleFa: '☕ سفارش در کافه و گپ کوتاه با باریستا',
        titleEn: '☕ Ordering at a Cozy Coffee Shop',
        scenarioFa: 'در یک کافه شلوغ، سفارش می‌دهید و درباره روز و هوا چند کلمه خوش‌وبش می‌کنید.',
        lines: [
          { speaker: 'Barista (A)', text: 'Good morning! What can I get started for you today?', fa: 'صبح بخیر! امروز براتون چی آماده کنم؟' },
          { speaker: 'You (B)', text: 'Morning! Could I please get a large iced vanilla oat latte?', fa: 'صبح بخیر! میشه لطفاً یک لاته بزرگ وانیلی سرد با شیر جو دوسر داشته باشم؟' },
          { speaker: 'Barista (A)', text: 'You got it! Having a busy morning so far?', fa: 'حتماً! صبحتون تا الان شلوغ و پرمشغله بوده؟' },
          { speaker: 'You (B)', text: 'Just getting started! Hope you have a smooth shift today.', fa: 'تازه شروع کردم! امیدوارم شیفت کاری آروم و خوبی داشته باشید.' },
          { speaker: 'Barista (A)', text: 'Thanks a lot! Your coffee will be right up at the counter.', fa: 'خیلی ممنون! قهوه‌تون تا یک دقیقه دیگه روی پیشخوان حاضره.' }
        ]
      },
      {
        id: 'en_d2',
        titleFa: '🤝 هم‌صحبتی در یک رویداد و علایق مشترک',
        titleEn: '🤝 Networking and Talking About Passions',
        scenarioFa: 'کنار میزی در یک همایش نشسته‌اید و سر صحبت را با فرد کناری باز می‌کنید.',
        lines: [
          { speaker: 'Person A', text: 'Excuse me, is anyone sitting here? Mind if I join you?', fa: 'ببخشید، کسی اینجا نشسته؟ اجازه هست کنارتون بشینم؟' },
          { speaker: 'You (B)', text: 'Not at all, please go ahead! I am David by the way.', fa: 'اصلاً، بفرمایید راحت باشید! راستی من دیوید هستم.' },
          { speaker: 'Person A', text: 'Nice to meet you David, I am Emma. What brought you to this event?', fa: 'از آشنایی باهات خوشوقتم دیوید، من اِما هستم. چه انگیزه‌ای باعث شد به این همایش بیای؟' },
          { speaker: 'You (B)', text: 'I am really keen on tech and mindful lifestyle design. How about yourself?', fa: 'خیلی به فناوری و سبک زندگی آگاهانه علاقه‌مندم. شما چطور؟' },
          { speaker: 'Person A', text: 'Same here! It is so refreshing to meet like-minded people.', fa: 'منم دقیقاً همینطور! چقدر حس خوبیه دیدن افرادی با علایق مشترک.' }
        ]
      },
      {
        id: 'en_d3',
        titleFa: '💡 گفت‌وگو پیرامون ایده‌های خلاقانه و پیشرفت',
        titleEn: '💡 Brainstorming Creative Ideas & Growth',
        scenarioFa: 'بحث درباره یک ایده نوآورانه برای ساخت اپلیکیشن با همکار تیم.',
        lines: [
          { speaker: 'Colleague (A)', text: 'What do you think about integrating AI into our daily workflow?', fa: 'نظرت درباره پیاده‌سازی هوش مصنوعی در کارهای روزمره‌مون چیه؟' },
          { speaker: 'You (B)', text: 'I believe it saves immense time if we use it with mindful clarity.', fa: 'به نظرم اگر با بینش روشن استفاده بشه، زمان فوق‌العاده‌ای برامون ذخیره می‌کنه.' },
          { speaker: 'Colleague (A)', text: 'Spot on! Let us prototype a simple version by this Friday.', fa: 'دقیقاً زدی به هدف! بیا تا جمعه یک نمونه اولیه ازش بسازیم.' },
          { speaker: 'You (B)', text: 'Sounds like a solid plan. Count me in!', fa: 'برنامه فوق‌العاده‌ایه. من پایه‌ام!' }
        ]
      }
    ],
    idioms: [
      {
        phrase: 'Break the ice',
        meaningFa: 'آب کردن یخ رابطه / شروع گفت‌وگو با ایجاد صمیمیت و لبخند',
        example: 'A simple genuine compliment is the best way to break the ice.'
      },
      {
        phrase: 'Hit the nail on the head',
        meaningFa: 'دقیقاً به هدف زدن / حرف کاملاً درست و بجا گفتن',
        example: 'You hit the nail on the head with that sharp observation!'
      },
      {
        phrase: 'Piece of cake',
        meaningFa: 'مثل آب خوردن / کاری که بسیار راحت و روان است',
        example: 'Do not stress about the interview, it will be a piece of cake.'
      },
      {
        phrase: 'Speak of the devil',
        meaningFa: 'حلال‌زاده است / درست وقتی صحبت از کسی می‌شود پیدایش می‌شود',
        example: 'Speak of the devil! We were just praising your new design.'
      },
      {
        phrase: 'Once in a blue moon',
        meaningFa: 'به ندرت / رویدادی که به ندرت در زندگی اتفاق می‌افتد',
        example: 'A masterpiece like this comes along once in a blue moon.'
      },
      {
        phrase: 'Burn the midnight oil',
        meaningFa: 'شب‌زنده‌داری برای کار و مطالعه با اشتیاق',
        example: 'He burned the midnight oil to build his dream application.'
      }
    ],
    quiz: {
      questionFa: 'وقتی پس از ماه‌ها یکی از دوستان قدیمی‌تان را در خیابان می‌بینید، کدام عبارت مناسب‌ترین است؟',
      questionEn: 'Which phrase is best when bumping into a long-lost friend?',
      options: [
        { text: 'Long time no see! What have you been up to?', correct: true, feedbackFa: 'کاملاً درسته! این عبارت صمیمانه‌ترین فرمول دیدار مجدد در زبان انگلیسی است.' },
        { text: 'Break a leg and bon appétit!', correct: false, feedbackFa: 'این عبارت برای آرزوی موفقیت در تئاتر است!' },
        { text: 'Excuse me, where is the nearest train station?', correct: false, feedbackFa: 'این برای آدرس پرسیدن از رهگذران است!' }
      ]
    }
  },

  // ─────────────────────────────────────────────
  //  3. FRENCH (Français) — 🇫🇷
  // ─────────────────────────────────────────────
  {
    id: 'fr',
    ttsCode: 'fr-FR',
    nameFa: 'فرانسوی (Français)',
    nameEn: 'French',
    flag: '🇫🇷',
    color: 'from-rose-600/30 via-purple-600/20 to-indigo-600/20 border-rose-500/40',
    accent: 'rose',
    descFa: 'زبان فرهنگ، هنر، فلسفه، شعر و ادب فرانسوی و هنر زیستن با وقار (L’art de vivre)',
    descEn: 'The language of romance, culture, philosophical debate and elegant manners.',
    cultureTipFa: 'در فرانسه، گفتن "Bonjour" هنگام ورود به هر مکان (حتی سوپرمارکت و آسانسور) نشانه احترام اولیه و کلید گشایش هر گفت‌وگویی است.',
    cultureTipEn: 'In France, saying "Bonjour" before asking anything is sacred etiquette for warmth and respect.',
    greetings: [
      {
        id: 'fr_1',
        phrase: 'Bonjour ! Comment allez-vous aujourd\'hui ?',
        phoneticFa: 'بُنژور ! کومان تالِه‌وو اُژوردویی ؟',
        meaningFa: 'سلام روز بخیر! امروز حالتان چطور است؟',
        meaningEn: 'Hello! How are you doing today?',
        categoryFa: 'محترمانه و رسمی',
        categoryEn: 'Polite & Formal',
        contextFa: 'احوالپرسی محترمانه در محیط کار، فروشگاه یا با افراد محترم',
        contextEn: 'Polite daily greeting for professionals & elders'
      },
      {
        id: 'fr_2',
        phrase: 'Salut ! Ça va bien ? Quoi de neuf de beau ?',
        phoneticFa: 'سَلو ! سا وا بیَن ؟ کوا دُ نُف دُ بو ؟',
        meaningFa: 'سلام! روبه‌راهی؟ چه خبرا، چه اتفاق قشنگی افتاده؟',
        meaningEn: 'Hi! How are things? What is good?',
        categoryFa: 'دوستانه و صمیمی',
        categoryEn: 'Casual & Friendly',
        contextFa: 'احوالپرسی صمیمی با دوستان و هم‌سن‌وسال‌ها',
        contextEn: 'Warm greeting among peers and friends'
      },
      {
        id: 'fr_3',
        phrase: 'Ravi(e) de faire votre connaissance !',
        phoneticFa: 'راوی دُ فِر وُتر کونِسانس !',
        meaningFa: 'از آشنایی با شما بسیار خوشبخت و خرسندم!',
        meaningEn: 'Delighted to make your acquaintance!',
        categoryFa: 'آشنایی اول',
        categoryEn: 'First Introduction',
        contextFa: 'وقتی برای نخستین بار به فردی معرفی می‌شوید',
        contextEn: 'When introduced to someone for the first time'
      },
      {
        id: 'fr_4',
        phrase: 'Ça fait un bail ! Tu deviens quoi ces temps-ci ?',
        phoneticFa: 'سا فِ اَن بای ! تو دُویَن کوا سِ تان‌سی ؟',
        meaningFa: 'خیلی وقته ندیدمت! این روزها مشغول چه کارهایی هستی؟',
        meaningEn: 'It has been ages! What have you been up to?',
        categoryFa: 'دیدار پس از غیبت',
        categoryEn: 'Long Time Reunion',
        contextFa: 'دیدن دوستی که چند ماهی از او بی‌خبر بوده‌اید',
        contextEn: 'Greeting someone you have not seen in a while'
      },
      {
        id: 'fr_5',
        phrase: 'Je vous remercie du fond du cœur pour votre aide.',
        phoneticFa: 'ژو وو رِمِرسی دو فون دو کُر پور وُتر اِد.',
        meaningFa: 'از صمیم قلب بابت کمک و راهنمایی ارزشمندتان سپاسگزارم.',
        meaningEn: 'Thank you from the bottom of my heart for your help.',
        categoryFa: 'تشکر قلبی و فاخر',
        categoryEn: 'Heartfelt Gratitude',
        contextFa: 'قدردانی صمیمانه و باکلاس در ارتباطات روزمره',
        contextEn: 'Expressing heartfelt thankfulness'
      },
      {
        id: 'fr_6',
        phrase: 'Passez une excellente journée ! À très bientôt !',
        phoneticFa: 'پاسِه اون اِکسِلانت ژورنِه ! اَ ترِه بیَنتو !',
        meaningFa: 'روز فوق‌العاده‌ای داشته باشید! به امید دیدار خیلی زود!',
        meaningEn: 'Have a wonderful day! See you very soon!',
        categoryFa: 'بدرقه و خداحافظی',
        categoryEn: 'Warm Farewell',
        contextFa: 'خداحافظی پرانرژی و سرشار از ادب فرانسوی',
        contextEn: 'A joyful and polite farewell'
      }
    ],
    dialogues: [
      {
        id: 'fr_d1',
        titleFa: '🥐 در کافه بیسترو پاریسی و سفارش صبحانه',
        titleEn: '🥐 At a Parisian Bistro Café',
        scenarioFa: 'در تراس کافه‌ای در پاریس می‌نشینید و صبحانه سنتی فرانسوی سفارش می‌دهید.',
        lines: [
          { speaker: 'Serveur (A)', text: 'Bonjour monsieur/madame ! Que puis-je vous servir ?', fa: 'سلام روز بخیر! چه چیزی براتون بیارم؟' },
          { speaker: 'Vous (B)', text: 'Bonjour ! Un café crème et un croissant bien chaud, s\'il vous plaît.', fa: 'سلام! یک قهوه کرم‌دار و یک کروسان داغ و تازه لطفاً.' },
          { speaker: 'Serveur (A)', text: 'Parfait ! Vous vous installez en terrasse ?', fa: 'عالیه! در تراس فضای باز میل دارید بنشینید؟' },
          { speaker: 'Vous (B)', text: 'Oui, il fait un temps magnifique ce matin !', fa: 'بله، امروز صبح هوای فوق‌العاده دلپذیری داره!' },
          { speaker: 'Serveur (A)', text: 'C\'est vrai, profitez-en bien. Je vous apporte ça tout de suite.', fa: 'کاملاً درسته، حسابی لذت ببرید. الان براتون می‌آورم.' }
        ]
      },
      {
        id: 'fr_d2',
        titleFa: '🎨 صحبت درباره آخر هفته و گالری هنری',
        titleEn: '🎨 Weekend Plans and Art Exhibitions',
        scenarioFa: 'با دوست فرانسوی‌تان درباره برنامه‌های تفریحی آخر هفته گپ می‌زنید.',
        lines: [
          { speaker: 'Ami(e) (A)', text: 'Salut ! Tu as prévu quelque chose de sympa ce week-end ?', fa: 'سلام! آخر این هفته برنامه جالبی داری؟' },
          { speaker: 'Vous (B)', text: 'Salut ! Je pense visiter une nouvelle exposition d\'art moderne.', fa: 'سلام! فکر کنم برم بازدید از یک نمایشگاه هنر مدرن جدید.' },
          { speaker: 'Ami(e) (A)', text: 'Quelle bonne idée ! C\'est dans quel quartier ?', fa: 'چه ایده خوبی! تو کدوم محله است؟' },
          { speaker: 'Vous (B)', text: 'C\'est près du Louvre. Tu veux m\'accompagner ?', fa: 'نزدیک موزه لووره. دوست داری باهام بیای؟' },
          { speaker: 'Ami(e) (A)', text: 'Avec grand plaisir ! On se retrouve samedi matin.', fa: 'با کمال میل! پس صبح شنبه همدیگه رو می‌بینیم.' }
        ]
      }
    ],
    idioms: [
      {
        phrase: 'C\'est la vie !',
        meaningFa: 'زندگی همینه! / پذیرش رویدادها با آرامش و لبخند',
        example: 'On a raté le train, mais c\'est la vie !'
      },
      {
        phrase: 'Joie de vivre',
        meaningFa: 'شوق و لذت بی‌پایان از نفس کشیدن و زیستن در هر روز',
        example: 'She always brings a delightful joie de vivre to every meeting.'
      },
      {
        phrase: 'Avoir le coup de foudre',
        meaningFa: 'عشق در یک نگاه / شیفته چیزی یا کسی شدن در لحظه اول',
        example: 'J\'ai eu un vrai coup de foudre pour cette ville magique.'
      },
      {
        phrase: 'Poser un lapin',
        meaningFa: 'سر کار گذاشتن / سر قرار نیامدن بدون اطلاع قبلی',
        example: 'Il ne m\'a pas prévenu, il m\'a posé un lapin !'
      }
    ],
    quiz: {
      questionFa: 'معادل مؤدبانه و رسمی «از آشنایی با شما بسیار خرسندم» در زبان فرانسوی کدام است؟',
      questionEn: 'How do you say Pleased to meet you politely in French?',
      options: [
        { text: 'Ravi(e) de faire votre connaissance !', correct: true, feedbackFa: 'بسیار عالی! این شیک‌ترین فرمول معارفه در زبان فرانسه است.' },
        { text: 'Poser un lapin au bistro', correct: false, feedbackFa: 'این اصطلاح به معنی سر قرار نیامدن است!' },
        { text: 'Bon appétit et au revoir', correct: false, feedbackFa: 'این برای نوش جان گفتن سر میز غذاست!' }
      ]
    }
  }
];
