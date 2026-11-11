"use client";

import { useT } from "@/i18n/useT";

const NoData = () => {
  const lang_1 = useT();
  return (
    <div className="text-center text-zinc-600 min-h-[40vh] flex items-center justify-center lg:text-3xl">{lang_1.sections.noData}</div>
  )
}

export default NoData