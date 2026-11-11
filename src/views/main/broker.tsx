"use client";

import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { File, MapPin, Share2 } from "lucide-react"
import { shareUrl } from "@/lib/helpers"
import PropertyCard from '@/components/ui/property-card'
import { useQuery } from '@tanstack/react-query'
import Loader from '@/components/ui/loader'
import Error from '../error'
import { getBroker, getProperties } from '@/server/main'
import { useState } from 'react'
import ListPagination from '@/components/main/pagination'
import placeholderAsset from '@/assets/placeholder.webp'
import ContactForm from '@/components/main/contact-form'
import WorkingHoursPopover from '@/components/main/working-hours-popover'
import { useT } from "@/i18n/useT";
import { getBrokerProfileMedia } from '@/server/media'
import Advertisement from '@/components/ui/advertisement'
import { Image } from "@/components/ui/image";
import { useLanguage } from '@/context/LanguageContext'
import { localePath } from '@/i18n/config'

const placeholder = (placeholderAsset as any)?.src ?? (placeholderAsset as any);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

const Broker = ({ initialData }: { initialData?: any }) => {
  const lang_1 = useT();
    const { language } = useLanguage();
    const rawParams = useParams<{ id: string }>();
    const id = rawParams?.id ? decodeURIComponent(String(rawParams.id)) : undefined;
    const [page, setPage] = useState(1);

    const { data, isPending, error } = useQuery({
        queryKey: ["broker", id],
        queryFn: () => getBroker(String(id)),
        initialData: initialData ?? undefined,
    });

    const { data: properties } = useQuery({
        queryKey: ["properties-by-user", page, data?.id],
        queryFn: () => getProperties(page, { user: data?.id }),
        enabled: !!data?.id
    });

    const { data: media } = useQuery({
        queryKey: ["broker-profile-media"],
        queryFn: () => getBrokerProfileMedia(),
    });


    const handleShare = () => {
        shareUrl({
            url: `${SITE_URL}${localePath(language, `/brokers/${data?.slug}`)}`,
            title: data?.title,
            text: data?.description,
        });
    };
    if (isPending) return <Loader />
    if (error) return <Error />
    return (
        <section className="mt-30 flex flex-col gap-20">
            <div className="flex flex-col justify-center gap-10 min-h-[40vh] relative bg-no-repeat bg-top bg-cover" style={{ backgroundImage: `url(${media?.image ?? placeholder})` }}>
                <span className='bg-black/35 absolute inset-0 w-full h-full' />


                <div className="relative flex lg:flex-row flex-col items-center gap-5 h-full p-5 max-w-400 w-[90%] mx-auto">
                    <Image src={data?.image || placeholder} className='w-40 h-40 rounded-full object-cover' alt="avatar" />
                    <div className="flex flex-col gap-4 text-white">
                        <h3 className="font-bold text-2xl text-center lg:text-start">{data?.full_name || lang_1.details.brokerName}</h3>
                        <div className='flex lg:flex-row flex-col items-center text-center lg:text-start gap-4'>
                            <p className='flex items-center gap-2'>
                                <MapPin />
                                <span> {lang_1.details.city}: {data?.city?.[0]?.name || '-'}</span>
                            </p>
                            <p className='flex items-center gap-2'>
                                <File />
                                <span>{lang_1.details.licenseNumber}: {data?.license_number || "-"}</span>
                            </p>
                        </div>
                        <div className='flex items-center gap-4'>
                            <WorkingHoursPopover working_hours={data?.working_hours} />

                            <span className='px-6 h-10 rounded-lg bg-[#A97A36] text-white font-semibold text-base flex items-center justify-center'>
                                {lang_1.details.propertiesCount}: {data?.property_count || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 h-fit absolute top-5 left-5 ">
                    <Button onClick={handleShare} className='bg-transparent text-white'><Share2 /></Button>
                </div>
            </div>

            <div className="flex lg:flex-row flex-col gap-10 max-w-400 w-[90%] mx-auto">
                <div className="w-full flex flex-col gap-20">
                    <div className="flex flex-col gap-5">
                        <h3 className="text-2xl font-bold">{lang_1.details.brokerInfo}</h3>
                        <p>{data?.bio ?? "-"}</p>
                        <hr />
                        <h3 className="text-2xl font-bold">{lang_1.details.propertiesFromBroker} </h3>
                        <div className="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 ">
                            {properties?.results?.length ? properties.results.map((property: any, index: number) => (
                                <PropertyCard data={property} grid key={property.id || index} state={{ broker: data }} />
                            )) : (
                                <div className="col-span-full text-center text-[#08182D] py-10 font-bold">
                                    {lang_1.profile.noProperties}
                                </div>
                            )}
                        </div>
                        <ListPagination
                            page={page}
                            setPage={setPage}
                            count={properties?.count}
                        />
                    </div>
                </div>

                <ContactForm
                    title={`${lang_1.details.messageTo} ${data?.full_name || lang_1.details.brokerFallback}`}
                    user={data}
                />

            </div>


            <Advertisement ad={media?.advertisement} className="w-full h-60 bg-no-repeat bg-center bg-cover block" />

        </section>
    )
}

export default Broker
