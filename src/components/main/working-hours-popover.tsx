"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useT } from "@/i18n/useT";

interface WorkingHoursPopoverProps {
    working_hours?: any[]
}

const WorkingHoursPopover = ({ working_hours }: WorkingHoursPopoverProps) => {
  const lang_1 = useT();
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div>
                    <Button variant="outline" className='bg-white text-black'>{lang_1.details.workHours}</Button>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="leading-none font-medium">{lang_1.details.workHours}</h4>
                        {working_hours && working_hours.length > 0 && working_hours.map((el: any) => {
                            if (el?.closed) {
                                return (
                                    <div key={el?.id} className="text-sm text-muted-foreground flex items-center justify-between">
                                        <span className='font-semibold min-w-[85px] capitalize'>{el?.day} :</span>
                                        <span>{lang_1.details.noHours}</span>
                                    </div>
                                )
                            }
                            return (
                                <div key={el?.id} className="text-sm text-muted-foreground flex items-center justify-between">
                                    <span className='font-semibold min-w-[85px] capitalize'>{el?.day} :</span>
                                    <span >{lang_1.details.from}</span>
                                    <span dir='ltr' className='min-w-[70px]'>{el?.open_from} {el?.am_pm_from}</span>
                                    <span >{lang_1.details.to}</span>
                                    <span dir='ltr' className=''> {el?.open_to} {el?.am_pm_to} </span>
                                </div>
                            )
                        })}
                        {(!working_hours || working_hours.length === 0) && (
                            <p className="text-sm text-muted-foreground">
                                {lang_1.details.noHours}
                            </p>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default WorkingHoursPopover
