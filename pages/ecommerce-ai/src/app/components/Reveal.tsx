import { useEffect, useRef, useState, type ElementType, type ReactNode, type CSSProperties } from "react";

type RevealProps = {
  as?: ElementType;
  className?: string;
  /** stagger index — multiplied by 70ms for transition-delay */
  delay?: number;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
};

/**
 * Scroll-entrance wrapper. Adds the `.in` class once the element scrolls into
 * view (IntersectionObserver). Self-contained state survives parent re-renders,
 * so elements that also get React-driven classes (e.g. module hot/dim) keep
 * their revealed state.
 */
export function Reveal({ as: Tag = "div", className = "", delay = 0, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`reveal ${inView ? "in" : ""} ${className}`.replace(/\s+/g, " ").trim()}
      style={{ transitionDelay: `${delay * 70}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
