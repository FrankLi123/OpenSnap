const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/index-BLMIWcpG.js","chunks/popup-BDtdwbFL.js","assets/popup-DRaT5ct8.css"])))=>i.map(i=>d[i]);
import{_ as fe}from"./popup-BDtdwbFL.js";const me=Symbol(),ee=Object.getPrototypeOf,q=new WeakMap,he=e=>e&&(q.has(e)?q.get(e):ee(e)===Object.prototype||ee(e)===Array.prototype),ge=e=>he(e)&&e[me]||null,te=(e,t=!0)=>{q.set(e,t)},z={BASE_URL:"/",BROWSER:"chrome",CHROME:!0,COMMAND:"build",DEV:!1,EDGE:!1,ENTRYPOINT:"html",FIREFOX:!1,MANIFEST_VERSION:3,MODE:"production",OPERA:!1,PROD:!0,SAFARI:!1,SSR:!1,VITE_CJS_IGNORE_WARNING:"true"},G=e=>typeof e=="object"&&e!==null,C=new WeakMap,x=new WeakSet,be=(e=Object.is,t=(n,g)=>new Proxy(n,g),s=n=>G(n)&&!x.has(n)&&(Array.isArray(n)||!(Symbol.iterator in n))&&!(n instanceof WeakMap)&&!(n instanceof WeakSet)&&!(n instanceof Error)&&!(n instanceof Number)&&!(n instanceof Date)&&!(n instanceof String)&&!(n instanceof RegExp)&&!(n instanceof ArrayBuffer),r=n=>{switch(n.status){case"fulfilled":return n.value;case"rejected":throw n.reason;default:throw n}},l=new WeakMap,c=(n,g,w=r)=>{const y=l.get(n);if((y==null?void 0:y[0])===g)return y[1];const I=Array.isArray(n)?[]:Object.create(Object.getPrototypeOf(n));return te(I,!0),l.set(n,[g,I]),Reflect.ownKeys(n).forEach(_=>{if(Object.getOwnPropertyDescriptor(I,_))return;const L=Reflect.get(n,_),j={value:L,enumerable:!0,configurable:!0};if(x.has(L))te(L,!1);else if(L instanceof Promise)delete j.value,j.get=()=>w(L);else if(C.has(L)){const[b,F]=C.get(L);j.value=c(b,F(),w)}Object.defineProperty(I,_,j)}),Object.preventExtensions(I)},m=new WeakMap,f=[1,1],W=n=>{if(!G(n))throw new Error("object required");const g=m.get(n);if(g)return g;let w=f[0];const y=new Set,I=(i,a=++f[0])=>{w!==a&&(w=a,y.forEach(o=>o(i,a)))};let _=f[1];const L=(i=++f[1])=>(_!==i&&!y.size&&(_=i,b.forEach(([a])=>{const o=a[1](i);o>w&&(w=o)})),w),j=i=>(a,o)=>{const h=[...a];h[1]=[i,...h[1]],I(h,o)},b=new Map,F=(i,a)=>{if((z?"production":void 0)!=="production"&&b.has(i))throw new Error("prop listener already exists");if(y.size){const o=a[3](j(i));b.set(i,[a,o])}else b.set(i,[a])},Z=i=>{var a;const o=b.get(i);o&&(b.delete(i),(a=o[1])==null||a.call(o))},ue=i=>(y.add(i),y.size===1&&b.forEach(([o,h],P)=>{if((z?"production":void 0)!=="production"&&h)throw new Error("remove already exists");const k=o[3](j(P));b.set(P,[o,k])}),()=>{y.delete(i),y.size===0&&b.forEach(([o,h],P)=>{h&&(h(),b.set(P,[o]))})}),H=Array.isArray(n)?[]:Object.create(Object.getPrototypeOf(n)),V=t(H,{deleteProperty(i,a){const o=Reflect.get(i,a);Z(a);const h=Reflect.deleteProperty(i,a);return h&&I(["delete",[a],o]),h},set(i,a,o,h){const P=Reflect.has(i,a),k=Reflect.get(i,a,h);if(P&&(e(k,o)||m.has(o)&&e(k,m.get(o))))return!0;Z(a),G(o)&&(o=ge(o)||o);let $=o;if(o instanceof Promise)o.then(A=>{o.status="fulfilled",o.value=A,I(["resolve",[a],A])}).catch(A=>{o.status="rejected",o.reason=A,I(["reject",[a],A])});else{!C.has(o)&&s(o)&&($=W(o));const A=!x.has($)&&C.get($);A&&F(a,A)}return Reflect.set(i,a,$,h),I(["set",[a],o,k]),!0}});m.set(n,V);const pe=[H,L,c,ue];return C.set(V,pe),Reflect.ownKeys(n).forEach(i=>{const a=Object.getOwnPropertyDescriptor(n,i);"value"in a&&(V[i]=n[i],delete a.value,delete a.writable),Object.defineProperty(H,i,a)}),V})=>[W,C,x,e,t,s,r,l,c,m,f],[ye]=be();function M(e={}){return ye(e)}function U(e,t,s){const r=C.get(e);(z?"production":void 0)!=="production"&&!r&&console.warn("Please use proxy object");let l;const c=[],m=r[3];let f=!1;const n=m(g=>{c.push(g),l||(l=Promise.resolve().then(()=>{l=void 0,f&&t(c.splice(0))}))});return f=!0,()=>{f=!1,n()}}function Ie(e,t){const s=C.get(e);(z?"production":void 0)!=="production"&&!s&&console.warn("Please use proxy object");const[r,l,c]=s;return c(r,l(),t)}const d=M({history:["ConnectWallet"],view:"ConnectWallet",data:void 0}),de={state:d,subscribe(e){return U(d,()=>e(d))},push(e,t){e!==d.view&&(d.view=e,t&&(d.data=t),d.history.push(e))},reset(e){d.view=e,d.history=[e]},replace(e){d.history.length>1&&(d.history[d.history.length-1]=e,d.view=e)},goBack(){if(d.history.length>1){d.history.pop();const[e]=d.history.slice(-1);d.view=e}},setData(e){d.data=e}},p={WALLETCONNECT_DEEPLINK_CHOICE:"WALLETCONNECT_DEEPLINK_CHOICE",WCM_VERSION:"WCM_VERSION",RECOMMENDED_WALLET_AMOUNT:9,isMobile(){return typeof window<"u"?!!(window.matchMedia("(pointer:coarse)").matches||/Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent)):!1},isAndroid(){return p.isMobile()&&navigator.userAgent.toLowerCase().includes("android")},isIos(){const e=navigator.userAgent.toLowerCase();return p.isMobile()&&(e.includes("iphone")||e.includes("ipad"))},isHttpUrl(e){return e.startsWith("http://")||e.startsWith("https://")},isArray(e){return Array.isArray(e)&&e.length>0},formatNativeUrl(e,t,s){if(p.isHttpUrl(e))return this.formatUniversalUrl(e,t,s);let r=e;r.includes("://")||(r=e.replaceAll("/","").replaceAll(":",""),r=`${r}://`),r.endsWith("/")||(r=`${r}/`),this.setWalletConnectDeepLink(r,s);const l=encodeURIComponent(t);return`${r}wc?uri=${l}`},formatUniversalUrl(e,t,s){if(!p.isHttpUrl(e))return this.formatNativeUrl(e,t,s);let r=e;r.endsWith("/")||(r=`${r}/`),this.setWalletConnectDeepLink(r,s);const l=encodeURIComponent(t);return`${r}wc?uri=${l}`},async wait(e){return new Promise(t=>{setTimeout(t,e)})},openHref(e,t){window.open(e,t,"noreferrer noopener")},setWalletConnectDeepLink(e,t){try{localStorage.setItem(p.WALLETCONNECT_DEEPLINK_CHOICE,JSON.stringify({href:e,name:t}))}catch{console.info("Unable to set WalletConnect deep link")}},setWalletConnectAndroidDeepLink(e){try{const[t]=e.split("?");localStorage.setItem(p.WALLETCONNECT_DEEPLINK_CHOICE,JSON.stringify({href:t,name:"Android"}))}catch{console.info("Unable to set WalletConnect android deep link")}},removeWalletConnectDeepLink(){try{localStorage.removeItem(p.WALLETCONNECT_DEEPLINK_CHOICE)}catch{console.info("Unable to remove WalletConnect deep link")}},setModalVersionInStorage(){try{typeof localStorage<"u"&&localStorage.setItem(p.WCM_VERSION,"2.6.2")}catch{console.info("Unable to set Web3Modal version in storage")}},getWalletRouterData(){var e;const t=(e=de.state.data)==null?void 0:e.Wallet;if(!t)throw new Error('Missing "Wallet" view data');return t}},ve=typeof location<"u"&&(location.hostname.includes("localhost")||location.protocol.includes("https")),u=M({enabled:ve,userSessionId:"",events:[],connectedWalletId:void 0}),we={state:u,subscribe(e){return U(u.events,()=>e(Ie(u.events[u.events.length-1])))},initialize(){u.enabled&&typeof(crypto==null?void 0:crypto.randomUUID)<"u"&&(u.userSessionId=crypto.randomUUID())},setConnectedWalletId(e){u.connectedWalletId=e},click(e){if(u.enabled){const t={type:"CLICK",name:e.name,userSessionId:u.userSessionId,timestamp:Date.now(),data:e};u.events.push(t)}},track(e){if(u.enabled){const t={type:"TRACK",name:e.name,userSessionId:u.userSessionId,timestamp:Date.now(),data:e};u.events.push(t)}},view(e){if(u.enabled){const t={type:"VIEW",name:e.name,userSessionId:u.userSessionId,timestamp:Date.now(),data:e};u.events.push(t)}}},E=M({chains:void 0,walletConnectUri:void 0,isAuth:!1,isCustomDesktop:!1,isCustomMobile:!1,isDataLoaded:!1,isUiLoaded:!1}),v={state:E,subscribe(e){return U(E,()=>e(E))},setChains(e){E.chains=e},setWalletConnectUri(e){E.walletConnectUri=e},setIsCustomDesktop(e){E.isCustomDesktop=e},setIsCustomMobile(e){E.isCustomMobile=e},setIsDataLoaded(e){E.isDataLoaded=e},setIsUiLoaded(e){E.isUiLoaded=e},setIsAuth(e){E.isAuth=e}},B=M({projectId:"",mobileWallets:void 0,desktopWallets:void 0,walletImages:void 0,chains:void 0,enableAuthMode:!1,enableExplorer:!0,explorerExcludedWalletIds:void 0,explorerRecommendedWalletIds:void 0,termsOfServiceUrl:void 0,privacyPolicyUrl:void 0}),R={state:B,subscribe(e){return U(B,()=>e(B))},setConfig(e){var t,s;we.initialize(),v.setChains(e.chains),v.setIsAuth(!!e.enableAuthMode),v.setIsCustomMobile(!!((t=e.mobileWallets)!=null&&t.length)),v.setIsCustomDesktop(!!((s=e.desktopWallets)!=null&&s.length)),p.setModalVersionInStorage(),Object.assign(B,e)}};var Ee=Object.defineProperty,se=Object.getOwnPropertySymbols,Oe=Object.prototype.hasOwnProperty,Le=Object.prototype.propertyIsEnumerable,ne=(e,t,s)=>t in e?Ee(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,We=(e,t)=>{for(var s in t||(t={}))Oe.call(t,s)&&ne(e,s,t[s]);if(se)for(var s of se(t))Le.call(t,s)&&ne(e,s,t[s]);return e};const X="https://explorer-api.walletconnect.com",Y="wcm",Q="js-2.6.2";async function K(e,t){const s=We({sdkType:Y,sdkVersion:Q},t),r=new URL(e,X);return r.searchParams.append("projectId",R.state.projectId),Object.entries(s).forEach(([l,c])=>{c&&r.searchParams.append(l,String(c))}),(await fetch(r)).json()}const S={async getDesktopListings(e){return K("/w3m/v1/getDesktopListings",e)},async getMobileListings(e){return K("/w3m/v1/getMobileListings",e)},async getInjectedListings(e){return K("/w3m/v1/getInjectedListings",e)},async getAllListings(e){return K("/w3m/v1/getAllListings",e)},getWalletImageUrl(e){return`${X}/w3m/v1/getWalletImage/${e}?projectId=${R.state.projectId}&sdkType=${Y}&sdkVersion=${Q}`},getAssetImageUrl(e){return`${X}/w3m/v1/getAssetImage/${e}?projectId=${R.state.projectId}&sdkType=${Y}&sdkVersion=${Q}`}};var Ae=Object.defineProperty,oe=Object.getOwnPropertySymbols,Ce=Object.prototype.hasOwnProperty,Me=Object.prototype.propertyIsEnumerable,re=(e,t,s)=>t in e?Ae(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,je=(e,t)=>{for(var s in t||(t={}))Ce.call(t,s)&&re(e,s,t[s]);if(oe)for(var s of oe(t))Me.call(t,s)&&re(e,s,t[s]);return e};const ae=p.isMobile(),O=M({wallets:{listings:[],total:0,page:1},search:{listings:[],total:0,page:1},recomendedWallets:[]}),Te={state:O,async getRecomendedWallets(){const{explorerRecommendedWalletIds:e,explorerExcludedWalletIds:t}=R.state;if(e==="NONE"||t==="ALL"&&!e)return O.recomendedWallets;if(p.isArray(e)){const s={recommendedIds:e.join(",")},{listings:r}=await S.getAllListings(s),l=Object.values(r);l.sort((c,m)=>{const f=e.indexOf(c.id),W=e.indexOf(m.id);return f-W}),O.recomendedWallets=l}else{const{chains:s,isAuth:r}=v.state,l=s==null?void 0:s.join(","),c=p.isArray(t),m={page:1,sdks:r?"auth_v1":void 0,entries:p.RECOMMENDED_WALLET_AMOUNT,chains:l,version:2,excludedIds:c?t.join(","):void 0},{listings:f}=ae?await S.getMobileListings(m):await S.getDesktopListings(m);O.recomendedWallets=Object.values(f)}return O.recomendedWallets},async getWallets(e){const t=je({},e),{explorerRecommendedWalletIds:s,explorerExcludedWalletIds:r}=R.state,{recomendedWallets:l}=O;if(r==="ALL")return O.wallets;l.length?t.excludedIds=l.map(w=>w.id).join(","):p.isArray(s)&&(t.excludedIds=s.join(",")),p.isArray(r)&&(t.excludedIds=[t.excludedIds,r].filter(Boolean).join(",")),v.state.isAuth&&(t.sdks="auth_v1");const{page:c,search:m}=e,{listings:f,total:W}=ae?await S.getMobileListings(t):await S.getDesktopListings(t),n=Object.values(f),g=m?"search":"wallets";return O[g]={listings:[...O[g].listings,...n],total:W,page:c??1},{listings:n,total:W}},getWalletImageUrl(e){return S.getWalletImageUrl(e)},getAssetImageUrl(e){return S.getAssetImageUrl(e)},resetSearch(){O.search={listings:[],total:0,page:1}}},N=M({open:!1}),J={state:N,subscribe(e){return U(N,()=>e(N))},async open(e){return new Promise(t=>{const{isUiLoaded:s,isDataLoaded:r}=v.state;if(p.removeWalletConnectDeepLink(),v.setWalletConnectUri(e==null?void 0:e.uri),v.setChains(e==null?void 0:e.chains),de.reset("ConnectWallet"),s&&r)N.open=!0,t();else{const l=setInterval(()=>{const c=v.state;c.isUiLoaded&&c.isDataLoaded&&(clearInterval(l),N.open=!0,t())},200)}})},close(){N.open=!1}};var Se=Object.defineProperty,ie=Object.getOwnPropertySymbols,De=Object.prototype.hasOwnProperty,Ue=Object.prototype.propertyIsEnumerable,le=(e,t,s)=>t in e?Se(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,_e=(e,t)=>{for(var s in t||(t={}))De.call(t,s)&&le(e,s,t[s]);if(ie)for(var s of ie(t))Ue.call(t,s)&&le(e,s,t[s]);return e};function Pe(){return typeof matchMedia<"u"&&matchMedia("(prefers-color-scheme: dark)").matches}const T=M({themeMode:Pe()?"dark":"light"}),ce={state:T,subscribe(e){return U(T,()=>e(T))},setThemeConfig(e){const{themeMode:t,themeVariables:s}=e;t&&(T.themeMode=t),s&&(T.themeVariables=_e({},s))}},D=M({open:!1,message:"",variant:"success"}),Ve={state:D,subscribe(e){return U(D,()=>e(D))},openToast(e,t){D.open=!0,D.message=e,D.variant=t},closeToast(){D.open=!1}};class Ne{constructor(t){this.openModal=J.open,this.closeModal=J.close,this.subscribeModal=J.subscribe,this.setTheme=ce.setThemeConfig,ce.setThemeConfig(t),R.setConfig(t),this.initUi()}async initUi(){if(typeof window<"u"){await fe(()=>import("./index-BLMIWcpG.js"),__vite__mapDeps([0,1,2]));const t=document.createElement("wcm-modal");document.body.insertAdjacentElement("beforeend",t),v.setIsUiLoaded(!0)}}}const $e=Object.freeze(Object.defineProperty({__proto__:null,WalletConnectModal:Ne},Symbol.toStringTag,{value:"Module"}));export{we as R,de as T,p as a,$e as i,ce as n,Ve as o,v as p,J as s,Te as t,R as y};
