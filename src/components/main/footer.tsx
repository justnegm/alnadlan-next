import logo from '@/assets/footerlogo.png'
import { Link } from 'react-router'
import { FaFacebook, FaInstagram, FaWhatsapp, FaLinkedin, FaTiktok, FaTwitter } from "react-icons/fa";
import { useQuery } from '@tanstack/react-query';
import { getMainInfo } from '@/server/main';
import { lang_1 } from '@/lib/lang_1';
import { Image } from "@/components/ui/image";

const Footer = () => {
    const { data } = useQuery({
        queryKey: ['main-info'],
        queryFn: getMainInfo
    })
    return (
        <footer className='py-12 pb-20 bg-[#08182D] text-white '>
            <div className='max-w-400 w-[90%] mx-auto flex flex-col items-center justify-center lg:gap-10 gap-6'>
                <Link to={'/'}>
                    <Image src={logo} alt="logo" className='w-60 aspect-square' />
                </Link>
                <div className='flex lg:flex-row flex-col items-center lg:gap-20 gap-6'>
                    <Link to={'/people-with-disabilities'}>
                        {lang_1.footer.legalLinks}
                    </Link>
                    <Link to={'/terms-and-conditions'}>
                        {lang_1.footer.terms}
                    </Link>
                    <Link to={'/privacy-policy'}>
                        {lang_1.footer.privacy}
                    </Link>
                    <Link to={'/contact'}>
                        {lang_1.footer.contact}
                    </Link>
                </div>
                <div className='flex lg:flex-row flex-col items-center lg:gap-20 gap-6'>
                    {data?.address && (
                        <p>
                            {data.address}
                        </p>
                    )}
                    {data?.phone && (
                        <Link to={`tel:${data.phone}`} target="_blank" style={{ direction: 'ltr' }}>
                            {data.phone}
                        </Link>
                    )}
                    {data?.email && (
                        <Link to={`mailto:${data.email}`} target="_blank">
                            {data.email}
                        </Link>
                    )}
                </div>
                <div className='flex items-center lg:gap-20 gap-6 flex-wrap justify-center'>
                    {data?.whatsapp && (
                        <Link to={`https://wa.me/${data.whatsapp}`} target="_blank">
                            <FaWhatsapp size={32} />
                        </Link>
                    )}
                    {data?.facebook && (
                        <Link to={data.facebook} target="_blank">
                            <FaFacebook size={32} />
                        </Link>
                    )}
                    {data?.instagram && (
                        <Link to={data.instagram} target="_blank">
                            <FaInstagram size={32} />
                        </Link>
                    )}
                    {data?.linkedin && (
                        <Link to={data.linkedin} target="_blank">
                            <FaLinkedin size={32} />
                        </Link>
                    )}
                    {data?.tiktok && (
                        <Link to={data.tiktok} target="_blank">
                            <FaTiktok size={32} />
                        </Link>
                    )}
                    {data?.x && (
                        <Link to={data.x} target="_blank">
                            <FaTwitter size={32} />
                        </Link>
                    )}
                </div>
            </div>
        </footer>
    )
}

export default Footer