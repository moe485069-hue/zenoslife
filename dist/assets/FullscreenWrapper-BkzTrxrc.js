import{i as a,r as l,a as h,j as t}from"./index-C0qRfO6f.js";/**
 * @license lucide-react v0.321.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=a("Maximize",[["path",{d:"M8 3H5a2 2 0 0 0-2 2v3",key:"1dcmit"}],["path",{d:"M21 8V5a2 2 0 0 0-2-2h-3",key:"1e4gt3"}],["path",{d:"M3 16v3a2 2 0 0 0 2 2h3",key:"wsl5sc"}],["path",{d:"M16 21h3a2 2 0 0 0 2-2v-3",key:"18trek"}]]);/**
 * @license lucide-react v0.321.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=a("Minimize",[["path",{d:"M8 3v3a2 2 0 0 1-2 2H3",key:"hohbtr"}],["path",{d:"M21 8h-3a2 2 0 0 1-2-2V3",key:"5jw1f3"}],["path",{d:"M3 16h3a2 2 0 0 1 2 2v3",key:"198tvr"}],["path",{d:"M16 21v-3a2 2 0 0 1 2-2h3",key:"ph8mxp"}]]);function f({children:c}){const n=l.useRef(null),[s,i]=l.useState(!1),{isRtl:r}=h();l.useEffect(()=>{const e=()=>{i(!!document.fullscreenElement)};return document.addEventListener("fullscreenchange",e),()=>{document.removeEventListener("fullscreenchange",e)}},[]);const o=()=>{var e;document.fullscreenElement?document.exitFullscreen():(e=n.current)==null||e.requestFullscreen().catch(u=>{console.warn(`Error attempting to enable fullscreen: ${u.message}`)})};return t.jsxs("div",{ref:n,className:`relative w-full h-full min-h-screen ${s?"bg-black":""}`,children:[c,t.jsx("button",{onClick:o,className:`fixed top-4 ${r?"left-4":"right-4"} z-50 p-2 rounded-xl bg-black/40 border border-white/20 text-white hover:bg-black/60 transition-colors backdrop-blur-md shadow-lg`,title:s?r?"خروج از تمام‌صفحه":"Exit Fullscreen":r?"تمام‌صفحه":"Fullscreen",children:s?t.jsx(p,{size:20}):t.jsx(d,{size:20})})]})}export{f as F};
