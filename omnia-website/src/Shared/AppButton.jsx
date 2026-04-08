// import React from "react";
// import { Button as ShadButton } from "@/components/ui/button";
// import { cn } from "@/lib/utils";

// export default function AppButton({
//   label,
//   children, 
//   leftIcon: LeftIcon,
//   rightIcon: RightIcon,
//   variant = "primary", 
//   size = "md",
//   onClick,
//   className = "",
//   type = "button",
//   ...props
// }) {
  
//   const customVariants = {
//     primary: 'bg-gradient-to-r from-[#D4AF37] to-[#CD7F32] text-white hover:from-[#E5C158] hover:to-[#D4AF37] shadow-md hover:shadow-lg hover:-translate-y-0.5',
//     secondary: 'bg-white border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white shadow-sm hover:shadow-md hover:-translate-y-0.5',
//     outline: 'bg-white border border-[#C8C3B8] text-[#2C2C2E] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 shadow-sm',
//     ghost: 'bg-[#D4AF37]/8 text-[#D4AF37] hover:bg-[#D4AF37]/15',
//     danger: 'bg-[#B85450] text-white hover:bg-[#A84844] shadow-md'
//   };

//   const customSizes = {
//     sm: 'px-5 py-2.5 text-sm',
//     md: 'px-7 py-3.5 text-[15px]',
//     lg: 'px-9 py-4 text-base',
//     default: 'px-7 py-3.5'
//   };

//   const baseLuxury = "rounded-2xl transition-all duration-300 inline-flex items-center justify-center gap-2.5 tracking-wide font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

//   return (
//     <ShadButton
//       variant="ghost" 
//       type={type}
//       onClick={onClick}
//       className={cn(
//         baseLuxury,
//         customVariants[variant] || "", 
//         customSizes[size] || customSizes.default,
//         className
//       )}
//       {...props}
//     >
//       {LeftIcon && <LeftIcon className="size-4" />}
//       {label || children}
//       {RightIcon && <RightIcon className="size-4" />}
//     </ShadButton>
//   );
// }
import React from "react";
import { Button as ShadButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function AppButton({
  label,
  children,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loading = false,
  className = "",
  ...props
}) {
  return (
    <ShadButton
      disabled={loading || props.disabled}
      className={cn(
        `
        w-full
        px-7 py-4
        rounded-2xl
        bg-gradient-to-r from-[#D4AF37] to-[#CD7F32]
        text-white
        font-semibold tracking-wide
        shadow-md
        hover:shadow-[0_10px_30px_rgba(212,175,55,0.35)]
        hover:-translate-y-0.5
        transition-all duration-300
        disabled:opacity-50 disabled:pointer-events-none
        `,
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <>
          {LeftIcon && <LeftIcon className="size-5" />}
          {label || children}
          {RightIcon && <RightIcon className="size-5" />}
        </>
      )}
    </ShadButton>
  );
}
