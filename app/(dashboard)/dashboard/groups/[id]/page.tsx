import { GroupDetailContent } from "@/components/dashboard/groups/group-detail-content";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <GroupDetailContent groupId={id} />;
}
