"use client";

import axios from "axios"
import { motion } from "framer-motion"
import { Image } from "@/components/ui/image"
import placeholderAsset from "@/assets/placeholder.webp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { z } from "zod"
import { Spinner } from "@/components/ui/spinner"
import type { Dictionary } from "@/i18n/useT";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation } from "@tanstack/react-query"
import api from "@/server/api"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useT } from "@/i18n/useT";

const placeholderImg = (placeholderAsset as any)?.src ?? (placeholderAsset as any);

const contactSchema = (lang_1: Dictionary) => (z.object({
    name: z.string().min(2, lang_1.landing.nameRequired),
    email: z.string().email(lang_1.helpers.invalidEmail),
    phone: z.string().min(5, lang_1.landing.phoneRequired),
    plan: z.string().min(1, lang_1.landing.planRequired),
    message: z.string().min(10, lang_1.landing.messageTooShort),
}))

const Landing = ({ initialData }: { initialData?: any }) => {
  const lang_1 = useT();
    const sliderRef = useRef<HTMLDivElement>(null)
    const [showAd, setShowAd] = useState(false)
    const [isMuted, setIsMuted] = useState(true)

    const { data: landingData, isLoading } = useQuery({
        queryKey: ['landingPage'],
        queryFn: async () => {
            const res = await api.get('/landingpage/')
            return res.data
        },
        initialData: initialData ?? undefined,
    })

    useEffect(() => {
        if (landingData?.ad?.image) {
            const timer = setTimeout(() => setShowAd(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [landingData?.ad?.image])

    const contactMutation = useMutation({
        mutationFn: async (values: any) => {
            const payload = { ...values }
            if (payload.plan !== "" && !isNaN(Number(payload.plan))) {
                payload.plan = Number(payload.plan)
            }
            const res = await api.post('/landingpage/contact/', payload)
            try {
                // Proxied through our own route handler so the Make.com
                // webhook URL stays server-side.
                await axios.post('/api/landing-lead', payload)
            } catch (err) {
                console.error("Failed to send to make.com webhook", err);
            }
            return res.data
        },
        onSuccess: () => {
            toast.success(lang_1.contact.messageSentSuccess)
            form.reset()
        },
        onError: () => {
            toast.error(lang_1.landing.sendError)
        }
    })

    const partners = landingData?.partners?.items

    const plans = landingData?.plans?.items


    const scrollSlider = (dir: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = 350
            sliderRef.current.scrollBy({
                left: dir === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    const form = useForm({
        defaultValues: { name: "", email: "", phone: "", plan: "", message: "" },
        onSubmit: async ({ value }) => {
            await contactMutation.mutateAsync(value)
        }
    })

    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spinner className="w-12 h-12 text-[#08182D]" />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen" style={{ direction: 'rtl' }}>

            {/* 1. Hero Section */}
            <section id="hero" className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image src={landingData?.header?.image || placeholderImg} alt="Hero Background" className="w-full h-full object-cover" loading="eager" fetchPriority="high" />
                    <div className="absolute inset-0 bg-[#08182D]/70 mix-blend-multiply" />
                </div>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white"
                >
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">{landingData?.header?.title || lang_1.landing.heroTitle}</h1>
                    <p className="text-lg md:text-2xl opacity-90 mb-8">{landingData?.header?.description || lang_1.landing.heroDesc}</p>
                    <a href="#about">
                        <Button size="lg" className="bg-white text-[#08182D] hover:bg-gray-200 text-lg px-8 h-14 rounded-xl">
                            {lang_1.landing.exploreNow}
                        </Button>
                    </a>
                </motion.div>
            </section>

            {/* 2. About Section */}
            <section id="about" className="py-24 bg-gray-50">
                <div className="max-w-[1400px] w-[90%] mx-auto flex flex-col md:flex-row items-center gap-12">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="w-full md:w-1/2"
                    >

                        <div className="w-full aspect-video md:aspect-auto md:h-[500px] bg-gray-100 rounded-3xl shadow-xl overflow-hidden flex items-center justify-center">
                            {landingData?.about?.video_url ? (() => {
                                let url = landingData.about.video_url;
                                
                                const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^"&?\/\s]{11})/);
                                if (ytMatch && ytMatch[1]) {
                                    const videoId = ytMatch[1];
                                    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? '1' : '0'}&loop=1&playlist=${videoId}`;
                                    return (
                                        <iframe
                                            src={embedUrl}
                                            title="YouTube video player"
                                            className="w-full h-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            loading="lazy"
                                        ></iframe>
                                    );
                                }

                                try {
                                    const parsed = new URL(url);
                                    parsed.searchParams.set('mute', isMuted ? '1' : '0');
                                    parsed.searchParams.set('muted', isMuted ? '1' : '0');
                                    parsed.searchParams.set('autoplay', '1');
                                    parsed.searchParams.set('loop', '1');
                                    url = parsed.toString();
                                } catch {
                                    const separator = url.includes('?') ? '&' : '?';
                                    url = `${url}${separator}mute=${isMuted ? '1' : '0'}&muted=${isMuted ? '1' : '0'}&autoplay=1&loop=1`;
                                }
                                return (
                                    <iframe
                                        src={url}
                                        title="Video player"
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        loading="lazy"
                                    ></iframe>
                                );
                            })() : (
                                <video
                                    className="w-full h-full object-contain"
                                    autoPlay
                                    loop
                                    muted={isMuted}
                                    playsInline
                                    controls
                                    preload="auto"
                                >
                                    <source src={landingData?.about?.video} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>

                    </motion.div>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={{ hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.2 } } }}
                        className="w-full md:w-1/2 flex flex-col gap-6"
                    >
                        <h2 className="text-4xl font-bold text-[#08182D]">{landingData?.about?.title || lang_1.landing.aboutUs}</h2>
                        <div className="w-20 h-1.5 bg-[#131927] rounded-full" />
                        <p className="text-lg text-gray-600 leading-relaxed">
                            {landingData?.about?.description || lang_1.landing.aboutText1}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 3. Iframe Section */}
            <section id="iframe" className="py-12 bg-white flex justify-center">
                <div className="w-[90%] max-w-[1400px]">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="w-full h-[500px] md:h-[700px] rounded-[2rem] overflow-hidden shadow-2xl"
                    >
                        <iframe
                            src={landingData?.about?.three_d_link}
                            title="YouTube video player"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </motion.div>
                </div>
            </section>

            {/* 4. Partners Section */}
            <section id="partners" className="py-24 bg-gray-50 overflow-hidden">
                <div className="max-w-[1400px] w-[90%] mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="flex items-center justify-between mb-12"
                    >
                        <div>
                            <h2 className="text-4xl font-bold text-[#08182D] mb-4">{landingData?.partners?.title || lang_1.landing.ourPartners}</h2>
                            <div className="w-20 h-1.5 bg-[#131927] rounded-full" />
                        </div>
                        <div className="gap-4 hidden md:flex" style={{ direction: 'ltr' }}>
                            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-[#08182D] text-[#08182D]" onClick={() => scrollSlider('right')}>
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-[#08182D] text-[#08182D]" onClick={() => scrollSlider('left')}>
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="relative"
                    >
                        <div
                            ref={sliderRef}
                            className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8"
                        >
                            {partners?.map((partner: any, idx: number) => (
                                <div key={partner.id || idx} className="min-w-[300px] md:min-w-[350px] snap-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                    <Image src={partner.image || partner.img || placeholderImg} alt={partner.name} className="w-full h-48 object-cover rounded-xl" />
                                    <h3 className="text-xl font-bold text-[#08182D]">{partner.name}</h3>
                                    <p className="text-gray-600">{partner.description || partner.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 5. Plans Section */}
            <section id="plans" className="py-24 bg-white">
                <div className="max-w-[1400px] w-[90%] mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="text-center mb-16 flex flex-col items-center"
                    >
                        <h2 className="text-4xl font-bold text-[#08182D] mb-4">{landingData?.plans?.title || lang_1.landing.pricingPlans}</h2>
                        <div className="w-20 h-1.5 bg-[#131927] rounded-full" />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans?.map((plan: any, index: number) => (
                            <motion.div
                                key={plan.id || index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } } }}
                                className="bg-white p-8 rounded-3xl border border-[#08182D] shadow-xl flex flex-col"
                            >
                                <h3 className="text-2xl font-bold text-[#08182D] mb-2">{plan.title}</h3>
                                <p className="text-4xl font-extrabold text-[#131927] mb-6">{plan.label || plan.price}</p>
                                <ul className="flex flex-col gap-4 mb-8 flex-1">
                                    {plan.features?.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2 text-gray-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#08182D]" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    onClick={() => {
                                        form.setFieldValue("plan", plan.id != null ? String(plan.id) : String(index));
                                        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="w-full h-12 rounded-xl bg-[#08182D] text-white hover:opacity-90"
                                >
                                    {lang_1.landing.choosePlan}
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Contact Section */}
            <section id="contact" className="py-24 bg-[#08182D] text-white">
                <div className="max-w-[1400px] w-[90%] mx-auto flex flex-col md:flex-row items-center gap-16">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                        className="w-full md:w-1/2 flex flex-col gap-6"
                    >
                        <h2 className="text-4xl font-bold mb-4">{landingData?.contact?.title || lang_1.landing.getInTouch}</h2>
                        <div className="w-20 h-1.5 bg-white rounded-full" />
                        <p className="text-lg opacity-80 leading-relaxed">
                            {landingData?.contact?.description || lang_1.landing.getInTouchDesc}
                        </p>

                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={{ hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } }}
                        className="w-full md:w-1/2 bg-white text-[#08182D] p-8 md:p-10 rounded-3xl shadow-2xl"
                    >
                        <h3 className="text-2xl font-bold mb-6 text-center">{lang_1.landing.contactUs}</h3>
                        <FieldSet className="w-full">
                            <FieldGroup>
                                <form.Field
                                    name="name"
                                    validators={{
                                        onChange: ({ value }) => contactSchema(lang_1).shape.name.safeParse(value).success ? undefined : lang_1.landing.nameRequired
                                    }}
                                >
                                    {(field) => {
                                        const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                                        return (
                                            <Field>
                                                <FieldLabel htmlFor="name" className="text-[#08182D]">{lang_1.contact.fullName}</FieldLabel>
                                                <Input value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} id="name" className={`h-12 bg-gray-50 ${hasError ? "border-red-500" : ""}`} type="text" placeholder={lang_1.contact.fullName} />
                                                {hasError && <FieldDescription className="text-red-500">{field.state.meta.errors[0] as string}</FieldDescription>}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                                <form.Field
                                    name="email"
                                    validators={{
                                        onChange: ({ value }) => contactSchema(lang_1).shape.email.safeParse(value).success ? undefined : lang_1.helpers.invalidEmail
                                    }}
                                >
                                    {(field) => {
                                        const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                                        return (
                                            <Field>
                                                <FieldLabel htmlFor="email" className="text-[#08182D]">{lang_1.contact.email}</FieldLabel>
                                                <Input value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} id="email" className={`h-12 bg-gray-50 ${hasError ? "border-red-500" : ""}`} type="email" placeholder="john@example.com" />
                                                {hasError && <FieldDescription className="text-red-500">{field.state.meta.errors[0] as string}</FieldDescription>}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                                <div className="flex flex-col md:flex-row gap-4 w-full">
                                    <form.Field
                                        name="phone"
                                        validators={{
                                            onChange: ({ value }) => contactSchema(lang_1).shape.phone.safeParse(value).success ? undefined : lang_1.landing.phoneRequired
                                        }}
                                    >
                                        {(field) => {
                                            const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                                            return (
                                                <Field className="w-full md:w-1/2">
                                                    <FieldLabel htmlFor="phone" className="text-[#08182D]">{lang_1.contact.phone}</FieldLabel>
                                                    <Input value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} id="phone" className={`h-12 bg-gray-50 rounded-lg ${hasError ? "border-red-500" : ""}`} type="text" placeholder="05x-xxxxxxx" />
                                                    {hasError && <FieldDescription className="text-red-500">{field.state.meta.errors[0] as string}</FieldDescription>}
                                                </Field>
                                            )
                                        }}
                                    </form.Field>

                                    <form.Field
                                        name="plan"
                                        validators={{
                                            onChange: ({ value }) => contactSchema(lang_1).shape.plan.safeParse(value).success ? undefined : lang_1.landing.planRequired
                                        }}
                                    >
                                        {(field) => {
                                            const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                                            return (
                                                <Field className="w-full md:w-1/2">
                                                    <FieldLabel className="text-[#08182D]">{lang_1.landing.selectedPlan}</FieldLabel>
                                                    <div dir="rtl" className="w-full">
                                                        <Select value={field.state.value || undefined} onValueChange={(val) => field.handleChange(val)}>
                                                            <SelectTrigger className={`w-full h-12! bg-gray-50 rounded-lg ${hasError ? "border-red-500" : ""}`}>
                                                                <SelectValue placeholder={lang_1.landing.choosePlan} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {plans?.map((p: any) => (
                                                                    <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    {hasError && <FieldDescription className="text-red-500">{field.state.meta.errors[0] as string}</FieldDescription>}
                                                </Field>
                                            )
                                        }}
                                    </form.Field>
                                </div>

                                <form.Field
                                    name="message"
                                    validators={{
                                        onChange: ({ value }) => contactSchema(lang_1).shape.message.safeParse(value).success ? undefined : lang_1.landing.messageTooShort
                                    }}
                                >
                                    {(field) => {
                                        const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
                                        return (
                                            <Field>
                                                <FieldLabel htmlFor="message" className="text-[#08182D]">{lang_1.contact.message}</FieldLabel>
                                                <Textarea value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} id="message" className={`min-h-[120px] bg-gray-50 ${hasError ? "border-red-500" : ""}`} placeholder={lang_1.contact.message} />
                                                {hasError && <FieldDescription className="text-red-500">{field.state.meta.errors[0] as string}</FieldDescription>}
                                            </Field>
                                        )
                                    }}
                                </form.Field>
                            </FieldGroup>
                        </FieldSet>

                        <Button
                            disabled={contactMutation.isPending}
                            onClick={(e) => { e.preventDefault(); form.handleSubmit(); }}
                            className="bg-[#131927] hover:bg-black text-white w-full h-12 mt-6 rounded-xl"
                        >
                            {contactMutation.isPending ? <Spinner className="text-white" /> : lang_1.contact.sendMessage}
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Ad Popup */}
            {landingData?.ad?.image && (
                <Dialog open={showAd} onOpenChange={(open) => {
                    setShowAd(open)
                    if (!open) setIsMuted(false)
                }}>
                    <DialogContent className="sm:max-w-[1200px] p-0 overflow-hidden bg-transparent border-none shadow-none [&>button]:bg-white [&>button]:text-black [&>button]:hover:bg-white [&>button]:hover:text-black [&>button]:opacity-100">
                        <a href={landingData.ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative" onClick={() => { setShowAd(false); setIsMuted(false); }}>
                            <Image src={landingData.ad.image} alt="Advertisement" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
                        </a>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default Landing
