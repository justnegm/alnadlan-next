"use client";

import logo from '@/assets/footerlogo.png'
import { Link } from '@/i18n/navigation'
import { FaFacebook, FaInstagram, FaWhatsapp, FaLinkedin, FaTiktok, FaTwitter } from "react-icons/fa";
import { useQuery } from '@tanstack/react-query';
import { getMainInfo } from '@/server/main';
import type { Dictionary } from "@/i18n/useT";
import { Image } from "@/components/ui/image";
import { useT } from "@/i18n/useT";

const landingLinks = (lang_1: Dictionary) => ([
    { name: lang_1.nav.home, href: "#hero" },
    { name: lang_1.landing.about, href: "#about" },
    { name: lang_1.landing.partners, href: "#partners" },
    { name: lang_1.landing.plans, href: "#plans" },
    { name: lang_1.footer.contact, href: "#contact" },
]);

const LandingFooter = () => {
  const lang_1 = useT();
    const { data } = useQuery({
        queryKey: ['main-info'],
        queryFn: getMainInfo
    })

    return (
        <footer className='py-12 pb-20 bg-[#08182D] text-white' style={{ direction: 'rtl' }}>
            <div className='max-w-[1400px] w-[90%] mx-auto flex flex-col items-center justify-center lg:gap-10 gap-6'>
                <Link href={'/'}>
                    <Image src={logo.src} alt="logo" className='w-60 aspect-square' />
                </Link>
                
                <div className='flex lg:flex-row flex-col items-center lg:gap-20 gap-6 text-gray-300'>
                    <Link href={'/terms-and-conditions'} className="hover:text-blue-300 transition-colors">
                        {lang_1.footer.terms}
                    </Link>
                    <Link href={'/privacy-policy'} className="hover:text-blue-300 transition-colors">
                        {lang_1.footer.privacy}
                    </Link>
                </div>

                <div className="flex flex-wrap justify-center lg:gap-20 gap-6">
                    {landingLinks(lang_1).map((link, index) => (
                        <a key={index} href={link.href} className="hover:text-blue-300 transition-colors font-medium">
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className='flex lg:flex-row flex-col items-center lg:gap-20 gap-6 text-gray-300'>
                    {data?.address && (
                        <p>{data.address}</p>
                    )}
                    {data?.phone && (
                        <Link href={`tel:${data.phone}`} target="_blank" style={{ direction: 'ltr' }} className="hover:text-blue-300">
                            {data.phone}
                        </Link>
                    )}
                    {data?.email && (
                        <Link href={`mailto:${data.email}`} target="_blank" className="hover:text-blue-300">
                            {data.email}
                        </Link>
                    )}
                </div>

                <div className='flex items-center lg:gap-20 gap-6 flex-wrap justify-center mt-4'>
                    {data?.whatsapp && (
                        <Link href={`https://wa.me/${data.whatsapp}`} target="_blank" className="hover:text-blue-300 transition-colors">
                            <FaWhatsapp size={32} />
                        </Link>
                    )}
                    {data?.facebook && (
                        <Link href={data.facebook} target="_blank" className="hover:text-blue-300 transition-colors">
                            <FaFacebook size={32} />
                        </Link>
                    )}
                    {data?.instagram && (
                        <Link href={data.instagram} target="_blank" className="hover:text-blue-300 transition-colors">
                            <FaInstagram size={32} />
                        </Link>
                    )}
                    {data?.linkedin && (
                        <Link href={data.linkedin} target="_blank" className="hover:text-blue-300 transition-colors">
                            <FaLinkedin size={32} />
                        </Link>
                    )}
                    {data?.tiktok && (
                        <Link href={data.tiktok} target="_blank" className="hover:text-blue-300 transition-colors">
                            <FaTiktok size={32} />
                        </Link>
                    )}
                    {data?.x && (
                        <Link href={data.x} target="_blank" className="hover:text-blue-300 transition-colors">
                            <FaTwitter size={32} />
                        </Link>
                    )}
                </div>
                
                <p className="text-sm text-gray-400 mt-8">© {new Date().getFullYear()} Alnadlan. כל הזכויות שמורות.</p>
            </div>
        </footer>
    )
}

export default LandingFooter
