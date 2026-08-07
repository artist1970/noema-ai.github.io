import {HAIR_COLORS,EYE_COLORS,SKIN_TONES,ACCENT_COLORS,colorValue} from "./appearance-catalog.js";
function esc(v){return String(v||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;")}
function hairPath(style){
  const m={
    short:`<path d="M58 82 Q80 38 128 48 Q169 50 181 88 Q155 67 126 67 Q91 67 58 82Z"/>`,
    wavy:`<path d="M49 86 Q55 37 106 42 Q157 32 187 80 Q181 109 170 122 Q169 84 145 68 Q117 55 91 70 Q65 84 62 121 Q49 105 49 86Z"/>`,
    curly:`<g>${[[62,75],[76,56],[96,48],[118,46],[140,49],[158,59],[174,77],[171,99],[154,83],[135,69],[111,67],[87,72],[68,93]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="18"/>`).join("")}</g>`,
    coily:`<g>${[[59,76],[72,57],[91,47],[112,44],[133,46],[153,54],[169,70],[177,89],[167,104],[151,85],[130,72],[108,69],[85,76],[67,98]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="15"/>`).join("")}</g>`,
    long:`<path d="M49 86 Q57 35 113 40 Q173 37 188 89 L180 187 Q164 202 151 194 L155 104 Q146 68 113 66 Q76 68 67 105 L70 195 Q52 202 44 184Z"/>`,
    bob:`<path d="M49 88 Q57 35 113 41 Q171 39 187 91 L180 151 Q165 164 154 159 L157 102 Q145 68 113 67 Q79 68 67 103 L70 158 Q55 164 45 151Z"/>`,
    braids:`<path d="M53 86 Q64 39 113 42 Q163 39 181 86 Q151 66 113 67 Q78 67 53 86Z"/><path d="M65 89 Q54 135 61 190" fill="none" stroke-width="10" stroke-linecap="round"/><path d="M164 89 Q176 136 168 190" fill="none" stroke-width="10" stroke-linecap="round"/>`,
    locs:`<path d="M51 85 Q60 36 113 40 Q169 38 185 89 Q153 65 113 66 Q75 66 51 85Z"/><g fill="none" stroke-width="9" stroke-linecap="round">${[66,79,91,104,118,132,145,158].map((x,i)=>`<path d="M${x} 72 Q${x-8+(i%2)*16} 126 ${x-5+(i%3)*5} 182"/>`).join("")}</g>`,
    ponytail:`<path d="M50 87 Q59 37 112 41 Q166 38 184 86 Q154 65 113 67 Q75 67 50 87Z"/><ellipse cx="181" cy="88" rx="24" ry="42"/>`,
    bun:`<circle cx="113" cy="42" r="33"/><path d="M51 86 Q61 38 113 46 Q163 40 183 86 Q151 66 113 67 Q77 67 51 86Z"/>`,
    bald:``
  };return m[style]??m.wavy;
}
export function renderAvatarSVG(manifest={}, {size=260}={}){
  const a=manifest.appearance||{};
  const skin=colorValue(SKIN_TONES,a.skinTone,"#c98d68");
  const hair=colorValue(HAIR_COLORS,a.hairColor,"#68452e");
  const eyes=colorValue(EYE_COLORS,a.eyeColor,"#5d3a26");
  const primary=colorValue(ACCENT_COLORS,a.primaryColor,"#17243a");
  const secondary=colorValue(ACCENT_COLORS,a.secondaryColor,"#c7a45c");
  const name=esc(manifest.displayName||"My Mentor");
  return `<svg viewBox="0 0 226 300" width="${size}" height="${Math.round(size*1.327)}" role="img" aria-label="${name} avatar preview">
    <defs><linearGradient id="shirtGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/></linearGradient></defs>
    <rect x="3" y="3" width="220" height="294" rx="30" fill="#fbf7ef" stroke="#d6c39e"/>
    <circle cx="113" cy="116" r="68" fill="${skin}"/>
    <g fill="${hair}" stroke="${hair}">${hairPath(a.hairStyle)}</g>
    <ellipse cx="87" cy="112" rx="8" ry="6" fill="#fff"/><ellipse cx="139" cy="112" rx="8" ry="6" fill="#fff"/>
    <circle cx="87" cy="112" r="4.2" fill="${eyes}"/><circle cx="139" cy="112" r="4.2" fill="${eyes}"/>
    <circle cx="88" cy="111" r="1.3" fill="#fff"/><circle cx="140" cy="111" r="1.3" fill="#fff"/>
    <path d="M113 117 Q109 130 115 132" fill="none" stroke="#6d4736" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>
    <path d="M94 146 Q113 159 133 145" fill="none" stroke="#8b4f56" stroke-width="3" stroke-linecap="round"/>
    <path d="M55 276 Q63 190 113 187 Q166 190 174 276Z" fill="url(#shirtGrad)"/>
    <path d="M84 194 Q113 219 142 194" fill="none" stroke="#f7ead0" stroke-width="5" opacity=".7"/>
    <rect x="25" y="254" width="176" height="28" rx="14" fill="#17243add"/>
    <text x="113" y="273" text-anchor="middle" fill="#f7ead0" font-family="Georgia,serif" font-size="13">${name}</text>
  </svg>`;
}
