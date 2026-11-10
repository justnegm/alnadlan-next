import Navbar from "@/components/main/navbar";
import Footer from "@/components/main/footer";
import ContactButton from "@/components/ui/contact-button";
import ContactAll from "@/components/main/contact-all";
import { isMaintenanceActive, MaintenanceScreen } from "@/server/maintenance";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await isMaintenanceActive()) {
    return <MaintenanceScreen />;
  }

  return (
    <main className="flex flex-col gap-20">
      <Navbar />
      {children}
      <Footer />
      <ContactButton />
      <ContactAll />
    </main>
  );
}
