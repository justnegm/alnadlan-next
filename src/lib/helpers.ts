import { z } from "zod";
import { useEffect } from "react";
import type { RefObject } from "react";
import { toast } from "sonner";
import { lang_1 } from "./lang_1";


export function lazyRetry<T extends { default: React.ComponentType<unknown> }>(
  componentImport: () => Promise<T>,
): Promise<T> {
  return componentImport().catch((error: unknown) => {
    console.error(error);
    return Promise.reject(error);
  });
}

export function useHorizontalDragScroll(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const mouseDownHandler = (e: MouseEvent) => {
      isDown = true;
      element.classList.add("active"); // optional, for cursor styling
      startX = e.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
    };

    const mouseLeaveHandler = () => {
      isDown = false;
      element.classList.remove("active");
    };

    const mouseUpHandler = () => {
      isDown = false;
      element.classList.remove("active");
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast multiplier
      element.scrollLeft = scrollLeft - walk;
    };

    element.addEventListener("mousedown", mouseDownHandler);
    element.addEventListener("mouseleave", mouseLeaveHandler);
    element.addEventListener("mouseup", mouseUpHandler);
    element.addEventListener("mousemove", mouseMoveHandler);

    return () => {
      element.removeEventListener("mousedown", mouseDownHandler);
      element.removeEventListener("mouseleave", mouseLeaveHandler);
      element.removeEventListener("mouseup", mouseUpHandler);
      element.removeEventListener("mousemove", mouseMoveHandler);
    };
  }, [ref]);
}

export const resendEmailSchema = z.object({
  email: z.string().email(lang_1.helpers.invalidEmail),
});
export const loginSchema = z.object({
  email: z.string().email(lang_1.helpers.invalidEmail),
  password: z.string().min(6, lang_1.helpers.passwordMinLength),
});
export const changePasswordSchema = z
  .object({
    new_password1: z.string().min(6, lang_1.helpers.passwordMinLength),
    new_password2: z.string().min(6, lang_1.helpers.passwordMinLength),
  })
  .refine((data) => data.new_password1 === data.new_password2, {
    message: lang_1.helpers.passwordMismatch,
    path: ["new_password2"],
  });
export const updatePasswordSchema = z.object({
  old_password: z.string().min(1, lang_1.helpers.oldPasswordRequired),
  new_password1: z.string().min(6, lang_1.helpers.passwordMinLength),
  new_password2: z.string(),
});
export const contactSchema = z.object({
  email: z.string().email(lang_1.helpers.invalidEmail),
  name: z.string().min(2, lang_1.helpers.nameMinLength),
  phone: z.string().min(1, lang_1.helpers.phoneInvalid),
  message: z.string().min(2, lang_1.helpers.messageMinLength),
});
export const contactAllSchema = z.object({
  message: z.string().min(2, lang_1.helpers.messageMinLength),
  property_type: z.string().min(1, lang_1.helpers.typeRequired),
  contract_type: z.string().min(1, lang_1.helpers.contractTypeRequired),
  area: z.string().min(1, lang_1.helpers.areaRequired),
  city: z.string().min(1, lang_1.helpers.cityRequired),
  property_area_from: z.string().min(1, lang_1.helpers.spaceRequired),
  property_area_to: z.string().min(1, lang_1.helpers.spaceRequired),
  price_from: z.string().min(1, lang_1.helpers.priceFromRequired),
  price_to: z.string().min(1, lang_1.helpers.priceToRequired),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(3, lang_1.helpers.fullNameMinLength),
    email: z.string().email(lang_1.helpers.invalidEmail),
    phone: z.string().min(6, lang_1.helpers.phoneInvalid),
    password1: z.string().min(6, lang_1.helpers.passwordMinLength),
    password2: z.string(),
  })
  .refine((data) => data.password1 === data.password2, {
    message: lang_1.helpers.passwordMismatch,
    path: ["password2"],
  });



export const shareUrl = async ({ url = '', title = '', text = '' }) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(lang_1.helpers.linkCopied);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
};

export const formatPrice = (price: string | number | undefined | null): string => {
  if (price === undefined || price === null || price === '') return "-";
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(num);
};

export const contractTypes = [
  {
    id: 1,
    name: lang_1.helpers.contractTypeRent
  },
  {
    id: 2,
    name: lang_1.helpers.contractTypeSell
  }
]

export const propertyStatuses = [
  {
    id: 1,
    name: lang_1.helpers.statusExcellent
  },
  {
    id: 2,
    name: lang_1.helpers.statusGood
  },
  {
    id: 3,
    name: lang_1.helpers.statusFair
  },
  {
    id: 4,
    name: lang_1.helpers.statusNeedsRestoration
  }
]

export const propertyConditions = [
  { id: "new", name: lang_1.helpers.conditionNew },
  { id: "good", name: lang_1.helpers.conditionGood },
  { id: "fair", name: lang_1.helpers.conditionFair },
  { id: "poor", name: lang_1.helpers.conditionPoor }
];

export const createNumberArray = (start: number, end: number): number[] => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export const property_prices = [
  {
    id: 500000,
    name: "500.000 ₪"
  },
  {
    id: 1000000,
    name: "1.000.000 ₪"
  },
  {
    id: 1500000,
    name: "1.500.000 ₪"
  },
  {
    id: 2000000,
    name: "2.000.000 ₪"
  }
]

export const experiencesInYears = [
  {
    id: 1,
    name: lang_1.helpers.year1
  },
  {
    id: 2,
    name: lang_1.helpers.years2
  },
  {
    id: 3,
    name: lang_1.helpers.years3
  },
  {
    id: 4,
    name: lang_1.helpers.years4
  },
  {
    id: 5,
    name: lang_1.helpers.years5,
  },
  {
    id: 6,
    name: lang_1.helpers.years6,
  },
  {
    id: 7,
    name: lang_1.helpers.years7,
  },
  {
    id: 8,
    name: lang_1.helpers.years8,
  },
  {
    id: 9,
    name: lang_1.helpers.years9,
  },
  {
    id: 10,
    name: lang_1.helpers.years10,
  },
  {
    id: 11,
    name: lang_1.helpers.yearsMore10,
  },
]


