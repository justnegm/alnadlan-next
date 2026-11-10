import { serverFetchOrNull } from "@/server/http";
import { isMaintenanceActive, MaintenanceScreen } from "@/server/maintenance";
import placeholder from "@/assets/placeholder.webp";

type AuthMedia = {
  image?: string | null;
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [maintenance, media] = await Promise.all([
    isMaintenanceActive(),
    serverFetchOrNull<AuthMedia>("/pages/auth/", { revalidate: 300 }),
  ]);

  if (maintenance) {
    return <MaintenanceScreen />;
  }

  return (
    <main
      className="w-full min-h-screen bg-center bg-no-repeat bg-cover flex items-center py-10"
      style={{ backgroundImage: `url(${media?.image ?? placeholder.src})` }}
    >
      {children}
    </main>
  );
}
