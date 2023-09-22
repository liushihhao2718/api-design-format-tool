//@ts-check
import "./init.js";
import hljs from "highlight.js";
import 'highlight.js/styles/github.css';

import javascript from "highlight.js/lib/languages/javascript";
import sql from "highlight.js/lib/languages/sql";
import * as sql2jsdoc from "./gen/sql2jsdoc.js";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("sql", sql);

/** @type {HTMLTextAreaElement}*/
// @ts-ignore
const code = document.getElementById("code");
const jsdoc = document.getElementById("jsdoc");

if (!jsdoc || !code) throw new Error("no id tag");

code.addEventListener("input", () => {
  const jsdocs = sql2jsdoc.gen(code.value.trim());
  const highlightedCode = hljs.highlight(jsdocs, {
    language: "javascript",
  }).value;

  jsdoc.innerHTML = highlightedCode;


code.innerHTML = hljs.highlight(code.value, {
  language: "sql",
}).value;

});
