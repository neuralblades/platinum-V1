'use client';

import { useEffect, useState, useRef } from 'react';

interface CounterProps {
  end: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

// Custom hook for in-view detection using IntersectionObserver
function useInViewCustom(ref: React.RefObject<HTMLElement>, options: { once?: boolean; amount?: number } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options.once) observer.disconnect();
        } else if (!options.once) {
          setInView(false);
        }
      },
      { threshold: options.amount ?? 0.5 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options.once, options.amount]);
  return inView;
}

export default function CounterAnimation({
  end,
  duration = 2,
  delay = 0,
  prefix = '',
  suffix = '',
  className = '',
}: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInViewCustom(ref, { once: true, amount: 0.5 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Only start animation when component is in view
    if (isInView && !hasAnimated) {
      setHasAnimated(true);

      // Delay the start of the animation
      const delayTimeout = setTimeout(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = (timestamp - startTime) / (duration * 1000);

          if (progress < 1) {
            // Easing function for smoother animation
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easedProgress * end));
            animationFrame = requestAnimationFrame(animate);
          } else {
            setCount(end);
          }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
          cancelAnimationFrame(animationFrame);
          clearTimeout(delayTimeout);
        };
      }, delay * 1000);

      return () => clearTimeout(delayTimeout);
    }
  }, [isInView, end, duration, delay, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}
