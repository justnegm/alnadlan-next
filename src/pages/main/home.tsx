import PropertyCard from "@/components/ui/property-card"
import Reveal from "@/components/ui/reveal"
import bg from '@/assets/placeholder.webp'
import { Button } from "@/components/ui/button"
import { Link } from "react-router"
import SpecialPropertyCard from "@/components/ui/special-property-card"
import { useRef } from "react"
import { useHorizontalDragScroll } from "@/lib/helpers"
import { useQuery } from "@tanstack/react-query"
import { getBrokers, getProjects, getProperties, getSpecialProperties, getOffices, getMainInfo } from "@/server/main"
import PropertyFilter from "@/components/main/property-filter"
import useFilterNavigation from "@/hooks/useFilterNavigation"
import { lang_1 } from "@/lib/lang_1"
import { getHomeMedia } from "@/server/media"
import Advertisement from "@/components/ui/advertisement"
import { Image } from "@/components/ui/image"

const Home = () => {
  const { handleFilters } = useFilterNavigation();

  const { data: mainInfo } = useQuery({
    queryKey: ["main-info"],
    queryFn: () => getMainInfo(),
  });
  const { data: newest } = useQuery({
    queryKey: ["newest-properties"],
    queryFn: () => getProperties(),
  });

  const { data: special } = useQuery({
    queryKey: ["special-properties"],
    queryFn: () => getSpecialProperties(),
  });

  const { data: brokers } = useQuery({
    queryKey: ["brokers"],
    queryFn: () => getBrokers(),
  });

  const { data: offices } = useQuery({
    queryKey: ["offices"],
    queryFn: () => getOffices(),
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  const { data: media } = useQuery({
    queryKey: ["home-media"],
    queryFn: () => getHomeMedia(),
  });


  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const scrollRef4 = useRef<HTMLDivElement>(null);
  const scrollRef3 = useRef<HTMLDivElement>(null);
  const scrollRef5 = useRef<HTMLDivElement>(null);
  useHorizontalDragScroll(scrollRef1);
  useHorizontalDragScroll(scrollRef2);
  useHorizontalDragScroll(scrollRef3);
  useHorizontalDragScroll(scrollRef4);
  useHorizontalDragScroll(scrollRef5);

  return (
    <section className="mt-20 flex flex-col gap-20">
      <div className="relative min-h-[65vh] flex justify-center items-center overflow-hidden">
        <Image src={media?.image} fallbackSrc={bg} placeholderSrc={bg} fetchPriority="high" loading="eager" alt="Hero" objectTop className="absolute inset-0 w-full h-full object-cover object-top -z-10" />
        <PropertyFilter handleFilters={handleFilters} title={mainInfo?.website_title} text={mainInfo?.website_subtitle} />
      </div>

      <div className="max-w-400 w-[90%] mx-auto flex flex-col gap-8">
        <Reveal direction="down"><h3 className="font-bold lg:text-2xl text-xl">{lang_1.sections.featuredProperties}</h3></Reveal>
        <div ref={scrollRef2} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 select-none cursor-grab">
          {special?.results?.map((item: any) => (
            <SpecialPropertyCard key={item?.id} data={item?.property_details} />
          ))}
        </div>
        <Link to={'/properties'} className="mx-auto max-w-60 w-full">
          <Button className="px-12 py-2 h-10 bg-[#A97A36] text-xs w-full">{lang_1.sections.showMore}</Button>
        </Link>
      </div>

      <Advertisement ad={media?.advertisement} className="w-full h-75 bg-no-repeat bg-center bg-cover block" />



      <div className="max-w-400 w-[90%] mx-auto flex flex-col gap-8">
        <Reveal direction="down"><h3 className="font-bold lg:text-2xl text-xl">{lang_1.sections.latestProperties}</h3></Reveal>
        <div ref={scrollRef1} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 select-none cursor-grab">
          {newest?.results?.map((item: any) => (
            <PropertyCard key={item?.id} data={item} />
          ))}
        </div>
        <Link to={'/properties'} className="mx-auto max-w-60 w-full">
          <Button className="px-12 py-2 h-10 bg-[#A97A36] text-xs w-full">{lang_1.sections.showMore}</Button>
        </Link>
      </div>
      <div className="max-w-400 w-[90%] mx-auto flex flex-col gap-8">
        <Reveal direction="down"><h3 className="font-bold lg:text-2xl text-xl">{lang_1.header.brokers}</h3></Reveal>
        <div ref={scrollRef3} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 select-none cursor-grab">
          {brokers?.results?.map((item: any) => (
            <PropertyCard grid={false} person personUrl={`/brokers/${item?.slug}`} key={item?.id} data={item} />
          ))}
        </div>
        <Link to={'/brokers'} className="mx-auto max-w-60 w-full">
          <Button className="px-12 py-2 h-10 bg-[#A97A36] text-xs w-full">{lang_1.sections.showMore}</Button>
        </Link>
      </div>
      <div className="max-w-400 w-[90%] mx-auto flex flex-col gap-8">
        <Reveal direction="down"><h3 className="font-bold lg:text-2xl text-xl">{lang_1.header.offices}</h3></Reveal>
        <div ref={scrollRef5} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 select-none cursor-grab">
          {offices?.results?.map((item: any) => (
            <PropertyCard grid={false} office personUrl={`/office/${item?.slug}`} key={item?.id} data={item} />
          ))}
        </div>
        <Link to={'/offices'} className="mx-auto max-w-60 w-full">
          <Button className="px-12 py-2 h-10 bg-[#A97A36] text-xs w-full">{lang_1.sections.showMore}</Button>
        </Link>
      </div>
      <div className="max-w-400 w-[90%] mx-auto flex flex-col gap-8">
        <Reveal direction="down"><h3 className="font-bold lg:text-2xl text-xl">{lang_1.sections.underConstruction}</h3></Reveal>
        <div ref={scrollRef4} className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 select-none cursor-grab">
          {projects?.results?.map((item: any) => (
            <SpecialPropertyCard layoutTwo project key={item?.id} data={item} />
          ))}
        </div>
        <Link to={'/projects'} className="mx-auto max-w-60 w-full">
          <Button className="px-12 py-2 h-10 bg-[#A97A36] text-xs w-full">{lang_1.sections.showMore}</Button>
        </Link>
      </div>
    </section>
  )
}

export default Home