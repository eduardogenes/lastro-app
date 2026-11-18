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
  coracao: I(<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />),
  mais: I(<path d="M12 5v14M5 12h14" />, 2.6),
  ok: I(<path d="M5 12.5l4.5 4.5L19 7.5" />, 2.8),
  x: I(<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />, 2.4),
  atencao: I(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.8v5M12 16.2v.1" /></>, 2.2),
  semrede: I(<><path d="M7 18.5a4.5 4.5 0 01-.5-9A6 6 0 0118 10.5a4 4 0 01-.5 8z" /><path d="M4 4l16 16" /></>),
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
  lixo: I(<path d="M5 7h14M9.500 7V4.500h5V7M7 7l.8 12.500h8.400L17 7" />),
  // a sessão de fotos: quem segura, as três luzes, a voz e o giro
  um: I(<><circle cx="12" cy="7" r="3.2" /><path d="M5.5 20c.6-3.8 3.2-6 6.5-6s5.9 2.2 6.5 6" /></>),
  dois: I(<><circle cx="8.5" cy="8" r="2.8" /><circle cx="16.5" cy="9" r="2.3" /><path d="M3 19.5c.5-3.2 2.7-5 5.5-5s5 1.8 5.5 5M14.5 14.8c2.9-.6 5.4 1 6 4.2" /></>),
  tripe: I(<><rect x="8.5" y="3.5" width="7" height="10" rx="1.8" /><path d="M12 13.5v3M12 16.5l-4.5 4M12 16.5l4.5 4" /></>),
  som: I(<path d="M4 10v4h3.5L12 18V6L7.5 10zM15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" />),
  nivel: I(<><rect x="3.5" y="9" width="17" height="6" rx="3" /><circle cx="12" cy="12" r="1.6" /></>),
  altura: I(<path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" />),
  distancia: I(<path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" />),
  gira: I(<><path d="M19.5 12a7.5 7.5 0 11-2.6-5.7" /><path d="M19.5 4v4.5H15" /></>, 2.2),
  play: I(<path d="M8 5.5l10 6.5-10 6.5z" />, 2.2),
  pausa: I(<path d="M8.5 5.5v13M15.5 5.5v13" />, 2.6)
};
