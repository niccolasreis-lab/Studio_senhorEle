import { useEffect, useRef } from 'react';
import './CuratorAmbientBackground.css';

const instrumentTicks = Array.from({ length: 17 }, (_, index) => {
  const angle = (204 + index * 4.2) * (Math.PI / 180);
  const outerRadius = 372;
  const innerRadius = index % 4 === 0 ? 344 : 354;
  const centerX = 1360;
  const centerY = 1015;

  return {
    x1: centerX + Math.cos(angle) * innerRadius,
    y1: centerY + Math.sin(angle) * innerRadius,
    x2: centerX + Math.cos(angle) * outerRadius,
    y2: centerY + Math.sin(angle) * outerRadius,
    emphasized: index === 11,
  };
});

export default function CuratorAmbientBackground() {
  const cursorLightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = cursorLightRef.current;
    if (!glow || typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (reducedMotion.matches || !precisePointer.matches) return;

    let frame = 0;
    let targetX = window.innerWidth * 0.72;
    let targetY = window.innerHeight * 0.38;
    let currentX = targetX;
    let currentY = targetY;

    const render = () => {
      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;
      glow.style.transform = `translate3d(${currentX - 210}px, ${currentY - 210}px, 0)`;

      if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.4) {
        frame = window.requestAnimationFrame(render);
      } else {
        glow.style.willChange = 'auto';
        frame = 0;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      glow.style.willChange = 'transform';
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    glow.style.transform = `translate3d(${currentX - 210}px, ${currentY - 210}px, 0)`;
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="curator-ambient" aria-hidden="true">
      <div className="curator-ambient__light curator-ambient__light--green" />
      <div className="curator-ambient__light curator-ambient__light--amber" />
      <div ref={cursorLightRef} className="curator-ambient__cursor-light" />
      <div className="curator-ambient__reflection" />

      <svg
        className="curator-ambient__drawing"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
        role="presentation"
      >
        <g className="curator-ambient__construction">
          <path d="M72 238 C236 170 356 176 482 238 S720 330 892 240" />
          <path className="curator-ambient__secondary-line" d="M92 273 C250 215 368 218 492 273" />
          <circle cx="276" cy="231" r="93" />
          <circle cx="276" cy="231" r="68" />
          <path d="M183 231 H369 M276 138 V324" />
          <path className="curator-ambient__slow-draw" pathLength={1} d="M596 208 C682 126 820 116 914 172 C1008 228 1062 308 1186 322" />
        </g>

        <path
          className="curator-ambient__body-line"
          pathLength={1}
          d="M84 735 C238 723 338 680 464 620 C542 582 600 476 716 454 C820 434 910 463 986 526 C1055 583 1102 650 1228 684 C1288 700 1340 704 1392 696"
        />

        <g className="curator-ambient__track">
          <path
            id="curator-track-path"
            d="M84 850 C172 790 258 806 304 862 C354 922 438 919 486 866 C527 821 565 779 624 794 C694 812 678 892 742 909"
          />
          <circle className="curator-ambient__particle" r="2.3">
            <animateMotion
              dur="38s"
              repeatCount="indefinite"
              path="M84 850 C172 790 258 806 304 862 C354 922 438 919 486 866 C527 821 565 779 624 794 C694 812 678 892 742 909"
            />
          </circle>
        </g>

        <g className="curator-ambient__instrument">
          <path d="M1016 1015 A344 344 0 0 1 1360 671" />
          <path d="M1045 1015 A315 315 0 0 1 1360 700" />
          {instrumentTicks.map((tick, index) => (
            <line
              key={index}
              className={tick.emphasized ? 'curator-ambient__tick--active' : undefined}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
            />
          ))}
        </g>

        <g className="curator-ambient__nodes">
          <path d="M214 683 L398 735 L572 662" />
          <path className="curator-ambient__node-link--desktop" d="M924 780 L1080 726 L1222 810" />
          <circle cx="214" cy="683" r="2.5" />
          <circle className="curator-ambient__node--pulse" cx="398" cy="735" r="3" />
          <circle cx="572" cy="662" r="2.2" />
          <circle className="curator-ambient__node--desktop" cx="924" cy="780" r="2.4" />
          <circle className="curator-ambient__node--desktop" cx="1080" cy="726" r="2.8" />
          <circle className="curator-ambient__node--desktop" cx="1222" cy="810" r="2.2" />
        </g>

        <g className="curator-ambient__precision">
          <path d="M28 164 H70 M49 143 V185 M1370 166 H1412 M1391 145 V187" />
          <path d="M34 398 H52 M34 416 H64 M34 434 H52 M1388 370 H1406 M1376 388 H1406 M1388 406 H1406" />
          <path d="M116 944 V968 M132 951 V968 M148 944 V968 M164 951 V968" />
        </g>
      </svg>

      <div className="curator-ambient__quiet-zone" />
      <div className="curator-ambient__card-glow curator-ambient__card-glow--studio" />
      <div className="curator-ambient__card-glow curator-ambient__card-glow--guest" />
      <div className="curator-ambient__grain" />
      <div className="curator-ambient__vignette" />
    </div>
  );
}
