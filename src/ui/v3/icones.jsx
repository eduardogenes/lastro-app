// Os ícones do visual novo: desenho de traço único, sem preenchimento.
// Nenhum ícone é caractere ou emoji (DESIGN.md).

const I = (d, w) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={w || 2}
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{d}</svg>
);

export const ic = {
  hoje: I(<><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8" /></>),
  dias: I(<><circle cx="6" cy="7" r="1.6" /><circle cx="12" cy="7" r="1.6" /><circle cx="18" cy="7" r="1.6" /><circle cx="6" cy="13" r="1.6" /><circle cx="12" cy="13" r="1.6" /><circle cx="18" cy="13" r="1.6" /><circle cx="6" cy="19" r="1.6" /></>),
  corpo: I(<><circle cx="12" cy="5" r="2.6" /><path d="M5 11.5c2.3 1 4.6 1.5 7 1.5s4.7-.5 7-1.5M12 13v4l-2.8 4.5M12 17l2.8 4.5" /></>),
  semana: I(<><path d="M3.5 17l5-5.5 4 3.5 8-9" /><path d="M15.5 6h5v5" /></>),
  plano: I(<path d="M6 4h12v16.5l-6-3.5-6 3.5z" />),
  mais: I(<path d="M12 5v14M5 12h14" />, 2.6),
  ok: I(<path d="M5 12.5l4.5 4.5L19 7.5" />, 2.8),
  x: I(<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />, 2.4),
  seta: I(<path d="M5 12h14M13 6l6 6-6 6" />, 2.4),
  volta: I(<path d="M15 5.5L8.5 12l6.5 6.5" />, 2.4),
  dir: I(<path d="M9 5.5l6.5 6.5L9 18.5" />, 2.2),
  baixo: I(<path d="M6 9.5l6 6 6-6" />, 2.4),
  cima: I(<path d="M6 14.5l6-6 6 6" />, 2.4),
  ajuste: I(<><path d="M4 8h10M18 8h2M4 16h2M10 16h10" /><circle cx="16" cy="8" r="2.2" /><circle cx="8" cy="16" r="2.2" /></>),
  lista: I(<path d="M4 7h16M4 12h16M4 17h10" />, 2.2),
  halter: I(<path d="M7 8v8M4 10v4M17 8v8M20 10v4M7 12h10" />, 2.2),
  prato: I(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></>),
  camera: I(<><path d="M4 8.5h3l1.5-2.5h7L17 8.5h3v10H4z" /><circle cx="12" cy="13.2" r="3.2" /></>),
  duvida: I(<path d="M9 9.2a3 3 0 115 2.3c-1 .8-2 1.3-2 2.500M12 17.500v.2" />, 2.4),
  lixo: I(<path d="M5 7h14M9.500 7V4.500h5V7M7 7l.8 12.500h8.400L17 7" />)
};
