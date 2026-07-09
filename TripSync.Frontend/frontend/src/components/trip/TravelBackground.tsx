// Reusable "flight" glyph (classic jet silhouette) used across several illustrations below.
const JET_PATH =
  "M21,16V14L13,9V3.5C13,2.67 12.33,2 11.5,2C10.67,2 10,2.67 10,3.5V9L2,14V16L10,13.5V19L7.5,20.5V22L11.5,21L15.5,22V20.5L13,19V13.5L21,16Z";

const PIN_PATH =
  "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z";

function toXY(deg: number, r: number, cx = 50, cy = 50) {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
}

function JetGlyph({ x = 12, y = 12, size = 1, rotate = 0 }: { x?: number; y?: number; size?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${size})`}>
      <path d={JET_PATH} fill="currentColor" stroke="none" transform="translate(-12,-12)" />
    </g>
  );
}

/* ---------- small moving marks ---------- */

function JetMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d={JET_PATH} fill="currentColor" />
    </svg>
  );
}

function PinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d={PIN_PATH} fill="currentColor" />
    </svg>
  );
}

function CompassNeedleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10.5" strokeWidth="0.8" />
      <path d="M12 3.5 L14.5 12 L12 12 Z" fill="currentColor" stroke="none" opacity="0.9" />
      <path d="M12 20.5 L9.5 12 L12 12 Z" fill="currentColor" stroke="none" opacity="0.45" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------- large watermark illustrations (all viewBox 0 0 100 100) ---------- */

function CompassRoseArt({ className }: { className?: string }) {
  const majorTicks = Array.from({ length: 8 }, (_, i) => i * 45);
  const minorTicks = Array.from({ length: 24 }, (_, i) => i * 15).filter((deg) => deg % 45 !== 0);

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="38" strokeWidth="0.5" strokeDasharray="1 4" />

      {majorTicks.map((deg) => {
        const [x1, y1] = toXY(deg - 90, 47);
        const [x2, y2] = toXY(deg - 90, 38);
        return <line key={`maj-${deg}`} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1" />;
      })}
      {minorTicks.map((deg) => {
        const [x1, y1] = toXY(deg - 90, 47);
        const [x2, y2] = toXY(deg - 90, 42.5);
        return <line key={`min-${deg}`} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.5" />;
      })}

      <path d="M50 6 L55 50 L50 50 L45 50 Z" fill="currentColor" stroke="none" opacity="0.9" />
      <path d="M50 94 L45 50 L50 50 L55 50 Z" fill="currentColor" stroke="none" opacity="0.45" />
      <path d="M6 50 L50 45 L50 50 L50 55 Z" fill="currentColor" stroke="none" opacity="0.45" />
      <path d="M94 50 L50 55 L50 50 L50 45 Z" fill="currentColor" stroke="none" opacity="0.9" />
      <path d="M22 22 L50 50 L50 45 Z" fill="currentColor" stroke="none" opacity="0.25" />
      <path d="M78 22 L50 50 L55 50 Z" fill="currentColor" stroke="none" opacity="0.25" />
      <path d="M22 78 L50 50 L45 50 Z" fill="currentColor" stroke="none" opacity="0.25" />
      <path d="M78 78 L50 50 L50 55 Z" fill="currentColor" stroke="none" opacity="0.25" />

      <circle cx="50" cy="50" r="5" strokeWidth="0.6" />
      <circle cx="50" cy="50" r="2.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GlobeArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" strokeWidth="0.9" />
      <ellipse cx="50" cy="50" rx="18" ry="42" strokeWidth="0.55" />
      <ellipse cx="50" cy="50" rx="42" ry="18" strokeWidth="0.55" />
      <path d="M12 38 C30 28 70 28 88 38" strokeWidth="0.4" strokeDasharray="1 4" />
      <path d="M12 62 C30 72 70 72 88 62" strokeWidth="0.4" strokeDasharray="1 4" />

      <path d="M13 68 C34 22 66 20 89 42" strokeWidth="0.95" strokeDasharray="2 4.5" strokeLinecap="round" opacity="0.85" />
      <circle cx="13" cy="68" r="1.6" fill="currentColor" stroke="none" />
      <JetGlyph x={89} y={42} size={1.3} rotate={110} />
    </svg>
  );
}

function FlightPathArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="82" r="3" strokeWidth="1" />
      <circle cx="15" cy="82" r="1.1" fill="currentColor" stroke="none" />
      <path d="M15 82 C32 44 52 58 83 15" strokeWidth="1" strokeDasharray="1 5.5" strokeLinecap="round" />
      <JetGlyph x={83} y={15} size={1.7} rotate={128} />
    </svg>
  );
}

function TravelMapArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 22 L34 12 L66 22 L92 12 L92 78 L66 88 L34 78 L8 88 Z" strokeWidth="1" strokeLinejoin="round" />
      <path d="M34 12 L34 78" strokeWidth="0.6" strokeDasharray="1 3" />
      <path d="M66 22 L66 88" strokeWidth="0.6" strokeDasharray="1 3" />
      <path d="M16 74 C28 60 30 44 44 40 C58 36 60 50 74 34" strokeWidth="1" strokeDasharray="1 5" strokeLinecap="round" />
      <circle cx="16" cy="74" r="1.6" fill="currentColor" stroke="none" />
      <path d="M70 30 L78 38 M78 30 L70 38" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function LuggageTagArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 8 L82 34 L82 82 C82 87 78 90 73 90 L27 90 C22 90 18 87 18 82 L18 34 Z"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="26" r="4.4" strokeWidth="1" />
      <path d="M46.5 21 C40 12 60 12 53.5 21" strokeWidth="1" />
      <line x1="30" y1="52" x2="70" y2="52" strokeWidth="0.7" strokeDasharray="1 3" />
      <line x1="30" y1="62" x2="62" y2="62" strokeWidth="0.7" strokeDasharray="1 3" />
      <line x1="30" y1="72" x2="66" y2="72" strokeWidth="0.7" strokeDasharray="1 3" />
      <JetGlyph x={50} y={40} size={1.1} rotate={0} />
    </svg>
  );
}

function BoardingPassArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 18 C10 14 13 11 17 11 L83 11 C87 11 90 14 90 18 L90 30 A6 6 0 0 0 90 42 L90 82 C90 86 87 89 83 89 L17 89 C13 89 10 86 10 82 L10 42 A6 6 0 0 0 10 30 Z"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <JetGlyph x={50} y={29} size={1.5} rotate={45} />
      <line x1="24" y1="42" x2="76" y2="42" strokeWidth="0.6" strokeDasharray="1 4" />
      <line x1="14" y1="62" x2="86" y2="62" strokeWidth="0.6" strokeDasharray="1.5 3" />
      <line x1="24" y1="74" x2="46" y2="74" strokeWidth="0.9" />
      <line x1="24" y1="80" x2="40" y2="80" strokeWidth="0.9" />
      <line x1="56" y1="70" x2="56" y2="83" strokeWidth="1" />
      <line x1="60" y1="70" x2="60" y2="83" strokeWidth="0.5" />
      <line x1="64" y1="70" x2="64" y2="83" strokeWidth="1.2" />
      <line x1="68" y1="70" x2="68" y2="83" strokeWidth="0.5" />
      <line x1="72" y1="70" x2="72" y2="83" strokeWidth="1" />
      <line x1="76" y1="70" x2="76" y2="83" strokeWidth="0.6" />
    </svg>
  );
}

function LifeRingArt({ className }: { className?: string }) {
  const bands = [0, 90, 180, 270];

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" strokeWidth="1" />
      <circle cx="50" cy="50" r="42" strokeWidth="6" strokeDasharray="6 6" opacity="0.32" />
      <circle cx="50" cy="50" r="24" strokeWidth="1" />
      {bands.map((deg) => {
        const [x1, y1] = toXY(deg, 24);
        const [x2, y2] = toXY(deg, 42);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="7" />;
      })}
    </svg>
  );
}

function PalmSunArt({ className }: { className?: string }) {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  const sunCx = 50;
  const sunCy = 32;

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx={sunCx} cy={sunCy} r="13" strokeWidth="1" />
      {rays.map((deg) => {
        const [x1, y1] = toXY(deg, 17, sunCx, sunCy);
        const [x2, y2] = toXY(deg, 22, sunCx, sunCy);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1" strokeLinecap="round" />;
      })}
      <path d="M50 58 C48 70 46 80 42 92" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M50 62 C40 56 28 58 18 50" strokeWidth="1" strokeLinecap="round" />
      <path d="M50 60 C42 50 30 46 20 34" strokeWidth="1" strokeLinecap="round" />
      <path d="M50 60 C54 48 64 42 76 32" strokeWidth="1" strokeLinecap="round" />
      <path d="M50 62 C58 54 70 52 82 56" strokeWidth="1" strokeLinecap="round" />
      <path d="M14 94 C34 88 66 88 86 94" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}


function PassportArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="10" width="56" height="80" rx="6" strokeWidth="1.2" />
      <rect x="29" y="17" width="42" height="66" rx="3" strokeWidth="0.7" opacity="0.55" />
      <circle cx="50" cy="42" r="13" strokeWidth="1" />
      <ellipse cx="50" cy="42" rx="5.5" ry="13" strokeWidth="0.65" />
      <path d="M37 42H63" strokeWidth="0.65" />
      <path d="M39 36C45 39 55 39 61 36" strokeWidth="0.5" />
      <path d="M39 48C45 45 55 45 61 48" strokeWidth="0.5" />
      <path d="M34 66H66" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M38 74H62" strokeWidth="0.7" strokeLinecap="round" strokeDasharray="1.5 3" />
    </svg>
  );
}

function CameraArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 34C18 29 22 25 27 25H38L44 17H58L64 25H74C79 25 83 29 83 34V74C83 79 79 83 74 83H27C22 83 18 79 18 74V34Z" strokeWidth="1.2" />
      <circle cx="51" cy="55" r="17" strokeWidth="1.1" />
      <circle cx="51" cy="55" r="8" strokeWidth="0.8" strokeDasharray="1 3" />
      <circle cx="72" cy="36" r="3.2" fill="currentColor" stroke="none" />
      <path d="M28 36H38" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function SuitcaseArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="30" width="64" height="54" rx="7" strokeWidth="1.2" />
      <path d="M38 30V23C38 18 42 15 47 15H53C58 15 62 18 62 23V30" strokeWidth="1.1" />
      <path d="M31 30V84" strokeWidth="0.7" strokeDasharray="1 4" />
      <path d="M69 30V84" strokeWidth="0.7" strokeDasharray="1 4" />
      <path d="M18 47H82" strokeWidth="0.8" />
      <circle cx="31" cy="47" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="69" cy="47" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RouteLabel({ className, children }: { className?: string; children: string }) {
  return (
    <div className={className}>
      <span>{children}</span>
    </div>
  );
}

function PostmarkGlyph({ className }: { className?: string }) {
  const ticks = Array.from({ length: 16 }, (_, i) => i * 22.5);

  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" strokeWidth="0.8" strokeDasharray="1 2.4" />
      <circle cx="20" cy="20" r="12" strokeWidth="0.6" />
      {ticks.map((deg) => {
        const [x1, y1] = toXY(deg, 17.5, 20, 20);
        const [x2, y2] = toXY(deg, 19.5, 20, 20);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.6" />;
      })}
      <JetGlyph x={20} y={20} size={0.9} rotate={-45} />
    </svg>
  );
}

export default function TravelBackground() {
  const sparks = Array.from({ length: 40 }, (_, index) => index + 1);
  const miniMarks = Array.from({ length: 16 }, (_, index) => index + 1);

  return (
    <div className="travel-background-rich" aria-hidden="true">
      <div className="travel-bg-glow travel-bg-glow-one" />
      <div className="travel-bg-glow travel-bg-glow-two" />
      <div className="travel-bg-grid" />

      <svg
        className="travel-bg-routes"
        viewBox="0 0 1440 1180"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          className="travel-route travel-route-primary"
          d="M-72 162 C126 64 278 210 454 126 C626 44 760 142 930 112 C1122 78 1236 14 1518 138"
        />
        <path
          className="travel-route travel-route-left"
          d="M92 -48 C-18 112 202 226 70 392 C-54 548 192 676 82 828 C12 926 116 1058 268 1220"
        />
        <path
          className="travel-route travel-route-right"
          d="M1328 -28 C1490 114 1242 260 1378 420 C1502 566 1260 718 1364 850 C1438 944 1346 1086 1182 1208"
        />
        <path
          className="travel-route travel-route-crew"
          d="M-96 604 C168 494 348 670 592 580 C822 496 1018 650 1238 568 C1374 516 1458 548 1530 612"
        />
        <path
          className="travel-route travel-route-bottom"
          d="M-84 940 C172 850 350 1010 592 924 C824 842 994 1016 1232 928 C1368 878 1452 912 1526 966"
        />
        <path
          className="travel-route travel-route-diagonal"
          d="M-80 1120 C168 840 292 912 502 692 C720 466 876 518 1068 294 C1212 126 1330 92 1526 24"
        />
        <path
          className="travel-route travel-route-sweep"
          d="M-100 332 C170 210 342 418 574 292 C802 168 982 342 1190 226 C1328 148 1424 180 1540 86"
        />
      </svg>

      <svg
        className="travel-bg-map-lines"
        viewBox="0 0 1440 1180"
        preserveAspectRatio="none"
        fill="none"
      >
        <path className="travel-map-line travel-map-line-a" d="M34 802 C180 724 292 776 424 708 C566 634 710 720 860 640" />
        <path className="travel-map-line travel-map-line-b" d="M910 338 C1014 268 1112 324 1228 258 C1314 210 1386 236 1458 184" />
        <path className="travel-map-line travel-map-line-c" d="M940 1010 C1048 924 1162 1002 1296 912 C1396 846 1472 888 1538 816" />
        <path className="travel-map-line travel-map-line-d" d="M222 174 C338 256 448 202 568 286 C694 374 810 326 930 408" />
        <path className="travel-map-line travel-map-line-e" d="M170 1040 C326 936 448 1010 604 888 C756 770 870 848 1034 726" />
        <path className="travel-map-coast travel-map-coast-left" d="M-40 474 C42 450 112 510 80 586 C52 650 120 676 142 742 C172 832 76 874 122 962 C156 1026 244 1022 298 1090" />
        <path className="travel-map-coast travel-map-coast-right" d="M1510 420 C1418 448 1368 512 1410 590 C1450 664 1364 704 1324 778 C1278 866 1370 918 1314 1004 C1278 1062 1190 1050 1138 1120" />
      </svg>

      <div className="travel-bg-icons">
        <JetMark className="travel-mark travel-plane travel-plane-top-left" />
        <JetMark className="travel-mark travel-plane travel-plane-top-right" />
        <JetMark className="travel-mark travel-plane travel-plane-lower" />
        <JetMark className="travel-mark travel-plane travel-plane-center" />
        <JetMark className="travel-mark travel-plane travel-plane-left-bottom" />
        <CompassNeedleMark className="travel-mark travel-navigation travel-navigation-main" />
        <CompassNeedleMark className="travel-mark travel-navigation travel-navigation-alt" />

        <PinMark className="travel-mark travel-pin travel-pin-left" />
        <PinMark className="travel-mark travel-pin travel-pin-right" />
        <PinMark className="travel-mark travel-pin travel-pin-lower" />
        <PinMark className="travel-mark travel-pin travel-pin-upper" />
        <PinMark className="travel-mark travel-pin travel-pin-mid" />

        <CompassRoseArt className="travel-watermark travel-compass" />
        <CompassRoseArt className="travel-watermark travel-compass-small" />
        <GlobeArt className="travel-watermark travel-globe" />
        <FlightPathArt className="travel-watermark travel-route-icon" />
        <TravelMapArt className="travel-watermark travel-map-icon" />
        <LuggageTagArt className="travel-watermark travel-luggage" />
        <BoardingPassArt className="travel-watermark travel-ticket" />
        <LifeRingArt className="travel-watermark travel-anchor" />
        <PalmSunArt className="travel-watermark travel-waves" />
        <PassportArt className="travel-watermark travel-passport" />
        <CameraArt className="travel-watermark travel-camera" />
        <SuitcaseArt className="travel-watermark travel-suitcase" />
      </div>

      <div className="travel-bg-stamps">
        <div className="travel-stamp travel-stamp-left">
          <PostmarkGlyph />
          <span>TOKYO</span>
        </div>
        <div className="travel-stamp travel-stamp-mid">
          <PostmarkGlyph />
          <span>BOARDING</span>
        </div>
        <div className="travel-stamp travel-stamp-right">
          <PostmarkGlyph />
          <span>COLOMBO</span>
        </div>
        <div className="travel-stamp travel-stamp-bottom">
          <PostmarkGlyph />
          <span>TRIP SYNC</span>
        </div>
      </div>

      <div className="travel-bg-labels">
        <RouteLabel className="travel-route-label travel-route-label-one">CHECK-IN</RouteLabel>
        <RouteLabel className="travel-route-label travel-route-label-two">GATE 07</RouteLabel>
        <RouteLabel className="travel-route-label travel-route-label-three">BAGAGEM</RouteLabel>
        <RouteLabel className="travel-route-label travel-route-label-four">ROTA</RouteLabel>
      </div>

      <div className="travel-bg-sparks">
        {sparks.map((spark) => (
          <span key={spark} className={`travel-spark travel-spark-${spark}`} />
        ))}
      </div>

      <div className="travel-bg-mini">
        {miniMarks.map((mark) => {
          const variants = ["dot", "square", "dash", "x"];
          const variant = variants[(mark - 1) % variants.length];

          return <span key={mark} className={`travel-mini travel-mini-${variant} travel-mini-${mark}`} />;
        })}
      </div>
    </div>
  );
}
