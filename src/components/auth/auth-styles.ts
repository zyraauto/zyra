const DARK = `
  --bg:#0F0F15; --card:#1B1C25; --text:#F3F3F5; --muted:#A3A6B3; --faint:#8A8D9A;
  --line:#34363F; --field:rgba(9,9,11,.8); --field-solid:#09090B; --field-line:#27272A; --field-text:#FFFFFF; --field-alt:#292B33;
  --err:#FF6B66; --shadow:0 30px 70px -20px rgba(0,0,0,.7);
`;

export const AUTH_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.zl-root{
  --bg:#F3F3F5; --card:#FFFFFF; --text:#15151E; --muted:#5F626E; --faint:#7B7E8B;
  --line:#DFE0E6; --field:#FFFFFF; --field-solid:#FFFFFF; --field-line:#D4D4D8; --field-text:#15151E; --field-alt:#F3F3F5;
  --err:#DC2626; --shadow:0 30px 60px -20px rgba(21,21,30,.25);
  background:var(--bg); color:var(--text); font-family:Inter,system-ui,sans-serif;
  transition:background-color .3s ease,color .3s ease;
}
@media (prefers-color-scheme:dark){:root:not([data-theme='light']) .zl-root{${DARK}}}
:root[data-theme='dark'] .zl-root{${DARK}}

.zl-head{font-family:Montserrat,Inter,system-ui,sans-serif;}
.zl-card{background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);transition:background-color .3s,border-color .3s;}
.zl-muted{color:var(--muted);}
.zl-faint{color:var(--faint);}
.zl-label{display:block;font-size:.8125rem;font-weight:600;margin-bottom:.375rem;color:var(--text);}
.zl-field{display:flex;align-items:center;border:1px solid var(--field-line);background:var(--field);border-radius:12px;padding:0 .75rem;transition:border-color .2s,box-shadow .2s,background-color .3s;overflow:hidden;}
.zl-field:focus-within{border-color:#EF4444;box-shadow:0 0 0 1px #EF4444;}
.zl-field[data-invalid='true']{border-color:#EF4444;}
.zl-field input{width:100%;background:transparent;outline:none;border:0;color:var(--field-text);padding:.8rem .6rem;font-size:.875rem;}
.zl-field input::placeholder{color:var(--faint);}
.zl-field input:disabled{opacity:.6;}
.zl-field input:-webkit-autofill{-webkit-text-fill-color:var(--field-text);box-shadow:0 0 0 40px var(--field-solid) inset;caret-color:var(--field-text);}
.zl-btn{display:flex;width:100%;align-items:center;justify-content:center;gap:.5rem;border-radius:12px;padding:.8rem 1rem;font-size:.9rem;transition:background-color .2s,transform .1s,opacity .2s,border-color .2s;cursor:pointer;}
.zl-btn:active:not(:disabled){transform:scale(.99);}
.zl-btn:disabled{opacity:.6;cursor:not-allowed;}
.zl-secondary{background:transparent;color:var(--text);border:1px solid var(--line);font-weight:700;}
.zl-secondary:hover:not(:disabled){background:var(--field-alt);}
.zl-link{font-weight:700;color:var(--text);transition:color .2s;cursor:pointer;background:none;border:0;padding:0;}
.zl-link:hover{color:#EF4444;}
.zl-root :focus-visible{outline:2px solid #EF4444;outline-offset:2px;}
.zl-field input:focus-visible{outline:none;}
.zl-error{border:1px solid rgba(220,38,38,.4);background:rgba(220,38,38,.08);color:var(--err);border-radius:12px;padding:.6rem .75rem;font-size:.8125rem;}
@keyframes zl-shake{10%,90%{transform:translateX(-1px)}20%,80%{transform:translateX(3px)}30%,50%,70%{transform:translateX(-5px)}40%,60%{transform:translateX(5px)}}
.zl-shake{animation:zl-shake .45s cubic-bezier(.36,.07,.19,.97);}
@keyframes zl-pop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
.zl-pop{animation:zl-pop .5s ease-out both;}
@media (prefers-reduced-motion:reduce){.zl-shake,.zl-pop{animation:none!important}}
`;