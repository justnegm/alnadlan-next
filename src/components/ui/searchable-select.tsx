import { useState, useEffect } from "react"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import {
    Command,
    CommandInput,
    CommandEmpty,
    CommandList,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { lang_1 } from "@/lib/lang_1"

interface SearchableSelectProps {
    value: string | null;
    onChange: (value: string) => void;
    data: any;
    placeholder?: string;
    searchPlaceholder?: string;
    grouped?: boolean;
    groupKey?: string;
    multi?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
    onSearchChange?: (val: string) => void;
    shouldFilter?: boolean;
}

export default function SearchableSelect({
    value,
    onChange,
    data,
    placeholder = lang_1.filters.pleaseSelect,
    searchPlaceholder = lang_1.filters.searchPlaceholder,
    grouped = false,
    groupKey = "property_types",
    multi = false,
    onLoadMore,
    hasMore = false,
    isLoadingMore = false,
    onSearchChange,
    shouldFilter,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false)
    const [localSearch, setLocalSearch] = useState("")
    const [cachedLabels, setCachedLabels] = useState<Record<string, string>>({})

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20) {
            if (onLoadMore && hasMore && !isLoadingMore) {
                onLoadMore();
            }
        }
    };

    const isGrouped = grouped && data?.length > 0 && data[0][groupKey] !== undefined;

    const allOption = { label: "הכל", value: "all" };
    const flatOptions = isGrouped
        ? [allOption, ...(data?.flatMap((group: any) => group[groupKey]?.map((el: any) => ({ label: el.name, value: String(el.id) }))) || [])]
        : [allOption, ...(data?.map((el: any) => ({ label: el.name, value: String(el.id) })) || [])];

    const selectedIds = value
        ? String(value)
              .split(",")
              .map((id) => id.trim())
              .filter(Boolean)
        : [];

    const isAllSelected = value === "all";

    useEffect(() => {
        const newCache = { ...cachedLabels };
        let updated = false;
        
        if (multi) {
            selectedIds.forEach((id: string) => {
                const opt = flatOptions?.find((o: any) => String(o.value) === String(id));
                if (opt && newCache[id] !== opt.label) {
                    newCache[id] = opt.label;
                    updated = true;
                }
            });
        } else if (value && value !== "all") {
            const opt = flatOptions?.find((o: any) => String(o.value) === String(value));
            if (opt && newCache[value] !== opt.label) {
                newCache[value] = opt.label;
                updated = true;
            }
        }
        
        if (updated) {
            setCachedLabels(newCache);
        }
    }, [value, flatOptions, multi, selectedIds]);

    let displayText = placeholder;
    if (multi) {
        if (isAllSelected) {
            displayText = "הכל";
        } else {
            const selectedLabels = selectedIds
                .map((id) => {
                    const found = flatOptions?.find((opt: any) => opt.value !== "all" && String(opt.value) === String(id));
                    return found ? found.label : cachedLabels[id];
                })
                .filter(Boolean);
            displayText = selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder;
        }
    } else {
        if (isAllSelected) {
            displayText = "הכל";
        } else if (value) {
            const selected = flatOptions?.find((opt: any) => String(opt.value) === String(value));
            displayText = selected ? selected.label : (cachedLabels[value] || placeholder);
        } else {
            displayText = placeholder;
        }
    }

    return (
        <Popover open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setLocalSearch("");
                if (onSearchChange) onSearchChange("");
            }
        }}>
            <PopoverTrigger asChild>
                <div>
                    <Button variant="outline" className="w-full justify-between font-normal">
                        <span className="truncate">
                            {displayText}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command shouldFilter={shouldFilter !== undefined ? shouldFilter : !onSearchChange}>
                    <CommandInput 
                        placeholder={searchPlaceholder} 
                        value={localSearch}
                        onValueChange={(val) => {
                            setLocalSearch(val);
                            if (onSearchChange) onSearchChange(val);
                        }} 
                    />
                    <CommandList 
                        className='overflow-y-auto w-full max-h-48'
                        onScroll={handleScroll}
                    >
                        <CommandEmpty>{lang_1.filters.noResults}</CommandEmpty>

                        {isGrouped && (!localSearch || (shouldFilter !== undefined ? shouldFilter : !onSearchChange)) && (
                            <CommandGroup>
                                <CommandItem
                                    value="all"
                                    onSelect={() => {
                                        onChange("all")
                                        if (!multi) setOpen(false)
                                    }}
                                >
                                    הכל
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            isAllSelected ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            </CommandGroup>
                        )}
                        {isGrouped ? (
                            data?.map((group: any) => (
                                <CommandGroup key={group.id} heading={group.name} className="flex flex-col gap-2">
                                    <div className="flex w-full gap-1 flex-wrap max-w-60">
                                        {multi && (
                                            <button
                                                type="button"
                                                className={cn(
                                                    "w-fit h-fit text-sm py-1 px-3 border rounded-sm flex items-center justify-center gap-1 cursor-pointer border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400",
                                                    group[groupKey]?.length > 0 && group[groupKey]?.every((opt: any) => selectedIds.includes(String(opt.id))) && "border-zinc-400 bg-zinc-100"
                                                )}
                                                onClick={() => {
                                                    const groupOptionIds = group[groupKey]?.map((opt: any) => String(opt.id)) || [];
                                                    const currentIds = selectedIds.filter((id: string) => id !== "all");
                                                    const allGroupSelected = groupOptionIds.every((id: string) => currentIds.includes(id));
                                                    let newSelectedIds: string[];
                                                    if (allGroupSelected) {
                                                        newSelectedIds = currentIds.filter((id: string) => !groupOptionIds.includes(id));
                                                    } else {
                                                        const otherSelectedIds = currentIds.filter((id: string) => !groupOptionIds.includes(id));
                                                        newSelectedIds = [...otherSelectedIds, ...groupOptionIds];
                                                    }
                                                    onChange(newSelectedIds.join(","));
                                                }}
                                            >
                                                הכל
                                                {group[groupKey]?.length > 0 && group[groupKey]?.every((opt: any) => selectedIds.includes(String(opt.id))) && <Check size={12} className="h-4" />}
                                            </button>
                                        )}
                                        {group[groupKey]?.length > 0 ? group[groupKey]?.map((opt: any) => {
                                            const isSelected = multi ? selectedIds.includes(String(opt?.id)) : value === String(opt?.id);
                                            return (
                                                <button
                                                    key={opt?.id}
                                                    value={opt?.name}
                                                    className={cn("w-fit h-fit text-sm py-1 px-3 border rounded-sm flex items-center justify-center gap-1 cursor-pointer border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400", isSelected && "border-zinc-400 bg-zinc-100")}
                                                    onClick={() => {
                                                        if (multi) {
                                                            const optId = String(opt?.id);
                                                            let newSelectedIds: string[];
                                                            const currentIds = selectedIds.filter((id: string) => id !== "all");
                                                            if (currentIds.includes(optId)) {
                                                                newSelectedIds = currentIds.filter((id) => id !== optId);
                                                            } else {
                                                                newSelectedIds = [...currentIds, optId];
                                                            }
                                                            onChange(newSelectedIds.join(","));
                                                        } else {
                                                            onChange(String(opt?.id))
                                                            setOpen(false)
                                                        }
                                                    }}
                                                >
                                                    {opt?.name}
                                                    {isSelected && <Check size={12} className="h-4" />}
                                                </button>
                                            );
                                        }) : <CommandItem className="w-fit">
                                            {lang_1.filters.noResults}
                                        </CommandItem>
                                        }
                                    </div>
                                </CommandGroup>
                            ))
                        ) : (
                            <CommandGroup>
                                {flatOptions.map((opt: any) => {
                                    const isLocalFiltering = shouldFilter !== undefined ? shouldFilter : !onSearchChange;
                                    if (opt.value === "all" && localSearch && !isLocalFiltering) return null;

                                    const isOptSelected = multi
                                        ? (opt.value === "all" ? isAllSelected : selectedIds.includes(String(opt.value)))
                                        : value === opt?.value;
                                    return (
                                        <CommandItem
                                            key={opt?.value}
                                            value={opt?.label}
                                            onSelect={() => {
                                                if (multi) {
                                                    if (opt.value === "all") {
                                                        onChange("all");
                                                    } else {
                                                        const optVal = String(opt.value);
                                                        let newSelectedIds: string[];
                                                        const currentIds = selectedIds.filter((id: string) => id !== "all");
                                                        if (currentIds.includes(optVal)) {
                                                            newSelectedIds = currentIds.filter((id) => id !== optVal);
                                                        } else {
                                                            newSelectedIds = [...currentIds, optVal];
                                                        }
                                                        onChange(newSelectedIds.join(","));
                                                    }
                                                } else {
                                                    onChange(opt?.value)
                                                    setOpen(false)
                                                }
                                            }}
                                        >
                                            {opt?.label}
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isOptSelected ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        )}

                        {isLoadingMore && (
                            <div className="py-2 text-center text-xs text-zinc-500 font-medium flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                טוען עוד...
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
