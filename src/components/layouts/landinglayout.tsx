import { Outlet, useLocation } from 'react-router'
import { LanguageProvider } from '../../context/LanguageContext'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMaintenanceMode } from '@/server/main'
import LandingNavbar from '../landing/landing-navbar'
import LandingFooter from '../landing/landing-footer'
import ReactPixel from 'react-facebook-pixel'
const LandingLayout = () => {
  const { pathname } = useLocation();
  const { data } = useQuery({
    queryKey: ["maintenance-mode"],
    queryFn: () => getMaintenanceMode(),
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    ReactPixel.pageView();
  }, [pathname])

  if ((data?.maintenance_mode?.front_active && data?.maintenance_mode?.back_active) || data?.maintenance_mode?.front_active || data?.maintenance_mode?.back_active) {
    return (
      <div className='flex flex-col justify-center items-center h-screen'>
        <h1 className='text-2xl font-bold text-center text-zinc-500'>Website Under Maintenance</h1>
      </div>
    )
  }

  return (
    <LanguageProvider>
      <main className='flex flex-col pt-20'>
        <LandingNavbar />
        <Outlet />
        <LandingFooter />
      </main>
    </LanguageProvider>
  )
}

export default LandingLayout
