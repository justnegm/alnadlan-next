// Server-side maintenance-mode check shared by the (main), (landing) and
// (auth) layouts. Mirrors getMaintenanceMode in src/server/main.ts but runs
// on the server via serverFetch so layouts can gate rendering before HTML
// is sent.
import { serverFetchOrNull } from "@/server/http";

type MaintenanceResponse = {
  maintenance_mode?: {
    front_active?: boolean;
    back_active?: boolean;
  };
};

/** True when the site should show the maintenance screen. Fails open (false) on API errors. */
export async function isMaintenanceActive(): Promise<boolean> {
  const data = await serverFetchOrNull<MaintenanceResponse>(
    "/core/maintenance-mode/",
    { revalidate: 60 },
  );
  return Boolean(
    data?.maintenance_mode?.front_active || data?.maintenance_mode?.back_active,
  );
}

/** The screen rendered while maintenance mode is active. */
export function MaintenanceScreen() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-2xl font-bold text-center text-zinc-500">
        Website Under Maintenance
      </h1>
    </div>
  );
}
