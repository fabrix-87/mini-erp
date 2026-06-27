import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("errors");

  return {
    title: t("title"),
    description: t("description"),
  };
}

const Error = async () => {
  const t = await getTranslations("errors");
  const tc = await getTranslations("common");

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/images/backgrounds/errorimg.svg"
          alt={t("title")}
          loading="eager"
          width={400}
          height={300}
          className="mb-4 w-100 h-auto"
        />
        <h1 className="text-4xl font-bold mb-6">Oops!</h1>
        <p className="text-xl text-muted-foreground">{t("message")}</p>
        <Button asChild className="mt-6">
          <Link href="/">{tc("actions.back_to_home")}</Link>
        </Button>
      </div>
    </div>
  );
};

export default Error;
