import { PageHeader } from "@/components/admin/PageHeader";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

export const dynamic = "force-dynamic";
export default function AdminMediaPage() {
  return (
    <>
      <PageHeader
        title="Image library"
        description="Keep book covers, author portraits and article images in one place."
      />
      <MediaLibrary />
    </>
  );
}
