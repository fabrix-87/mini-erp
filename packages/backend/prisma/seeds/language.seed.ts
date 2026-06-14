import { prisma } from "@/config/prisma-config";

const LANGUAGE_DATA = [
  { id: 1, isoCode: "it", name: "Italiano", languageCode: "it_IT" },
  { id: 2, isoCode: "en", name: "English", languageCode: "en_US" },
  { id: 3, isoCode: "fr", name: "Français", languageCode: "fr_FR" },
  { id: 4, isoCode: "de", name: "Deutsch", languageCode: "de_DE" },
  { id: 5, isoCode: "es", name: "Español", languageCode: "es_ES" },
];

async function main() {
  console.log("Inizio del seeding...");

  // 1. LANGUAGE
  console.log("Seeding Language...");
  for (const lang of LANGUAGE_DATA) {
    await prisma.language.upsert({
      where: { isoCode: lang.isoCode },
      update: {},
      create: lang,
    });
  }
  console.log("Seed language completato");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
