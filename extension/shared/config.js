// ============================================================
//  Veridion — shared/config.js
//  Único ponto de definição da URL do backend.
//  Carregado como script clássico (não é módulo ES) para funcionar
//  tanto no content script quanto via importScripts() no service worker
//  e via <script> nas páginas da extensão.
// ============================================================

const BACKEND_URL = 'https://veridion-5tjh.onrender.com';
