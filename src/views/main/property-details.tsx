"use client";

import { Button } from '@/components/ui/button'
import ReactPlayer from 'react-player'
import Advertisement from "@/components/ui/advertisement"
import PropertyCard from '@/components/ui/property-card'
import { Link } from '@/i18n/navigation'
import { useParams, useSearchParams } from 'next/navigation'
import SpecialPropertyCard from "@/components/ui/special-property-card"
import { useState, useEffect } from "react"
import { Accessibility, ArrowLeft, ArrowRight, Building, Check, Eye, Flame, Icon, MapPin, Milestone, PaintBucket, PawPrint, Pencil, Share2, ShieldCheck, Snowflake, Warehouse, X } from "lucide-react"
import { chevronsUpDownSquare } from '@lucide/lab';
import { cn, formatDate, getUserUrl } from "@/lib/utils"
import { formatPrice, shareUrl } from "@/lib/helpers"
import ContactForm from '@/components/main/contact-form'
import PropertyAppointmentCalendar from '@/components/main/property-appointment-calendar'
import InstallmentCalculator from "@/components/main/installment-calculator"
import { getBroker, getProjects, getProperties, getProperty, getSpecialProperties, getUser } from '@/server/main'
import { useQuery } from '@tanstack/react-query'
import Loader from '@/components/ui/loader'
import Error from '../error'
import placeholderAsset from '@/assets/placeholder.webp'
import { useAuth } from '@/store/auth-slice'
import { lang_1 } from '@/lib/lang_1'
import AddToFavBtn from '@/components/ui/add-to-fav-btn'
import { getBrokerPropertyDetailsMedia, getCustomerPropertyDetailsMedia } from '@/server/media'
import { Image } from "@/components/ui/image";
import MapComponent from '@/components/main/map'
import { useLanguage } from '@/context/LanguageContext'
import { localePath } from '@/i18n/config'

const placeholder = (placeholderAsset as any)?.src ?? (placeholderAsset as any);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

const PropertyDetails = ({ initialData }: { initialData?: any }) => {
    const { isAuth } = useAuth((state) => state)
    const { language } = useLanguage();
    const rawParams = useParams<{ id: string }>();
    const id = rawParams?.id ? decodeURIComponent(String(rawParams.id)) : undefined;
    const searchParams = useSearchParams();
    // The old router carried the broker via location.state + sessionStorage;
    // in Next the broker slug travels as a ?broker= query param and is fetched.
    const brokerParam = searchParams.get('broker');

    const [current, setCurrent] = useState(0)
    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: () => getUser(),
        enabled: isAuth
    });
    const { data, isPending, error } = useQuery({
        queryKey: ["property", id],
        queryFn: () => getProperty(String(id)),
        initialData: initialData ?? undefined,
    });

    const { data: activeBroker } = useQuery({
        queryKey: ["property-broker", brokerParam],
        queryFn: () => getBroker(String(brokerParam)),
        enabled: !!brokerParam,
    });

    const brokerId = activeBroker?.id ?? activeBroker?.pk;
    const isSharedWithBroker = !!activeBroker && !!brokerId && (
        data?.shared_with?.includes(brokerId) ||
        data?.shared_with?.some((b: any) => {
            const bid = typeof b === 'object' && b !== null ? (b.id ?? b.pk) : b;
            return bid === brokerId;
        })
    );

    const { data: relatedProperties } = useQuery({
        queryKey: ["related-properties", data?.property_type, data?.city_id],
        queryFn: () => getProperties(1, { type: data?.property_type, city: data?.city_id }),
    });
    const { data: specialProperties } = useQuery({
        queryKey: ["special-properties"],
        queryFn: () => getSpecialProperties(),
    });
    const { data: projects } = useQuery({
        queryKey: ["projects"],
        queryFn: () => getProjects(),
    });

    const { data: brokerMedia } = useQuery({
        queryKey: ["broker-property-details-media"],
        queryFn: () => getBrokerPropertyDetailsMedia(),
    });
    const { data: customerMedia } = useQuery({
        queryKey: ["customer-property-details-media"],
        queryFn: () => getCustomerPropertyDetailsMedia(),
    });


    const [currentImage, setCurrentImage] = useState(0)
    const handleNextImage = () => {
        setCurrentImage((prev) => (prev + 1) % data?.images?.length)
    }
    const handlePrevImage = () => {
        setCurrentImage((prev) => (prev - 1 + data?.images?.length) % data?.images?.length)
    }

    const [currentVideo, setCurrentVideo] = useState(0)
    const handleNextVideo = () => {
        setCurrentVideo((prev) => (prev + 1) % data?.videos?.length)
    }
    const handlePrevVideo = () => {
        setCurrentVideo((prev) => (prev - 1 + data?.videos?.length) % data?.videos?.length)
    }

    const handleShare = () => {
        shareUrl({
            url: `${SITE_URL}${localePath(language, `/property/${data?.slug}`)}`,
            title: data?.title,
            text: data?.description,
        });
    };



    useEffect(() => {
        if (data?.three_d_link) {
            setCurrent(3)
        }
        else {
            setCurrent(1)
        }
    }, [data]);


    if (isPending) return <Loader />
    if (error) return <Error />

    const targetPropertyUser = isSharedWithBroker ? activeBroker : data?.user;
    const appointmentHours =
        targetPropertyUser?.appointment_hours ||
        data?.user?.appointment_hours ||
        data?.appointment_hours ||
        [];
    const targetBrokerId =
        data?.user?.id ??
        data?.user?.pk ??
        data?.user_id ??
        targetPropertyUser?.id ??
        targetPropertyUser?.pk;

    return (
        <section className="mt-40 flex flex-col gap-20">
            <div className="flex flex-col gap-10 max-w-400 w-[90%] mx-auto">
                <div className="flex flex-wrap justify-between gap-4 ">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-2 h-fit">
                                <h3 className="font-bold text-2xl">{lang_1.details.postNumber}:{data?.id}</h3>
                                <AddToFavBtn data={data} project={false} black />
                                <Button className='bg-transparent text-black' onClick={handleShare}><Share2 /></Button>
                                {data?.user?.id === user?.pk && <Link href={`/property/edit/${data?.slug}`}>
                                    <Button className='bg-transparent text-black'><Pencil /></Button>
                                </Link>}
                            </div>
                            <div className='flex flex-wrap items-center gap-5'>
                                <p className="text-zinc-600 text-sm">{lang_1.details.postDate}: {formatDate(data?.created_at)}</p>
                                <p className="text-zinc-600 text-sm flex items-center gap-1"><Eye size={16} /> {lang_1.details.viewsOn} 30 {lang_1.details.day}  {lang_1.details.views} : {data?.view_count} </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {data?.images?.length > 0 && <Button onClick={() => setCurrent(1)} className={cn(current === 1 ? 'bg-[#08182D] text-white' : 'bg-transparent text-[#08182D]', 'border border-[#08182D] transition hover:opacity-75 rounded-full px-6')}>{lang_1.details.photos}</Button>}
                        {data?.videos?.length > 0 && <Button onClick={() => setCurrent(2)} className={cn(current === 2 ? 'bg-[#08182D] text-white' : 'bg-transparent text-[#08182D]', 'border border-[#08182D] transition hover:opacity-75 rounded-full px-6')}>{lang_1.details.video}</Button>}
                        {data?.three_d_link && <Button onClick={() => setCurrent(3)} className={cn(current === 3 ? 'bg-[#08182D] text-white' : 'bg-transparent text-[#08182D]', 'border border-[#08182D] transition hover:opacity-75 rounded-full px-6')}>3D</Button>}
                    </div>
                </div>
                {current === 1 && (
                    <div className="w-full h-[50vh] rounded-2xl overflow-hidden relative">
                        <Image src={data?.images?.length > 0 ? data?.images[currentImage]?.image : placeholder} className="w-full h-full object-cover" alt="image" loading="eager" fetchPriority="high" />
                        {data?.images?.length > 1 && <div className='absolute top-[40%] left-1/2 -translate-x-1/2 w-[90%] flex items-center justify-between'>
                            <Button size={'icon'} onClick={handleNextImage} className='rounded-full bg-[#A97A36] text-white'><ArrowRight /></Button>
                            <Button size={'icon'} onClick={handlePrevImage} className='rounded-full bg-[#A97A36] text-white'><ArrowLeft /></Button>
                        </div>}
                    </div>
                )}
                {current === 2 && (
                    <div className="w-full h-[50vh] rounded-2xl overflow-hidden relative">
                        {data?.videos?.length > 0 && <div className="w-full h-full object-cover" >
                            <ReactPlayer
                                src={data?.videos[currentVideo]?.video}
                                controls
                                width="100%"
                                height="100%"
                            />
                        </div>}
                        {data?.videos?.length > 1 && <div className='absolute top-[40%] left-1/2 -translate-x-1/2 w-[90%] flex items-center justify-between'>
                            <Button size={'icon'} onClick={handleNextVideo} className='rounded-full bg-[#A97A36] text-white'><ArrowRight /></Button>
                            <Button size={'icon'} onClick={handlePrevVideo} className='rounded-full bg-[#A97A36] text-white'><ArrowLeft /></Button>
                        </div>}
                    </div>
                )}
                {current === 3 && (
                    <div className="w-full h-[50vh] rounded-2xl overflow-hidden">
                        {data?.three_d_link && <iframe src={data?.three_d_link} className="w-full h-full object-cover" title="3d" />}
                    </div>
                )}

            </div>

            <div className="flex lg:flex-row flex-col gap-10 max-w-400 w-[90%] mx-auto">
                <div className="w-full flex flex-col gap-20 lg:sticky lg:top-40 h-fit">
                    <Advertisement ad={data?.user_id === user?.pk ? customerMedia?.advertisement1 : brokerMedia?.advertisement1} className="lg:w-full h-20 bg-no-repeat bg-top bg-cover" />

                    <div className="flex flex-col gap-5">
                        <h3 className="text-2xl font-bold">{formatPrice(data?.property_price)} ₪</h3>
                        <div className="flex flex-wrap items-center justify-between gap-5">
                            <div className='flex items-center gap-2'>
                                <MapPin />
                                <h3 className='text-xs font-semibold'>{lang_1.details.area}:  {data?.area ?? "-"}</h3>
                            </div>
                            <div className='flex items-center gap-2'>
                                <MapPin />
                                <h3 className='text-xs font-semibold'>{lang_1.details.city}:  {data?.city ?? "-"}</h3>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Milestone />
                                <h3 className='text-xs font-semibold'>{lang_1.details.street}:  {data?.street ?? "-"}</h3>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Building />
                                <h3 className='text-xs font-semibold'>{data?.property_number ?? "-"}</h3>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold">{data?.title}</h3>
                        <p>{data?.desc}</p>
                        <h3 className="text-2xl font-bold">{lang_1.propertyForm.additionalInfo} </h3>
                        <hr />
                        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5">
                            <h3 className='text-xs font-semibold'>{lang_1.details.property_type}: {data?.property_type ?? "-"}</h3>
                            <h3 className='text-xs font-semibold'>{lang_1.details.transactionType}: {data?.contract_type_label ?? "-"}</h3>
                            <h3 className='text-xs font-semibold'>{lang_1.propertyForm.roomsCount}: {data?.rooms_number ?? "-"}</h3>
                            <h3 className='text-xs font-semibold'>{lang_1.propertyForm.floor} : {data?.floor ?? "-"}</h3>
                            <h3 className='text-xs font-semibold'>{lang_1.details.houseAreaText} {data?.property_area ?? "-"} {lang_1.details.meter}</h3>
                            <h3 className='text-xs font-semibold'>{lang_1.details.propertyStatus}: {data?.condition_label ?? "-"}</h3>
                            <h3 className='text-xs font-semibold'>{lang_1.propertyForm.entryDate}: {data?.entry_time ?? "-"}</h3>
                            <h3 className='text-xs font-semibold'>{lang_1.details.pricePerMeterText} {formatPrice(data?.meter_price) ?? "-"} {lang_1.details.perMeter}</h3>
                            <h3 className='text-xs font-semibold'>{lang_1.details.landAreaText} {data?.land_area ? data?.land_area : data?.property_area ? data?.property_area : "-"} {lang_1.details.meter}</h3>
                            <h3 className='text-xs font-semibold'>{lang_1.propertyForm.parkingCount}: {data?.parking_number ?? "-"}</h3>
                        </div>
                        <hr />
                        <h3 className="text-2xl font-bold">{lang_1.propertyForm.whatDoesItContain}</h3>
                        <hr />
                        <div className="grid lg:grid-cols-3 grid-cols-2 gap-5">
                            <div className={cn(data?.elevator ? 'text-[#A97A36]' : 'text-gray-500', 'flex items-center gap-2')}>
                                <Icon iconNode={chevronsUpDownSquare} />
                                <h3 className='text-xs font-semibold'>{lang_1.propertyForm.elevator}</h3>
                                <span className="h-4 w-0.5 bg-gray-500/50" />
                                {data?.elevator ? (<Check />) : (<X />)}
                            </div>
                            <div className={cn(data?.special_entrance ? 'text-[#A97A36]' : 'text-gray-500', 'flex items-center gap-2')}>
                                <Accessibility />
                                <h3 className='text-xs font-semibold'>{lang_1.propertyForm.accessible}</h3>
                                <span className="h-4 w-0.5 bg-gray-500/50" />
                                {data?.special_entrance ? (<Check />) : (<X />)}
                            </div>
                            <div className={cn(data?.air_conditioner ? 'text-[#A97A36]' : 'text-gray-500', 'flex items-center gap-2')}>
                                <Snowflake />
                                <h3 className='text-xs font-semibold'>{lang_1.propertyForm.ac}</h3>
                                <span className="h-4 w-0.5 bg-gray-500/50" />
                                {data?.air_conditioner ? (<Check />) : (<X />)}
                            </div>
                            <div className={cn(data?.storehouse ? 'text-[#A97A36]' : 'text-gray-500', 'flex items-center gap-2')}>
                                <Warehouse />
                                <h3 className='text-xs font-semibold'>{lang_1.propertyForm.storage}</h3>
                                <span className="h-4 w-0.5 bg-gray-500/50" />
                                {data?.storehouse ? (<Check />) : (<X />)}
                            </div>
                            <div className={cn(data?.water_heater ? 'text-[#A97A36]' : 'text-gray-500', 'flex items-center gap-2')}>
                                <Flame />
                                <h3 className='text-xs font-semibold'>{lang_1.propertyForm.waterHeater}</h3>
                                <span className="h-4 w-0.5 bg-gray-500/50" />
                                {data?.water_heater ? (<Check />) : (<X />)}
                            </div>
                            <div className={cn(data?.restored_property ? 'text-[#A97A36]' : 'text-gray-500', 'flex items-center gap-2')}>
                                <PaintBucket />
                                <h3 className='text-xs font-semibold'>{lang_1.propertyForm.renovated}</h3>
                                <span className="h-4 w-0.5 bg-gray-500/50" />
                                {data?.restored_property ? (<Check />) : (<X />)}
                            </div>
                            <div className={cn(data?.security ? 'text-[#A97A36]' : 'text-gray-500', 'flex items-center gap-2')}>
                                <ShieldCheck />
                                <h3 className='text-xs font-semibold'>{lang_1.propertyForm.protection}</h3>
                                <span className="h-4 w-0.5 bg-gray-500/50" />
                                {data?.security ? (<Check />) : (<X />)}
                            </div>
                            <div className={cn(data?.pets_allowed ? 'text-[#A97A36]' : 'text-gray-500', 'flex items-center gap-2')}>
                                <PawPrint />
                                <h3 className='text-xs font-semibold'>{lang_1.propertyForm.petsAllowed}</h3>
                                <span className="h-4 w-0.5 bg-gray-500/50" />
                                {data?.pets_allowed ? (<Check />) : (<X />)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:max-w-150 w-full flex flex-col gap-5">

                    <PropertyAppointmentCalendar
                        appointmentHours={appointmentHours}
                        propertyId={data?.id}
                        brokerId={targetBrokerId}
                        currentUser={user}
                        userDuration={targetPropertyUser?.duration ?? data?.user?.duration}
                    />
                    <ContactForm
                        title={`${lang_1.details.messageTo} ${targetPropertyUser?.full_name || ''}`}
                        user={targetPropertyUser}
                        url={getUserUrl(targetPropertyUser)}
                    />
                </div>

            </div>
            <InstallmentCalculator price={data?.property_price || 0} />
            <MapComponent address={[[data?.street, data?.property_number].filter(Boolean).join(' '), data?.city].filter(Boolean).join(', ')} />

            <div className="lg:w-full flex flex-col gap-10">
                <h3 className="max-w-400 w-[90%] mx-auto font-bold lg:text-2xl text-xl">{lang_1.details.similarHouses}</h3>
                <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-4 ">
                    {relatedProperties?.results?.map((item: any) => (
                        <PropertyCard grid key={item?.id} data={item} />
                    ))}
                </div>
                <Link href={`/properties`} className="text-xl font-bold underline underline-offset-2 mx-auto max-w-400 w-[90%] text-center">{lang_1.sections.showMore}</Link>


                <Advertisement ad={data?.user_id === user?.pk ? customerMedia?.advertisement2 : brokerMedia?.advertisement2} className="lg:w-full h-75 bg-no-repeat bg-top bg-cover" />
                <h3 className="max-w-400 w-[90%] mx-auto font-bold lg:text-2xl text-xl">{lang_1.sections.featuredProperties}</h3>
                <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-4 ">
                    {specialProperties?.results?.map((item: any) => (
                        <SpecialPropertyCard grid key={item?.id} data={item?.property_details} />
                    ))}
                </div>
                <Link href={`/properties`} className="text-xl font-bold underline underline-offset-2 mx-auto max-w-400 w-[90%] text-center">{lang_1.sections.showMore}</Link>


                <Advertisement ad={data?.user_id === user?.pk ? customerMedia?.advertisement3 : brokerMedia?.advertisement3} className="lg:w-full h-75 bg-no-repeat bg-top bg-cover" />


                <h3 className="max-w-400 w-[90%] mx-auto font-bold lg:text-2xl text-xl">{lang_1.sections.underConstruction}</h3>

                <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-4 ">
                    {projects?.results?.map((item: any) => (
                        <SpecialPropertyCard grid key={item?.id} project data={item} />
                    ))}
                </div>
                <Link href={`/projects`} className="text-xl font-bold underline underline-offset-2 mx-auto max-w-400 w-[90%] text-center">{lang_1.sections.showMore}</Link>


            </div>
        </section>
    )
}

export default PropertyDetails
