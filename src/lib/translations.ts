const translations = {
  ar: {
    viewAll: "مشاهدة الكل",
    back: "رجوع",
    price: "السعر",
    seeMore: "رؤية المزيد",
    seeLess: "رؤية اقل",
    home: "الرئيسية",
    allRights: "جميع الحقوق محفوظة",
    terms: "الشروط والاحكام",
    startNow: "ابدأ الان",
    fullname: "الاسم الكامل",
    email: "البريد الالكتروني",
    phone: "الهاتف",
    subject: "الموضوع",
    message: "الرسالة",
    send: "ارسال",
    success: "تم الارسال بنجاح",
    to: "الي",
    all: "الكل",
    joinus: "انضم الينا",
    from: "من",
    search: "بحث",
  },
  he: {
    viewAll: "הצג הכל",
    back: "חזרה",
    price: "מחירה",
    seeMore: "ראה יותר",
    seeLess: "ראה פחות",
    home: "בית",
    allRights: "כל הזכויות שמורות",
    terms: "תנאים והגבלות",
    startNow: "התחל עכשיו",
    fullname: "שם מלא",
    email: "אימייל",
    phone: "טלפון",
    subject: "נושא",
    message: "הודעה",
    send: "שלח",
    success: "נשלח בהצלחה",
    to: "אל",
    all: "הכל",
    joinus: "הצטרף אלינו",
    from: "מ",
    search: "חיפוש",
  },
};

export type Language = "ar" | "he";
type TranslationKey = keyof typeof translations.ar;

export const translate = (key: TranslationKey, lang: Language): string =>
  translations[lang][key] || key;
