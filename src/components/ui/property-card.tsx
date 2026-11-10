"use client";

import { Button } from './button'
import { ArrowLeft, ArrowRight, BedDouble, ChartNoAxesColumnDecreasing, File, House, MapPin, Share2, ShieldCheck, User } from 'lucide-react'
import Reveal from './reveal'
import { cn } from '@/lib/utils'
import { Link } from '@/i18n/navigation'
import { useState } from 'react'
import placeholderAsset from '@/assets/placeholder.webp'
import { formatPrice, shareUrl } from '@/lib/helpers'
import { lang_1 } from '@/lib/lang_1'
import AddToFavBtn from './add-to-fav-btn'
import { Image } from "@/components/ui/image";
import { BsBadge3D } from "react-icons/bs";
import { useLanguage } from '@/context/LanguageContext'
import { localePath } from '@/i18n/config'

const placeholder = (placeholderAsset as any)?.src ?? (placeholderAsset as any);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

interface Props {
    person?: boolean;
    project?: boolean;
    office?: boolean;
    personUrl?: string;
    grid?: boolean;
    data?: any;
    state?: any;
}
const PropertyCard = ({ person, office, personUrl, grid, data, project, state }: Props) => {
    const { language } = useLanguage();
    const [currentImage, setCurrentImage] = useState(0)
    const handleNextImage = () => {
        setCurrentImage((prev) => (prev + 1) % data?.images?.length)
    }
    const handlePrevImage = () => {
        setCurrentImage((prev) => (prev - 1 + data?.images?.length) % data?.images?.length)
    }

    // Router "state" does not exist in Next: a broker passed via state is
    // carried as a ?broker=<slug> query param instead (read by property-details).
    const brokerRef = state?.broker?.slug ?? state?.broker?.id ?? state?.broker?.pk;
    const basePath = personUrl ? personUrl : project ? `/project/${data?.slug}` : `/property/${data?.slug}`;
    const detailHref = !personUrl && !project && brokerRef
        ? `${basePath}?broker=${encodeURIComponent(String(brokerRef))}`
        : basePath;

    const handleShare = () => {
        person ?
            shareUrl({
                url: `${SITE_URL}${localePath(language, personUrl || basePath)}`,
                title: data?.full_name,
                text: data?.license_number,
            }) :
            project ?
                shareUrl({
                    url: `${SITE_URL}${localePath(language, `/project/${data?.slug}`)}`,
                    title: data?.title,
                    text: data?.project_desc,
                }) :
                shareUrl({
                    url: `${SITE_URL}${localePath(language, `/property/${data?.slug}`)}`,
                    title: data?.title,
                    text: data?.description,
                });
    };


    return (
        <Reveal className={cn(grid ? 'min-w-full w-full' : 'min-w-75 max-w-75 w-full', 'flex flex-col gap-4 p-2 rounded-xl border border-zinc-300 bg-white  relative overflow-hidden')}>
            <div className='relative w-full h-40 rounded-xl overflow-hidden'>
                <span className='absolute top-0 left-0 w-full h-full bg-black/15 pointer-events-none' />
                <Link href={detailHref} className='w-full h-full block'>
                    <Image src={person || office ? data?.image : data?.images?.length > 0 ? data?.images[currentImage]?.image : placeholder} alt="sample" className='w-full h-full object-cover pointer-events-none' />
                </Link>
                <div className='flex items-center justify-between absolute top-2 left-1/2 -translate-x-1/2 w-[90%]'>
                    <div className='flex items-center gap-1'>
                        {!person && !office && (
                            <AddToFavBtn project={project} data={data} />
                        )}
                        <Button className='bg-transparent text-white' onClick={handleShare}><Share2 /></Button>
                    </div>
                    {!person && !office && <div className='flex items-center gap-1'>
                        {data?.three_d_link && <Button size={'icon'} className='rounded-full bg-[#A97A36] text-white'><BsBadge3D /></Button>}
                        {data?.security && <Button size={'icon'} className='rounded-full bg-[#A97A36] text-white'><ShieldCheck /></Button>}
                        {data?.label && <Button className='px-6 rounded-full bg-[#A97A36] text-white'>{data?.label}</Button>}
                    </div>}
                </div>
                {!person && !office && data?.images?.length > 1 && <div className='absolute top-[40%] left-1/2 -translate-x-1/2 w-[90%] flex items-center justify-between'>
                    <Button size={'icon'} onClick={handleNextImage} className='rounded-full bg-[#A97A36] text-white'><ArrowRight /></Button>
                    <Button size={'icon'} onClick={handlePrevImage} className='rounded-full bg-[#A97A36] text-white'><ArrowLeft /></Button>
                </div>
                }
            </div>
            {person || office ? (<div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                    <h3 className='text-sm font-semibold capitalize' title={office ? data?.title : data?.full_name}>{lang_1.details.name} : {office ? data?.title : data?.full_name}</h3>
                </div>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <File />
                        <h3 className='text-xs font-semibold'>{lang_1.details.licenseCertificate} : {data?.license_number ?? '-'}</h3>
                    </div>
                    <div className='flex items-center gap-2'>
                        <House />
                        <h3 className='text-xs font-semibold'>{lang_1.details.city}: {office ? data?.city : data?.city?.[0]?.name ?? '-'}</h3>
                    </div>
                </div>
            </div>) : (
                <div className='flex flex-col gap-4'>
                    <div className='flex items-center justify-between'>
                        <h3 className='text-sm font-semibold'> {formatPrice(data?.property_price)} ₪</h3>
                        <div className='flex items-center gap-2'>
                            <ChartNoAxesColumnDecreasing />
                            <h3 className='text-xs font-semibold'>{lang_1.details.floorCount}: {data?.floor ?? 0}</h3>
                        </div>
                    </div>
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
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <House />
                            <h3 className='text-xs font-semibold'>{lang_1.details.space}:  {data?.property_area} {lang_1.details.meter}</h3>
                        </div>
                        <div className='flex items-center gap-2'>
                            <User />
                            <h3 className='text-xs font-semibold' title={data?.user?.full_name}>{lang_1.details.publisherName}: {data?.user?.full_name}</h3>
                        </div>
                    </div>
                </div>
            )}
            <Link href={detailHref}>
                <Button className='px-6 rounded-xl text-xs bg-[#08182D] text-white w-full h-10'> {person ? lang_1.details.showProfile : lang_1.sections.showMore}</Button>
            </Link>
        </Reveal>
    )
}

export default PropertyCard
