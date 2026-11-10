import logo from '@/assets/logo.png'
import { useQuery } from '@tanstack/react-query'
import { getPeopleWithDisabilities } from '@/server/main'
import Loader from '@/components/ui/loader'
import Error from '../error'
import { formatDate } from '@/lib/utils'
import { lang_1 } from '@/lib/lang_1'
import { Image } from "@/components/ui/image";
const PeopleWithDisabilities = () => {
    const { data, status, error } = useQuery({
        queryKey: ['people-with-disabilities'],
        queryFn: getPeopleWithDisabilities
    })

    if (status === 'pending') return <Loader />
    if (error) return <Error />
    return (
        <section className="mt-20 flex flex-col gap-20">
            <div className="min-h-[50vh] bg-no-repeat bg-top bg-cover flex justify-center items-center">
                <div className="max-w-3xl w-[90%] mx-auto flex flex-col justify-center align-center text-center gap-4">
                    <Image src={logo} className='lg:w-40 w-30 mx-auto aspect-square' alt="alnadlan" />
                    <h3 className="text-3xl font-bold text-black">{data?.title}</h3>
                </div>
            </div>
            <div className="max-w-400 w-[90%] mx-auto flex flex-col gap-8">
                <p className='font-semibold'>{lang_1.sections.lastUpdated}: {formatDate(data?.updated_at)}</p>
                <div dangerouslySetInnerHTML={{ __html: data?.content }} />
            </div>
        </section>
    )
}

export default PeopleWithDisabilities