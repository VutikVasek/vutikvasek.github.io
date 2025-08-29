import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useEffect, useRef } from "react"

export default function Toast({ text, color, reshow, ...params }) {
  const toast = useRef(null);
  const { contextSafe } = useGSAP();

  const showToast = contextSafe(() => {
    if (!text || !toast.current) return;

    const el = toast.current;
    gsap.killTweensOf(el);
    requestAnimationFrame(() => {
      const width = el.offsetWidth;
      gsap.fromTo(el, {
        left: 'unset',
        right: -width,
        color: color,
      }, {
        right: 0,
        duration: 1,
        ease: 'sine.out',
        onComplete: () => {
          gsap.to(el, {
            right: -width,
            duration: 1,
            delay: 3,
            ease: 'sine.in',  
          })
        }
      })
    });
  });

  useEffect(() => {
    showToast()
  }, [text, color, reshow])

  return (
    <div className="relative stiff">
      <div className="fixed bottom-0 bg-slate-700 p-2 mb-2 right-[-10rem] rounded-l-md stiff" style={{color: {color}}} {...params} ref={toast}>
        {text}
      </div>
    </div>
  )
};