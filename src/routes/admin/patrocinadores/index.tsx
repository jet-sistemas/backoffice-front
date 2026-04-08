import { createFileRoute } from "@tanstack/react-router";

import { SponsorListPage } from "@/pages/sponsor/sponsor-list-page";

export const Route = createFileRoute("/admin/patrocinadores/")({
  component: SponsorListPage,
});
