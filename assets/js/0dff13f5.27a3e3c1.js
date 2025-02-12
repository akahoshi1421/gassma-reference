"use strict";(self.webpackChunkgassma_reference=self.webpackChunkgassma_reference||[]).push([[448],{2477:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>l,contentTitle:()=>c,default:()=>o,frontMatter:()=>i,metadata:()=>t,toc:()=>a});const t=JSON.parse('{"id":"\u30ea\u30d5\u30a1\u30ec\u30f3\u30b9/CRUD/Read/findFirst","title":"findFirst()","description":"\u7279\u5b9a\u306e\u6761\u4ef6\u306b\u5408\u81f4\u3057\u305f\u6700\u521d\u306e\u884c\u3092\u53d6\u308a\u51fa\u3057\u305f\u3044\u5834\u5408\u306b\u5229\u7528\u3057\u307e\u3059\u3002","source":"@site/docs/\u30ea\u30d5\u30a1\u30ec\u30f3\u30b9/CRUD/Read/findFirst.md","sourceDirName":"\u30ea\u30d5\u30a1\u30ec\u30f3\u30b9/CRUD/Read","slug":"/\u30ea\u30d5\u30a1\u30ec\u30f3\u30b9/CRUD/Read/findFirst","permalink":"/gassma-reference/docs/\u30ea\u30d5\u30a1\u30ec\u30f3\u30b9/CRUD/Read/findFirst","draft":false,"unlisted":false,"tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_position":2},"sidebar":"tutorialSidebar","previous":{"title":"findMany()","permalink":"/gassma-reference/docs/\u30ea\u30d5\u30a1\u30ec\u30f3\u30b9/CRUD/Read/findMany"},"next":{"title":"Update","permalink":"/gassma-reference/docs/category/update"}}');var d=s(4848),r=s(8453);const i={sidebar_position:2},c="findFirst()",l={},a=[{value:"\u4f7f\u7528\u3067\u304d\u308b\u30ad\u30fc",id:"\u4f7f\u7528\u3067\u304d\u308b\u30ad\u30fc",level:2},{value:"\u8aac\u660e\u4f8b\u7528\u306e\u30b7\u30fc\u30c8",id:"\u8aac\u660e\u4f8b\u7528\u306e\u30b7\u30fc\u30c8",level:2},{value:"\u8aac\u660e",id:"\u8aac\u660e",level:2}];function h(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",header:"header",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,r.R)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"findfirst",children:"findFirst()"})}),"\n",(0,d.jsx)(n.p,{children:"\u7279\u5b9a\u306e\u6761\u4ef6\u306b\u5408\u81f4\u3057\u305f\u6700\u521d\u306e\u884c\u3092\u53d6\u308a\u51fa\u3057\u305f\u3044\u5834\u5408\u306b\u5229\u7528\u3057\u307e\u3059\u3002"}),"\n",(0,d.jsx)(n.h2,{id:"\u4f7f\u7528\u3067\u304d\u308b\u30ad\u30fc",children:"\u4f7f\u7528\u3067\u304d\u308b\u30ad\u30fc"}),"\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"\u30ad\u30fc\u540d"}),(0,d.jsx)(n.th,{children:"\u5185\u5bb9"}),(0,d.jsx)(n.th,{children:"\u7701\u7565"}),(0,d.jsx)(n.th,{children:"\u5099\u8003"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"where"}),(0,d.jsx)(n.td,{children:"\u53d6\u5f97\u6761\u4ef6\u306e\u6307\u5b9a"}),(0,d.jsx)(n.td,{children:"\u53ef"}),(0,d.jsx)(n.td,{children:"\u66f8\u304b\u306a\u3044\u5834\u5408\u306f\u5168\u3066\u306e\u884c\u3092\u53d6\u5f97\u3057\u307e\u3059"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"select"}),(0,d.jsx)(n.td,{children:"\u53d6\u5f97\u5217\u306e\u8868\u793a\u8a2d\u5b9a"}),(0,d.jsx)(n.td,{children:"\u53ef"}),(0,d.jsx)(n.td,{})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"orderBy"}),(0,d.jsx)(n.td,{children:"\u30bd\u30fc\u30c8\u8a2d\u5b9a"}),(0,d.jsx)(n.td,{children:"\u53ef"}),(0,d.jsx)(n.td,{children:"\u6307\u5b9a\u3059\u308b\u5217\u304c 1 \u3064\u306e\u5834\u5408\u3001\u914d\u5217\u306e\u7701\u7565\u304c\u53ef\u80fd\u3067\u3059"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"take"}),(0,d.jsx)(n.td,{children:"\u53d6\u5f97\u6570\u306e\u8a2d\u5b9a"}),(0,d.jsx)(n.td,{children:"\u53ef"}),(0,d.jsx)(n.td,{})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"skip"}),(0,d.jsx)(n.td,{children:"\u30b9\u30ad\u30c3\u30d7\u6570\u306e\u8a2d\u5b9a"}),(0,d.jsx)(n.td,{children:"\u53ef"}),(0,d.jsx)(n.td,{})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"distinct"}),(0,d.jsx)(n.td,{children:"\u91cd\u8907\u524a\u9664\u306e\u8a2d\u5b9a"}),(0,d.jsx)(n.td,{children:"\u53ef"}),(0,d.jsx)(n.td,{children:"\u6307\u5b9a\u3059\u308b\u5217\u304c 1 \u3064\u306e\u5834\u5408\u3001\u914d\u5217\u306e\u7701\u7565\u304c\u53ef\u80fd\u3067\u3059"})]})]})]}),"\n",(0,d.jsx)(n.h2,{id:"\u8aac\u660e\u4f8b\u7528\u306e\u30b7\u30fc\u30c8",children:"\u8aac\u660e\u4f8b\u7528\u306e\u30b7\u30fc\u30c8"}),"\n",(0,d.jsx)(n.p,{children:(0,d.jsx)(n.img,{alt:"\u8aac\u660e\u7528\u30b7\u30fc\u30c8",src:s(7827).A+"",width:"898",height:"1156"})}),"\n",(0,d.jsx)(n.h2,{id:"\u8aac\u660e",children:"\u8aac\u660e"}),"\n",(0,d.jsx)(n.p,{children:"\u4e0a\u8a18\u4f8b\u304b\u3089\u4ee5\u4e0b\u306e\u6761\u4ef6\u306e\u884c\u3092\u53d6\u308a\u51fa\u3057\u305f\u3044\u3068\u3057\u307e\u3059\u3002"}),"\n",(0,d.jsxs)(n.ul,{children:["\n",(0,d.jsxs)(n.li,{children:["age => ",(0,d.jsx)(n.strong,{children:"20 \u4ee5\u4e0a"})]}),"\n"]}),"\n",(0,d.jsx)(n.p,{children:"\u3053\u306e\u5834\u5408\u4ee5\u4e0b\u306e\u30b3\u30fc\u30c9\u3068\u306a\u308a\u307e\u3059\u3002"}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{className:"language-ts",children:"const gassma = new Gassma.GassmaClient();\n\n// gassma.sheets.{{TARGET_SHEET_NAME}}.findFirst\nconst result = gassma.sheets.sheet1.findFirst({\n  where: {\n    age: {\n      gte: 20,\n    },\n  },\n});\n"})}),"\n",(0,d.jsx)(n.p,{children:"\u623b\u308a\u5024\u306f\u4ee5\u4e0b\u306e\u5f62\u5f0f\u3067\u3059\u3002"}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{className:"language-ts",children:"{\n  name: 'akahoshi',\n  age: 22,\n  pref: 'Ibaraki',\n  postNumber: '310-8555'\n}\n"})}),"\n",(0,d.jsxs)(n.p,{children:["\u307e\u305f\u3001key \u306e\u30aa\u30d7\u30b7\u30e7\u30f3\u7b49\u305d\u308c\u4ee5\u5916\u306e\u4ed5\u69d8\u306b\u3064\u3044\u3066\u306f",(0,d.jsx)(n.a,{href:"./findMany",children:"findMany()"}),"\u306b\u6e96\u62e0\u3057\u307e\u3059\u30fb\u3002"]})]})}function o(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(h,{...e})}):h(e)}},7827:(e,n,s)=>{s.d(n,{A:()=>t});const t=s.p+"assets/images/exampleSheet-decd75319fc5eb5651ed0c1c5d2fe764.png"},8453:(e,n,s)=>{s.d(n,{R:()=>i,x:()=>c});var t=s(6540);const d={},r=t.createContext(d);function i(e){const n=t.useContext(r);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:i(e.components),t.createElement(r.Provider,{value:n},e.children)}}}]);