/**
 * Memed Preloader — singleton script injection.
 * Inject once when atendimento starts, reuse across tab switches.
 */
import { getMemedScriptUrl } from "../api/memed";

let _loaded = false;
let _loading = false;
let _error = null;
let _retry = null;
let _listeners = [];

function notify() {
  _listeners.forEach((fn) =>
    fn({ loaded: _loaded, error: _error, loading: _loading }),
  );
}

export function preloadMemed(token) {
  if (_loaded || _loading) return;

  _loading = true;
  _error = null;

  const script = document.createElement("script");
  script.src = getMemedScriptUrl() + "?_t=" + Date.now();
  script.setAttribute("data-token", token);
  script.setAttribute("data-container", "prescricao-controlados");
  script.setAttribute("data-color", "#6D28D9");
  script.async = true;

  script.onload = () => {
    _loaded = true;
    _loading = false;
    notify();
  };

  script.onerror = () => {
    _error = "Falha ao carregar módulo Memed";
    _loading = false;
    notify();
  };

  document.body.appendChild(script);

  _retry = () => {
    if (script.parentNode) script.parentNode.removeChild(script);
    _loaded = false;
    _loading = false;
    _error = null;
    preloadMemed(token);
  };
}

export function isMemedLoaded() {
  return _loaded;
}

export function isMemedLoading() {
  return _loading;
}

export function getMemedError() {
  return _error;
}

export function preloadAgain() {
  if (_retry) _retry();
}

export function showMemed() {
  try {
    window.MdHub?.module?.show?.("plataforma.prescricao");
  } catch {}
}

export function hideMemed() {
  try {
    window.MdHub?.module?.hide?.("plataforma.prescricao");
  } catch {}
}

export function onMemedState(cb) {
  _listeners.push(cb);
  cb({ loaded: _loaded, error: _error, loading: _loading });
  return () => {
    _listeners = _listeners.filter((l) => l !== cb);
  };
}
