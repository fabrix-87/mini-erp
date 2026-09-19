import { DOCUMENT_TITLES, DocumentTypePageProps, VALID_TYPES } from "@/types/document";
import { Metadata } from "next";

export { cn } from "cn";

export async function generateDocumentMetadata({
  params,
}: DocumentTypePageProps): Promise<Metadata> {
  const { type } = await params;

  if (!VALID_TYPES.includes(type)) {
    return { title: "Non trovato" };
  }

  const titles = DOCUMENT_TITLES[type];
  return {
    title: `${titles.plural} | Vendite`,
    description: `Gestisci i tuoi ${titles.plural.toLowerCase()}`,
  };
}

export async function generateDocumentStaticParams() {
  return VALID_TYPES.map((type) => ({
    type,
  }));
}

export const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};
