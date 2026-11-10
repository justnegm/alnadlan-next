import { Button } from '@/components/ui/button'
import { Link, useParams, useSearchParams } from 'react-router'
import Advertisement from "@/components/ui/advertisement"
import { File, MapPin, Share2 } from "lucide-react"
import { shareUrl } from "@/lib/helpers"
import PropertyCard from '@/components/ui/property-card'
import { useQuery } from '@tanstack/react-query'
import Loader from '@/components/ui/loader'
import Error from '../error'
import { getBrokers, getOffice, getProjects, getProperties } from '@/server/main'
import { useState } from 'react'
import ListPagination from '@/components/main/pagination'
import placeholder from '@/assets/placeholder.webp'
import ContactForm from '@/components/main/contact-form'
import WorkingHoursPopover from '@/components/main/working-hours-popover'
import SpecialPropertyCard from '@/components/ui/special-property-card'
import { lang_1 } from '@/lib/lang_1'
import { getCompanyProfileMedia } from '@/server/media'
import { Image } from "@/components/ui/image";

const Office = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isPrivate = searchParams.get('private') === 'true';
    const [page, setPage] = useState(1);

    const { data, status, error } = useQuery({
        queryKey: ["office", id],
        queryFn: () => getOffice(String(id)),
    });

    const { data: properties } = useQuery({
        queryKey: ["properties-by-user", data?.id],
        queryFn: () => getProperties(page, { company: data?.id }),
        enabled: !!data?.id
    });

    const { data: relatedProjects } = useQuery({
        queryKey: ["related-projects", data?.id],
        queryFn: () => getProjects(null, { company: data?.id }),
    });
    const { data: brokers } = useQuery({
        queryKey: ["brokers-by-office", page, data?.id],
        queryFn: () => getBrokers(page, { company: data?.id }),
        enabled: !!data?.id
    });

    const { data: media } = useQuery({
        queryKey: ["office-media"],
        queryFn: () => getCompanyProfileMedia(),
    });

    const handleShare = () => {
        shareUrl({
            url: `${window.location.origin}/office/${data?.slug}`,
            title: data?.title || data?.full_name,
            text: data?.description,
        });
    };


    if (status === 'pending') return <Loader />
    if (error) return <Error />

    return (
        <section className="mt-30 flex flex-col gap-20">
            <div className="flex flex-col justify-center gap-10 min-h-[40vh] relative bg-no-repeat bg-top bg-cover" style={{ backgroundImage: `url(${media?.image ?? placeholder})` }}>
                <span className='bg-black/35 absolute inset-0 w-full h-full' />

                <div className="relative flex lg:flex-row flex-col items-center gap-5 h-full p-5 max-w-400 w-[90%] mx-auto">
                    <Image src={data?.image || placeholder} className='w-40 h-40 rounded-full object-cover' alt="avatar" />
                    <div className="flex flex-col gap-4 text-white">
                        <h3 className="font-bold text-2xl text-center lg:text-start">{data?.title || lang_1.details.officeName}</h3>
                        <p className='text-sm text-center lg:text-start'>{data?.description}</p>
                        <div className='flex lg:flex-row flex-col items-center text-center lg:text-start gap-4'>
                            <p className='flex items-center gap-2'>
                                <MapPin />
                                <span>{lang_1.details.address}: {data?.address || "-"}</span>
                            </p>
                            <p className='flex items-center gap-2'>
                                <File />
                                <span>{lang_1.details.licenseNumber}: {data?.license_number || "-"}</span>
                            </p>
                        </div>
                        <div className='flex items-center gap-4'>
                            <WorkingHoursPopover working_hours={data?.working_hours} />

                            <span className='px-6 h-10 rounded-lg bg-[#A97A36] text-white font-semibold text-base flex items-center justify-center'>
                                {lang_1.details.propertiesCount}: {properties?.count || 0}
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
                        <h3 className="text-2xl font-bold">{lang_1.details.officeInfo}</h3>
                        <p>{data?.desc ?? "-"}</p>
                        <hr />
                        <h3 className="text-2xl font-bold">{lang_1.details.officeBrokers}</h3>
                        <div className="w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 ">
                            {brokers?.results?.length ? brokers.results.map((broker: any, index: number) => (
                                <PropertyCard data={broker} person personUrl={`/brokers/${broker?.slug}`} grid key={broker.id || index} />
                            )) : (
                                <div className="col-span-full text-center text-[#08182D] py-10 font-bold">
                                    {lang_1.details.noBrokers}
                                </div>
                            )}
                        </div>
                        <ListPagination
                            page={page}
                            setPage={setPage}
                            count={brokers?.count}
                        />
                    </div>
                </div>

                <ContactForm
                    title={`${lang_1.details.messageTo} ${data?.title || ''}`}
                    user={data}
                />
            </div>

            <Advertisement ad={media?.advertisement} className="w-full h-60 bg-no-repeat bg-center bg-cover block" />
            {!isPrivate && (
                <div className="lg:w-full flex flex-col gap-10">
                    <h3 className="max-w-400 w-[90%] mx-auto font-bold lg:text-2xl text-xl"> {lang_1.sections.properties}</h3>
                    <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-4 ">
                        {properties?.results?.slice(0, 10)?.map((item: any) => (
                            <PropertyCard grid key={item?.id} data={item} />
                        ))}
                    </div>
                    <Link to={`/properties`} className="text-xl font-bold underline underline-offset-2 mx-auto max-w-400 w-[90%] text-center">{lang_1.sections.showMore}</Link>
                    <h3 className="max-w-400 w-[90%] mx-auto font-bold lg:text-2xl text-xl">{lang_1.details.officeProjects}</h3>
                    <div className="max-w-400 w-[90%] mx-auto grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-4 ">
                        {relatedProjects?.results?.slice(0, 10)?.map((item: any) => (
                            <SpecialPropertyCard grid key={item?.id} data={item} />
                        ))}
                    </div>
                    <Link to={`/projects`} className="text-xl font-bold underline underline-offset-2 mx-auto max-w-400 w-[90%] text-center">{lang_1.sections.showMore}</Link>
                </div>
            )}
        </section>
    )
}

export default Office