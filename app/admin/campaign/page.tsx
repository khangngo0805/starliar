import { AdminNav } from "@/components/admin/admin-nav";
import { CampaignForm } from "@/components/admin/campaign-form";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminCampaignPage() {
  await requireAdmin();
  const media = await prisma.campaignMedia.findMany({ orderBy: { position: "asc" } });

  return (
    <main className="admin-shell">
      <AdminNav />
      <h1>Campaign media</h1>
      <CampaignForm />
      <div className="admin-list">
        {media.map((item) => (
          <article className="admin-row" key={item.id}>
            <span>{item.title}</span>
            <span>{item.kind}</span>
            <span>{item.src}</span>
          </article>
        ))}
      </div>
    </main>
  );
}
