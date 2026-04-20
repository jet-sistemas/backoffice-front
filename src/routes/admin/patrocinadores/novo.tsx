import { createFileRoute } from "@tanstack/react-router";

import { SponsorCreatePage } from "@/pages/sponsor/sponsor-create-page";

export const Route = createFileRoute("/admin/patrocinadores/novo")({
  component: SponsorCreatePage,
});
