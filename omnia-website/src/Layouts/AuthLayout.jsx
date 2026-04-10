import React from "react";
import { Store } from "lucide-react";

export const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen precision-bg relative overflow-hidden text-on-surface">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[320px] w-[680px] -translate-x-1/2 rounded-full bg-surface-container-highest/50 blur-3xl" />
        <div className="absolute -right-32 top-24 h-[380px] w-[380px] rounded-full bg-primary-container/20 blur-[110px]" />
        <div className="absolute -bottom-36 left-[-8rem] h-[420px] w-[420px] rounded-full bg-secondary-container/40 blur-[120px]" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[440px] space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container shadow-sm">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-inverse-surface">Precision POS</h1>
            <p className="mt-2 text-sm font-medium text-on-surface-variant">Merchant Terminal Access</p>
          </div>

          <section className="precision-panel rounded-3xl border border-white p-8 md:p-9">
            <div className="mb-8 text-center">
              <h2 className="font-headline text-2xl font-extrabold tracking-tight text-inverse-surface">{title}</h2>
              <p className="mt-2 text-sm font-medium text-on-surface-variant">{subtitle}</p>
            </div>

            {children}
          </section>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-on-surface-variant">
            <span className="precision-chip">End-to-End Encrypted</span>
            <span className="precision-chip">PCI-DSS Compliant</span>
          </div>
        </div>
      </main>
    </div>
  );
};
