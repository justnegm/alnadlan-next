"use client";

import { Button } from '@/components/ui/button'
import Advertisement from "@/components/ui/advertisement"
import { useParams } from 'next/navigation'
import { Briefcase, File, MapPin, Share2, User } from "lucide-react"
import { shareUrl } from "@/lib/helpers"
import Loader from '@/components/ui/loader'
import Error from '../error'
import placeholderAsset from '@/assets/placeholder.webp'
import WorkingHoursPopover from '@/components/main/working-hours-popover'
import { useQuery } from '@tanstack/react-query'
import { getLoanAdvisor } from '@/server/main'
import ContactForm from '@/components/main/contact-form'
import { lang_1 } from '@/lib/lang_1'
import { getLoanAdvisorsMedia } from '@/server/media'
import { Image } from "@/components/ui/image";
import { useLanguage } from '@/context/LanguageContext'
import { localePath } from '@/i18n/config'

const placeholder = (placeholderAsset as any)?.src ?? (placeholderAsset as any);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

const Advisor = ({ initialData }: { initialData?: any }) => {
    const { language } = useLanguage();
    const rawParams = useParams<{ id: string }>();
    const id = rawParams?.id ? decodeURIComponent(String(rawParams.id)) : undefined;

    const { data, isPending, error } = useQuery({
        queryKey: ["advisor", id],
        queryFn: () => getLoanAdvisor(String(id)),
        initialData: initialData ?? undefined,
    });

    const { data: media } = useQuery({
        queryKey: ["advisor-media"],
        queryFn: () => getLoanAdvisorsMedia(),
    });


    const handleShare = () => {
        shareUrl({
            url: `${SITE_URL}${localePath(language, `/loan-advisors/${data?.slug}`)}`,
            title: data?.full_name,
            text: data?.bio,
        });
    };

    if (isPending) return <Loader />
    if (error) return <Error />

    return (
        <section className="mt-30 flex flex-col gap-20">
            <div className="flex flex-col justify-center gap-10 min-h-[40vh] relative bg-no-repeat bg-top bg-cover" style={{ backgroundImage: `url(${media?.image ?? placeholder})` }}>
                <span className='bg-black/35 absolute inset-0 w-full h-full' />

                <div className="relative flex lg:flex-row flex-col items-center h-full gap-5 p-5  max-w-400 w-[90%] mx-auto">
                    <Image src={data?.image || placeholder} className='w-40 h-40 rounded-full object-cover' alt="avatar" />
                    <div className="flex flex-col lg:items-start items-center gap-4 text-white">
                        <h3 className="font-bold text-2xl">{data?.full_name}</h3>
                        <div className='flex flex-wrap items-center gap-4'>
                            <p className='flex items-center gap-2'>
                                <MapPin />
                                <span> {lang_1.details.city}: {data?.city?.[0]?.name || '-'}</span>
                            </p>
                            <p className='flex items-center gap-2'>
                                <User />
                                <span>{lang_1.details.specialization}: {data?.specialty || '-'}</span>
                            </p>
                            <p className='flex items-center gap-2'>
                                <Briefcase />
                                <span>{lang_1.details.experience} {data?.expertise ? `${data.expertise} ${lang_1.details.years}` : "-"}</span>
                            </p>
                            <p className='flex items-center gap-2'>
                                <File />
                                <span>{lang_1.details.licenseNumber}: {data?.license_number || '-'}</span>
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
                        <h3 className="text-2xl font-bold">{lang_1.details.aboutAdvisor}</h3>
                        <p>{data?.bio}</p>
                        <Advertisement ad={media?.advertisement1} className="lg:w-full h-60 rounded-2xl bg-no-repeat bg-top bg-cover" />
                    </div>
                </div>

                <ContactForm
                    title={`${lang_1.details.messageTo} ${data?.full_name || lang_1.details.advisorFallback}`}
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

export default Advisor
