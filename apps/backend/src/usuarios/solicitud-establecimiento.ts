export const redesSociales = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
} as const;

export type RedSocial = keyof typeof redesSociales;

export type SolicitudEstablecimiento = {
  nombre: string;
  direccion: string;
} & Partial<Record<RedSocial, string>>;

export const mensajeSinRedes = 'Debes registrar al menos una red social de tu establecimiento';

export function enlaceSocialValido(valor: string, red: RedSocial): boolean {
  if (valor.length > 2048 || /[\s\\]/u.test(valor)) return false;
  try {
    const url = new URL(valor);
    return /^https?:\/\//i.test(valor) &&
      !url.username && !url.password && !url.port &&
      [red + '.com', 'www.' + red + '.com', ...(red === 'facebook' ? ['m.facebook.com'] : red === 'tiktok' ? ['vm.tiktok.com', 'vt.tiktok.com'] : [])].includes(url.hostname) &&
      url.pathname.replace(/\//g, '').length > 0;
  } catch {
    return false;
  }
}
