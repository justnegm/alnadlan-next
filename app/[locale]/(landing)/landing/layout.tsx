import LandingNavbar from "@/components/landing/landing-navbar";
import LandingFooter from "@/components/landing/landing-footer";
import { isMaintenanceActive, MaintenanceScreen } from "@/server/maintenance";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await isMaintenanceActive()) {
    return <MaintenanceScreen />;
  }

  return (
    <main className="flex flex-col pt-20">
      <LandingNavbar />
      {children}
      <LandingFooter />
    </main>
  );
}
