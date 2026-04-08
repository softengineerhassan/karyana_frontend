import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const loadResources = async (lng) => {
  try {
    const response = await fetch(`/locales/${lng}/translation.json`);
    if (!response.ok) throw new Error("Translation file not found");
    return await response.json();
  } catch (error) {
    console.error("Error loading translations:", error);
    return {};
  }
};

i18n.use(initReactI18next).init({
  resources: {},
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

const initializeI18n = async () => {
  const defaultLang = localStorage.getItem("currentLang") || "en";
  const translations = await loadResources(defaultLang);

  i18n.addResourceBundle(defaultLang, "translation", translations, true, true);
  i18n.changeLanguage(defaultLang);
  document.documentElement.setAttribute("lang", defaultLang);
  document.documentElement.setAttribute(
    "dir",
    defaultLang === "ar" ? "rtl" : "ltr"
  );
};

initializeI18n();

// export const changeLanguage = async (lng) => {
//   if (!i18n.hasResourceBundle(lng, "translation")) {
//     const translations = await loadResources(lng);
//     i18n.addResourceBundle(lng, "translation", translations, true, true);
//   }

//   i18n.changeLanguage(lng);
//   localStorage.setItem("currentLang", lng);
//   document.documentElement.setAttribute("lang", lng);
//   document.documentElement.setAttribute("dir", lng === "ar" ? "rtl" : "ltr");
// };
export const changeLanguage = async (lng) => {
  const currentLang = i18n.language;

  if (currentLang === lng) return;

  // Always reload translations to ensure fresh data
  const translations = await loadResources(lng);
  i18n.addResourceBundle(lng, "translation", translations, true, true);

  localStorage.setItem("currentLang", lng);

  if (window.google && window.google.maps) {
    window.location.reload();
    return;
  }

  await i18n.changeLanguage(lng);

  document.documentElement.setAttribute("lang", lng);
  document.documentElement.setAttribute("dir", lng === "ar" ? "rtl" : "ltr");
};

export default i18n;
    