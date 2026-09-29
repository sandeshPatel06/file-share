/**
 * Accurately calculates caret coordinates (x, y, lineHeight) within a textarea.
 * Based on the battle-tested mirror-div technique used by GitHub, Notion, and Slack.
 */

const properties = [
  "direction",
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontSizeAdjust",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
  "MozTabSize",
] as const;

export interface CaretCoordinates {
  top: number;
  left: number;
  height: number;
}

export function getCaretCoordinates(element: HTMLTextAreaElement, position: number): CaretCoordinates {
  if (typeof window === "undefined" || !element) {
    return { top: 0, left: 0, height: 20 };
  }

  const div = document.createElement("div");
  div.id = "textarea-caret-position-mirror-div";
  document.body.appendChild(div);

  const style = div.style;
  const computed = window.getComputedStyle(element);

  style.whiteSpace = "pre-wrap";
  style.wordWrap = "break-word";
  style.position = "absolute";
  style.visibility = "hidden";
  style.top = "0px";
  style.left = "-9999px";

  for (const prop of properties) {
    // @ts-expect-error index access on CSSStyleDeclaration
    style[prop] = computed[prop];
  }

  style.overflow = "hidden";

  div.textContent = element.value.substring(0, position);

  const span = document.createElement("span");
  span.textContent = element.value.substring(position) || ".";
  div.appendChild(span);

  const coordinates: CaretCoordinates = {
    top: span.offsetTop + parseInt(computed.borderTopWidth || "0", 10),
    left: span.offsetLeft + parseInt(computed.borderLeftWidth || "0", 10),
    height: parseInt(computed.lineHeight || "20", 10) || parseInt(computed.fontSize || "14", 10) * 1.5,
  };

  document.body.removeChild(div);

  return coordinates;
}
