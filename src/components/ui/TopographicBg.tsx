import React from 'react';

export interface TopographicBgProps {
  className?: string;
  opacity?: string;
}

export const TopographicBg: React.FC<TopographicBgProps> = ({
  className = '',
  opacity = 'opacity-[0.06] dark:opacity-[0.08]',
}) => {
  return (
    <div
      className={`pointer-events-none select-none absolute inset-0 w-full h-full overflow-hidden ${opacity} ${className}`}
      aria-hidden="true"
      style={{
        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
      }}
    >
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Concentric elevation ridge 1 (North-East terrain peak) */}
        <path
          d="M 820 160 C 820 115, 850 97, 880 94 C 916 91, 946 118, 943 160 C 940 208, 910 226, 870 223 C 834 220, 820 196, 820 160 Z"
          stroke="#0F2544"
          className="dark:stroke-[#94A3B8]"
          strokeWidth="1.1"
        />
        <path
          d="M 770 160 C 770 78, 825 45, 880 39 C 946 34, 1001 83, 995 160 C 990 248, 935 281, 870 275 C 804 270, 770 226, 770 160 Z"
          stroke="#1D4ED8"
          className="dark:stroke-[#60A5FA]"
          strokeWidth="1.1"
        />
        <path
          d="M 710 160 C 710 33, 795 -18, 880 -27 C 982 -36, 1067 41, 1058 160 C 1050 296, 965 347, 870 338 C 768 330, 710 262, 710 160 Z"
          stroke="#0F2544"
          className="dark:stroke-[#94A3B8]"
          strokeWidth="1.1"
        />
        <path
          d="M 640 160 C 640 -20, 760 -92, 880 -104 C 1024 -116, 1144 -8, 1132 160 C 1120 352, 1000 424, 870 412 C 726 400, 640 304, 640 160 Z"
          stroke="#1D4ED8"
          className="dark:stroke-[#60A5FA]"
          strokeWidth="1.1"
        />
        <path
          d="M 560 160 C 560 -80, 720 -176, 880 -192 C 1072 -208, 1232 -64, 1216 160 C 1200 416, 1040 512, 870 496 C 678 480, 560 352, 560 160 Z"
          stroke="#0F2544"
          className="dark:stroke-[#94A3B8]"
          strokeWidth="1.1"
        />

        {/* Sweeping cross-terrain contour lines (Flowing valleys and ridges) */}
        <path
          d="M -50 540 C 170 490, 310 620, 510 550 C 710 480, 870 570, 1250 480"
          stroke="#1D4ED8"
          className="dark:stroke-[#60A5FA]"
          strokeWidth="1.1"
        />
        <path
          d="M -50 480 C 180 430, 320 560, 520 490 C 720 420, 880 510, 1250 420"
          stroke="#0F2544"
          className="dark:stroke-[#94A3B8]"
          strokeWidth="1.1"
        />
        <path
          d="M -50 420 C 190 370, 330 500, 530 430 C 730 360, 890 450, 1250 360"
          stroke="#1D4ED8"
          className="dark:stroke-[#60A5FA]"
          strokeWidth="1.1"
        />
        <path
          d="M -50 360 C 200 310, 340 440, 540 370 C 740 300, 900 390, 1250 300"
          stroke="#0F2544"
          className="dark:stroke-[#94A3B8]"
          strokeWidth="1.1"
        />
        <path
          d="M -50 300 C 210 250, 350 380, 550 310 C 750 240, 910 330, 1250 240"
          stroke="#1D4ED8"
          className="dark:stroke-[#60A5FA]"
          strokeWidth="1.1"
        />
        <path
          d="M -50 240 C 220 190, 360 320, 560 250 C 760 180, 920 270, 1250 180"
          stroke="#0F2544"
          className="dark:stroke-[#94A3B8]"
          strokeWidth="1.1"
        />
        <path
          d="M -50 180 C 230 130, 370 260, 570 190 C 770 120, 930 210, 1250 120"
          stroke="#1D4ED8"
          className="dark:stroke-[#60A5FA]"
          strokeWidth="1.1"
        />

        {/* High elevation crest contours across top-left */}
        <path
          d="M -50 100 C 150 170, 320 30, 550 120 C 780 210, 920 90, 1250 140"
          stroke="#0F2544"
          className="dark:stroke-[#94A3B8]"
          strokeWidth="1.1"
        />
        <path
          d="M 80 50 C 280 120, 450 -20, 680 70 C 910 160, 1050 40, 1250 90"
          stroke="#1D4ED8"
          className="dark:stroke-[#60A5FA]"
          strokeWidth="1.1"
        />
        <path
          d="M -50 40 C 140 -20, 360 80, 580 10 C 800 -60, 1020 40, 1250 20"
          stroke="#0F2544"
          className="dark:stroke-[#94A3B8]"
          strokeWidth="1.1"
        />
      </svg>
    </div>
  );
};

export default TopographicBg;
