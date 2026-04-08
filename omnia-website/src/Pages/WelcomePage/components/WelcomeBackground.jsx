import React from "react";

export const WelcomeBackground = ({ shimmerPosition }) => (
  <div className="fixed inset-0 bg-background overflow-hidden -z-10">
    <div
      className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, var(--color-gold-primary) 0px, var(--color-gold-primary) 1px, transparent 1px, transparent 60px),
                        repeating-linear-gradient(90deg, var(--color-gold-primary) 0px, var(--color-gold-primary) 1px, transparent 1px, transparent 60px)`,
      }}
    />

    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-gold-primary/10 to-transparent rounded-full blur-3xl animate-float" />
    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-gold-secondary/10 to-transparent rounded-full blur-3xl animate-float-delayed" />

    <div
      className="absolute inset-0 opacity-20"
      style={{
        background: `linear-gradient(90deg, transparent ${
          shimmerPosition - 10
        }%, rgba(212, 175, 55, 0.1) ${shimmerPosition}%, transparent ${
          shimmerPosition + 10
        }%)`,
      }}
    />
  </div>
);
