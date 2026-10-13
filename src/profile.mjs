// Profile model: validation and normalisation. Everything that reaches the
// renderer or the database goes through normalizeProfile().
import { ICONS } from './icons.mjs';
import { parseSpotifyUrl } from './spotify.mjs';

export const SHAPES = ['rect', 'square'];
export const CONTENTS = ['text', 'icon', 'both'];
export const PRESETS = {
  light:  { bg: '#f6f5f2', fg: '#1b1b1b', accent: '#1b1b1b' },
  dark:   { bg: '#121214', fg: '#f2f2f2', accent: '#f2f2f2' },
  sunset: { bg: '#ffe9dc', fg: '#3a1c12', accent: '#e4572e' },
  forest: { bg: '#e6efe4', fg: '#1d2b20', accent: '#2f6b3f' },
  ocean:  { bg: '#e3f0f7', fg: '#10212b', accent: '#1f6f9f' },
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const BLOCK_ID = /^[a-z0-9_-]{1,32}$/;

export class ProfileError extends Error {}

export function isSafeUrl(value, { allowMailto = true } = {}) {
  try {
    const u = new URL(value);
    if (u.protocol === 'https:' || u.protocol === 'http:') return true;
    return allowMailto && u.protocol === 'mailto:';
  } catch {
    return false;
  }
}

function str(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function color(v, where) {
  if (v == null || v === '') return undefined;
  if (typeof v !== 'string' || !HEX.test(v)) throw new ProfileError(`${where}: colors must be #rrggbb`);
  return v.toLowerCase();
}

function normalizeBlock(b, index, seen) {
  const where = `blocks[${index}]`;
  if (!b || typeof b !== 'object') throw new ProfileError(`${where} must be an object`);
  const id = b.id ?? `b${index + 1}`;
  if (!BLOCK_ID.test(id)) throw new ProfileError(`${where}.id must match ${BLOCK_ID}`);
  if (seen.has(id)) throw new ProfileError(`${where}.id "${id}" is duplicated`);
  seen.add(id);

  if (b.type === 'spotify') {
    if (!parseSpotifyUrl(b.url)) throw new ProfileError(`${where}.url is not a Spotify track/album/playlist/artist/episode URL`);
    return { id, type: 'spotify', url: b.url, title: str(b.title, 80) || 'Spotify' };
  }

  if (b.type !== 'link') throw new ProfileError(`${where}.type must be "link" or "spotify"`);
  const title = str(b.title, 80);
  if (!title) throw new ProfileError(`${where}.title is required`);
  if (!isSafeUrl(b.url)) throw new ProfileError(`${where}.url must be an http(s) or mailto URL`);
  const shape = b.shape ?? 'rect';
  if (!SHAPES.includes(shape)) throw new ProfileError(`${where}.shape must be one of ${SHAPES.join(', ')}`);
  const content = b.content ?? (b.icon || b.emoji ? 'both' : 'text');
  if (!CONTENTS.includes(content)) throw new ProfileError(`${where}.content must be one of ${CONTENTS.join(', ')}`);
  if (b.icon != null && !(b.icon in ICONS)) throw new ProfileError(`${where}.icon "${b.icon}" is not a built-in icon`);
  const emoji = b.emoji == null ? undefined : str(b.emoji, 8);
  if (content !== 'text' && !b.icon && !emoji) throw new ProfileError(`${where}: content "${content}" needs an icon or emoji`);
  const out = { id, type: 'link', title, url: b.url, shape, content };
  if (b.icon) out.icon = b.icon;
  if (emoji) out.emoji = emoji;
  const bg = color(b.bg, `${where}.bg`);
  const fg = color(b.fg, `${where}.fg`);
  if (bg) out.bg = bg;
  if (fg) out.fg = fg;
  return out;
}

export function normalizeProfile(input) {
  if (!input || typeof input !== 'object') throw new ProfileError('profile must be an object');
  const name = str(input.name, 80);
  if (!name) throw new ProfileError('name is required');
  const theme = input.theme ?? {};
  const preset = theme.preset ?? 'light';
  if (!(preset in PRESETS)) throw new ProfileError(`theme.preset must be one of ${Object.keys(PRESETS).join(', ')}`);
  const outTheme = { preset };
  for (const k of ['bg', 'fg', 'accent']) {
    const c = color(theme[k], `theme.${k}`);
    if (c) outTheme[k] = c;
  }
  const blocks = input.blocks ?? [];
  if (!Array.isArray(blocks) || blocks.length > 60) throw new ProfileError('blocks must be an array of at most 60 items');
  const seen = new Set();
  const profile = {
    name,
    bio: str(input.bio, 280),
    theme: outTheme,
    blocks: blocks.map((b, i) => normalizeBlock(b, i, seen)),
  };
  if (input.avatar != null && input.avatar !== '') {
    if (!isSafeUrl(input.avatar, { allowMailto: false })) throw new ProfileError('avatar must be an http(s) URL');
    profile.avatar = input.avatar;
  }
  return profile;
}
