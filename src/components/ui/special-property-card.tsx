"use client";

import { Button } from './button'
import { ArrowLeft, ArrowRight, BedDouble, ChartNoAxesColumnDecreasing, House, MapPin, Share2, ShieldCheck, User } from 'lucide-react'
import Reveal from './reveal'
import { cn } from '@/lib/utils'
import { formatPrice, shareUrl } from '@/lib/helpers';
import { useState } from 'react';
import placeholderAsset from '@/assets/placeholder.webp'
import { Link } from '@/i18n/navigation';
import { useT } from "@/i18n/useT";
import AddToFavBtn from './add-to-fav-btn';
import { Image } from "@/components/ui/image";
import { useLanguage } from '@/context/LanguageContext';
import { localePath } from '@/i18n/config';

const placeholder = (placeholderAsset as any)?.src ?? (placeholderAsset as any);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

const SpecialPropertyCard = ({ data, layoutTwo, grid, project, shorter }: any) => {
  const lang_1 = useT();
    const { language } = useLanguage();
    const [currentImage, setCurrentImage] = useState(0)
    const handleNextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImage((prev) => (prev + 1) % data?.images?.length)
    }
    const handlePrevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImage((prev) => (prev - 1 + data?.images?.length) % data?.images?.length)
    }

    const handleShare = () => {
        if (project) {
            shareUrl({
                url: `${SITE_URL}${localePath(language, `/project/${data?.slug}`)}`,
                title: data?.title,
                text: data?.description,
            });
        } else {
            shareUrl({
                url: `${SITE_URL}${localePath(language, `/property/${data?.slug}`)}`,
                title: data?.title,
                text: data?.description,
            });
        }
    };

    return (
        <Reveal className={cn(grid ? 'min-w-full w-full' : 'min-w-75')}>
            <div className='w-full h-full flex flex-col gap-4 p-3 rounded-xl  relative overflow-hidden'>
                <Image sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 90vw" src={data?.images?.length > 0 ? data?.images[currentImage]?.image : placeholder} alt="bg" className='absolute inset-0 w-full h-full object-cover' />
                <span className='bg-black/35 absolute inset-0 w-full h-full' />
                <span className='bg-linear-to-t from-black/80 via-black/40 to-transparent absolute inset-0 w-full h-full' />
                <div className={cn('relative w-full rounded-xl overflow-hidden', shorter ? 'h-26' : 'h-40')}>
                    <div className='flex items-center justify-between absolute top-2 left-1/2 -translate-x-1/2 w-[90%]'>
                        <div className={cn(layoutTwo && 'me-auto', 'flex items-center gap-1')}>
                            <AddToFavBtn data={data} project={project} />
                            <Button className='bg-transparent text-white' onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(); }}><Share2 /></Button>
                        </div>
                        <div className='flex items-center gap-1'>
                            {data?.security && <Button size={'icon'} className='rounded-full bg-[#A97A36] text-white'><ShieldCheck /></Button>}
                            {data?.label && <span className='px-6 py-1.5 rounded-full bg-[#A97A36] text-white text-xs'>{data?.label}</span>}
                        </div>
                    </div>
                    <div className={cn('absolute left-1/2 -translate-x-1/2 w-[90%] flex items-center justify-between', shorter ? 'top-[60%]' : 'top-[40%]')}>
                        <Button size={'icon'} onClick={handleNextImage} className='rounded-full bg-[#A97A36] text-white'><ArrowRight /></Button>
                        <Button size={'icon'} onClick={handlePrevImage} className='rounded-full bg-[#A97A36] text-white'><ArrowLeft /></Button>
                    </div>
                </div>
                <div className='flex flex-col gap-4 text-white relative'>
                    <div className='flex items-center justify-between'>
                        <h3 className='text-sm font-semibold'> {project ? formatPrice(data?.starting_price) : formatPrice(data?.property_price)} ₪</h3>
                        {!project && (<div className='flex items-center gap-2'>
                            <ChartNoAxesColumnDecreasing />
                            <h3 className='text-xs font-semibold'>{lang_1.details.floorCount}: {data?.floor ?? 0}</h3>
                        </div>)}
                    </div>
                    {project && <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <User />
                            <h3 className='text-xs font-semibold' title={data?.user?.full_name}>{lang_1.details.publisherName}: {data?.user?.full_name || '-'}</h3>
                        </div>
                        <div className='flex items-center gap-2'>
                            <MapPin />
                            <h3 className='text-xs font-semibold'>{lang_1.details.city}: {data?.city ?? '-'}</h3>
                        </div>
                    </div>}
                    {!project &&
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <MapPin />
                                <h3 className='text-xs font-semibold'>{lang_1.details.city}: {data?.city ?? '-'}</h3>
                            </div>
                            <div className='flex items-center gap-2'>
                                <BedDouble />
                                <h3 className='text-xs font-semibold'>{lang_1.details.roomsCount}: {data?.rooms_number ?? 0}</h3>
                            </div>
                        </div>
                    }
                    {!project && <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <House />
                            <h3 className='text-xs font-semibold'>{lang_1.details.space}:  {data?.property_area} {lang_1.details.meter}</h3>
                        </div>
                        <div className='flex items-center gap-2'>
                            <User />
                            <h3 className='text-xs font-semibold' title={data?.user?.full_name}>{lang_1.details.publisherName}: {data?.user?.full_name || '-'}</h3>
                        </div>
                    </div>}

                </div>
                <Link href={project ? `/project/${data?.slug}` : `/property/${data?.slug}`}>
                    <Button className='px-6 rounded-xl text-xs bg-[#A97A36] text-white w-full h-10 relative'>{lang_1.sections.showMore}</Button>
                </Link>
            </div>
        </Reveal>
    )
}

export default SpecialPropertyCard
