import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
import { pageService } from "@/services/payload";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug?: string }>;
};

export default async function FerryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "ferry";

  const page = await pageService.getBySlug(slug);

  if (!page || !page.pageContent?.content) {
    notFound();
  }

  if (page.publishingSettings?.status !== "published") {
    notFound();
  }

  return <BlockRenderer blocks={page.pageContent.content} />;
}
