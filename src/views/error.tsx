"use client";

import { Link } from "@/i18n/navigation"
import { useT } from "@/i18n/useT"

const Error = () => {
  const t = useT()
  return (
    <section className="flex flex-col items-center justify-center h-screen gap-5 p-5 text-center">
      <h3 className="lg:text-4xl text-2xl font-bold">{t.common.notFoundTitle}</h3>
      <p className="lg:text-3xl text-xl font-black">404</p>
      <Link href={'/'} className="text-blue-500 underline underline-offset-2">{t.common.backHome}</Link>
    </section>
  )
}

export default Error
