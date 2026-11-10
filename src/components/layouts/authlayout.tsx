import { Outlet } from 'react-router'
import { LanguageProvider } from '../../context/LanguageContext'
import { useQuery } from '@tanstack/react-query';
import { getMaintenanceMode } from '@/server/main';
import { getAuthMedia } from '@/server/media';
import placeholder from '@/assets/placeholder.webp';
const AuthLayout = () => {
  const { data } = useQuery({
    queryKey: ["maintenance-mode"],
    queryFn: () => getMaintenanceMode(),
  });
  const { data: media } = useQuery({
    queryKey: ["auth-media"],
    queryFn: () => getAuthMedia(),
  });


  if ((data?.maintenance_mode?.front_active && data?.maintenance_mode?.back_active) || data?.maintenance_mode?.front_active || data?.maintenance_mode?.back_active) {
    return (
      <div className='flex flex-col justify-center items-center h-screen'>
        <h1 className='text-2xl font-bold text-center text-zinc-500'>Website Under Maintenance</h1>
      </div>
    )
  }
  return (
    <LanguageProvider>
      <main className='w-full min-h-screen bg-center bg-no-repeat bg-cover flex items-center py-10' style={{ backgroundImage: `url(${media?.image ?? placeholder})` }}>
        <Outlet />
      </main>
    </LanguageProvider>
  )
}

export default AuthLayout