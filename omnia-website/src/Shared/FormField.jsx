import React from "react";
import { Label } from "@/components/ui/label";
import { Input as ShadInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// export const FormField = ({
//   label,
//   error,
//   htmlFor,
//   type = "text",
//   placeholder,
//   register,
//   name,
//   rules,
//   className,
//   icon: Icon,
//   inputProps = {},
// }) => {
//   return (
//     <div className="w-full space-y-2">
//       {label && (
//         <Label
//           htmlFor={htmlFor || name}
//           className="block text-[#5C5850] tracking-wide font-semibold text-sm"
//         >
//           {label}
//         </Label>
//       )}

//       <div className="relative">
//         {Icon && (
//           <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8B8680]">
//             <Icon size={20} />
//           </div>
//         )}

//         <ShadInput
//           id={htmlFor || name}
//           type={type}
//           placeholder={placeholder || label}
//           className={cn(
//             "w-full px-5 py-6 bg-white border-[1.5px] border-[#D4AF37]/20 rounded-2xl text-[#1A1A1C] placeholder:text-[#8B8680]",
//             "focus:outline-none focus:ring-0 focus:border-[#D4AF37] focus:shadow-[0_0_0_4px_rgba(212,175,55,0.1)]",
//             "transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
//             Icon ? "pl-14" : "",
//             error ? "border-[#B85450] focus:border-[#B85450] focus:shadow-[0_0_0_4px_rgba(184,84,80,0.1)]" : "",
//             className
//           )}
//           {...(register && name ? register(name, rules) : {})}
//           {...inputProps}
//         />
//       </div>

//       {error && (
//         <p className="text-[#B85450] text-sm mt-2 animate-in fade-in slide-in-from-top-1">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// };
export const FormField = ({
  label,
  name,
  register,
  icon: Icon,
  error,
  htmlFor,
  type = "text",
  placeholder,
  rules,
  className,
  inputProps = {},
}) => {
  return (
    <div className="w-full">
      {label && (
        <Label
          htmlFor={htmlFor || name}
          className="block text-[#5C5850] tracking-wide font-semibold text-sm"
        >
          {label}
        </Label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-luxury-gray w-5 h-5" />
        )}

        <input
          type={type}
          {...register(name)}
          placeholder={placeholder || label}
          className={`
            w-full px-5 py-4 ${Icon ? "pl-14" : ""}
            bg-white border-[1.5px] border-gold-primary/20
            rounded-2xl text-foreground placeholder:text-luxury-gray
            focus:border-gold-primary
            focus:shadow-[0_0_0_4px_rgba(212,175,55,0.1)]
            transition-all
            ${error ? "border-gold-danger" : ""}
          `}
          {...inputProps}
        />
      </div>

      {error && (
        <p className="text-gold-danger text-sm mt-2 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};
