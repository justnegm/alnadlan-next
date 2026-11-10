
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import ReactPlayer from 'react-player'
import Advertisement from "@/components/ui/advertisement"
import PropertyCard from '@/components/ui/property-card'
import { Link, useParams, useSearchParams } from 'react-router'
import SpecialPropertyCard from "@/components/ui/special-property-card"
import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Building, Eye, MapPin, Milestone, Share2 } from "lucide-react"
import { cn, formatDate, getUserUrl } from "@/lib/utils"
import { formatPrice, shareUrl } from "@/lib/helpers"
import ContactForm from '@/components/main/contact-form'
import InstallmentCalculator from "@/components/main/installment-calculator"
import { getProject, getProjects, getSpecialProperties } from '@/server/main'
import { useQuery } from '@tanstack/react-query'
import Loader from '@/components/ui/loader'
import Error from '../error'
import placeholder from '@/assets/placeholder.webp'
import { lang_1 } from '@/lib/lang_1'
import AddToFavBtn from '@/components/ui/add-to-fav-btn'
import { getProjectDetailsMedia } from '@/server/media'
import { Image } from "@/components/ui/image";
import MapComponent from '@/components/main/map'

const ProjectDetails = () => {
    const [current, setCurrent] = useState(0)
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isPrivate = searchParams.get('private') === 'true';

    const { data, status, error } = useQuery({
        queryKey: ["project", id],
        queryFn: () => getProject(String(id)),
    });

    const { data: special } = useQuery({
        queryKey: ["special-properties"],
        queryFn: () => getSpecialProperties(),
    });

    const { data: relatedProjects } = useQuery({
        queryKey: ["related-projects", data?.property_type],
        queryFn: () => getProjects(),
    });

    const { data: media } = useQuery({
        queryKey: ["project-media"],
        queryFn: () => getProjectDetailsMedia(),
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
            url: `${window.location.origin}/property/${data?.slug}`,
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

    if (status === 'pending') return <Loader />
    if (error) return <Error />

    return (
        <section className="mt-40 flex flex-col gap-20">
            <div className="flex flex-col gap-10 max-w-400 w-[90%] mx-auto">
                <div className="flex flex-wrap justify-between gap-4 ">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-2 h-fit">
                                <h3 className="font-bold text-2xl">{lang_1.details.postNumber}:{data?.id}</h3>
                                <AddToFavBtn data={data} project black />
                                <Button className='bg-transparent text-black' onClick={handleShare}><Share2 /></Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <p className="text-zinc-600 text-sm">{lang_1.details.postDate}: {formatDate(data?.created_at)}</p>
                                <p className="text-zinc-600 text-sm flex items-center gap-1"><Eye size={16} /> {lang_1.details.viewsOn} 30 {lang_1.details.day} : {data?.view_count} </p>
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
                        {data?.videos?.length > 0 && <div className="w-full h-full object-cover">
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
                        {data?.three_d_link ? <iframe src={data?.three_d_link} className="w-full h-full object-cover" title="3d" /> : <Image src={placeholder} className="w-full h-full object-cover" alt="image" />}
                    </div>
                )}
            </div>
            <div className="flex lg:flex-row flex-col gap-10 max-w-400 w-[90%] mx-auto">
                <div className="w-full flex flex-col gap-20">
                    <Advertisement ad={media?.advertisement1} className="lg:w-full h-20 rounded-2xl bg-no-repeat bg-top bg-cover" />

                    <div className="flex flex-col gap-5">
                        <h3 className="text-2xl font-bold">{formatPrice(data?.starting_price)} ₪</h3>
                        <div className="flex flex-wrap items-center justify-between gap-5">
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
                        <p className="text-2xl font-bold">{lang_1.details.projectDesc}</p>
                        <p>{data?.project_desc}</p>
                        <p className="text-2xl font-bold">{lang_1.details.companyDesc}</p>
                        <p>{data?.company_desc}</p>

                        {data?.properties?.length > 0 && (
                            <div className="w-full overflow-x-auto mt-8 border rounded-lg">
                                <Table className="bg-white">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-center">{lang_1.propertyForm.propertyType}</TableHead>
                                            <TableHead className="text-center">{lang_1.propertyForm.floor}</TableHead>
                                            <TableHead className="text-center">{lang_1.propertyForm.roomsCount}</TableHead>
                                            <TableHead className="text-center">{lang_1.filters.price}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.properties.map((property: any) => (
                                            <TableRow key={property.id}>
                                                <TableCell className="text-center">{property.property_type}</TableCell>
                                                <TableCell className="text-center">{property.floor}</TableCell>
                                                <TableCell className="text-center">{property.rooms_number}</TableCell>
                                                <TableCell className="text-center">{formatPrice(property.property_price)} ₪</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>

                <ContactForm
                    title={`${lang_1.details.messageTo} ${data?.user?.full_name || ''}`}
                    user={data?.user}
                    url={getUserUrl(data?.user)}
                />
            </div>
            <InstallmentCalculator price={data?.starting_price || 0} />
            <MapComponent address={[[data?.street, data?.property_number].filter(Boolean).join(' '), data?.city].filter(Boolean).join(', ')} />

            {!isPrivate && (
                <div className="lg:w-full flex flex-col gap-10">
                    <h3 className="max-w-400 w-[90%] mx-auto font-bold lg:text-2xl text-xl">{lang_1.details.similarProjects}</h3>
                    <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-4 ">
                        {relatedProjects?.results?.map((item: any) => (
                            <PropertyCard project grid key={item?.id} data={item} />
                        ))}
                    </div>
                    <Link to={`/projects`} className="text-xl font-bold underline underline-offset-2 mx-auto max-w-400 w-[90%] text-center">{lang_1.sections.showMore}</Link>
                    <Advertisement ad={media?.advertisement2} className="lg:w-full h-75 bg-no-repeat bg-top bg-cover" />
                    <h3 className="max-w-400 w-[90%] mx-auto font-bold lg:text-2xl text-xl">{lang_1.sections.featuredProperties}</h3>
                    <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-4 ">
                        {special?.results?.map((item: any) => (
                            <SpecialPropertyCard grid key={item?.id} project data={item} />
                        ))}
                    </div>
                    <Link to={`/properties`} className="text-xl font-bold underline underline-offset-2 mx-auto max-w-400 w-[90%] text-center">{lang_1.sections.showMore}</Link>
                    <Advertisement ad={media?.advertisement3} className="lg:w-full h-75 bg-no-repeat bg-top bg-cover" />
                </div>
            )}
        </section>
    )
}

export default ProjectDetails