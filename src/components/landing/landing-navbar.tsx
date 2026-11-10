"use client";

import { Link } from '@/i18n/navigation'
import logo from '@/assets/logo.jpeg'
import { Button } from '../ui/button'
import { useState } from 'react'
import { Menu, X, UserRound } from 'lucide-react'
import { Image } from "@/components/ui/image"
import { useAuth } from '@/store/auth-slice'
import { getUser } from '@/server/main'
import { useQuery } from '@tanstack/react-query'
import { lang_1 } from '@/lib/lang_1'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import avatar from '@/assets/avatar.webp'

const landingLinks = [
    { name: lang_1.nav.home, href: "#hero" },
    { name: lang_1.landing.about, href: "#about" },
    { name: lang_1.landing.partners, href: "#partners" },
    { name: lang_1.landing.plans, href: "#plans" },
    { name: lang_1.footer.contact, href: "#contact" },
];

const LandingNavbar = () => {
    const [toggle, setToggle] = useState(false)
    const { isAuth, logout } = useAuth((state) => state)

    const { data } = useQuery({
        queryKey: ["profile"],
        queryFn: () => getUser(),
    });

    return (
        <nav className='lg:py-4 bg-white fixed z-999 top-0 left-0 w-full shadow-sm'>
            <div className='flex lg:flex-row flex-row-reverse items-center gap-4 justify-between max-w-[1400px] w-[90%] mx-auto'>
                <div className='lg:hidden w-10 flex items-center justify-end gap-2'>
                    {isAuth ? (
                        <Link href={'/profile'} onClick={() => setToggle(false)} className='text-sm text-[#0d294e]'>
                            <UserRound size={14} />
                        </Link>
                    ) : (
                        <Link href={'/auth'} onClick={() => setToggle(false)} className='text-sm text-[#0d294e]'>
                            <UserRound size={14} />
                        </Link>
                    )}
                    <Button variant={'ghost'} size={'icon'} onClick={() => setToggle(!toggle)} >
                        {toggle ? <X /> : <Menu />}
                    </Button>
                </div>

                <Link href={'/'}>
                    <Image src={logo.src} alt="logo" className='w-15 lg:w-20 aspect-square object-contain' />
                </Link>

                <div className='hidden lg:flex items-center gap-12 px-8 py-4 bg-[#08182D] text-white rounded-xl' style={{ direction: 'rtl' }}>
                    {landingLinks.map((link, index) => (
                        <a key={index} href={link.href} className="hover:opacity-80 transition-opacity">
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className='hidden lg:block' style={{ direction: 'rtl' }}>
                    {isAuth ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className='flex items-center gap-2 cursor-pointer select-none'>
                                    <Image src={data?.image || avatar.src} className='w-12 h-12 rounded-full object-cover' alt="avatar" />
                                    <p className='text-sm font-bold'>{data?.full_name || lang_1.nav.defaultUsername}</p>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40 z-999" align="start">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>{lang_1.nav.myAccount}</DropdownMenuLabel>
                                    <Link href={'/profile'}>
                                        <DropdownMenuItem className='cursor-pointer py-4'>
                                            {lang_1.nav.profile}
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem onClick={() => logout()} className='cursor-pointer py-4 text-red-400'>
                                        {lang_1.nav.logout}
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href={'/auth'}>
                            <Button variant={'outline'} className='lg:h-10 lg:px-6 text-sm lg:text-base border-[#08182D] text-[#08182D]'>
                                {lang_1.nav.login}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {toggle && (
                <div className='lg:hidden flex flex-col bg-[#08182D] w-[90%] mx-auto h-auto max-h-[90vh] overflow-y-auto rounded-2xl mb-4 py-4' style={{ direction: 'rtl' }}>
                    {isAuth && (
                        <div className='flex flex-col'>
                            <p className='text-sm text-white p-4 border-b border-[#0d294e] text-center'>{lang_1.nav.welcome} {data?.full_name || lang_1.nav.defaultUsername} </p>
                            <Link href={'/profile'} onClick={() => setToggle(false)} className='text-sm text-white p-4 border-b border-[#0d294e]'>
                                {lang_1.nav.profile}
                            </Link>
                        </div>
                    )}
                    {landingLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.href}
                            onClick={() => setToggle(false)}
                            className='text-white p-4 border-b border-[#0d294e] last:border-0'
                        >
                            {link.name}
                        </a>
                    ))}
                    {isAuth ? (
                        <button onClick={() => { logout(); setToggle(false) }} className='text-sm text-white text-start p-4 mb-8 border-b border-[#0d294e] mt-2'>{lang_1.nav.logout}</button>
                    ) : (
                        <Link href={'/auth'} onClick={() => setToggle(false)} className='text-sm text-white p-4 mb-8 border-b border-[#0d294e] mt-2'>
                            {lang_1.nav.loginMobile}
                        </Link>
                    )}
                </div>
            )}
        </nav>
    )
}

export default LandingNavbar
