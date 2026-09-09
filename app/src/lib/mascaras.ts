/**
 * Máscaras de digitação.
 *
 * A regra aqui é uma só: corrigir enquanto ela digita, nunca depois. Campo
 * que aceita "2570" e só reclama no botão faz a pessoa voltar e adivinhar
 * o que estava errado. Aqui o "25" vira "23" na hora, porque não existe
 * hora 25 e fingir que existe não ajuda ninguém.
 */

/** Só dígitos, no máximo `max` deles. */
export function apenasDigitos(txt: string, max = 4) {
  return txt.replace(/\D/g, '').slice(0, max);
}

/**
 * Máscara de hora `HH:MM`.
 *
 * Vai colocando os dois pontos sozinha e prende hora em 23 e minuto em 59
 * conforme os dígitos entram.
 */
export function mascaraHora(txt: string) {
  const d = apenasDigitos(txt, 4);
  if (d.length === 0) return '';

  // primeiro dígito acima de 2 só pode ser hora com zero à esquerda: 9 -> 09
  if (d.length === 1) return Number(d) > 2 ? `0${d}:` : d;

  let hh = d.slice(0, 2);
  if (Number(hh) > 23) hh = '23';
  if (d.length === 2) return `${hh}:`;

  let mm = d.slice(2);
  if (mm.length === 2 && Number(mm) > 59) mm = '59';
  return `${hh}:${mm}`;
}

/** `HH:MM` para minutos desde a meia-noite. `null` se estiver incompleto. */
export function horaParaMinutos(txt: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(txt.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Minutos desde a meia-noite para `HH:MM`. */
export function minutosParaHora(min: number) {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Quanto tempo o silêncio dura, dito em português. */
export function duracaoSilencio(de: number, ate: number) {
  const total = ((ate - de) % 1440 + 1440) % 1440;
  if (total === 0) return 'o dia inteiro';
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}
