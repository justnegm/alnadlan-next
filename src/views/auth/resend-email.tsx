"use client";

import { Link } from '@/i18n/navigation';
import logo from '@/assets/logo.jpeg'
import { useMutation } from '@tanstack/react-query';
import { resendEmail } from '@/server/auth';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useForm } from "@tanstack/react-form";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resendEmailSchema } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { lang_1 } from '@/lib/lang_1';
import { Image } from "@/components/ui/image";
const ResendEmail = () => {
    const [seconds, setSeconds] = useState(0);
    const form = useForm({
        defaultValues: {
            email: "",
        },
        onSubmit: async ({ value }) => {
            mutate(value)
        },
    });

    const { mutate, status } = useMutation({
        mutationFn: (formData: any) => resendEmail(formData),
        onSuccess: (res) => {
            toast.success(res?.detail || lang_1.auth.activationEmailSentVariant);
            setSeconds(60);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || lang_1.auth.errorOccurred);
        },
    });


    useEffect(() => {
        if (seconds === 0) return;

        const timer = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds]);



    return (
        <section className='max-w-400 w-[90%] mx-auto flex items-center h-full'>
            <div className='flex flex-col gap-4 max-w-125 w-full rounded-3xl bg-white p-4 py-8 text-center'>
                <Link href={'/'}>
                    <Image src={logo.src} alt="logo" className='w-50 mx-auto aspect-square' />
                </Link>
                <p className='text-xl font-semibold'>{lang_1.auth.didNotReceiveEmail}</p>
                <p className='text-xl font-semibold'>{lang_1.auth.resendEmailTitle}</p>
                <FieldSet className="w-full">
                    <FieldGroup>
                        <form.Field
                            name="email"
                            validators={{
                                onChange: ({ value }) => {
                                    const result = resendEmailSchema.shape.email.safeParse(value)
                                    return result.success ? undefined : result.error.issues[0].message
                                },
                            }}
                        >
                            {(field) => {
                                const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                return (
                                    <Field>
                                        <FieldLabel>{lang_1.auth.email}</FieldLabel>
                                        <Input
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className={cn("h-10", hasError && "border-red-500 focus-visible:ring-red-500")}
                                            placeholder={lang_1.auth.email}
                                        />
                                        {hasError && (
                                            <FieldDescription className="text-red-500">
                                                {field.state.meta.errors[0]}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )
                            }}
                        </form.Field>
                    </FieldGroup>
                </FieldSet>

                <Button
                    disabled={seconds > 0}
                    onClick={() => form.handleSubmit()}
                    className="bg-[#131927] border-[#131927] text-white hover:opacity-75 w-full h-10 disabled:opacity-50"
                >
                    {status === "pending"
                        ? <Spinner />
                        : seconds > 0
                            ? `${lang_1.auth.resendLinkIn} ${seconds} ${lang_1.auth.seconds}`
                            : lang_1.auth.sendLink
                    }
                </Button>
            </div>
        </section>
    )
}

export default ResendEmail