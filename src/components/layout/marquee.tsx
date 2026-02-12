"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PAYMENT_APPS } from "@/lib/constants";

export function PaymentLogoMarquee() {
  const logos = [...PAYMENT_APPS, ...PAYMENT_APPS]; // Double the array for seamless loop

  return (
    <div className="relative mt-12 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
        Comparing live offers across
      </p>
      
      <div className="flex">
        <motion.div
          className="flex gap-4 pr-4"
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
          style={{ width: "max-content" }}
        >
          {logos.map((app, index) => (
            <Link 
              key={`${app.slug}-${index}`} 
              href={`/offers?payment_app=${app.slug}`}
              className="block"
            >
              <div
                className="group relative flex h-14 w-40 cursor-pointer items-center justify-center gap-3 rounded-xl border border-border/40 bg-white/40 px-4 backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div 
                  className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-500 grayscale transition-all group-hover:bg-transparent group-hover:text-white group-hover:grayscale-0 dark:bg-zinc-800"
                  style={{ '--hover-bg': app.color } as React.CSSProperties}
                >
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-10"
                    style={{ backgroundColor: app.color }}
                  />
                  <span className="z-10 text-xs text-foreground group-hover:text-inherit">
                    {app.name.charAt(0)}
                  </span>
                  
                  {/* Colored dot for active state vibe */}
                  <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full opacity-20 transition-opacity group-hover:opacity-100" style={{ backgroundColor: app.color }} />
                </div>
                
                <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                  {app.name}
                </span>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
