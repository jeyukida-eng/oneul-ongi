/* Pyeoda actions share the home screen's olive and cream pill buttons. */
(()=>{
 if(document.getElementById('pyeoda-ui-theme'))return;
 const style=document.createElement('style');style.id='pyeoda-ui-theme';style.textContent=`
 :root{--pyeoda-action-olive:#697158;--pyeoda-action-ink:#3e4037;--pyeoda-action-line:#cfcdc2;--pyeoda-action-paper:#fffdf8;--pyeoda-action-soft:#f0f1e9}
 :is(button.primary,dialog #bookDownloadAction,dialog [data-import],dialog #testPaymentStart,dialog #testPaymentRetry,dialog #episodePublishPriceConfirm){background:var(--pyeoda-action-olive)!important;color:#fffdf8!important;border:1px solid var(--pyeoda-action-olive)!important;box-shadow:none!important;font-weight:700!important}
 :is(button.secondary,.book-actions button,.register-actions button,.publish-actions button,.editor-actions button,.editor-book-tools button,.editor-footer-navigation button,.editor-episode-navigation button,.manuscript-file-tools button,.web-writer-top-actions button,.web-writer-library-heading button,.side button,dialog button:not([data-rich-command])){border-radius:999px!important;font-weight:600;box-shadow:none}
 :is(button.secondary,.manuscript-file-tools button,.editor-footer-navigation button,.web-writer-library-heading button,dialog button:not([data-rich-command])){border:1px solid var(--pyeoda-action-line);background:var(--pyeoda-action-paper);color:var(--pyeoda-action-ink)}
 :is(.manuscript-file-tools button,.web-writer-library-heading button,dialog button:not([data-rich-command])){font-family:var(--pyeoda-ui-font,system-ui,sans-serif);font-size:13px;line-height:1.4;min-height:40px;padding:8px 16px;box-sizing:border-box;cursor:pointer}
 :is(.web-writer-top-actions #saveEpisodeBtn,#editor .editor-actions #saveEpisodeBtn){background:var(--pyeoda-action-olive)!important;color:#fffdf8!important;border-color:var(--pyeoda-action-olive)!important}
 .web-writer-top-actions :is(#publishEpisode,#mobileWritingTools,button[aria-expanded]){background:var(--pyeoda-action-paper)!important;color:var(--pyeoda-action-ink)!important;border-color:var(--pyeoda-action-line)!important}
 :is(.web-writer-side button,.side button){border:1px solid var(--pyeoda-action-line)!important;border-radius:999px!important;background:var(--pyeoda-action-paper)!important;color:var(--pyeoda-action-ink)!important;text-align:center!important;font-size:13px!important;font-weight:600!important;line-height:1.35!important;padding:10px 12px!important;min-height:40px!important;margin-bottom:6px!important;letter-spacing:-.015em}
 .web-writer-side button:first-of-type{background:var(--pyeoda-action-olive)!important;color:#fffdf8!important;border-color:var(--pyeoda-action-olive)!important;font-weight:700!important}
 .side button.active{background:var(--pyeoda-action-olive)!important;color:#fffdf8!important;border-color:var(--pyeoda-action-olive)!important}
 .web-writer-side h2{font-size:15px!important;line-height:1.5;letter-spacing:-.03em;margin-bottom:20px!important;font-weight:700}
 .web-writer-side .web-writer-note{font-size:11px;line-height:1.7;color:#858477;border-top:1px solid #e8e4da;padding-top:14px}
 :is(.web-writer-side,.web-writer-library){background:var(--pyeoda-action-paper)!important;border-color:#e0dbd0!important;border-radius:18px!important}
 .web-writer-library #episodeList button{border:1px solid transparent;border-radius:999px!important;background:#f6f4ee!important;padding-inline:14px!important;color:var(--pyeoda-action-ink)}
 .web-writer-library #episodeList button.active{background:var(--pyeoda-action-soft)!important;border-color:#d2d7c6!important;color:#4c5640!important}
 :is(.manuscript-file-tools,.mobile-writing-tools .manuscript-viewbar,.mobile-writing-tools .manuscript-toolbar){background:#f7f6f0!important;border-color:#e0dbd0!important;border-radius:14px!important}
 .manuscript-file-tools button{font-weight:600!important;background:var(--pyeoda-action-paper)!important;border-color:var(--pyeoda-action-line)!important}
 dialog{font-family:var(--pyeoda-ui-font,system-ui,sans-serif);color:var(--pyeoda-action-ink);border-color:#ded9ce!important;border-radius:20px!important;background:var(--pyeoda-action-paper)!important;box-shadow:0 20px 60px rgba(51,48,38,.15)}
 dialog::backdrop{background:rgba(42,42,33,.38)!important}
 dialog :is(h2,h3){letter-spacing:-.035em;font-weight:700;line-height:1.4}
 dialog button:not([data-rich-command]){font-weight:600!important}
 dialog button:disabled,.manuscript-file-tools button:disabled{opacity:.48!important;cursor:not-allowed!important}
 dialog :is(select,input[type=number],input[type=text],input[type=email],input[type=password]){font:inherit;font-size:13px;min-height:40px;padding:8px 12px;border:1px solid var(--pyeoda-action-line);border-radius:10px;background:var(--pyeoda-action-paper);color:var(--pyeoda-action-ink);box-sizing:border-box;max-width:100%}
 dialog input[type=radio],dialog input[type=checkbox]{accent-color:var(--pyeoda-action-olive)}
 :is(.author-auth-card,.reader-auth-card){border-radius:20px!important;background:var(--pyeoda-action-paper)!important;border-color:#ded9ce!important}
 :is(.reader-auth-provider,.author-auth-submit,.author-auth-signup-direct,.author-auth-logout,.author-auth-resend){border-radius:999px!important;font-weight:600!important}
 .author-auth-submit{background:var(--pyeoda-action-olive)!important;border-color:var(--pyeoda-action-olive)!important;color:#fffdf8!important;box-shadow:none!important}
 .author-auth-signup-direct{background:var(--pyeoda-action-paper)!important;border-color:var(--pyeoda-action-line)!important;color:var(--pyeoda-action-ink)!important}
 .pdf-import-dialog{padding:24px!important}
 .pdf-import-dialog h2{font-size:21px;margin:0 0 10px}
 .pdf-import-dialog [data-name]{color:#7b7d70;font-size:12px;overflow-wrap:anywhere;padding-bottom:12px;border-bottom:1px solid #e5e1d7}
 .pdf-import-dialog [data-status]{font-size:12px;color:#697158;line-height:1.6}
 .pdf-import-controls{gap:10px!important;align-items:stretch!important;margin:14px 0!important}
 .pdf-import-controls label:has(input[type=radio]){flex:1;display:flex;align-items:center;gap:7px;border:1px solid var(--pyeoda-action-line);border-radius:999px;padding:10px 14px;background:var(--pyeoda-action-paper);font-size:13px;cursor:pointer}
 .pdf-import-controls label:has(input[type=radio]:checked){background:var(--pyeoda-action-soft);border-color:#aab199;color:#4c5640;font-weight:600}
 .pdf-import-controls input[type=radio]{margin:0;flex-shrink:0}
 .pdf-import-controls label:has(input[type=number]){display:flex;flex:1;align-items:center;justify-content:space-between;gap:10px;padding:0 2px;font-size:12px;color:#777a6c}
 .pdf-import-controls input[type=number]{width:74px!important;flex-shrink:0;text-align:center}
 .pdf-import-preview{border:1px solid #ded9ce!important;border-radius:14px!important;background:#fffefa!important;color:#45463d;font-size:14px;line-height:1.8!important}
 .pdf-import-dialog [data-help]{font-size:12px;color:#818274;line-height:1.7;margin:12px 0}
 .pdf-import-dialog [data-import]{font-weight:700!important}
 .pdf-import-dialog footer{gap:10px!important;padding-top:4px}
 .pdf-import-dialog footer button{min-height:42px!important;padding:9px 20px!important}
 .book-file-dialog .file-actions{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}
 .book-file-dialog #bookDownloadPrice{color:#697158;font-weight:600}
 :is(.web-writer-side button,.web-writer-top-actions button,.manuscript-file-tools button,dialog button):hover:not(:disabled){filter:brightness(.97)}
 :is(.web-writer-side button,.web-writer-top-actions button,.manuscript-file-tools button,dialog button,dialog input,dialog select):focus-visible{outline:2px solid var(--pyeoda-action-olive);outline-offset:3px}
 @media(max-width:480px){.pdf-import-dialog{padding:18px!important}.pdf-import-controls{gap:8px!important}.pdf-import-controls label:has(input[type=radio]){padding:9px 10px;font-size:12px}.pdf-import-controls label:has(input[type=number]){gap:6px}.pdf-import-controls input[type=number]{width:60px!important}.pdf-import-dialog footer button{padding:9px 14px!important}.pdf-import-dialog [data-import]{flex:1}.book-file-dialog .file-actions{grid-template-columns:minmax(0,1fr) auto}}
 `;document.head.append(style);
})();
