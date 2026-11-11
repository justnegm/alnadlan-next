"use client";

import { Button } from '@/components/ui/button'
import Advertisement from "@/components/ui/advertisement"
import { useParams } from 'next/navigation'
import { Briefcase, MapPin, Share2, User } from "lucide-react"
import { shareUrl } from "@/lib/helpers"
import { useQuery } from '@tanstack/react-query'
import { getDesigner } from '@/server/main'
import Loader from '@/components/ui/loader'
import Error from '../error'
import placeholderAsset from '@/assets/placeholder.webp'
import WorkingHoursPopover from '@/components/main/working-hours-popover'
import ContactForm from '@/components/main/contact-form'
import { useT } from "@/i18n/useT";
import { getDesignerProfileMedia } from '@/server/media'
import { Image } from "@/components/ui/image";
import { useLanguage } from '@/context/LanguageContext'
import { localePath } from '@/i18n/config'

const placeholder = (placeholderAsset as any)?.src ?? (placeholderAsset as any);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

const Designer = ({ initialData }: { initialData?: any }) => {
  const lang_1 = useT();
    const { language } = useLanguage();
    const rawParams = useParams<{ id: string }>();
    const id = rawParams?.id ? decodeURIComponent(String(rawParams.id)) : undefined;

    const { data, isPending, error } = useQuery({
        queryKey: ["designer", id],
        queryFn: () => getDesigner(String(id)),
        initialData: initialData ?? undefined,
    });

    const { data: media } = useQuery({
        queryKey: ["designer-media"],
        queryFn: () => getDesignerProfileMedia(),
        staleTime: 1000 * 60 * 60 * 12,
    });

    const handleShare = () => {
        shareUrl({
            url: `${SITE_URL}${localePath(language, `/designers/${data?.slug}`)}`,
            title: data?.title,
            text: data?.description,
        });
    };


    if (isPending) return <Loader />
    if (error) return <Error />
    return (
        <section className="mt-30 flex flex-col gap-20">
            <div className="flex relative flex-col justify-center gap-10 min-h-[40vh] bg-no-repeat bg-top bg-cover" style={{ backgroundImage: `url(${media?.image ?? placeholder})` }}>
                <span className='bg-black/35 absolute inset-0 w-full h-full' />

                <div className="relative flex flex-col lg:flex-row items-center h-full gap-5 p-5 max-w-400 w-[90%] mx-auto">
                    <Image src={data?.image || placeholder} className='w-40 h-40 rounded-full object-cover' alt="avatar" />
                    <div className="flex lg:items-start items-center flex-col gap-4 text-white">
                        <h3 className="font-bold text-2xl">{data?.full_name}</h3>
                        <div className='flex flex-wrap items-center gap-4'>
                            <p className='flex items-center gap-2'>
                                <MapPin />
                                <span> {lang_1.details.city}: {data?.city?.[0]?.name || '-'}</span>
                            </p>
                            <p className='flex items-center gap-2'>
                                <User />
                                <span>{lang_1.details.specialization}: {data?.expertise}</span>
                            </p>
                            <p className='flex items-center gap-2'>
                                <Briefcase />
                                <span>{lang_1.details.experience} {data?.experience} {lang_1.details.years}</span>
                            </p>
                        </div>
                        <WorkingHoursPopover working_hours={data?.working_hours} />
                    </div>
                </div>
                <div className="flex items-center gap-2 h-fit absolute top-5 left-5">
                    <Button onClick={handleShare} className='bg-transparent text-white'><Share2 /></Button>
                </div>
            </div>

            <div className="flex lg:flex-row flex-col gap-10 max-w-400 w-[90%] mx-auto">
                <div className="w-full flex flex-col gap-20">
                    <div className="flex flex-col gap-5">
                        <h3 className="text-2xl font-bold">{lang_1.details.aboutDesigner}  </h3>
                        <p>{data?.bio}</p>
                        <Advertisement ad={media?.advertisement1} className="lg:w-full h-60 rounded-2xl bg-no-repeat bg-top bg-cover" />
                    </div>
                </div>

                <ContactForm
                    title={`${lang_1.details.messageTo} ${data?.full_name || lang_1.details.designerFallback}`}
                    user={data}
                />

            </div>
            <div className='max-w-400 w-[90%] mx-auto flex flex-col gap-10'>
                <h3 className="text-2xl font-bold">{lang_1.details.gallery}</h3>
                {data?.portfolio?.length > 0 ? (
                    <div className="flex lg:flex-row flex-col gap-4">
                        <div className='grid lg:grid-cols-2 grid-cols-1 gap-4 lg:max-w-125 w-full h-fit'>
                            {data.portfolio.slice(1, 5).map((item: any) => (
                                <Image key={item.id} src={item.image || placeholder} title={item.title} className='lg:h-50 h-60 w-full rounded-lg object-cover' alt="portfolio" />
                            ))}
                        </div>
                        {data.portfolio[0] && (
                            <Image src={data.portfolio[0].image || placeholder} title={data.portfolio[0].title} className='w-full lg:h-104 h-60 rounded-lg object-cover' alt="portfolio main" />
                        )}
                    </div>
                ) : (
                    <div className="text-center text-[#08182D] py-10 font-bold">
                        {lang_1.details.noGallery}
                    </div>
                )}
            </div>
            <Advertisement ad={media?.advertisement2} className="h-60 bg-no-repeat bg-top bg-cover" />
        </section>
    )
}

export default Designer
