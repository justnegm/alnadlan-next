import { useState } from 'react'
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
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo.jpeg'
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { createAccount } from '@/server/auth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { registerSchema } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { lang_1 } from '@/lib/lang_1';
import { Image } from "@/components/ui/image";
const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false)
    const form = useForm({
        defaultValues: {
            full_name: "",
            email: "",
            phone: "",
            password1: "",
            password2: "",
            accept_terms: false
        },
        onSubmit: async ({ value }) => {
            if (!value.accept_terms) {
                toast.error(lang_1.auth.acceptTermsAlert)
                return
            }
            mutate(value)
        },
    })

    const { mutate, status } = useMutation({
        mutationFn: (formData: any) => createAccount(formData),
        onSuccess: (res) => {
            toast.success(res?.detail || lang_1.auth.activationEmailSent);
            setTimeout(() => {
                navigate("/auth/resend-email");
            }, 2000);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || lang_1.auth.errorOccurred);
        },
    });


    return (
        <section className='max-w-400 w-[90%] mx-auto flex items-center h-full'>
            <div className='flex flex-col gap-4 max-w-125 w-full rounded-3xl bg-white p-4 py-8'>
                <Link to={'/'}>
                    <Image src={logo} alt="logo" className='w-50 mx-auto aspect-square' />
                </Link>
                <p className='text-xl font-semibold'>{lang_1.auth.createAccount}</p>

                <FieldSet className="w-full">
                    <FieldGroup>

                        {/* Username */}
                        <form.Field
                            name="full_name"
                            validators={{
                                onChange: ({ value }) => {
                                    const result = registerSchema.shape.full_name.safeParse(value)
                                    return result.success ? undefined : result.error.issues[0].message
                                },
                            }}
                        >
                            {(field) => {
                                const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                return (
                                    <Field>
                                        <FieldLabel>{lang_1.auth.fullName}</FieldLabel>
                                        <Input
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className={cn("h-10", hasError && "border-red-500 focus-visible:ring-red-500")}
                                            placeholder={lang_1.auth.fullName}
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

                        {/* Email */}
                        <form.Field
                            name="email"
                            validators={{
                                onChange: ({ value }) => {
                                    const result = registerSchema.shape.email.safeParse(value)
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

                        {/* Phone */}
                        <form.Field
                            name="phone"
                            validators={{
                                onChange: ({ value }) => {
                                    const result = registerSchema.shape.phone.safeParse(value)
                                    return result.success ? undefined : result.error.issues[0].message
                                },
                            }}
                        >
                            {(field) => {
                                const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                return (
                                    <Field>
                                        <FieldLabel>{lang_1.auth.phone}</FieldLabel>
                                        <Input
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className={cn("h-10", hasError && "border-red-500 focus-visible:ring-red-500")}
                                            placeholder={lang_1.auth.phone}
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

                        {/* Password */}
                        <form.Field
                            name="password1"
                            validators={{
                                onChange: ({ value }) => {
                                    const result = registerSchema.shape.password1.safeParse(value)
                                    return result.success ? undefined : result.error.issues[0].message
                                },
                            }}
                        >
                            {(field) => {
                                const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                return (
                                    <Field>
                                        <FieldLabel>{lang_1.auth.password}</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                className={cn("h-10 pe-8", hasError && "border-red-500 focus-visible:ring-red-500")}
                                                placeholder={lang_1.auth.password}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="absolute left-0 top-1/2 -translate-y-1/2"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff /> : <Eye />}
                                            </Button>
                                        </div>
                                        {hasError && (
                                            <FieldDescription className="text-red-500">
                                                {field.state.meta.errors[0]}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )
                            }}
                        </form.Field>

                        <form.Field
                            name="password2"
                            validators={{
                                onChangeListenTo: ["password1"],
                                onChange: ({ value, fieldApi }) => {
                                    const result = registerSchema.shape.password2.safeParse(value)
                                    if (!result.success) return result.error.issues[0].message
                                    const password = fieldApi.form.getFieldValue("password1")
                                    if (!value || !password || value !== password) return lang_1.auth.passwordMismatch
                                    return undefined
                                },
                            }}
                        >
                            {(field) => {
                                const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                return (
                                    <Field>
                                        <FieldLabel>{lang_1.auth.confirmPassword}</FieldLabel>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                className={cn("h-10 pe-8", hasError && "border-red-500 focus-visible:ring-red-500")}
                                                placeholder={lang_1.auth.reTypePassword}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="absolute left-0 top-1/2 -translate-y-1/2"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff /> : <Eye />}
                                            </Button>
                                        </div>
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

                <form.Field name="accept_terms">
                    {(field) => (
                        <Field orientation="horizontal" className="my-2">
                            <Checkbox
                                checked={field.state.value}
                                onCheckedChange={(v) => field.handleChange(Boolean(v))}
                                id="terms-checkbox"
                            />
                            <Label htmlFor="terms-checkbox">
                                {lang_1.auth.agreeToTerms}
                            </Label>
                        </Field>
                    )}
                </form.Field>

                <Button
                    type="submit"
                    disabled={status === "pending"}
                    className="bg-[#131927] border-[#131927] text-white hover:opacity-75 w-full h-10"
                    onClick={() => form.handleSubmit()}
                >
                    {status === "pending" ? <Spinner /> : lang_1.auth.createAccount}
                </Button>

                <div className='flex flex-col gap-4'>
                    <p className='flex items-center gap-2 w-full'>
                        <span className='w-full h-0.5 bg-black/10' />
                        {lang_1.auth.or}
                        <span className='w-full h-0.5 bg-black/10' />
                    </p>
                    <Link to={'/auth'} className='text-sm underline underline-offset-2 text-zinc-600 text-center'>
                        {lang_1.auth.haveAccount}
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default Register