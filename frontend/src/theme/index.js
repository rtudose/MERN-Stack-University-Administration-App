// src/theme/index.js
import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import getCustomTheme from './theme';

/**
 * Reusable hook to sync an external proxy scrollbar with a native scroll container.
 * It hides nothing by itself; consumers should style the native container to hide its scrollbar
 * and render a separate absolutely positioned proxy container outside the frame.
 */
export function useExternalScrollbarSync({
  deps = [], // external dependencies that should trigger re-evaluation (e.g., data length, sort, language)
  fallback = 17, // typical Windows Chrome scrollbar width
  rAFThrottleMs = 120,
  debug = false,
} = {}) {
  const nativeRef = useRef(null);
  const proxyRef = useRef(null);
  const frameRef = useRef(null);

  const [hasOverflow, setHasOverflow] = useState(false);
  const [ghostHeight, setGhostHeight] = useState(0);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  const effectiveScrollbarWidth = scrollbarWidth > 0 ? scrollbarWidth : fallback;
  const [metrics, setMetrics] = useState(null);

  const isSyncingRef = useRef(false);
  const lastEvtTsRef = useRef(0);
  const [domVersion, setDomVersion] = useState(0);
  const prevHasRef = useRef(null);
  const prevGhostRef = useRef(null);
  const prevMaxPxRef = useRef(null);
  const lastTopRef = useRef(null);
  const scrollParentRef = useRef(null);
  const lastFrameCHRef = useRef(null);
  const lastSPCHRef = useRef(null);
  // Track last applied maxHeight (px) to avoid redundant writes
  const lastCalcTsRef = useRef(0);

  const setNativeNode = useCallback((node) => {
    nativeRef.current = node;
    setDomVersion((v) => v + 1);
  }, []);
  const setProxyNode = useCallback((node) => {
    proxyRef.current = node;
    setDomVersion((v) => v + 1);
  }, []);
  const setFrameNode = useCallback((node) => {
    frameRef.current = node;
    setDomVersion((v) => v + 1);
  }, []);

  // Measure native vertical scrollbar width once using an off-DOM probe
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;';
    document.body.appendChild(probe);
    const width = probe.offsetWidth - probe.clientWidth;
    document.body.removeChild(probe);
    setScrollbarWidth(Math.max(0, width || 0));
  }, []);

  // Shared measurement + apply function
  const calculateAndApply = useCallback(() => {
    const el = nativeRef.current;
    if (!el) return;
    const proxy = proxyRef.current;
    const nowTs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const elScroll = el.scrollHeight;
    const elRect = el.getBoundingClientRect();
    // Cache last top for rAF-driven detection
    lastTopRef.current = elRect.top;
    // Compute available height from scroll parent or viewport; only constrain to the frame bottom once overflow is ON
    let availableClient = 0;
    let scrollParent = null;
    try {
      let p = el.parentElement;
      while (p) {
        const cs = window.getComputedStyle(p);
        const oy = (cs.overflowY || cs.overflow || '').toLowerCase();
        if (/(auto|scroll|overlay)/.test(oy)) { scrollParent = p; break; }
        p = p.parentElement;
      }
      scrollParentRef.current = scrollParent;
      const frame = frameRef.current;
      let availableFromSP;
      if (scrollParent) {
        const spRect = scrollParent.getBoundingClientRect();
        availableFromSP = Math.max(0, spRect.bottom - elRect.top);
      } else {
        const vh = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : elRect.bottom;
        availableFromSP = Math.max(0, vh - elRect.top);
      }
      let availableFromFrame = null;
      if (frame) {
        const fr = frame.getBoundingClientRect();
        availableFromFrame = Math.max(0, fr.bottom - elRect.top);
      }
      // Always respect the frame boundary when present; subtract 1px to avoid fencepost issues
      const SAFE = 2;
      const baseAvail = availableFromFrame != null ? Math.min(availableFromSP, availableFromFrame) : availableFromSP;
      availableClient = Math.max(0, baseAvail - SAFE);
    } catch (_) {
      const vh = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 0;
      availableClient = Math.max(0, vh - elRect.top);
    }
    const proxyClient = proxy ? Math.min(proxy.clientHeight || availableClient, availableClient) : availableClient;
    const diff = elScroll - availableClient;
    const ON_EPS = 2;
    let nextHas;
    if (prevHasRef.current === true) {
      // If we were overflowing, turn it OFF as soon as content fits (diff <= 0)
      nextHas = diff > 0;
    } else {
      // Require a small positive margin to turn ON to avoid flicker at the boundary
      nextHas = diff > ON_EPS;
    }
    // No additional bias; rely on hysteresis above to avoid oscillation
    if (prevHasRef.current !== nextHas) { prevHasRef.current = nextHas; setHasOverflow(nextHas); }
    let capPx;
    if (nextHas) {
      capPx = Math.max(0, Math.floor(Math.min(elScroll - 1, availableClient - 1)));
    } else {
      capPx = null; // no cap when not overflowing; allow natural shrink-to-content
    }
    const clientForGhost = nextHas ? Math.min(availableClient, capPx) : Math.min(availableClient, elScroll);
    const ghost = Math.max(1, elScroll - clientForGhost + proxyClient);
    if (prevGhostRef.current !== ghost) { prevGhostRef.current = ghost; setGhostHeight(ghost); }
    try {
      if (nextHas) {
        if (prevMaxPxRef.current !== capPx || el.style.height !== 'auto' || el.style.maxHeight !== `${capPx}px`) {
          prevMaxPxRef.current = capPx; el.style.height = 'auto'; el.style.maxHeight = `${capPx}px`;
        }
      } else {
        if (prevMaxPxRef.current != null || el.style.maxHeight) {
          prevMaxPxRef.current = null; el.style.height = 'auto'; el.style.maxHeight = '';
        }
      }
    } catch (_) { /* ignore */ }
    if (proxy) proxy.scrollTop = el.scrollTop;
    const m = { elScroll, availableClient, proxyClient, ghost, has: prevHasRef.current, capPx };
    if (debug) { setMetrics(m); }
    lastCalcTsRef.current = nowTs;
    if (debug) { console.info('[ScrollSync] layout update', m); }
  }, [debug]);

  // Observe layout to compute overflow and keep ghost height in sync
  useLayoutEffect(() => {
    const el = nativeRef.current;
    if (!el) return;
    calculateAndApply();
    // Stabilizer: re-measure on the next two frames to catch late style/font/layout updates
    let raf1 = 0, raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      calculateAndApply();
      raf2 = requestAnimationFrame(() => calculateAndApply());
    });
    // Also schedule a macrotask re-measure
    const to = setTimeout(calculateAndApply, 0);
    // And after fonts are ready
    let cancelled = false;
    if (document && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!cancelled) calculateAndApply(); });
    }
    const throttled = () => {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - lastCalcTsRef.current > rAFThrottleMs) { calculateAndApply(); }
    };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(throttled) : null;
    if (ro) ro.observe(el);
    // Also observe nearest scroll parent for size changes
    const sp = scrollParentRef.current;
    if (ro && sp) ro.observe(sp);
    // Observe frame if provided
    const fr = frameRef.current;
    if (ro && fr) ro.observe(fr);
    window.addEventListener('resize', throttled);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(to);
      cancelled = true;
      if (ro) ro.disconnect();
      window.removeEventListener('resize', throttled);
    };
  }, [domVersion, calculateAndApply, ...deps]);

  // Recalculate when the native scroll container's subtree mutates (rows mount, translations change text lengths, etc.)
  useEffect(() => {
    const el = nativeRef.current;
    if (!el || typeof MutationObserver === 'undefined') return;
    let raf = 0;
    const mo = new MutationObserver(() => {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - lastCalcTsRef.current < rAFThrottleMs) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(calculateAndApply);
    });
    try {
      mo.observe(el, { childList: true, subtree: true, attributes: true });
    } catch (_) { /* ignore */ }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      mo.disconnect();
    };
  }, [domVersion, calculateAndApply, ...deps]);

  // Two-way event-based syncing
  useEffect(() => {
    const el = nativeRef.current;
    const proxy = proxyRef.current;
    if (!el || !proxy) return;

    const onElScroll = () => {
      if (isSyncingRef.current) return;
      lastEvtTsRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
      isSyncingRef.current = true;
      proxy.scrollTop = el.scrollTop;
      isSyncingRef.current = false;
    };
    const onProxyScroll = () => {
      if (isSyncingRef.current) return;
      lastEvtTsRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
      isSyncingRef.current = true;
      el.scrollTop = proxy.scrollTop;
      isSyncingRef.current = false;
    };

    el.addEventListener('scroll', onElScroll, { passive: true });
    proxy.addEventListener('scroll', onProxyScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onElScroll);
      proxy.removeEventListener('scroll', onProxyScroll);
    };
  }, [domVersion, ...deps]);

  // rAF fallback mirroring + position shift detection (top changes)
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const el = nativeRef.current;
      const proxy = proxyRef.current;
      if (!el || !proxy) { raf = requestAnimationFrame(tick); return; }
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - lastEvtTsRef.current < rAFThrottleMs) { raf = requestAnimationFrame(tick); return; }
      // Detect element top changes (e.g., form expanding above) and recompute layout when it happens
      try {
        const curTop = el.getBoundingClientRect().top;
        if (lastTopRef.current == null) { lastTopRef.current = curTop; }
        else if (Math.abs(curTop - lastTopRef.current) > 1.0) {
          lastTopRef.current = curTop;
          // Throttle layout recalcs to avoid rapid cascades while form toggles
          const now2 = typeof performance !== 'undefined' ? performance.now() : Date.now();
          if (now2 - lastCalcTsRef.current > rAFThrottleMs) { calculateAndApply(); }
        }
        // Also detect frame/scroll-parent height changes without top movement
        const fr = frameRef.current;
        const sp = scrollParentRef.current;
        const frCH = fr ? fr.clientHeight : null;
        const spCH = sp ? sp.clientHeight : null;
        if (frCH != null && lastFrameCHRef.current == null) lastFrameCHRef.current = frCH;
        if (spCH != null && lastSPCHRef.current == null) lastSPCHRef.current = spCH;
        if ((frCH != null && Math.abs(frCH - lastFrameCHRef.current) > 0.5) || (spCH != null && Math.abs(spCH - lastSPCHRef.current) > 0.5)) {
          lastFrameCHRef.current = frCH;
          lastSPCHRef.current = spCH;
          const now3 = typeof performance !== 'undefined' ? performance.now() : Date.now();
          if (now3 - lastCalcTsRef.current > rAFThrottleMs) { calculateAndApply(); }
        }
      } catch (_) { /* ignore */ }
      const cur = el.scrollTop;
      if (cur !== last && !isSyncingRef.current) {
        last = cur;
        isSyncingRef.current = true;
        proxy.scrollTop = cur;
        isSyncingRef.current = false;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [domVersion, rAFThrottleMs, calculateAndApply, ...deps]);

  const forceAlign = useCallback(() => {
    const el = nativeRef.current;
    const proxy = proxyRef.current;
    if (el && proxy) {
      isSyncingRef.current = true;
      proxy.scrollTop = el.scrollTop;
      isSyncingRef.current = false;
    }
  }, []);

  return {
    nativeRef: setNativeNode,
    proxyRef: setProxyNode,
    frameRef: setFrameNode,
    hasOverflow,
    ghostHeight,
    scrollbarWidth,
    effectiveScrollbarWidth,
    forceAlign,
    recalculate: calculateAndApply,
    domVersion,
    metrics,
  };
}

export default getCustomTheme;
