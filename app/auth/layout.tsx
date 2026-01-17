import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteShell } from "@/components/site-shell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteShell>
      <SiteHeader />
      <main className="mt-10 flex justify-center">{children}</main>
      <SiteFooter />
    </SiteShell>
  );
}
