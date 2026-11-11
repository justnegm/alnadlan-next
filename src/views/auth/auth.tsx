"use client";

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
import { loginSchema } from '@/lib/helpers';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/logo.jpeg'
import { useMutation } from '@tanstack/react-query';
import { login } from '@/server/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/auth-slice';
import { Spinner } from '@/components/ui/spinner';
import { useT } from "@/i18n/useT";
import { Image } from "@/components/ui/image";

const Auth = () => {
  const lang_1 = useT();
  const loginAuth = useAuth((s) => s.login);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      mutate(value)
    },
  })

  const { mutate, status } = useMutation({
    mutationFn: (formData: any) => login(formData),
    onSuccess: () => {
      loginAuth();
      // react-router's location.state.from doesn't exist in Next; the
      // redirect target is carried in the ?next= query param instead.
      const next = searchParams.get("next");
      // Only same-site paths: "//evil.com" or "https://..." would be an open redirect.
      const from = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      router.replace(from);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.password?.[0] ||
        err?.response?.data?.detail ||
        lang_1.auth.loginFailed;
      toast.error(message);
    },
  });
  return (
    <section className='max-w-400 w-[90%] mx-auto flex items-center h-full'>
      <div className='flex flex-col gap-4 max-w-125 w-full rounded-3xl bg-white p-4 py-8'>
        <Link href={'/'}>
          <Image src={logo.src} alt="logo" className='w-50 mx-auto aspect-square' />
        </Link>
        <h3 className='text-2xl font-semibold'>{lang_1.auth.welcomeToAlnadlan}</h3>
        <p className='text-xl font-semibold'>{lang_1.auth.login}</p>
        <FieldSet className="w-full">
          <FieldGroup>
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = loginSchema(lang_1).shape.email.safeParse(value)
                  return result.success ? undefined : result.error.issues[0].message
                },
              }}
            >
              {(field) => {
                const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0
                return (
                  <Field>
                    <FieldLabel htmlFor="email">{lang_1.auth.email}</FieldLabel>
                    <Input
                      id="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={cn("h-10", hasError && "border-red-500 focus-visible:ring-red-500")}
                      type="text" placeholder={lang_1.auth.email} />
                    {hasError && (
                      <FieldDescription className="text-red-500">
                        {field.state.meta.errors[0]}
                      </FieldDescription>
                    )}
                  </Field>
                )
              }

              }
            </form.Field>
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const result = loginSchema(lang_1).shape.password.safeParse(value)
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
          </FieldGroup>
        </FieldSet>

        <Link href={'/auth/reset-password'} className='text-sm underline underline-offset-2 text-zinc-600'>{lang_1.auth.forgotPassword}</Link>
        <Button type='submit' disabled={status === "pending"} onClick={() => form.handleSubmit()} className="bg-[#131927] border-[#131927] text-white hover:opacity-75 w-full h-10">
          {status === "pending" ? <Spinner /> : lang_1.auth.login}
        </Button>
        <div className='flex flex-col gap-4'>
          <p className='flex items-center gap-2 w-full'>
            <span className='w-full h-0.5 bg-black/10' />
            {lang_1.auth.or}
            <span className='w-full h-0.5 bg-black/10' />
          </p>
          <Link href={'/auth/register'} className='text-sm underline underline-offset-2 text-zinc-600 text-center'>{lang_1.auth.dontHaveAccount}</Link>
        </div>
      </div>
    </section>
  )
}

export default Auth