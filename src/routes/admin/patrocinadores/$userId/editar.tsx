import { createFileRoute } from "@tanstack/react-router";

import { SponsorEditPage } from "@/pages/sponsor/sponsor-edit-page";

export const Route = createFileRoute("/admin/patrocinadores/$userId/editar")({
  component: SponsorEditRoute,
});

function SponsorEditRoute() {
  const { userId } = Route.useParams();
  return <SponsorEditPage userId={userId} />;
}
