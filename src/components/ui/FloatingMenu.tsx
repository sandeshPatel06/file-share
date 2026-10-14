"use client";

import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { arrow, autoUpdate, computePosition, flip, offset, shift, type Placement } from "@floating-ui/dom";
import { createPortal } from "react-dom";

interface FloatingMenuProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
  placement?: Placement;
  offset?: number;
}

export function FloatingMenu({
  open,
  anchorRef,
  children,
  className = "",
  placement = "bottom",
  offset: distance = 8,
}: FloatingMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const arrowMaskRef = useRef<HTMLDivElement>(null);
  const [positioned, setPositioned] = useState(false);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !menuRef.current) {
      setPositioned(false);
      return;
    }

    const anchor = anchorRef.current;
    const menu = menuRef.current;
    const arrowElement = arrowRef.current;
    if (!arrowElement) return;
    const update = () => {
      computePosition(anchor, menu, {
        strategy: "fixed",
        placement,
        middleware: [offset(distance), flip({ padding: 8 }), shift({ padding: 8 }), arrow({ element: arrowElement, padding: 6 })],
      }).then(({ x, y, placement: resolvedPlacement, middlewareData }) => {
        Object.assign(menu.style, { left: `${x}px`, top: `${y}px` });
        const arrowData = middlewareData.arrow;
        if (arrowData) {
          const side = resolvedPlacement.split("-")[0];
          const staticSide = { top: "bottom", right: "left", bottom: "top", left: "right" }[side as "top" | "right" | "bottom" | "left"];
          Object.assign(arrowElement.style, {
            left: arrowData.x != null ? `${arrowData.x}px` : "",
            top: arrowData.y != null ? `${arrowData.y}px` : "",
            right: "",
            bottom: "",
            [staticSide]: "-5px",
          });
          if (arrowMaskRef.current) {
            Object.assign(arrowMaskRef.current.style, {
              left: arrowData.x != null ? `${arrowData.x}px` : "",
              top: arrowData.y != null ? `${arrowData.y}px` : "",
              right: "",
              bottom: "",
              [staticSide]: "-5px",
              width: "12px",
              height: "12px",
              clipPath: staticSide === "bottom" ? "inset(4px 0 0 0)" : staticSide === "top" ? "inset(0 0 4px 0)" : staticSide === "left" ? "inset(0 4px 0 0)" : "inset(0 0 0 4px)",
            });
          }
        }
        setPositioned(true);
      });
    };

    update();
    return autoUpdate(anchor, menu, update);
  }, [anchorRef, distance, open, placement]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      onMouseDown={(event) => event.stopPropagation()}
      className={`fixed z-[100] ${className}`}
      style={{ visibility: positioned ? "visible" : "hidden" }}
    >
      <div ref={arrowRef} className="absolute z-0 h-3 w-3 rotate-45 bg-[var(--modal-bg)]" aria-hidden="true" />
      <div ref={arrowMaskRef} className="pointer-events-none absolute z-0 bg-[var(--modal-bg)]" aria-hidden="true" />
      {children}
    </div>,
    document.body,
  );
}
