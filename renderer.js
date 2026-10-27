const CSS = `
.ymd-toasts{position:fixed;z-index:2147483646;display:flex;flex-direction:column;width:340px;max-width:calc(100vw - 32px);
  pointer-events:none;font:14px/1.4 system-ui,"Segoe UI",sans-serif;--ymd-spring:cubic-bezier(.16,1,.3,1)}
.ymd-toasts[data-pos=bottom-right]{right:16px;bottom:96px}
.ymd-toasts[data-pos=top-right]{right:16px;top:48px;flex-direction:column-reverse}
.ymd-toasts[data-pos=bottom-left]{left:16px;bottom:96px}
.ymd-toast-slot{padding-top:8px}
.ymd-toast{position:relative;pointer-events:auto;display:flex;gap:10px;align-items:flex-start;
  background:#232326;color:#f2f2f2;border-radius:14px;padding:11px 14px 13px;overflow:hidden;cursor:pointer;
  box-shadow:0 8px 28px rgba(0,0,0,.38);transition:transform .3s var(--ymd-spring),box-shadow .3s,background .3s}
.ymd-toast:hover{transform:translateY(-2px) scale(1.015);box-shadow:0 12px 34px rgba(0,0,0,.45)}
.ymd-toast-body{flex:1;min-width:0;word-break:break-word}
.ymd-toast small{display:block;opacity:.6;font-size:11px;margin-bottom:2px}
.ymd-toast-icon{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:13px;
  color:#141414;background:#ffd23f;animation:ymd-pop .5s var(--ymd-spring) .08s both}
.ymd-toast[data-type=success] .ymd-toast-icon{background:#3cbe64}
.ymd-toast[data-type=error] .ymd-toast-icon{background:#e64646;color:#fff}
.ymd-toast[data-type=progress] .ymd-toast-icon{background:none;border:2.5px solid rgba(255,210,63,.25);border-top-color:#ffd23f;
  width:18px;height:18px;margin:2px;animation:ymd-spin .8s linear infinite}
.ymd-toast[data-type=error]{animation:ymd-shake .45s ease .5s}
.ymd-toast-life{position:absolute;left:0;bottom:0;height:3px;width:100%;transform-origin:left;background:#ffd23f;opacity:.55}
.ymd-toast[data-type=success] .ymd-toast-life{background:#3cbe64}
.ymd-toast[data-type=error] .ymd-toast-life{background:#e64646}
.ymd-toast .ymd-bar{height:5px;border-radius:3px;background:rgba(255,255,255,.12);margin-top:8px;overflow:hidden}
.ymd-toast .ymd-bar i{position:relative;display:block;height:100%;border-radius:3px;background:#ffd23f;
  transition:width .45s var(--ymd-spring);overflow:hidden}
.ymd-toast .ymd-bar i::after{content:"";position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);animation:ymd-shine 1.2s ease-in-out infinite}
.ymd-toast .ymd-bar.ymd-done i{background:#3cbe64}
.ymd-toast .ymd-bar.ymd-done i::after{display:none}
.ymd-toast-actions{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.ymd-toast-action{border:0;border-radius:8px;padding:5px 12px;font:inherit;font-size:13px;cursor:pointer;
  background:rgba(255,255,255,.12);color:#f2f2f2;transition:filter .2s}
.ymd-toast-action:hover{filter:brightness(1.25)}
.ymd-toast-action.ymd-primary{background:#ffd23f;color:#141414;font-weight:600}
@keyframes ymd-pop{from{transform:scale(0) rotate(-90deg)}}
@keyframes ymd-spin{to{transform:rotate(360deg)}}
@keyframes ymd-shine{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
@keyframes ymd-shake{20%,60%{transform:translateX(-4px)}40%,80%{transform:translateX(4px)}}
@media (prefers-reduced-motion:reduce){.ymd-toasts *{animation:none!important;transition:none!important}}
`;

const ICONS = { info: 'i', success: '✓', error: '!', progress: '' };
const SPRING = 'cubic-bezier(.16,1,.3,1)';
const EASE_OUT = 'cubic-bezier(.4,0,1,1)';
const EDGE_SHIFT_PX = 120;

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createToaster(ymd) {
  const toasts = new Map();
  let root = null;

  const position = () => ymd.settings.get('position') || 'bottom-right';

  function container() {
    if (!root || !root.isConnected) {
      root = element('div', 'ymd-toasts');
      document.body.append(root);
    }
    root.dataset.pos = position();
    return root;
  }

  const edgeShift = () => (position() === 'bottom-left' ? -1 : 1) * EDGE_SHIFT_PX;

  function moveSmoothly(changeDom) {
    const before = new Map([...toasts.values()].map(({ slot }) => [slot, slot.getBoundingClientRect().top]));
    changeDom();
    if (reducedMotion()) return;
    for (const [slot, top] of before) {
      if (!slot.isConnected) continue;
      const delta = top - slot.getBoundingClientRect().top;
      if (Math.abs(delta) > 0.5) slot.animate([{ transform: `translateY(${delta}px)` }, { transform: 'none' }], { duration: 420, easing: SPRING });
    }
  }

  function create(id) {
    const slot = element('div', 'ymd-toast-slot');
    const node = element('div', 'ymd-toast');
    node.addEventListener('click', () => hide(id));
    node.addEventListener('mouseenter', () => pauseTimer(id));
    node.addEventListener('mouseleave', () => resumeTimer(id));
    slot.append(node);
    const toast = { id, slot, node, timer: null, lifeAnimation: null, remaining: 0, startedAt: 0, lastProgress: 0 };
    moveSmoothly(() => {
      container().append(slot);
      toasts.set(id, toast);
    });
    if (!reducedMotion()) {
      node.animate(
        [{ transform: `translateX(${edgeShift()}px) scale(.9)`, opacity: 0, filter: 'blur(4px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }],
        { duration: 520, easing: SPRING },
      );
    }
    return toast;
  }

  function progressBar(toast, value) {
    const bar = element('div', `ymd-bar${value >= 1 ? ' ymd-done' : ''}`);
    const fill = element('i');
    fill.style.width = `${Math.round(toast.lastProgress * 100)}%`;
    requestAnimationFrame(() => { fill.style.width = `${Math.round(value * 100)}%`; });
    toast.lastProgress = value;
    bar.append(fill);
    return bar;
  }

  function actionButtons(toast, actions) {
    const row = element('div', 'ymd-toast-actions');
    for (const action of actions) {
      const button = element('button', `ymd-toast-action${action.primary ? ' ymd-primary' : ''}`, String(action.label));
      button.type = 'button';
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        try {
          if (typeof action.onClick === 'function') action.onClick();
        } catch (error) {
          ymd.log('toast action failed', error);
        }
        hide(toast.id);
      });
      row.append(button);
    }
    return row;
  }

  function render(toast, message, type) {
    const body = element('div', 'ymd-toast-body');
    const label = message.title || (message.source && message.source !== 'core' && message.source !== ymd.id ? message.source : '');
    if (label) body.append(element('small', '', label));
    body.append(document.createTextNode(message.text));
    if (typeof message.progress === 'number') body.append(progressBar(toast, Math.min(1, Math.max(0, message.progress))));
    if (Array.isArray(message.actions) && message.actions.length) body.append(actionButtons(toast, message.actions));
    toast.node.dataset.type = type;
    toast.node.replaceChildren(element('span', 'ymd-toast-icon', ICONS[type] ?? ICONS.info), body, element('div', 'ymd-toast-life'));
  }

  function startTimer(id, ms) {
    const toast = toasts.get(id);
    toast.remaining = ms;
    const lifeBar = toast.node.querySelector('.ymd-toast-life');
    if (!reducedMotion()) toast.lifeAnimation = lifeBar.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: ms, fill: 'forwards' });
    runTimer(id);
  }

  function runTimer(id) {
    const toast = toasts.get(id);
    toast.startedAt = Date.now();
    toast.timer = setTimeout(() => hide(id), toast.remaining);
  }

  function stopTimer(toast) {
    clearTimeout(toast.timer);
    toast.timer = null;
    toast.lifeAnimation?.cancel();
    toast.lifeAnimation = null;
  }

  function pauseTimer(id) {
    const toast = toasts.get(id);
    if (!toast || !toast.remaining) return;
    clearTimeout(toast.timer);
    toast.remaining = Math.max(400, toast.remaining - (Date.now() - toast.startedAt));
    toast.lifeAnimation?.pause();
  }

  function resumeTimer(id) {
    const toast = toasts.get(id);
    if (!toast || !toast.remaining) return;
    toast.lifeAnimation?.play();
    runTimer(id);
  }

  function show(message) {
    if (!message || !message.text) return null;
    const id = message.id ? String(message.id) : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const type = message.type === 'progress' && message.progress >= 1 ? 'success' : message.type || 'info';
    const toast = toasts.get(id) || create(id);
    stopTimer(toast);
    render(toast, message, type);
    if (type === 'progress' || message.sticky) {
      toast.remaining = 0;
      toast.node.querySelector('.ymd-toast-life').hidden = true;
    } else {
      const seconds = Number(message.duration) || Number(ymd.settings.get('duration')) || 4;
      startTimer(id, (type === 'error' ? seconds * 2 : seconds) * 1000);
    }
    return id;
  }

  function hide(id) {
    const toast = toasts.get(id);
    if (!toast) return;
    toasts.delete(id);
    stopTimer(toast);
    if (reducedMotion()) {
      toast.slot.remove();
      return;
    }
    toast.node.style.pointerEvents = 'none';
    const leave = toast.node.animate(
      [{ transform: 'none', opacity: 1 }, { transform: `translateX(${edgeShift()}px) scale(.92)`, opacity: 0 }],
      { duration: 260, easing: EASE_OUT, fill: 'forwards' },
    );
    leave.onfinish = () => {
      const height = toast.slot.getBoundingClientRect().height;
      const collapse = toast.slot.animate(
        [{ height: `${height}px`, paddingTop: '8px' }, { height: '0px', paddingTop: '0px' }],
        { duration: 240, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' },
      );
      collapse.onfinish = () => toast.slot.remove();
    };
  }

  function destroy() {
    for (const toast of toasts.values()) stopTimer(toast);
    toasts.clear();
    root?.remove();
    root = null;
  }

  return { show, hide, destroy, applyPosition: () => root && (root.dataset.pos = position()) };
}

function createApi(toaster) {
  function show(options) {
    let current = { ...options };
    current.id = toaster.show(current);
    return Object.freeze({
      id: current.id,
      update(changes) {
        current = { ...current, ...changes, id: current.id };
        toaster.show(current);
      },
      close() {
        toaster.hide(current.id);
      },
    });
  }
  return {
    show,
    info: (text, options) => show({ ...options, text, type: 'info' }),
    success: (text, options) => show({ ...options, text, type: 'success' }),
    error: (text, options) => show({ ...options, text, type: 'error' }),
    progress: (text, value = 0, options) => show({ ...options, text, type: 'progress', progress: value }),
  };
}

module.exports = {
  start(ymd) {
    ymd.addStyle(CSS);
    const toaster = createToaster(ymd);
    ymd.onDispose(() => toaster.destroy());

    ymd.expose(createApi(toaster));
    ymd.on('notify', (message) => toaster.show(message));
    ymd.settings.onChange(() => toaster.applyPosition());

    if (ymd.settings.get('welcome')) toaster.show({ text: `YMDMod ${ymd.modVersion} загружен`, type: 'success' });
  },
};
