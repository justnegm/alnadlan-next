import { Link } from 'react-router'
import logo from '@/assets/logo.jpeg'
import { Links } from '@/lib/utils'
import { Button } from '../ui/button'
import { useState } from 'react'
import { Menu, UserRound, X } from 'lucide-react'
import { useAuth } from '@/store/auth-slice'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import avatar from '@/assets/avatar.webp'
import { getUser } from '@/server/main'
import { useQuery } from '@tanstack/react-query'
import { lang_1 } from '@/lib/lang_1'
import { Image } from "@/components/ui/image";

const Navbar = () => {
    const [toggle, setToggle] = useState(false)
    const { isAuth, logout } = useAuth((state) => state)

    const { data } = useQuery({
        queryKey: ["profile"],
        queryFn: () => getUser(),
    });

    return (
        <nav className='lg:py-4 bg-white fixed z-999 top-0 left-0 w-full'>
            <div className='flex lg:flex-row flex-row-reverse items-center gap-4 justify-between max-w-400 w-[90%] mx-auto'>
                <div className='lg:hidden w-10 flex items-center justify-end gap-2'>
                    {isAuth ? (
                        <Link to={'/profile'} onClick={() => setToggle(false)} className='text-sm text-[#0d294e]'>
                            <UserRound size={14} />
                        </Link>
                    ) : (
                        <Link to={'/auth'} onClick={() => setToggle(false)} className='text-sm text-[#0d294e]'>
                            <UserRound size={14} />
                        </Link>
                    )}
                    <Button variant={'ghost'} size={'icon'} onClick={() => setToggle(!toggle)} >
                        {toggle ? (
                            <X />
                        ) : (
                            <Menu />
                        )}
                    </Button>
                </div>


                <Link to={'/'} className='bg-[#08182D] rounded-xl'>
                    <Image src={logo} alt="logo" className='w-15 lg:w-20 aspect-square' />
                </Link>
                <div className='hidden lg:flex items-center gap-12 px-8 py-4 bg-[#08182D] text-white rounded-xl'>
                    {Links?.map((link, index) => (
                        <Link key={index} to={link.href}>
                            {link.name}
                        </Link>
                    ))}
                </div>
                <div className='hidden lg:block'>
                    {isAuth ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className='flex items-center gap-2 cursor-pointer select-none'>
                                    <Image src={data?.image || avatar} className='w-12 h-12 rounded-full object-cover' alt="avatar" />
                                    <p className='text-sm font-bold'>{data?.full_name || lang_1.nav.defaultUsername}</p>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40  z-999" align="start">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel>{lang_1.nav.myAccount}</DropdownMenuLabel>
                                    <Link to={'/profile'}>
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
                    ) : (<Link to={'/auth'}>
                        <Button variant={'outline'} className='lg:h-10 lg:px-6 text-sm lg:text-base border-[#08182D] text-[#08182D]'>
                            {lang_1.nav.login}
                        </Button>
                    </Link>)
                    }
                </div>
            </div >
            {toggle && <div className='lg:hidden flex flex-col bg-[#08182D] w-[90%] mx-auto h-[90vh] no-scrollbar overflow-y-auto rounded-2xl mb-4'>
                {isAuth && (
                    <div className='flex flex-col'>
                        <p className='text-sm text-white p-4 border-b border-[#0d294e] text-center'>{lang_1.nav.welcome} {data?.full_name || lang_1.nav.defaultUsername} </p>
                        <Link to={'/profile'} onClick={() => setToggle(false)} className='text-sm text-white p-4 border-b border-[#0d294e]'>
                            {lang_1.nav.profile}
                        </Link>
                    </div>

                )
                }
                {Links?.map((link, index) => (
                    <Link key={index} to={link.href} onClick={() => setToggle(false)} className='text-white p-4 border-b border-[#0d294e] last:border-0'>
                        {link.name}
                    </Link>
                ))}
                {isAuth ? (
                    <button onClick={() => { logout(); setToggle(false) }} className='text-sm text-white text-start p-4 mb-8 border-b border-[#0d294e]'>{lang_1.nav.logout}</button>
                ) : (
                    <Link to={'/auth'} onClick={() => setToggle(false)} className='text-sm text-white p-4 mb-8 border-b border-[#0d294e]'>
                        {lang_1.nav.loginMobile}
                    </Link>
                )}
            </div>}
        </nav >
    )
}

export default Navbar