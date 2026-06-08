import React, { createContext, useContext, useState } from "react";

type Lang = "en" | "gu";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Home page
    messageUs: "Message Us",
    all: "All",
    groundnut: "Groundnut",
    sunflower: "Sunflower",
    cottonseed: "Cottonseed",
    Cottonseed: "Cottonseed",
    updated: "Updated:",
    perTin: "Per Tin",
    perLiter: "/L",
    Groundnut: "Groundnut",
    Sunflower: "Sunflower",
    "Maruti Groundnut Oil": "Maruti Groundnut Oil",
    "Maharani Refined Groundnut Oil": "Maharani Refined Groundnut Oil",
    "Saraswati Groundnut Oil": "Saraswati Groundnut Oil",
    "Saurashtra Pure Oil": "Saurashtra Pure Oil",
    "Amrut Dhara Groundnut Oil": "Amrut Dhara Groundnut Oil",
    "Sungold Refined Sunflower Oil": "Sungold Refined Sunflower Oil",
    "Sunfit Refined Sunflower Oil": "Sunfit Refined Sunflower Oil",
    "Sun Health Refined Sunflower Oil": "Sun Health Refined Sunflower Oil",
    "Sun Fresh Refined Sunflower Oil": "Sun Fresh Refined Sunflower Oil",
    "Natural Life Sunflower Brand": "Natural Life Sunflower Brand",
    "Sun Plus Refined Sunflower": "Sun Plus Refined Sunflower",
    "Organic Forsun Refined Sunflower": "Organic Forsun Refined Sunflower",
    "Forline Refined Sunflower Oil": "Forline Refined Sunflower Oil",
    "Forking Sungold Refined Sunflower": "Forking Sungold Refined Sunflower",

    // Admin login
    adminAccess: "Admin Access",
    enterPassword: "Enter the shopkeeper password to manage prices",
    enterPasswordPlaceholder: "Enter password",
    login: "Login",
    incorrectPassword: "Incorrect password. Please try again.",
    
    // Admin panel
    adminPanel: "Admin Panel",
    prices: "Prices",
    messages: "Messages",
    saveAll: "Save All",
    saving: "Saving…",
    printBills: "Print Bills",
    bill: "Bill",
    generated: "Generated:",
    unableToOpenWindow: "Unable to open window",
    allowPopups: "Please allow popups for this site.",
    print: "Print",
    printUnsupported: "Direct printing is supported on web only in this build. I can add server-side printing if you want.",
    noMessagesYet: "No messages yet",
    messagesSubtitle: "Customer messages will appear here. Pull down to refresh.",
    anonymous: "Anonymous",
    markAsRead: "Mark as read",
    editPriceInfo: "Edit the price per tin for each oil. Tap \"Save All\" when done.",
    changePassword: "Change Password",
    invalidPrice: "Invalid Price",
    allPricesMustBeValid: "All prices must be valid numbers.",
    priceSaved: "Saved!",
    pricesUpdatedSuccessfully: "Prices updated successfully.",
    tooShort: "Too Short",
    passwordMustBeAtLeast: "Password must be at least 4 characters.",
    mismatch: "Mismatch",
    passwordsDoNotMatch: "Passwords do not match.",
    done: "Done",
    passwordChangedSuccessfully: "Password changed successfully.",
    newPassword: "New password (min 4 chars)",
    confirmPassword: "Confirm password",
    updatePassword: "Update Password",
    allOils: "All Oils",

    // Message screen
    messageShopkeeper: "Message Shopkeeper",
    messageSentTitle: "Message Sent!",
    messageSentSubtitle:
      "The shopkeeper has received your message and will get back to you soon.",
    backToBoard: "Back to Price Board",
    writeMessageError: "Please write a message before sending.",
    sendFailed: "Could not send message. Please try again.",
    sendMessage: "Send Message",
    sending: "Sending...",
    yourName: "Your Name (optional)",
    phoneNumber: "Phone Number (optional)",
    messageLabel: "Message",
    inputPlaceholderName: "e.g. Ramesh Patel",
    inputPlaceholderPhone: "e.g. 9876543210",
    inputPlaceholderMessage: "Type your message here...",
  },
  gu: {
    // Home page
    messageUs: "અમને સંદેશ મોકલો",
    all: "બધું",
    groundnut: "મગફળી",
    sunflower: "સૂર્યમુખી",
    cottonseed: "કપાસિયા તેલ",
    Cottonseed: "કપાસિયા તેલ",
    updated: "અપડેટ કર્યું:",
    perTin: "ટીન દીઠ",
    perLiter: "/લીટર",
    Groundnut: "મગફળી",
    Sunflower: "સૂર્યમુખી",
    "Maruti Groundnut Oil": "મરુતિ મગફળી તેલ",
    "Maharani Refined Groundnut Oil": "મહારાણી રિફાઈન્ડ મગફળી તેલ",
    "Saraswati Groundnut Oil": "સરસ્વતી મગફળી તેલ",
    "Saurashtra Pure Oil": "સૌરાષ્ટ્ર પ્યોર તેલ",
    "Amrut Dhara Groundnut Oil": "અમૃતધારા મગફળી તેલ",
    "Sungold Refined Sunflower Oil": "સનગોલ્ડ રિફાઈન્ડ સૂર્યમુખી તેલ",
    "Sunfit Refined Sunflower Oil": "સનફિટ રિફાઈન્ડ સૂર્યમુખી તેલ",
    "Sun Health Refined Sunflower Oil": "સન હેલ્થ રિફાઈન્ડ સૂર્યમુખી તેલ",
    "Sun Fresh Refined Sunflower Oil": "સન ફ્રેશ રિફાઈન્ડ સૂર્યમુખી તેલ",
    "Natural Life Sunflower Brand": "નેચરલ લાઈફ સૂર્યમુખી તેલ",
    "Sun Plus Refined Sunflower": "સન પ્લસ રિફાઈન્ડ સૂર્યમુખી",
    "Organic Forsun Refined Sunflower": "ઑર્ગેનિક ફોર્સન રિફાઈન્ડ સૂર્યમુખી",
    "Forline Refined Sunflower Oil": "ફોર્લાઇન રિફાઈન્ડ સૂર્યમુખી તેલ",
    "Forking Sungold Refined Sunflower": "ફોર્કિંગ સનગોલ્ડ રિફાઈન્ડ સૂર્યમુખી",

    // Admin login
    adminAccess: "એડમિન એક્સેસ",
    enterPassword: "ભાવ સંચાલિત કરવા માટે દુકાનદારનો પાસવર્ડ દાખલ કરો",
    enterPasswordPlaceholder: "પાસવર્ડ દાખલ કરો",
    login: "લૉગિન",
    incorrectPassword: "ખોટો પાસવર્ડ. કૃપા કરીને ફરી પ્રયાસ કરો.",
    
    // Admin panel
    adminPanel: "એડમિન પેનલ",
    prices: "ભાવ",
    messages: "સંદેશો",
    saveAll: "સાચવો",
    saving: "સાચવવામાં આવી રહ્યું છે…",
    printBills: "બિલ પ્રિન્ટ કરો",
    bill: "બિલ",
    generated: "જનરેટ થયેલું:",
    unableToOpenWindow: "વિન્ડો ખોલવાનું શક્ય નથી",
    allowPopups: "કૃપા કરીને આ સાઇટ માટે પોપઅપની મંજૂરી આપો.",
    print: "પ્રિન્ટ",
    printUnsupported: "આ બિલ્ડમાં ડાયરેક્ટ પ્રિન્ટિંગ ફક્ત વેબ પર સમર્થિત છે. હું સર્વર-સાઇડ પ્રિન્ટિંગ ઉમેરવા માટે તૈયાર છું.",
    noMessagesYet: "હજી સુધી કોઈ સંદેશો નથી",
    messagesSubtitle: "ગ્રાહકના સંદેશા અહીં દેખાશે. રિફ્રેશ કરવા માટે ખેંચો.",
    anonymous: "અજ્ઞાત",
    markAsRead: "વાંચેલું છે",
    editPriceInfo: "દરેક તેલના ટીન દીઠ ભાવમાં ફેરફાર કરો. પૂર્ણ થાય તો \"સાચવો\" પર ક્લિક કરો.",
    changePassword: "પાસવર્ડ બદલો",
    invalidPrice: "અમાન્ય ભાવ",
    allPricesMustBeValid: "બધા ભાવ માન્ય સંખ્યા હોવા જોઈએ.",
    priceSaved: "સાચવાયું!",
    pricesUpdatedSuccessfully: "ભાવ સફળતાપૂર્વક અપડેટ કર્યા.",
    tooShort: "ખૂબ ટૂંકું",
    passwordMustBeAtLeast: "પાસવર્ડ ઓછામાં ઓછા 4 અક્ષરનો હોવો જોઈએ.",
    mismatch: "અસંમતિ",
    passwordsDoNotMatch: "પાસવર્ડ મેળ ખાતા નથી.",
    done: "પૂર્ણ",
    passwordChangedSuccessfully: "પાસવર્ડ સફળતાપૂર્વક બદલાયું.",
    newPassword: "નવો પાસવર્ડ (ન્યૂનતમ 4 અક્ષર)",
    confirmPassword: "પાસવર્ડ પુષ્ટિ કરો",
    updatePassword: "પાસવર્ડ અપડેટ કરો",
    allOils: "બધી તેલ્સ",

    // Message screen
    messageShopkeeper: "દુકાનદારને સંદેશો મોકલો",
    messageSentTitle: "સંદેશ મોકલાયો!",
    messageSentSubtitle:
      "દુકાનદારને તમારો સંદેશ મળી ગયો છે અને તેઓ જલ્દી જવાબ આપશે.",
    backToBoard: "પ્રાઈસ બોર્ડ પર પાછા જાઓ",
    writeMessageError: "મેસેજ મોકલવા પહેલાં કૃપા કરીને લખો.",
    sendFailed: "સંદેશ મોકલી શકાયો નહીં. કૃપા કરીને ફરી પ્રયાસ કરો.",
    sendMessage: "સંદેશ મોકલો",
    sending: "મોકલાયું...",
    yourName: "તમારું નામ (વૈકલ્પિક)",
    phoneNumber: "ફોન નંબર (વૈકલ્પિક)",
    messageLabel: "સંદેશ",
    inputPlaceholderName: "ઉદાહરણ: રમેશ પટેલ",
    inputPlaceholderPhone: "ઉદાહરણ: 9876543210",
    inputPlaceholderMessage: "અહીં તમારો સંદેશ ટાઈપ કરો...",
  },
};

const LanguageContext = createContext<{
  lang: Lang;
  toggle: () => void;
  t: (key: string) => string;
} | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("gu");

  const toggle = () => setLang((l) => (l === "en" ? "gu" : "en"));

  const t = (key: string) => {
    return translations[lang][key] ?? translations["en"][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export default LanguageContext;
