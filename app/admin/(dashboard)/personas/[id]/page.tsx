import { auth } from "@/auth";
import { can } from "@/lib/permissions";
import { PersonDetail } from "@/components/admin/PersonDetail";

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  return (
    <PersonDetail
      id={id}
      canViewConfidential={can(session?.user, "viewConfidential")}
      canPublish={can(session?.user, "publish")}
      canDelete={can(session?.user, "delete")}
    />
  );
}
