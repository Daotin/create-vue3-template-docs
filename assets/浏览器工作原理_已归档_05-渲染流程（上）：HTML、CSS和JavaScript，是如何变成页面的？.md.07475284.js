import{_ as e,o as a,c as _,k as t,a as s}from"./chunks/framework.ff44d2fd.js";const g=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"浏览器工作原理/已归档/05-渲染流程（上）：HTML、CSS和JavaScript，是如何变成页面的？.md","filePath":"浏览器工作原理/已归档/05-渲染流程（上）：HTML、CSS和JavaScript，是如何变成页面的？.md","lastUpdated":1714650135000}'),o={name:"浏览器工作原理/已归档/05-渲染流程（上）：HTML、CSS和JavaScript，是如何变成页面的？.md"},c=t("p",null,"具体笔记在 04 章节：#30",-1),n=t("p",null,[t("img",{src:"https://raw.githubusercontent.com/Daotin/pic/master/img/20190912173635.png",alt:""})],-1),r=t("h2",{id:"思考题",tabindex:"-1"},[s("思考题 "),t("a",{class:"header-anchor",href:"#思考题","aria-label":'Permalink to "思考题"'},"​")],-1),i=t("p",null,[t("em",null,"如果下载 CSS 文件阻塞了，会阻塞 DOM 树的合成吗？会阻塞页面的显示吗？")],-1),l=t("p",null,"不会阻塞DOM树合成，DOM树的合成只需要html文件就够了，但是会阻塞页面的显示，因为需要css进行样式计算和布局，没有这些无法进行页面的渲染，进而阻塞页面的显示。",-1),d=[c,n,r,i,l];function p(h,m,S,u,f,M){return a(),_("div",null,d)}const x=e(o,[["render",p]]);export{g as __pageData,x as default};
