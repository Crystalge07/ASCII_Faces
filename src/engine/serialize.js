export function encode(selection) {
  return Object.entries(selection)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
}

export function decode(hash) {
  const out = {};
  for (const pair of hash.replace(/^#/, '').split('&')) {
    if (!pair) continue;
    const [k, v] = pair.split('=');
    if (k) out[k] = decodeURIComponent(v ?? '');
  }
  return out;
}
