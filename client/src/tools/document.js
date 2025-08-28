export function disableScroll() {
  document.body.style.paddingRight = `${window.innerWidth - document.body.clientWidth}px`;
  document.body.style.overflowY = 'hidden';
}
export function allowScroll() {
  document.body.style.overflowY = 'scroll';
  document.body.style.paddingRight = "initial"
}
export function getBackgroundFromLevel(level) {
  switch (level) {
    case 9: return "bg-slate-900";
    case 8: return "bg-slate-800";
    case 7: return "bg-slate-700";
    case 6: return "bg-slate-600";
    case 5: return "bg-slate-500";
    case 4: return "bg-slate-400";
    case 3: return "bg-slate-300";
    case 2: return "bg-slate-200";
    case 1: return "bg-slate-100";
  }
}