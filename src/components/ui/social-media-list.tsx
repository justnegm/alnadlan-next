"use client";

import { FaFacebook, FaInstagram, FaWhatsapp, FaTiktok, FaGlobe } from "react-icons/fa";
import { X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { socialClickAnalytics } from '@/server/main';

interface SocialMediaListProps {
    list: {
        id: number;
        social_type: string;
        social_url: string;
    }[];
}

const SocialMediaList = ({ list }: SocialMediaListProps) => {
    const { mutate } = useMutation({
        mutationFn: (id: number) => socialClickAnalytics(id)
    });

    if (!list || list.length === 0) return null;

    return (
        <div className='flex items-center gap-4 flex-wrap'>
            {list?.map((item) => (
                <a
                    onClick={() => mutate(item?.id as number)}
                    className='hover:scale-110 transition-all text-[#131927]'
                    key={item?.id}
                    href={item?.social_url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {item?.social_type === 'facebook' ? <FaFacebook size={32} />
                        : item?.social_type === 'instagram' ? <FaInstagram size={32} />
                            : item?.social_type === 'tiktok' ? <FaTiktok size={32} />
                                : item?.social_type === 'X' ? <X size={32} />
                                    : item?.social_type === 'whatsapp' ? <FaWhatsapp size={32} />
                                        : <FaGlobe size={32} />
                    }
                </a>
            ))}
        </div>
    )
}

export default SocialMediaList