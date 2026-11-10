import { Outlet, useLocation } from 'react-router'
import { LanguageProvider } from '../../context/LanguageContext'
import Navbar from '../main/navbar'
import Footer from '../main/footer'
import { useEffect } from 'react'
import ContactButton from '../ui/contact-button'
import ContactAll from '../main/contact-all'
import { useQuery } from '@tanstack/react-query'
import { getMaintenanceMode } from '@/server/main'
import ReactPixel from 'react-facebook-pixel'

const MainLayout = () => {
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
      <main className='flex flex-col gap-20'>
        <Navbar />
        <Outlet />
        <Footer />
        <ContactButton />
        <ContactAll />
      </main>
    </LanguageProvider>
  )
}

export default MainLayout