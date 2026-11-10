"use client";

import contactIcon from '@/assets/contact.png'
import { Link } from '@/i18n/navigation'
import { Image } from "@/components/ui/image";
const ContactButton = () => {
    return (
        <Link href="/contact" className='bg-[#A97A36] border-[#A97A36] text-white hover:opacity-75 w-14 h-14 rounded-full flex items-center justify-center fixed lg:bottom-10 lg:right-10 right-5 bottom-5 z-50'>
            <Image src={contactIcon.src} className='w-6 h-6' alt="contact icon" />
        </Link>
    )
}

export default ContactButton
