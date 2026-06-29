import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, input, select, textarea, label, [role="button"], [role="combobox"], [role="option"], [tabindex="0"], .btn, .sb-item, .kpi, .stk-card, .task-card, .pg-btn, .picker-card, .qr-card, .chk-item, .date-pill, .stage-tab, .view-toggle button, .tb-btn, .tb-menu';
const DANGER_SEL = '.bi-del, [data-danger]';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot = dotRef.current;
    const rng = ringRef.current;
    if (!dot || !rng) return;

    const onMove = (e) => {
      const x = e.clientX + 'px';
      const y = e.clientY + 'px';
      dot.style.left = x;
      dot.style.top = y;
      rng.style.left = x;
      rng.style.top = y;
    };

    const onDown = () => document.body.classList.add('cc-click');
    const onUp = () => document.body.classList.remove('cc-click');

    const onOver = (e) => {
      if (e.target.closest(DANGER_SEL)) {
        document.body.classList.add('cc-hover', 'cc-danger');
      } else if (e.target.closest(INTERACTIVE)) {
        document.body.classList.add('cc-hover');
        document.body.classList.remove('cc-danger');
      }
    };

    const onOut = (e) => {
      if (!e.target.closest(INTERACTIVE)) return;
      const to = e.relatedTarget;
      if (to?.closest?.(INTERACTIVE)) return;
      document.body.classList.remove('cc-hover', 'cc-danger');
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.body.classList.remove('cc-hover', 'cc-click', 'cc-danger');
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cc-dot" aria-hidden="true" />
      <div ref={ringRef} className="cc-ring" aria-hidden="true" />
    </>
  );
}
