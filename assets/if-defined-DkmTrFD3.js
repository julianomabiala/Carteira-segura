function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/add-DgJSEOBv.js","assets/index-D7mYiV6G.js","assets/index-BSprzO2F.css","assets/all-wallets-DcPEgM2l.js","assets/arrow-bottom-circle-BrwZj7V5.js","assets/app-store-CotwNFAI.js","assets/apple-DdWkVehz.js","assets/arrow-bottom-Dv11FdRN.js","assets/arrow-left-CuHbYGxe.js","assets/arrow-right-CntqIV4l.js","assets/arrow-top-Cvc0CIv5.js","assets/bank-BvYHZzbH.js","assets/browser-CNIaKPdf.js","assets/card-V3Iyc6aC.js","assets/checkmark-yGnhgs7H.js","assets/checkmark-bold-Dkuf0cAg.js","assets/chevron-bottom-CVP449ay.js","assets/chevron-left-CXCzpctV.js","assets/chevron-right-DrdTt5o5.js","assets/chevron-top-Bjtm_Jhn.js","assets/chrome-store-BUKMd1oW.js","assets/clock-BhPsX3iD.js","assets/close-CBYQ5hV5.js","assets/compass-CJAPMiPi.js","assets/coinPlaceholder-QMdHYgi1.js","assets/copy-CPh9xhyR.js","assets/cursor-VGoBrQ2z.js","assets/cursor-transparent-C4SWXNSM.js","assets/desktop-T-jOsf4_.js","assets/disconnect-DLq21HWK.js","assets/discord-CGhNQVjE.js","assets/etherscan-D4Hz-_S6.js","assets/extension-COA168Qo.js","assets/external-link-BrqnUG2p.js","assets/facebook-CUrWBSKL.js","assets/farcaster-8dJx07Qy.js","assets/filters-yVXslorw.js","assets/github-Bc1AiSIS.js","assets/google-BaOxKMle.js","assets/help-circle-Dnwf8SRS.js","assets/image-BO_soBlT.js","assets/id-BmGrfWIh.js","assets/info-circle-CDCKDdPc.js","assets/lightbulb-C1IE9wYY.js","assets/mail-DgiyDHj2.js","assets/mobile-DNY2ZKzG.js","assets/more-B2Y0ttY0.js","assets/network-placeholder-BkTMvM5m.js","assets/nftPlaceholder-DrjQC5jF.js","assets/off-7pDQ0VEc.js","assets/play-store-DrlhQbFS.js","assets/plus-uSZd0bAp.js","assets/qr-code-QBcJgoAV.js","assets/recycle-horizontal-C96qE72H.js","assets/refresh-CIub-edG.js","assets/search-CD4h_IKZ.js","assets/send-BAdrQD0g.js","assets/swapHorizontal-6cnXvHeT.js","assets/swapHorizontalMedium-rmFL31Ls.js","assets/swapHorizontalBold-CjE22E8b.js","assets/swapHorizontalRoundedBold-Cwmn0MnI.js","assets/swapVertical-DCnmIIlB.js","assets/telegram-B7t-nbVD.js","assets/three-dots-DQI_iGIM.js","assets/twitch-C92LsCHt.js","assets/x-DJnTcSc4.js","assets/twitterIcon-SWgv_fli.js","assets/verify-CXv6ms62.js","assets/verify-filled-ULNjgirc.js","assets/wallet-Z4rZ5ie-.js","assets/walletconnect-CQTACANs.js","assets/wallet-placeholder-gggn28Nw.js","assets/warning-circle-eirhCkr2.js","assets/info-CUIR-ZX7.js","assets/exclamation-triangle--RrhUEa-.js","assets/reown-logo-lIVZOYjB.js"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
import{bb as k,bc as j,bd as T,i as P,r as R,c as B,a as I,b as E,_ as o,A as M}from"./index-D7mYiV6G.js";const h={getSpacingStyles(t,e){if(Array.isArray(t))return t[e]?`var(--wui-spacing-${t[e]})`:void 0;if(typeof t=="string")return`var(--wui-spacing-${t})`},getFormattedDate(t){return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)},getHostName(t){try{return new URL(t).hostname}catch{return""}},getTruncateString({string:t,charsStart:e,charsEnd:i,truncate:n}){return t.length<=e+i?t:n==="end"?`${t.substring(0,e)}...`:n==="start"?`...${t.substring(t.length-i)}`:`${t.substring(0,Math.floor(e))}...${t.substring(t.length-Math.floor(i))}`},generateAvatarColors(t){const i=t.toLowerCase().replace(/^0x/iu,"").replace(/[^a-f0-9]/gu,"").substring(0,6).padEnd(6,"0"),n=this.hexToRgb(i),a=getComputedStyle(document.documentElement).getPropertyValue("--w3m-border-radius-master"),s=100-3*Number(a==null?void 0:a.replace("px","")),c=`${s}% ${s}% at 65% 40%`,_=[];for(let v=0;v<5;v+=1){const p=this.tintColor(n,.15*v);_.push(`rgb(${p[0]}, ${p[1]}, ${p[2]})`)}return`
    --local-color-1: ${_[0]};
    --local-color-2: ${_[1]};
    --local-color-3: ${_[2]};
    --local-color-4: ${_[3]};
    --local-color-5: ${_[4]};
    --local-radial-circle: ${c}
   `},hexToRgb(t){const e=parseInt(t,16),i=e>>16&255,n=e>>8&255,a=e&255;return[i,n,a]},tintColor(t,e){const[i,n,a]=t,r=Math.round(i+(255-i)*e),s=Math.round(n+(255-n)*e),c=Math.round(a+(255-a)*e);return[r,s,c]},isNumber(t){return{number:/^[0-9]+$/u}.number.test(t)},getColorTheme(t){var e;return t||(typeof window<"u"&&window.matchMedia?(e=window.matchMedia("(prefers-color-scheme: dark)"))!=null&&e.matches?"dark":"light":"dark")},splitBalance(t){const e=t.split(".");return e.length===2?[e[0],e[1]]:["0","00"]},roundNumber(t,e,i){return t.toString().length>=e?Number(t).toFixed(i):t},formatNumberToLocalString(t,e=2){return t===void 0?"0.00":typeof t=="number"?t.toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:e}):parseFloat(t).toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:e})}};function U(t,e){const{kind:i,elements:n}=e;return{kind:i,elements:n,finisher(a){customElements.get(t)||customElements.define(t,a)}}}function H(t,e){return customElements.get(t)||customElements.define(t,e),e}function L(t){return function(i){return typeof i=="function"?H(t,i):U(t,i)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const F={attribute:!0,type:String,converter:j,reflect:!1,hasChanged:k},G=(t=F,e,i)=>{const{kind:n,metadata:a}=i;let r=globalThis.litPropertyMetadata.get(a);if(r===void 0&&globalThis.litPropertyMetadata.set(a,r=new Map),n==="setter"&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),n==="accessor"){const{name:s}=i;return{set(c){const _=e.get.call(this);e.set.call(this,c),this.requestUpdate(s,_,t,!0,c)},init(c){return c!==void 0&&this.C(s,void 0,t,c),c}}}if(n==="setter"){const{name:s}=i;return function(c){const _=this[s];e.call(this,c),this.requestUpdate(s,_,t,!0,c)}}throw Error("Unsupported decorator location: "+n)};function l(t){return(e,i)=>typeof i=="object"?G(t,e,i):((n,a,r)=>{const s=a.hasOwnProperty(r);return a.constructor.createProperty(r,n),s?Object.getOwnPropertyDescriptor(a,r):void 0})(t,e,i)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ct(t){return l({...t,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const N=t=>t===null||typeof t!="object"&&typeof t!="function",W=t=>t.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const V={ATTRIBUTE:1,CHILD:2},C=t=>(...e)=>({_$litDirective$:t,values:e});let x=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,i,n){this._$Ct=e,this._$AM=i,this._$Ci=n}_$AS(e,i){return this.update(e,i)}update(e,i){return this.render(...i)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const f=(t,e)=>{var n;const i=t._$AN;if(i===void 0)return!1;for(const a of i)(n=a._$AO)==null||n.call(a,e,!1),f(a,e);return!0},$=t=>{let e,i;do{if((e=t._$AM)===void 0)break;i=e._$AN,i.delete(t),t=e}while((i==null?void 0:i.size)===0)},z=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(i===void 0)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),X(e)}};function q(t){this._$AN!==void 0?($(this),this._$AM=t,z(this)):this._$AM=t}function K(t,e=!1,i=0){const n=this._$AH,a=this._$AN;if(a!==void 0&&a.size!==0)if(e)if(Array.isArray(n))for(let r=i;r<n.length;r++)f(n[r],!1),$(n[r]);else n!=null&&(f(n,!1),$(n));else f(this,t)}const X=t=>{t.type==V.CHILD&&(t._$AP??(t._$AP=K),t._$AQ??(t._$AQ=q))};class Y extends x{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,i,n){super._$AT(e,i,n),z(this),this.isConnected=e._$AU}_$AO(e,i=!0){var n,a;e!==this.isConnected&&(this.isConnected=e,e?(n=this.reconnected)==null||n.call(this):(a=this.disconnected)==null||a.call(this)),i&&(f(this,e),$(this))}setValue(e){if(W(this._$Ct))this._$Ct._$AI(e,this);else{const i=[...this._$Ct._$AH];i[this._$Ci]=e,this._$Ct._$AI(i,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class Z{constructor(e){this.G=e}disconnect(){this.G=void 0}reconnect(e){this.G=e}deref(){return this.G}}class Q{constructor(){this.Y=void 0,this.Z=void 0}get(){return this.Y}pause(){this.Y??(this.Y=new Promise(e=>this.Z=e))}resume(){var e;(e=this.Z)==null||e.call(this),this.Y=this.Z=void 0}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const O=t=>!N(t)&&typeof t.then=="function",D=1073741823;class J extends Y{constructor(){super(...arguments),this._$Cwt=D,this._$Cbt=[],this._$CK=new Z(this),this._$CX=new Q}render(...e){return e.find(i=>!O(i))??T}update(e,i){const n=this._$Cbt;let a=n.length;this._$Cbt=i;const r=this._$CK,s=this._$CX;this.isConnected||this.disconnected();for(let c=0;c<i.length&&!(c>this._$Cwt);c++){const _=i[c];if(!O(_))return this._$Cwt=c,_;c<a&&_===n[c]||(this._$Cwt=D,a=0,Promise.resolve(_).then(async v=>{for(;s.get();)await s.get();const p=r.deref();if(p!==void 0){const S=p._$Cbt.indexOf(_);S>-1&&S<p._$Cwt&&(p._$Cwt=S,p.setValue(v))}}))}return T}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}}const tt=C(J);class et{constructor(){this.cache=new Map}set(e,i){this.cache.set(e,i)}get(e){return this.cache.get(e)}has(e){return this.cache.has(e)}delete(e){this.cache.delete(e)}clear(){this.cache.clear()}}const A=new et,it=P`
  :host {
    display: flex;
    aspect-ratio: var(--local-aspect-ratio);
    color: var(--local-color);
    width: var(--local-width);
  }

  svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
    object-position: center;
  }

  .fallback {
    width: var(--local-width);
    height: var(--local-height);
  }
`;var m=function(t,e,i,n){var a=arguments.length,r=a<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,i):n,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,i,n);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(r=(a<3?s(r):a>3?s(e,i,r):s(e,i))||r);return a>3&&r&&Object.defineProperty(e,i,r),r};const b={add:async()=>(await o(()=>import("./add-DgJSEOBv.js"),__vite__mapDeps([0,1,2]))).addSvg,allWallets:async()=>(await o(()=>import("./all-wallets-DcPEgM2l.js"),__vite__mapDeps([3,1,2]))).allWalletsSvg,arrowBottomCircle:async()=>(await o(()=>import("./arrow-bottom-circle-BrwZj7V5.js"),__vite__mapDeps([4,1,2]))).arrowBottomCircleSvg,appStore:async()=>(await o(()=>import("./app-store-CotwNFAI.js"),__vite__mapDeps([5,1,2]))).appStoreSvg,apple:async()=>(await o(()=>import("./apple-DdWkVehz.js"),__vite__mapDeps([6,1,2]))).appleSvg,arrowBottom:async()=>(await o(()=>import("./arrow-bottom-Dv11FdRN.js"),__vite__mapDeps([7,1,2]))).arrowBottomSvg,arrowLeft:async()=>(await o(()=>import("./arrow-left-CuHbYGxe.js"),__vite__mapDeps([8,1,2]))).arrowLeftSvg,arrowRight:async()=>(await o(()=>import("./arrow-right-CntqIV4l.js"),__vite__mapDeps([9,1,2]))).arrowRightSvg,arrowTop:async()=>(await o(()=>import("./arrow-top-Cvc0CIv5.js"),__vite__mapDeps([10,1,2]))).arrowTopSvg,bank:async()=>(await o(()=>import("./bank-BvYHZzbH.js"),__vite__mapDeps([11,1,2]))).bankSvg,browser:async()=>(await o(()=>import("./browser-CNIaKPdf.js"),__vite__mapDeps([12,1,2]))).browserSvg,card:async()=>(await o(()=>import("./card-V3Iyc6aC.js"),__vite__mapDeps([13,1,2]))).cardSvg,checkmark:async()=>(await o(()=>import("./checkmark-yGnhgs7H.js"),__vite__mapDeps([14,1,2]))).checkmarkSvg,checkmarkBold:async()=>(await o(()=>import("./checkmark-bold-Dkuf0cAg.js"),__vite__mapDeps([15,1,2]))).checkmarkBoldSvg,chevronBottom:async()=>(await o(()=>import("./chevron-bottom-CVP449ay.js"),__vite__mapDeps([16,1,2]))).chevronBottomSvg,chevronLeft:async()=>(await o(()=>import("./chevron-left-CXCzpctV.js"),__vite__mapDeps([17,1,2]))).chevronLeftSvg,chevronRight:async()=>(await o(()=>import("./chevron-right-DrdTt5o5.js"),__vite__mapDeps([18,1,2]))).chevronRightSvg,chevronTop:async()=>(await o(()=>import("./chevron-top-Bjtm_Jhn.js"),__vite__mapDeps([19,1,2]))).chevronTopSvg,chromeStore:async()=>(await o(()=>import("./chrome-store-BUKMd1oW.js"),__vite__mapDeps([20,1,2]))).chromeStoreSvg,clock:async()=>(await o(()=>import("./clock-BhPsX3iD.js"),__vite__mapDeps([21,1,2]))).clockSvg,close:async()=>(await o(()=>import("./close-CBYQ5hV5.js"),__vite__mapDeps([22,1,2]))).closeSvg,compass:async()=>(await o(()=>import("./compass-CJAPMiPi.js"),__vite__mapDeps([23,1,2]))).compassSvg,coinPlaceholder:async()=>(await o(()=>import("./coinPlaceholder-QMdHYgi1.js"),__vite__mapDeps([24,1,2]))).coinPlaceholderSvg,copy:async()=>(await o(()=>import("./copy-CPh9xhyR.js"),__vite__mapDeps([25,1,2]))).copySvg,cursor:async()=>(await o(()=>import("./cursor-VGoBrQ2z.js"),__vite__mapDeps([26,1,2]))).cursorSvg,cursorTransparent:async()=>(await o(()=>import("./cursor-transparent-C4SWXNSM.js"),__vite__mapDeps([27,1,2]))).cursorTransparentSvg,desktop:async()=>(await o(()=>import("./desktop-T-jOsf4_.js"),__vite__mapDeps([28,1,2]))).desktopSvg,disconnect:async()=>(await o(()=>import("./disconnect-DLq21HWK.js"),__vite__mapDeps([29,1,2]))).disconnectSvg,discord:async()=>(await o(()=>import("./discord-CGhNQVjE.js"),__vite__mapDeps([30,1,2]))).discordSvg,etherscan:async()=>(await o(()=>import("./etherscan-D4Hz-_S6.js"),__vite__mapDeps([31,1,2]))).etherscanSvg,extension:async()=>(await o(()=>import("./extension-COA168Qo.js"),__vite__mapDeps([32,1,2]))).extensionSvg,externalLink:async()=>(await o(()=>import("./external-link-BrqnUG2p.js"),__vite__mapDeps([33,1,2]))).externalLinkSvg,facebook:async()=>(await o(()=>import("./facebook-CUrWBSKL.js"),__vite__mapDeps([34,1,2]))).facebookSvg,farcaster:async()=>(await o(()=>import("./farcaster-8dJx07Qy.js"),__vite__mapDeps([35,1,2]))).farcasterSvg,filters:async()=>(await o(()=>import("./filters-yVXslorw.js"),__vite__mapDeps([36,1,2]))).filtersSvg,github:async()=>(await o(()=>import("./github-Bc1AiSIS.js"),__vite__mapDeps([37,1,2]))).githubSvg,google:async()=>(await o(()=>import("./google-BaOxKMle.js"),__vite__mapDeps([38,1,2]))).googleSvg,helpCircle:async()=>(await o(()=>import("./help-circle-Dnwf8SRS.js"),__vite__mapDeps([39,1,2]))).helpCircleSvg,image:async()=>(await o(()=>import("./image-BO_soBlT.js"),__vite__mapDeps([40,1,2]))).imageSvg,id:async()=>(await o(()=>import("./id-BmGrfWIh.js"),__vite__mapDeps([41,1,2]))).idSvg,infoCircle:async()=>(await o(()=>import("./info-circle-CDCKDdPc.js"),__vite__mapDeps([42,1,2]))).infoCircleSvg,lightbulb:async()=>(await o(()=>import("./lightbulb-C1IE9wYY.js"),__vite__mapDeps([43,1,2]))).lightbulbSvg,mail:async()=>(await o(()=>import("./mail-DgiyDHj2.js"),__vite__mapDeps([44,1,2]))).mailSvg,mobile:async()=>(await o(()=>import("./mobile-DNY2ZKzG.js"),__vite__mapDeps([45,1,2]))).mobileSvg,more:async()=>(await o(()=>import("./more-B2Y0ttY0.js"),__vite__mapDeps([46,1,2]))).moreSvg,networkPlaceholder:async()=>(await o(()=>import("./network-placeholder-BkTMvM5m.js"),__vite__mapDeps([47,1,2]))).networkPlaceholderSvg,nftPlaceholder:async()=>(await o(()=>import("./nftPlaceholder-DrjQC5jF.js"),__vite__mapDeps([48,1,2]))).nftPlaceholderSvg,off:async()=>(await o(()=>import("./off-7pDQ0VEc.js"),__vite__mapDeps([49,1,2]))).offSvg,playStore:async()=>(await o(()=>import("./play-store-DrlhQbFS.js"),__vite__mapDeps([50,1,2]))).playStoreSvg,plus:async()=>(await o(()=>import("./plus-uSZd0bAp.js"),__vite__mapDeps([51,1,2]))).plusSvg,qrCode:async()=>(await o(()=>import("./qr-code-QBcJgoAV.js"),__vite__mapDeps([52,1,2]))).qrCodeIcon,recycleHorizontal:async()=>(await o(()=>import("./recycle-horizontal-C96qE72H.js"),__vite__mapDeps([53,1,2]))).recycleHorizontalSvg,refresh:async()=>(await o(()=>import("./refresh-CIub-edG.js"),__vite__mapDeps([54,1,2]))).refreshSvg,search:async()=>(await o(()=>import("./search-CD4h_IKZ.js"),__vite__mapDeps([55,1,2]))).searchSvg,send:async()=>(await o(()=>import("./send-BAdrQD0g.js"),__vite__mapDeps([56,1,2]))).sendSvg,swapHorizontal:async()=>(await o(()=>import("./swapHorizontal-6cnXvHeT.js"),__vite__mapDeps([57,1,2]))).swapHorizontalSvg,swapHorizontalMedium:async()=>(await o(()=>import("./swapHorizontalMedium-rmFL31Ls.js"),__vite__mapDeps([58,1,2]))).swapHorizontalMediumSvg,swapHorizontalBold:async()=>(await o(()=>import("./swapHorizontalBold-CjE22E8b.js"),__vite__mapDeps([59,1,2]))).swapHorizontalBoldSvg,swapHorizontalRoundedBold:async()=>(await o(()=>import("./swapHorizontalRoundedBold-Cwmn0MnI.js"),__vite__mapDeps([60,1,2]))).swapHorizontalRoundedBoldSvg,swapVertical:async()=>(await o(()=>import("./swapVertical-DCnmIIlB.js"),__vite__mapDeps([61,1,2]))).swapVerticalSvg,telegram:async()=>(await o(()=>import("./telegram-B7t-nbVD.js"),__vite__mapDeps([62,1,2]))).telegramSvg,threeDots:async()=>(await o(()=>import("./three-dots-DQI_iGIM.js"),__vite__mapDeps([63,1,2]))).threeDotsSvg,twitch:async()=>(await o(()=>import("./twitch-C92LsCHt.js"),__vite__mapDeps([64,1,2]))).twitchSvg,twitter:async()=>(await o(()=>import("./x-DJnTcSc4.js"),__vite__mapDeps([65,1,2]))).xSvg,twitterIcon:async()=>(await o(()=>import("./twitterIcon-SWgv_fli.js"),__vite__mapDeps([66,1,2]))).twitterIconSvg,verify:async()=>(await o(()=>import("./verify-CXv6ms62.js"),__vite__mapDeps([67,1,2]))).verifySvg,verifyFilled:async()=>(await o(()=>import("./verify-filled-ULNjgirc.js"),__vite__mapDeps([68,1,2]))).verifyFilledSvg,wallet:async()=>(await o(()=>import("./wallet-Z4rZ5ie-.js"),__vite__mapDeps([69,1,2]))).walletSvg,walletConnect:async()=>(await o(()=>import("./walletconnect-CQTACANs.js"),__vite__mapDeps([70,1,2]))).walletConnectSvg,walletConnectLightBrown:async()=>(await o(()=>import("./walletconnect-CQTACANs.js"),__vite__mapDeps([70,1,2]))).walletConnectLightBrownSvg,walletConnectBrown:async()=>(await o(()=>import("./walletconnect-CQTACANs.js"),__vite__mapDeps([70,1,2]))).walletConnectBrownSvg,walletPlaceholder:async()=>(await o(()=>import("./wallet-placeholder-gggn28Nw.js"),__vite__mapDeps([71,1,2]))).walletPlaceholderSvg,warningCircle:async()=>(await o(()=>import("./warning-circle-eirhCkr2.js"),__vite__mapDeps([72,1,2]))).warningCircleSvg,x:async()=>(await o(()=>import("./x-DJnTcSc4.js"),__vite__mapDeps([65,1,2]))).xSvg,info:async()=>(await o(()=>import("./info-CUIR-ZX7.js"),__vite__mapDeps([73,1,2]))).infoSvg,exclamationTriangle:async()=>(await o(()=>import("./exclamation-triangle--RrhUEa-.js"),__vite__mapDeps([74,1,2]))).exclamationTriangleSvg,reown:async()=>(await o(()=>import("./reown-logo-lIVZOYjB.js"),__vite__mapDeps([75,1,2]))).reownSvg};async function ot(t){if(A.has(t))return A.get(t);const i=(b[t]??b.copy)();return A.set(t,i),i}let g=class extends I{constructor(){super(...arguments),this.size="md",this.name="copy",this.color="fg-300",this.aspectRatio="1 / 1"}render(){return this.style.cssText=`
      --local-color: ${`var(--wui-color-${this.color});`}
      --local-width: ${`var(--wui-icon-size-${this.size});`}
      --local-aspect-ratio: ${this.aspectRatio}
    `,E`${tt(ot(this.name),E`<div class="fallback"></div>`)}`}};g.styles=[R,B,it];m([l()],g.prototype,"size",void 0);m([l()],g.prototype,"name",void 0);m([l()],g.prototype,"color",void 0);m([l()],g.prototype,"aspectRatio",void 0);g=m([L("wui-icon")],g);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const rt=C(class extends x{constructor(t){var e;if(super(t),t.type!==V.ATTRIBUTE||t.name!=="class"||((e=t.strings)==null?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){var n,a;if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(r=>r!=="")));for(const r in e)e[r]&&!((n=this.nt)!=null&&n.has(r))&&this.st.add(r);return this.render(e)}const i=t.element.classList;for(const r of this.st)r in e||(i.remove(r),this.st.delete(r));for(const r in e){const s=!!e[r];s===this.st.has(r)||(a=this.nt)!=null&&a.has(r)||(s?(i.add(r),this.st.add(r)):(i.remove(r),this.st.delete(r)))}return T}}),nt=P`
  :host {
    display: inline-flex !important;
  }

  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    font-family: var(--wui-font-family);
    font-feature-settings:
      'tnum' on,
      'lnum' on,
      'case' on;
    line-height: 130%;
    font-weight: var(--wui-font-weight-regular);
    overflow: inherit;
    text-overflow: inherit;
    text-align: var(--local-align);
    color: var(--local-color);
  }

  .wui-line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wui-line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .wui-font-medium-400 {
    font-size: var(--wui-font-size-medium);
    font-weight: var(--wui-font-weight-light);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-medium-600 {
    font-size: var(--wui-font-size-medium);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-title-600 {
    font-size: var(--wui-font-size-title);
    letter-spacing: var(--wui-letter-spacing-title);
  }

  .wui-font-title-6-600 {
    font-size: var(--wui-font-size-title-6);
    letter-spacing: var(--wui-letter-spacing-title-6);
  }

  .wui-font-mini-700 {
    font-size: var(--wui-font-size-mini);
    letter-spacing: var(--wui-letter-spacing-mini);
    text-transform: uppercase;
  }

  .wui-font-large-500,
  .wui-font-large-600,
  .wui-font-large-700 {
    font-size: var(--wui-font-size-large);
    letter-spacing: var(--wui-letter-spacing-large);
  }

  .wui-font-2xl-500,
  .wui-font-2xl-600,
  .wui-font-2xl-700 {
    font-size: var(--wui-font-size-2xl);
    letter-spacing: var(--wui-letter-spacing-2xl);
  }

  .wui-font-paragraph-400,
  .wui-font-paragraph-500,
  .wui-font-paragraph-600,
  .wui-font-paragraph-700 {
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
  }

  .wui-font-small-400,
  .wui-font-small-500,
  .wui-font-small-600 {
    font-size: var(--wui-font-size-small);
    letter-spacing: var(--wui-letter-spacing-small);
  }

  .wui-font-tiny-400,
  .wui-font-tiny-500,
  .wui-font-tiny-600 {
    font-size: var(--wui-font-size-tiny);
    letter-spacing: var(--wui-letter-spacing-tiny);
  }

  .wui-font-micro-700,
  .wui-font-micro-600 {
    font-size: var(--wui-font-size-micro);
    letter-spacing: var(--wui-letter-spacing-micro);
    text-transform: uppercase;
  }

  .wui-font-tiny-400,
  .wui-font-small-400,
  .wui-font-medium-400,
  .wui-font-paragraph-400 {
    font-weight: var(--wui-font-weight-light);
  }

  .wui-font-large-700,
  .wui-font-paragraph-700,
  .wui-font-micro-700,
  .wui-font-mini-700 {
    font-weight: var(--wui-font-weight-bold);
  }

  .wui-font-medium-600,
  .wui-font-medium-title-600,
  .wui-font-title-6-600,
  .wui-font-large-600,
  .wui-font-paragraph-600,
  .wui-font-small-600,
  .wui-font-tiny-600,
  .wui-font-micro-600 {
    font-weight: var(--wui-font-weight-medium);
  }

  :host([disabled]) {
    opacity: 0.4;
  }
`;var y=function(t,e,i,n){var a=arguments.length,r=a<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,i):n,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,i,n);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(r=(a<3?s(r):a>3?s(e,i,r):s(e,i))||r);return a>3&&r&&Object.defineProperty(e,i,r),r};let w=class extends I{constructor(){super(...arguments),this.variant="paragraph-500",this.color="fg-300",this.align="left",this.lineClamp=void 0}render(){const e={[`wui-font-${this.variant}`]:!0,[`wui-color-${this.color}`]:!0,[`wui-line-clamp-${this.lineClamp}`]:!!this.lineClamp};return this.style.cssText=`
      --local-align: ${this.align};
      --local-color: var(--wui-color-${this.color});
    `,E`<slot class=${rt(e)}></slot>`}};w.styles=[R,nt];y([l()],w.prototype,"variant",void 0);y([l()],w.prototype,"color",void 0);y([l()],w.prototype,"align",void 0);y([l()],w.prototype,"lineClamp",void 0);w=y([L("wui-text")],w);const at=P`
  :host {
    display: flex;
    width: inherit;
    height: inherit;
  }
`;var d=function(t,e,i,n){var a=arguments.length,r=a<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,i):n,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(t,e,i,n);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(r=(a<3?s(r):a>3?s(e,i,r):s(e,i))||r);return a>3&&r&&Object.defineProperty(e,i,r),r};let u=class extends I{render(){return this.style.cssText=`
      flex-direction: ${this.flexDirection};
      flex-wrap: ${this.flexWrap};
      flex-basis: ${this.flexBasis};
      flex-grow: ${this.flexGrow};
      flex-shrink: ${this.flexShrink};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};
      padding-top: ${this.padding&&h.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&h.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&h.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&h.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&h.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&h.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&h.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&h.getSpacingStyles(this.margin,3)};
    `,E`<slot></slot>`}};u.styles=[R,at];d([l()],u.prototype,"flexDirection",void 0);d([l()],u.prototype,"flexWrap",void 0);d([l()],u.prototype,"flexBasis",void 0);d([l()],u.prototype,"flexGrow",void 0);d([l()],u.prototype,"flexShrink",void 0);d([l()],u.prototype,"alignItems",void 0);d([l()],u.prototype,"justifyContent",void 0);d([l()],u.prototype,"columnGap",void 0);d([l()],u.prototype,"rowGap",void 0);d([l()],u.prototype,"gap",void 0);d([l()],u.prototype,"padding",void 0);d([l()],u.prototype,"margin",void 0);u=d([L("wui-flex")],u);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const pt=t=>t??M;export{h as U,rt as a,L as c,C as e,Y as f,l as n,pt as o,ct as r};
