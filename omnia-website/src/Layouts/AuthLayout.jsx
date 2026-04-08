import React from "react";

export const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] to-[#F8F6F1] flex flex-col relative overflow-hidden">
      
      {/* Background decorative blobs - matching Figma */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top center gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#D4AF37]/[0.06] to-transparent rounded-full blur-3xl" />
        
        {/* Top right decorative element */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-gradient-to-bl from-[#D4AF37]/[0.08] via-[#CD7F32]/[0.04] to-transparent rounded-full blur-2xl" />
        
        {/* Bottom left subtle glow */}
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-[#CD7F32]/[0.05] to-transparent rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-10">
            <h2
              className="text-4xl mb-3 tracking-tight text-[#1A1A1C]"
              style={{ fontWeight: 400, fontFamily: "Cormorant Garamond, serif", fontStyle: "italic" }}
            >
              {title}
            </h2>
            <p className="text-luxury-gray tracking-wide text-sm">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
