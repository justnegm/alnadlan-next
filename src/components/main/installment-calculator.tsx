"use client";

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getBankInfo } from "@/server/main"
import { useT } from "@/i18n/useT";
import placeholderAsset from "@/assets/placeholder.webp"
import { Image } from "@/components/ui/image";

const placeholder = (placeholderAsset as any)?.src ?? (placeholderAsset as any);

export default function InstallmentCalculator({ price }: { price: number | string }) {
  const lang_1 = useT();
    const [downPaymentPercent, setDownPaymentPercent] = useState([20])
    const [years, setYears] = useState([15])

    const { data: bankInfo } = useQuery({
        queryKey: ["bank-info"],
        queryFn: getBankInfo,
    })

    const numericPrice = Number(price) || 0
    const downPayment = (downPaymentPercent[0] / 100) * numericPrice
    const loan = numericPrice - downPayment
    const interestRate = (bankInfo?.data?.interest ?? bankInfo?.interest ?? 5) / 100 // fallback to 5% if API is missing the specific field, adjusting based on actual payload

    // Monthly interest rate
    const r = interestRate / 12
    const n = years[0] * 12
    const installment = r === 0
        ? loan / n
        : loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)

    const avatar = bankInfo?.data?.image ?? bankInfo?.image ?? placeholder;

    return (
        <div className="flex lg:flex-row flex-col gap-10 max-w-400 w-[90%] mx-auto">
            <div className="w-full flex flex-col gap-20">
                <div className="flex flex-col gap-5 bg-white border border-zinc-300 p-4 rounded-lg">
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-2xl font-bold">{lang_1.details.calculateInstallment}</h3>
                        <Image src={avatar} className="w-10 h-10 rounded-full object-cover" alt="bank logo" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="font-bold">{lang_1.details.downPayment}</h3>
                        <h3 className="font-bold text-3xl">{downPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                    </div>
                    <div className="mx-auto grid w-full gap-3">
                        <Slider
                            value={downPaymentPercent}
                            onValueChange={setDownPaymentPercent}
                            min={0}
                            max={100}
                            step={1}
                            className="**:[[role=slider]]:bg-[#A97A36] [&_.bg-primary]:bg-[#A97A36]"
                        />
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-muted-foreground">{downPaymentPercent[0]}%</span>
                            <span className="text-sm text-muted-foreground ">0%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="font-bold">{lang_1.details.paymentPeriodYears}</h3>
                        <h3 className="font-bold text-3xl">{years[0]}</h3>
                    </div>
                    <div className="mx-auto grid w-full gap-3">
                        <Slider
                            value={years}
                            onValueChange={setYears}
                            min={1}
                            max={30}
                            step={1}
                            className="**:[[role=slider]]:bg-[#A97A36] [&_.bg-primary]:bg-[#A97A36]"
                        />
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-muted-foreground">{years[0]}</span>
                            <span className="text-sm text-muted-foreground">1</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:max-w-150 w-full flex flex-col gap-5">
                <div className="w-full p-10 bg-[#08182D] text-white rounded-lg flex flex-col  items-center gap-5">
                    <div className="flex items-center justify-between gap-4">
                        <Image src={avatar} className="w-10 h-10 rounded-full object-cover" alt="bank logo" />
                        <h3 className="font-bold text-2xl">{bankInfo?.bank_name}</h3>
                    </div>
                    <h3 className="font-bold text-2xl">{lang_1.details.installment}</h3>

                    <h3 className="font-bold text-3xl">{Math.round(installment || 0).toLocaleString()} ₪ / {lang_1.details.month}</h3>
                    <div className="grid grid-cols-2 gap-10 text-sm">
                        <p>{lang_1.details.downPayment}: {downPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })} ₪</p>
                        <p>{lang_1.details.loan} : {loan.toLocaleString(undefined, { maximumFractionDigits: 0 })} ₪</p>
                        <p>{lang_1.details.paymentPeriodYears} : {years[0]}</p>
                        <p>{lang_1.details.interest} : {bankInfo?.bank_interest_rate || 0}%</p>
                    </div>
                    <a href={bankInfo?.link || "#"} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-[#A97A36] text-white hover:opacity-75 w-full h-10">
                            {lang_1.details.contactNow}
                        </Button>
                    </a>

                    <p className="text-sm text-center text-white">{bankInfo?.bank_message}</p>
                </div>
            </div>
        </div>
    )
}
