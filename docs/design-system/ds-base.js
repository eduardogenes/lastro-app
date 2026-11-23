/* Página viva do design system do Lastro: ícones, peças de desenho, dados de
   exemplo e a navegação do aparelho. As telas estão em ds-telas.js; o
   documento (índice, fundamentos, componentes, fluxos, auditoria) em ds-doc.js. */

// Phosphor Icons, peso regular. Copyright Phosphor Icons, licença MIT.
const I = d => `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
const ic = {
  troca: I('M213.66,181.66l-32,32a8,8,0,0,1-11.32-11.32L188.69,184H48a8,8,0,0,1,0-16H188.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,213.66,181.66Zm-139.32-64a8,8,0,0,0,11.32-11.32L67.31,88H208a8,8,0,0,0,0-16H67.31L85.66,53.66A8,8,0,0,0,74.34,42.34l-32,32a8,8,0,0,0,0,11.32Z'),
  pula: I('M200,32a8,8,0,0,0-8,8v69.23L72.43,34.45A15.95,15.95,0,0,0,48,47.88V208.12a16,16,0,0,0,24.43,13.43L192,146.77V216a8,8,0,0,0,16,0V40A8,8,0,0,0,200,32ZM64,207.93V48.05l127.84,80Z'),
  fim: I('M50.34,117.66a8,8,0,0,1,11.32-11.32L120,164.69V32a8,8,0,0,1,16,0V164.69l58.34-58.35a8,8,0,0,1,11.32,11.32l-72,72a8,8,0,0,1-11.32,0ZM216,208H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z'),
  hoje: I('M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z'),
  dias: I('M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z'),
  corpo: I('M160,40a32,32,0,1,0-32,32A32,32,0,0,0,160,40ZM128,56a16,16,0,1,1,16-16A16,16,0,0,1,128,56Zm90.34,78.05L173.17,82.83a32,32,0,0,0-24-10.83H106.83a32,32,0,0,0-24,10.83L37.66,134.05a20,20,0,0,0,28.13,28.43l16.3-13.08L65.55,212.28A20,20,0,0,0,102,228.8l26-44.87,26,44.87a20,20,0,0,0,36.41-16.52L173.91,149.4l16.3,13.08a20,20,0,0,0,28.13-28.43Zm-11.51,16.77a4,4,0,0,1-5.66,0c-.21-.2-.42-.4-.65-.58L165,121.76A8,8,0,0,0,152.26,130L175.14,217a7.72,7.72,0,0,0,.48,1.35,4,4,0,1,1-7.25,3.38,6.25,6.25,0,0,0-.33-.63L134.92,164a8,8,0,0,0-13.84,0L88,221.05a6.25,6.25,0,0,0-.33.63,4,4,0,0,1-2.26,2.07,4,4,0,0,1-5-5.45,7.72,7.72,0,0,0,.48-1.35L103.74,130A8,8,0,0,0,91,121.76L55.48,150.24c-.23.18-.44.38-.65.58a4,4,0,1,1-5.66-5.65c.12-.12.23-.24.34-.37L94.83,93.41a16,16,0,0,1,12-5.41h42.34a16,16,0,0,1,12,5.41l45.32,51.39c.11.13.22.25.34.37A4,4,0,0,1,206.83,150.82Z'),
  semana: I('M240,56v64a8,8,0,0,1-16,0V75.31l-82.34,82.35a8,8,0,0,1-11.32,0L96,123.31,29.66,189.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0L136,140.69,212.69,64H168a8,8,0,0,1,0-16h64A8,8,0,0,1,240,56Z'),
  plano: I('M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.77-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z'),
  coracao: I('M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z'),
  mais: I('M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z'),
  ok: I('M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z'),
  x: I('M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z'),
  atencao: I('M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z'),
  semrede: I('M213.92,210.62a8,8,0,1,1-11.84,10.76l-52-57.15a60,60,0,0,0-57.41,7.24,8,8,0,1,1-9.42-12.93A75.43,75.43,0,0,1,128,144c1.28,0,2.55,0,3.82.1L104.9,114.49A108,108,0,0,0,61,135.31,8,8,0,0,1,49.73,134,8,8,0,0,1,51,122.77a124.27,124.27,0,0,1,41.71-21.66L69.37,75.4a155.43,155.43,0,0,0-40.29,24A8,8,0,0,1,18.92,87,171.87,171.87,0,0,1,58,62.86L42.08,45.38A8,8,0,1,1,53.92,34.62ZM128,192a12,12,0,1,0,12,12A12,12,0,0,0,128,192ZM237.08,87A172.3,172.3,0,0,0,106,49.4a8,8,0,1,0,2,15.87A158.33,158.33,0,0,1,128,64a156.25,156.25,0,0,1,98.92,35.37A8,8,0,0,0,237.08,87ZM195,135.31a8,8,0,0,0,11.24-1.3,8,8,0,0,0-1.3-11.24,124.25,124.25,0,0,0-51.73-24.2A8,8,0,1,0,150,114.24,108.12,108.12,0,0,1,195,135.31Z'),
  seta: I('M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z'),
  volta: I('M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z'),
  dir: I('M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z'),
  baixo: I('M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z'),
  cima: I('M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z'),
  ajuste: I('M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z'),
  lista: I('M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z'),
  texto: I('M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64Zm8,48H168a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Zm176,24H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm-48,40H40a8,8,0,0,0,0,16H168a8,8,0,0,0,0-16Z'),
  halter: I('M248,120h-8V88a16,16,0,0,0-16-16H208V64a16,16,0,0,0-16-16H168a16,16,0,0,0-16,16v56H104V64A16,16,0,0,0,88,48H64A16,16,0,0,0,48,64v8H32A16,16,0,0,0,16,88v32H8a8,8,0,0,0,0,16h8v32a16,16,0,0,0,16,16H48v8a16,16,0,0,0,16,16H88a16,16,0,0,0,16-16V136h48v56a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16v-8h16a16,16,0,0,0,16-16V136h8a8,8,0,0,0,0-16ZM32,168V88H48v80Zm56,24H64V64H88V192Zm104,0H168V64h24V175.82c0,.06,0,.12,0,.18s0,.12,0,.18V192Zm32-24H208V88h16Z'),
  prato: I('M72,88V40a8,8,0,0,1,16,0V88a8,8,0,0,1-16,0ZM216,40V224a8,8,0,0,1-16,0V176H152a8,8,0,0,1-8-8,268.75,268.75,0,0,1,7.22-56.88c9.78-40.49,28.32-67.63,53.63-78.47A8,8,0,0,1,216,40ZM200,53.9c-32.17,24.57-38.47,84.42-39.7,106.1H200ZM119.89,38.69a8,8,0,1,0-15.78,2.63L112,88.63a32,32,0,0,1-64,0l7.88-47.31a8,8,0,1,0-15.78-2.63l-8,48A8.17,8.17,0,0,0,32,88a48.07,48.07,0,0,0,40,47.32V224a8,8,0,0,0,16,0V135.32A48.07,48.07,0,0,0,128,88a8.17,8.17,0,0,0-.11-1.31Z'),
  camera: I('M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z'),
  duvida: I('M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z'),
  lixo: I('M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z'),
  um: I('M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z'),
  dois: I('M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z'),
  tripe: I('M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM176,96v24a8,8,0,0,1-8,8H144a8,8,0,0,1,0-16h5.15a32.12,32.12,0,0,0-40.34-1.61A8,8,0,0,1,99.19,97.6,48.21,48.21,0,0,1,160,100.23V96a8,8,0,0,1,16,0Zm-17.61,59.2a8,8,0,0,1-1.58,11.2A48.21,48.21,0,0,1,96,163.77V168a8,8,0,0,1-16,0V144a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16h-5.15a32.12,32.12,0,0,0,40.34,1.61A8,8,0,0,1,158.39,155.2Z'),
  som: I('M155.51,24.81a8,8,0,0,0-8.42.88L77.25,80H32A16,16,0,0,0,16,96v64a16,16,0,0,0,16,16H77.25l69.84,54.31A8,8,0,0,0,160,224V32A8,8,0,0,0,155.51,24.81ZM32,96H72v64H32ZM144,207.64,88,164.09V91.91l56-43.55Zm54-106.08a40,40,0,0,1,0,52.88,8,8,0,0,1-12-10.58,24,24,0,0,0,0-31.72,8,8,0,0,1,12-10.58ZM248,128a79.9,79.9,0,0,1-20.37,53.34,8,8,0,0,1-11.92-10.67,64,64,0,0,0,0-85.33,8,8,0,1,1,11.92-10.67A79.83,79.83,0,0,1,248,128Z'),
  nivel: I('M207.06,72.67A111.24,111.24,0,0,0,128,40h-.4C66.07,40.21,16,91,16,153.13V176a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V152A111.25,111.25,0,0,0,207.06,72.67ZM224,176H119.71l54.76-75.3a8,8,0,0,0-12.94-9.42L99.92,176H32V153.13c0-3.08.15-6.12.43-9.13H56a8,8,0,0,0,0-16H35.27c10.32-38.86,44-68.24,84.73-71.66V80a8,8,0,0,0,16,0V56.33A96.14,96.14,0,0,1,221,128H200a8,8,0,0,0,0,16h23.67c.21,2.65.33,5.31.33,8Z'),
  altura: I('M165.66,194.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,212.69V43.31L101.66,61.66A8,8,0,0,1,90.34,50.34l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32L136,43.31V212.69l18.34-18.35A8,8,0,0,1,165.66,194.34Z'),
  distancia: I('M237.66,133.66l-32,32a8,8,0,0,1-11.32-11.32L212.69,136H43.31l18.35,18.34a8,8,0,0,1-11.32,11.32l-32-32a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,11.32L43.31,120H212.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,237.66,133.66Z'),
  gira: I('M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z'),
  play: I('M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z'),
  pausa: I('M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z'),
  agua: I('M174,47.75a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A254.19,254.19,0,0,0,82,47.75C54.51,79.32,40,112.6,40,144a88,88,0,0,0,176,0C216,112.6,201.49,79.32,174,47.75ZM128,216a72.08,72.08,0,0,1-72-72c0-57.23,55.47-105,72-118,16.53,13,72,60.75,72,118A72.08,72.08,0,0,1,128,216Zm55.89-62.66a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68Z'),
  peso: I('M239.43,133l-32-80h0a8,8,0,0,0-9.16-4.84L136,62V40a8,8,0,0,0-16,0V65.58L54.26,80.19A8,8,0,0,0,48.57,85h0v.06L16.57,165a7.92,7.92,0,0,0-.57,3c0,23.31,24.54,32,40,32s40-8.69,40-32a7.92,7.92,0,0,0-.57-3L66.92,93.77,120,82V208H104a8,8,0,0,0,0,16h48a8,8,0,0,0,0-16H136V78.42L187,67.1,160.57,133a7.92,7.92,0,0,0-.57,3c0,23.31,24.54,32,40,32s40-8.69,40-32A7.92,7.92,0,0,0,239.43,133ZM56,184c-7.53,0-22.76-3.61-23.93-14.64L56,109.54l23.93,59.82C78.76,180.39,63.53,184,56,184Zm144-32c-7.53,0-22.76-3.61-23.93-14.64L200,77.54l23.93,59.82C222.76,148.39,207.53,152,200,152Z'),
  medida: I('M235.32,73.37,182.63,20.69a16,16,0,0,0-22.63,0L20.68,160a16,16,0,0,0,0,22.63l52.69,52.68a16,16,0,0,0,22.63,0L235.32,96A16,16,0,0,0,235.32,73.37ZM84.68,224,32,171.31l32-32,26.34,26.35a8,8,0,0,0,11.32-11.32L75.31,128,96,107.31l26.34,26.35a8,8,0,0,0,11.32-11.32L107.31,96,128,75.31l26.34,26.35a8,8,0,0,0,11.32-11.32L139.31,64l32-32L224,84.69Z'),
  cardio: I('M72,144H32a8,8,0,0,1,0-16H67.72l13.62-20.44a8,8,0,0,1,13.32,0l25.34,38,9.34-14A8,8,0,0,1,136,128h24a8,8,0,0,1,0,16H140.28l-13.62,20.44a8,8,0,0,1-13.32,0L88,126.42l-9.34,14A8,8,0,0,1,72,144ZM178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,.75,0,1.5,0,2.25a8,8,0,1,0,16-.5c0-.58,0-1.17,0-1.75A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46c0,53.61-77.76,102.15-96,112.8-10.83-6.31-42.63-26-66.68-52.21a8,8,0,1,0-11.8,10.82c31.17,34,72.93,56.68,74.69,57.63a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40Z'),
  manha: I('M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z'),
  tarde: I('M240,152H199.55a73.54,73.54,0,0,0,.45-8,72,72,0,0,0-144,0,73.54,73.54,0,0,0,.45,8H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM72,144a56,56,0,1,1,111.41,8H72.59A56.13,56.13,0,0,1,72,144Zm144,56a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H208A8,8,0,0,1,216,200ZM72.84,43.58a8,8,0,0,1,14.32-7.16l8,16a8,8,0,0,1-14.32,7.16Zm-56,48.84a8,8,0,0,1,10.74-3.57l16,8a8,8,0,0,1-7.16,14.31l-16-8A8,8,0,0,1,16.84,92.42Zm192,15.16a8,8,0,0,1,3.58-10.73l16-8a8,8,0,1,1,7.16,14.31l-16,8a8,8,0,0,1-10.74-3.58Zm-48-55.16,8-16a8,8,0,0,1,14.32,7.16l-8,16a8,8,0,1,1-14.32-7.16Z'),
  noite: I('M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z')
};
const nomesDosIcones = Object.keys(ic);
// Nomes históricos e desenhos usados só na documentação.
const traco = (d, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
Object.assign(ic, {
  cam: ic.camera, alt: ic.altura, dist: ic.distancia, bike: ic.cardio, sobe: ic.semana,
  envia: traco('<path d="M12 15V4.5M8 8l4-3.5L16 8M5 14.5V19h14v-4.5"/>', 2.2),
  lupa: traco('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', 2.2),
  nuvem: traco('<path d="M7 18.5a4.5 4.5 0 01-.5-9A6 6 0 0118 10.5a4 4 0 01-.5 8z"/>'),
  quadro: traco('<rect x="3.5" y="5" width="17" height="12" rx="2"/><path d="M8 20h8M12 17v3"/>'),
  repete: traco('<path d="M4 11a8 8 0 0114-4.5M20 4v4h-4M20 13a8 8 0 01-14 4.5M4 20v-4h4"/>', 2.2),
  copia: traco('<rect x="8" y="8" width="11.5" height="11.5" rx="2"/><path d="M5 15.5V5.5a1 1 0 011-1h10"/>'),
  cadeado: traco('<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"/>'),
  sair: traco('<path d="M14 5h4.5v14H14M10 8l-4 4 4 4M6 12h9.5"/>', 2.2),
  editar: traco('<path d="M4.5 19.5l1-4.2L15.8 5a2 2 0 012.8 0l.4.4a2 2 0 010 2.8L8.7 18.5z"/>')
});

/* ---------------- números em português ---------------- */
const vir = v => String(v).replace('.', ',').replace('-', '−');
const f1 = v => vir((Math.round(v * 10) / 10).toFixed(1));
const sinal = v => (v > 0 ? '+' : v < 0 ? '−' : '') + f1(Math.abs(v)).replace('−', '');
const milhar = v => Math.round(v).toLocaleString('pt-BR');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* ---------------- peças de desenho ---------------- */
const at = o => Object.entries(o || {}).filter(([, v]) => v != null && v !== false).map(([k, v]) => v === true ? k : `${k}="${esc(v)}"`).join(' ');
const H = {
  momento: o => `<section class="momento ${o.fino ? 'fino' : ''}" style="--cor:var(--${o.cor || 'assunto-treino'})">
      <div class="linha0">${o.linha0 || ''}</div>
      <div class="${o.anima === false ? '' : 'entra'}">
        ${o.quando ? `<p class="quando">${o.vivo ? '<i></i>' : ''}${o.quando}</p>` : ''}
        ${o.antes || ''}
        ${o.titulo ? `<h1 class="heroi ${o.titulo.replace(/<[^>]+>/g, '').length > 12 && !o.grande ? 'm' : ''}">${o.titulo}</h1>` : ''}
        ${o.apoio ? `<p class="apoio">${o.apoio}</p>` : ''}
        ${o.meio || ''}
        ${o.acoes ? `<div class="acoes">${o.acoes}</div>` : ''}
        ${o.saidas ? `<div class="saidas">${o.saidas}</div>` : ''}
      </div></section>`,
  cab: (t, nota, o = {}) => o.lugar
    ? `<header class="cab"><h1>${t}</h1>${nota ? `<span>${nota}</span>` : ''}</header>`
    : `<header class="cab d"><button class="ico" data-voltar aria-label="Voltar">${ic.volta}</button><h1 class="${o.longo ? 'l' : ''}">${t}</h1>${o.dir || (nota ? `<span style="padding-right:8px">${nota}</span>` : '')}</header>`,
  secao: (t, nota, corpo, o = {}) => `<section class="secao" ${o.style ? `style="${o.style}"` : ''}>${t ? `<h2 class="h">${t}${nota ? ` <small>${nota}</small>` : ''}</h2>` : ''}<div class="${t ? 'corpo' : ''}">${corpo}</div></section>`,
  lin: o => {
    const marca = o.marca === 'mais' ? ic.mais : o.marca === 'nada' ? '' : ic.dir;
    const tag = o.tag || 'button';
    return `<${tag} class="lin ${o.off ? 'off' : ''} ${o.cls || ''}" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-desfazer': o.desfazer, 'aria-label': o.aria })}>
      ${o.o ? `<span class="o ${o.oc || ''}">${o.o}</span>` : ''}<span class="tx"><b>${o.t}</b>${o.a ? `<span class="${o.n ? 'n' : ''}">${o.a}</span>` : ''}</span>
      ${o.sp ? `<span class="sp">${o.sp}</span>` : ''}${o.val != null ? `<span class="val n">${o.val}${o.un ? `<small>${o.un}</small>` : ''}</span>` : ''}${o.extra || ''}${marca}</${tag}>`;
  },
  vai: (t, o = {}) => `<button class="vai ${o.g ? 'g' : ''} ${o.cls || ''}" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-voltar': o.voltar, 'data-fecha': o.fecha, 'data-desfazer': o.desfazer, 'data-lugar': o.lugar, 'aria-disabled': o.off ? 'true' : null, 'data-est': o.est, style: o.style })}>${t}</button>`,
  alt: (t, o = {}) => `<button class="alt ${o.cheio ? 'cheio' : ''}" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-voltar': o.voltar, 'data-fecha': o.fecha, 'data-desfazer': o.desfazer, 'data-lugar': o.lugar, 'data-est': o.est, 'aria-disabled': o.off ? 'true' : null, style: o.style })}>${t}</button>`,
  saida: (t, o = {}) => `<button class="saida" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-voltar': o.voltar, 'data-fecha': o.fecha, 'data-desfazer': o.desfazer, 'data-est': o.est, 'data-lugar': o.lugar })}>${t}</button>`,
  resp: (ops, sel, o = {}) => `<div class="resp ${o.fundo ? 'sobre-fundo' : ''}" role="radiogroup" aria-label="${o.nome || 'Resposta'}">${ops.map(x => `<button role="radio" data-radio aria-checked="${x === sel}">${x}</button>`).join('')}</div>`,
  pergunta: (p, small, ops, sel) => `<div class="pergunta"><p class="pq">${p}</p>${small ? `<small>${small}</small>` : ''}${H.resp(ops, sel, { nome: p })}</div>`,
  seg: (ops, sel, nome) => `<div class="seg" role="radiogroup" aria-label="${nome || ''}">${ops.map(x => `<button role="radio" data-radio aria-checked="${x === sel}">${x}</button>`).join('')}</div>`,
  fichas: (ops, sel, nome) => `<div class="fita-f" role="radiogroup" aria-label="${nome || ''}">${ops.map((x, i) => `<button role="radio" data-radio aria-checked="${i === sel}">${x}</button>`).join('')}</div>`,
  q: o => `<${o.ir || o.folha ? 'button' : 'div'} class="q" ${at({ 'data-ir': o.ir, 'data-folha': o.folha })}><b class="n">${o.v}${o.u ? ` <small>${o.u}</small>` : ''}</b>${o.l}${o.sp ? `<div class="sp">${o.sp}</div>` : ''}</${o.ir || o.folha ? 'button' : 'div'}>`,
  quadros: (l, col) => `<div class="quadros" style="--col:${col || 2}">${l.map(H.q).join('')}</div>`,
  selo: (t, tom, i) => `<span class="selo ${tom || ''}">${i || ''}${t}</span>`,
  segs: (n, f, a, extra) => `<div class="segs" role="img" aria-label="${f} de ${n}">${Array.from({ length: n }, (_, j) => `<i class="${j < f ? 'f' : j === a ? 'a' : ''} ${extra && extra.includes(j) ? 'vao' : ''}"></i>`).join('')}</div>`,
  esc: (k, ico, t, a, sel) => `<button class="esc" role="radio" data-radio aria-checked="${!!sel}">${ico ? `<span class="o">${ico}</span>` : ''}<span><b>${t}</b><span class="c">${a}</span></span></button>`,
  chave: (t, a, on) => `<button class="chave-l" role="switch" data-chave aria-checked="${!!on}"><span class="tx"><b>${t}</b>${a ? `<span>${a}</span>` : ''}</span><span class="chave" aria-hidden="true"></span></button>`,
  vazio: (h, p, b) => `<div class="vazio"><h3>${h}</h3><p>${p}</p>${b ? `<div class="acoes">${b}</div>` : ''}</div>`,
  caixa: (tom, p, small, bs) => `<div class="caixa ${tom || ''}" role="${tom === 'a' ? 'status' : 'note'}"><p>${p}${small ? `<small>${small}</small>` : ''}</p>${bs ? `<div class="bs">${bs}</div>` : ''}</div>`,
  peq: (t, o = {}) => `<button class="peq ${o.f ? 'f' : ''} ${o.c ? 'c' : ''}" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-fecha': o.fecha, 'data-est': o.est, 'data-desfazer': o.desfazer, 'data-voltar': o.voltar })}>${t}</button>`,
  folha: (t, sub, corpo) => `<div class="puxa" aria-hidden="true"></div><h2 class="ft" id="folha-t">${t}</h2>${sub ? `<p class="fs">${sub}</p>` : ''}${corpo || ''}`,
  op: (ico, t, a, o = {}) => `<button class="op ${o.cls || ''}" ${at({ 'data-ir': o.ir, 'data-folha': o.folha, 'data-fecha': o.fecha, 'data-desfazer': o.desfazer, 'data-est': o.est })}><span class="o">${ico}</span><span class="tx"><b>${t}</b>${a ? `<span>${a}</span>` : ''}</span>${o.dir ? ic.dir : ''}</button>`,
  topoA: (esq, meio, dir) => `<div class="topo-a">${esq}<span class="mid">${meio}</span>${dir || '<span style="min-width:44px"></span>'}</div>`,
  campo: (rot, tipo, val, o = {}) => `<label class="campo ${o.erro ? 'erro' : ''}"><span>${rot}</span><input type="${tipo}" value="${esc(val || '')}" ${o.ac ? `autocomplete="${o.ac}"` : ''} ${o.im ? `inputmode="${o.im}"` : ''}>${o.erro ? `<span class="msg">${ic.atencao}${o.erro}</span>` : ''}</label>`
};

/* a régua: o número se arrasta. `alvo` é o seletor do número grande que acompanha */
let reguaN = 0;
function regua(o) {
  const id = 'rg' + (++reguaN), n = Math.round((o.mx - o.mn) / o.st);
  let t = '';
  for (let i = 0; i <= n; i++) { const v = Math.round((o.mn + i * o.st) * 100) / 100, g = Math.abs(v / o.cada - Math.round(v / o.cada)) < 1e-6; t += `<i class="tk ${g ? 'g' : ''}" ${g ? `data-r="${vir(v)}"` : ''}></i>`; }
  return `<div class="regua" style="--passo:${o.px}px"><div class="rola" id="${id}" role="slider" tabindex="0" aria-label="${o.nome}" aria-valuemin="${o.mn}" aria-valuemax="${o.mx}" aria-valuenow="${o.v}" aria-valuetext="${vir(o.v)} ${o.un || ''}"
    data-mn="${o.mn}" data-st="${o.st}" data-px="${o.px}" data-v="${o.v}" data-alvo="${o.alvo || ''}" data-dec="${o.dec || 0}" data-un="${o.un || ''}" data-kcal="${o.kcal || ''}"><div class="fita">${t}</div></div></div>
    ${o.passos === false ? '' : `<div class="passos-r"><button data-passo="-1" data-r="${id}" aria-label="menos ${vir(o.st)} ${o.un || ''}">−</button><button data-passo="1" data-r="${id}" aria-label="mais ${vir(o.st)} ${o.un || ''}">+</button></div>`}`;
}
function armaReguas(raiz) {
  raiz.querySelectorAll('.rola').forEach(el => {
    const mn = +el.dataset.mn, st = +el.dataset.st, px = +el.dataset.px, dec = +el.dataset.dec;
    el.scrollLeft = (+el.dataset.v - mn) / st * px;
    const pinta = v => {
      el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuetext', vir(v.toFixed(dec)) + ' ' + el.dataset.un);
      if (el.dataset.alvo) document.querySelectorAll(el.dataset.alvo).forEach(a => { a.textContent = vir(v.toFixed(dec)); });
      if (el.dataset.kcal) document.querySelectorAll('[data-kcal-de]').forEach(a => { a.textContent = Math.round(+el.dataset.kcal * v / 100); });
      const g = raiz.querySelector('[data-guarda]'); if (g) { g.classList.remove('espera'); g.innerHTML = ic.ok + ' ' + g.dataset.guarda.replace('#', vir(v.toFixed(dec))); }
    };
    let ult = +el.dataset.v;
    el.addEventListener('scroll', () => { const v = Math.round((mn + Math.round(el.scrollLeft / px) * st) * 100) / 100; if (v !== ult) { ult = v; pinta(v); } }, { passive: true });
    el.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0; if (d) { e.preventDefault(); el.scrollLeft += d * px; } });
  });
}

/* ---------------- o manequim das fotos (no app, a foto é a foto) ---------------- */
function gente(p, s, fantasma) {
  const k = s / 10, o = 25 + 4 * k, c = 15 + 1.5 * k, cor = fantasma ? 'none' : '#3A3934', tr = fantasma ? 'stroke="#0F0F0D" stroke-width="1.6" stroke-dasharray="4 4"' : '';
  const L = (d, w) => fantasma ? `<path d="${d}" fill="none" stroke="#0F0F0D" stroke-width="1.6" stroke-dasharray="4 4"/>` : `<path d="${d}" fill="none" stroke="#3A3934" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let arms = ''; const sx = p.v === 'perfil' ? .58 : 1, ox = 60 - o, dx = 60 + o;
  if (p.b === 'solto') arms = L(`M${ox} 64L${ox - 7} 150`, 11) + L(`M${dx} 64L${dx + 7} 150`, 11);
  if (p.b === 'A') arms = L(`M${ox} 64L${ox - 26} 140`, 11) + L(`M${dx} 64L${dx + 26} 140`, 11);
  if (p.b === 'biceps') arms = L(`M${ox} 64L${ox - 24} 62L${ox - 26} 30`, 11) + L(`M${dx} 64L${dx + 24} 62L${dx + 26} 30`, 11);
  if (p.b === 'nuca') arms = L(`M${ox} 64L${ox - 18} 44L60 26`, 10) + L(`M${dx} 64L${dx + 18} 44L60 26`, 10);
  if (p.b === 'cintura') arms = L(`M${ox} 64L${ox - 22} 104L${60 - c} 136`, 10) + L(`M${dx} 64L${dx + 22} 104L${60 + c} 136`, 10);
  if (p.v === 'perfil' && p.b === 'solto') arms = L('M62 66L66 150', 11);
  if (p.v === 'perfil' && p.b === 'nuca') arms = L('M60 64L86 44L62 28', 10);
  const tronco = `M${ox} 58Q60 50 ${dx} 58L${60 + c} 138L${60 + c + 4} 168L${60 - c - 4} 168L${60 - c} 138Z`;
  const corpo = `<circle cx="60" cy="27" r="15" fill="${cor}" ${tr}/><path d="M54 40h12v14H54z" fill="${cor}" ${tr}/><path d="${tronco}" fill="${cor}" ${tr}/>` + L(`M${60 - c + 3} 168L47 288`, 17) + L(`M${60 + c - 3} 168L73 288`, 17) + arms;
  return `<svg viewBox="0 0 120 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g transform="translate(60 0) scale(${sx} 1) translate(-60 0)">${corpo}</g></svg>`;
}
const foto = (p, s, marca, extra) => `<span class="foto" role="img" aria-label="${p.n}" ${extra || ''}>${gente(p, s)}${marca ? '<span class="marca" title="fora do padrão"></span>' : ''}</span>`;

/* ---------------- gráficos ---------------- */
function linha(pts, o = {}) {
  const W = 340, Ht = o.h || 120, x0 = o.x0 ?? pts[0][0], x1 = o.x1 ?? pts[pts.length - 1][0];
  const ys = pts.map(p => p[1]).concat((o.pontos || []).map(p => p[1])), mn = Math.min(...ys) - (o.folga || .4), mx = Math.max(...ys) + (o.folga || .4);
  const X = d => (d - x0) / (x1 - x0 || 1) * W, Y = v => Ht - (v - mn) / (mx - mn) * Ht; let s = '';
  if (o.banda) s += `<path d="M${X(o.banda[0])} ${Y(o.banda[1])}L${X(x1)} ${Y(o.banda[1] + (x1 - o.banda[0]) / 7 * .30)}L${X(x1)} ${Y(o.banda[1] + (x1 - o.banda[0]) / 7 * .15)}Z" fill="#D3C6FF"/>`;
  (o.marcas || []).filter(d => d >= x0).forEach(d => { s += `<path d="M${X(d)} ${Ht + 6}v8" stroke="#0F0F0D" stroke-width="3" stroke-linecap="round"/>`; });
  (o.pontos || []).filter(p => p[0] >= x0).forEach(p => { s += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="2.6" fill="#0F0F0D" opacity=".3"/>`; });
  const v = pts.filter(p => p[0] >= x0 - 7);
  s += `<path d="${v.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('')}" fill="none" stroke="#0F0F0D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (o.bolas) v.slice(0, -1).forEach(p => { s += `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="5" fill="#F6F3EC" stroke="#0F0F0D" stroke-width="3"/>`; });
  if (o.cur != null) { s += `<path d="M${X(o.cur)} -6V${Ht + 14}" stroke="#0F0F0D" stroke-width="2" stroke-dasharray="3 4"/><circle cx="${X(o.cur)}" cy="${Y(o.curY)}" r="7" fill="#D2F23A" stroke="#0F0F0D" stroke-width="3"/>`; }
  else { const u = v[v.length - 1]; s += `<circle cx="${X(u[0])}" cy="${Y(u[1])}" r="6" fill="${o.corFim || '#D3C6FF'}" stroke="#0F0F0D" stroke-width="3"/>`; }
  if (o.rotulos) s += `<text x="0" y="${Ht + 24}" font-family="Bricolage Grotesque" font-weight="700" font-size="12" fill="#62615A">${o.rotulos[0]}</text><text x="${W}" y="${Ht + 24}" text-anchor="end" font-family="Bricolage Grotesque" font-weight="700" font-size="12" fill="#62615A">${o.rotulos[1]}</text>`;
  return `<svg class="graf" viewBox="-8 -12 356 ${Ht + 40}" role="img" aria-label="${o.rotulo || 'gráfico'}">${s}</svg>`;
}
const mini = ys => { const mn = Math.min(...ys), mx = Math.max(...ys), n = ys.length; return `<svg viewBox="-3 -3 70 36" preserveAspectRatio="none" aria-hidden="true"><path d="${ys.map((y, i) => (i ? 'L' : 'M') + (i / Math.max(1, n - 1) * 64).toFixed(1) + ' ' + (30 - (mx === mn ? .5 : (y - mn) / (mx - mn)) * 30).toFixed(1)).join('')}" fill="none" stroke="#0F0F0D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`; };

/* ---------------- dados de exemplo (o produto de verdade) ---------------- */
const D = {
  REF: [
    { id: 'pre', h: '05h45', n: 'Pré-treino', k: 163, it: [['Pão Artesano', '35 g', 98], ['Doce de leite', '20 g', 62], ['Café preto', '200 ml', 3]], so: true },
    { id: 'cafe', h: '08h00', n: 'Café da manhã', k: 629, it: [['Cuscuz cozido', '200 g', 224], ['Frango cozido', '70 g', 116], ['Requeijão light', '30 g', 54], ['Leite integral', '250 ml', 153], ['Uva', '120 g', 82]] },
    { id: 'almoco', h: '12h30', n: 'Almoço', k: 719, it: [['Arroz branco cozido', '250 g', 320], ['Feijão cozido', '50 g', 38], ['Frango cozido', '80 g', 132], ['Legumes e verduras', '100 g', 35], ['Azeite de oliva', '15 g', 133], ['Kiwi', '100 g', 61]] },
    { id: 'lanche', h: '16h00', n: 'Lanche da tarde', k: 819, it: [['Leite integral', '250 ml', 153], ['Banana', '120 g', 107], ['Aveia', '40 g', 156], ['Whey', '30 g', 120], ['Pão Artesano', '50 g', 140]] },
    { id: 'jantar', h: '19h30', n: 'Jantar', k: 678, it: [['Arroz branco cozido', '250 g', 320], ['Feijão cozido', '50 g', 38], ['Lombo suíno cozido', '80 g', 168], ['Legumes e verduras', '100 g', 35]] },
    { id: 'ceia', h: '21h30', n: 'Ceia', k: 197, it: [['Leite integral', '250 ml', 153], ['Neston 3 cereais', '12 g', 46]] }
  ],
  EX: [
    { id: 'ag', n: 'Agachamento no Smith', g: 'quadríceps', s: 2, f: [6, 10], rir: '1–2', un: 'kg por lado', d: 'Amplitude máxima confortável. Pés na mesma posição de sempre.', h: [['30/09', 55, [9, 8]], ['07/10', 55, [10, 9]], ['14/10', 57.5, [8, 8]], ['21/10', 60, [9, 10]]], sub: ['Hack machine', 'Leg press 45°'] },
    { id: 'fl', n: 'Cadeira flexora sentada', g: 'posterior', s: 4, f: [8, 12], rir: '1', un: 'kg', d: 'Volte em 2 a 3 segundos.', h: [['23/09', 40, [12, 11, 10, 10]], ['30/09', 42.5, [11, 10, 10, 9]], ['07/10', 42.5, [12, 11, 11, 10]], ['14/10', 45, [11, 11, 10, 10]], ['21/10', 45, [12, 12, 12, 12]]], sub: ['Mesa flexora', 'Flexora unilateral'] },
    { id: 'tr', n: 'Terra romeno no Smith', g: 'posterior', s: 3, f: [6, 10], rir: '1–2', un: 'kg por lado', d: 'Quem protege a lombar é o quadril.', h: [['30/09', 50, [9, 9, 8]], ['07/10', 50, [9, 9, 8]], ['14/10', 50, [9, 9, 8]], ['21/10', 50, [9, 9, 8]]], sub: ['Stiff com halteres'] },
    { id: 'lp', n: 'Leg press', g: 'quadríceps', s: 2, f: [10, 15], rir: '1–2', un: 'kg', d: 'Desça até onde o quadril não sai do banco.', h: [['07/10', 150, [13, 12]], ['14/10', 160, [12, 11]], ['21/10', 160, [14, 12]]], sub: ['Hack machine'] },
    { id: 'ex', n: 'Cadeira extensora', g: 'quadríceps', s: 1, f: [10, 15], rir: '0–1', un: 'kg', d: 'Um segundo parado no topo.', h: [['07/10', 50, [15]], ['14/10', 55, [12]], ['21/10', 55, [13]]], sub: ['Extensora unilateral'] },
    { id: 'ep', n: 'Elevação pélvica na máquina', g: 'glúteo', s: 3, f: [8, 12], rir: '1', un: 'kg', d: 'Queixo recolhido, costelas para baixo.', h: [['07/10', 75, [12, 11, 10]], ['14/10', 80, [11, 10, 10]], ['21/10', 80, [12, 11, 10]]], sub: ['Elevação pélvica na barra'] },
    { id: 'ad', n: 'Adutora', g: 'adutores', s: 2, f: [10, 15], rir: '1', un: 'kg', d: 'Sem embalo na abertura.', h: [['07/10', 45, [15, 14]], ['14/10', 50, [13, 12]], ['21/10', 50, [14, 13]]], sub: ['Adutora no cabo'] },
    { id: 'pp', n: 'Panturrilha em pé', g: 'panturrilha', s: 3, f: [6, 10], rir: '1', un: 'kg', d: 'Dois segundos alongado embaixo.', h: [['07/10', 70, [10, 9, 8]], ['14/10', 70, [10, 9, 8]], ['21/10', 70, [10, 9, 8]]], sub: ['Panturrilha no leg press'] },
    { id: 'ps', n: 'Panturrilha sentada', g: 'panturrilha', s: 2, f: [10, 15], rir: '1', un: 'kg', d: 'Amplitude inteira, sem quicar.', h: [['07/10', 32.5, [15, 13]], ['14/10', 35, [13, 12]], ['21/10', 35, [14, 12]]], sub: ['Panturrilha unilateral'] }
  ],
  TR: [['A', 'Peito superior, dorsais, lateral, tríceps', 20, 1], ['B', 'Pernas completas e panturrilhas', 22, 0], ['C', 'Costas, deltoides, bíceps', 17, 1], ['D', 'Lateral, panturrilha, abdômen', 18, 2], ['E', 'Peito superior, costas, braços', 18, 5]],
  POSES: [
    { n: 'Frente relaxado', v: 'frente', b: 'solto', fala: 'Braços soltos, um palmo do corpo. Solte o ar e segure.', conf: 'pés no T · braços um palmo do corpo' },
    { n: 'Frente braços afastados', v: 'frente', b: 'A', fala: 'Abra os braços em A, palmas para a frente.', conf: 'braços longe da cintura' },
    { n: 'Frente duplo bíceps', v: 'frente', b: 'biceps', fala: 'Duplo bíceps, cotovelos na altura do ombro.', conf: 'punhos podem passar da linha de cima' },
    { n: 'Abdômen e coxa', v: 'frente', b: 'nuca', fala: 'Mãos na nuca, olhe para a frente, uma perna à frente.', conf: 'cabeça reta' },
    { n: 'Perfil direito', v: 'perfil', b: 'solto', fala: 'Um quarto de volta. Braços soltos ao lado do corpo.', conf: 'ombro e quadril alinhados' },
    { n: 'Perfil direito natural', v: 'perfil', b: 'solto', fala: 'Marque passo três vezes e pare como parou.', conf: 'postura do dia a dia, sem arrumar' },
    { n: 'Perfil mãos na nuca', v: 'perfil', b: 'nuca', fala: 'Mãos na nuca, cotovelos para a frente.', conf: 'cotovelo não cobre o tronco' },
    { n: 'Costas relaxado', v: 'costas', b: 'solto', fala: 'Braços soltos, um palmo do corpo.', conf: 'pés no T' },
    { n: 'Costas duplo bíceps', v: 'costas', b: 'biceps', fala: 'Duplo bíceps, abra as costas.', conf: 'cotovelos na altura do ombro' },
    { n: 'Costas mãos na cintura', v: 'costas', b: 'cintura', fala: 'Mãos só apoiadas na cintura, sem apertar.', conf: 'mãos sem pinçar' },
    { n: 'Perfil esquerdo', v: 'perfil', b: 'solto', fala: 'Braços soltos ao lado do corpo.', conf: 'ombro e quadril alinhados' }
  ],
  SES: [['06/07', 72.4, null, ''], ['21/07', 73.0, null, ''], ['06/08', 73.6, null, ''], ['16/08', 74.0, null, ''], ['24/08', 74.3, null, ''], ['04/09', 74.9, null, ''], ['20/09', 75.6, null, ''], ['01/10', 76.3, 84.5, ''], ['15/10', 77.1, null, ''], ['29/10', 77.6, 86.0, 'outra luz'], ['12/11', 77.9, null, '']],
  SEM: [74.3, 75.3, 76.2, 77.3, 78.2, 78.2, 77.8, 77.9, 77.6]
};
D.PESAGENS = (() => { const r = [], pe = d => { const i = Math.min(7, Math.floor(d / 7)), t = (d - i * 7) / 7; return D.SEM[i] + (D.SEM[i + 1] - D.SEM[i]) * t; }; for (let d = 0; d < 54; d++) if ((d * 7) % 9 < 7 && r.length < 43) r.push([d, Math.round((pe(d) + Math.sin(d * 2.3) * .45) * 10) / 10]); r.push([54, 77.6]); D.pesoEm = pe; return r; })();
D.SEMPTS = D.SEM.map((v, i) => [i * 7, v]);
const DIA0 = new Date(2026, 8, 20);
const dataDe = d => { const x = new Date(DIA0.getTime() + d * 864e5); return String(x.getDate()).padStart(2, '0') + '/' + String(x.getMonth() + 1).padStart(2, '0'); };

/* ---------------- a navegação do aparelho ---------------- */
const TELAS = {};        // registradas por ds-telas.js
const ORDEM = [];
function tela(t) { TELAS[t.id] = t; ORDEM.push(t.id); }
const GRUPOS = [['geral', 'Moldura e estados', 'assunto-feito'], ['hoje', 'Hoje', 'assunto-treino'], ['treino', 'Treino', 'assunto-treino'], ['dias', 'Dias', 'assunto-corpo'], ['corpo', 'Corpo', 'assunto-corpo'], ['fotos', 'Fotos', 'assunto-corpo'], ['semana', 'Semana', 'assunto-semana'], ['plano', 'Plano', 'assunto-refeicao'], ['ajustes', 'Ajustes e primeira vez', 'superficie-quieta']];
const CAMADA = { lugar: 'lugar', destino: 'destino', acao: 'tela de ação', folha: 'folha' };
const LUGARES = [['hoje', 'Hoje'], ['dias', 'Dias'], ['corpo', 'Corpo'], ['semana', 'Semana'], ['plano', 'Plano']];

const P = { pilha: [], folha: null, glob: { rede: false, falha: false, treino: false }, desfazer: null };
const $ = s => document.querySelector(s);

function abreTela(id, est) {
  const t = TELAS[id]; if (!t) return;
  if (t.c === 'folha') { P.pilha = [{ id: t.base, e: TELAS[t.base].es ? TELAS[t.base].es[0][0] : null }]; P.folha = { id, e: est || (t.es ? t.es[0][0] : null) }; }
  else { P.pilha = [{ id, e: est || (t.es ? t.es[0][0] : null) }]; P.folha = null; }
  if (t.glob) Object.assign(P.glob, t.glob);
}
const topo = () => P.pilha[P.pilha.length - 1];
const atual = () => P.folha || topo();
function hashDe() { const a = atual(); return '#t-' + a.id + (a.e && TELAS[a.id].es && a.e !== TELAS[a.id].es[0][0] ? '--' + a.e : ''); }

/* O tipo de troca diz o movimento (07-fluidez-e-estabilidade.md, regra 4). */
let ULT = { chave: null, id: null, n: 0, faixas: null };
/* O toque durante uma transição vale (regra 5): o Safari entrega o toque à camada da
   transição, e não ao botão; então o toque encerra a transição e vai para quem está
   embaixo do dedo. */
let VT = null, tocouNaTransicao = false;
document.addEventListener('pointerdown', () => { if (VT) { tocouNaTransicao = true; VT.skipTransition(); } }, true);
document.addEventListener('click', ev => {
  if (!tocouNaTransicao) return;
  tocouNaTransicao = false;
  const alvo = document.elementFromPoint(ev.clientX, ev.clientY);
  // o clique caiu num contêiner porque o dedo desceu sobre a imagem da transição: entrega a quem está embaixo
  if (alvo && alvo !== ev.target && ev.target.contains(alvo)) { ev.stopImmediatePropagation(); ev.preventDefault(); alvo.click(); }
}, true);
const reduzMovimento = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function tipoDe(b) {
  if (!ULT.id) return null;
  const a = TELAS[ULT.id], t = TELAS[b.id], n = P.pilha.length;
  if (ULT.id === b.id) return t.c === 'acao' ? 'passo' : 'estado';
  if (a.c === 'acao' && t.c === 'acao') return 'passo';
  if (n > ULT.n) return t.c === 'acao' ? 'sobe' : 'entra';
  if (n < ULT.n) return a.c === 'acao' ? 'desce' : 'sai';
  if (a.c === 'acao') return 'desce';
  return 'lugar';
}
/* Âncoras: o mesmo nome antes e depois mantém o elemento no lugar. */
function nomeia(el, tipo) {
  el.querySelectorAll('[data-vt]').forEach(x => { x.style.viewTransitionName = ''; delete x.dataset.vt; });
  const poe = (x, n) => { if (x) { x.style.viewTransitionName = n; x.dataset.vt = n; } };
  el.style.viewTransitionName = 'tela';
  poe(el.querySelector('.pe-a, .pe-f'), 'pe'); poe(el.querySelector('.topo-a'), 'topo'); poe(el.querySelector('.segs'), 'segs');
  if (tipo === 'estado' || tipo === 'passo') {
    poe(el.querySelector('.momento'), 'momento'); poe(el.querySelector('.cab'), 'cab');
    el.querySelectorAll(':scope > .secao').forEach((x, i) => poe(x, 'sec' + i));
  }
}
function desenhaAparelho(primeira) {
  const raiz = $('#raiz');
  if (primeira || !$('#fone')) {
    ULT = { chave: null, id: null, n: 0, faixas: null };
    raiz.innerHTML = `<div class="palco"><div class="fone" id="fone">
        <div class="sim" role="group" aria-label="Navegação da página, não é do app"><a href="#indice" aria-label="Voltar ao índice do design system">${ic.volta}Índice</a><span class="nm" id="sim-nm"></span><select id="sim-e" aria-label="Estado desta tela"></select></div>
        <div class="meio" id="meio"><main class="tela" id="tela"></main><div class="gruda" id="gruda"></div><div id="tira"></div><div class="doca" id="doca"></div><div class="faixas" id="faixas"></div><div id="desf"></div>
          <div class="veu" id="veu"></div><section class="folha" id="folha" role="dialog" aria-modal="true" aria-labelledby="folha-t"></section></div></div>
      <aside class="lado" id="lado"></aside></div>`;
  }
  const b = topo(), tb = TELAS[b.id], lugar = tb.c === 'lugar';
  const chave = [b.id, b.e, P.glob.treino, b.mes, b.dia, b.edicaoDia].join('|');
  const mudouTela = chave !== ULT.chave;
  const tipo = mudouTela ? tipoDe(b) : null;
  const el = $('#tela');
  const pinta = () => {
    if (mudouTela) {
      const y = el.scrollTop;
      el.className = 'tela' + (lugar ? ' com-doca' : '') + (tb.c === 'acao' ? ' acao' : '');
      el.innerHTML = tb.r(b.e || '', P);
      // posição de leitura: o mesmo lugar ao mudar de estado, a de antes ao voltar, o topo ao entrar
      el.scrollTop = tipo === 'estado' ? y : (tipo === 'sai' || tipo === 'desce') ? (b.y || 0) : 0;
      armaReguas(el); if (window.armaExtras) armaExtras(el);
      nomeia(el, tipo);
      $('#doca').innerHTML = lugar ? `<nav class="nav" aria-label="Lugares">${LUGARES.map(l => `<button data-lugar="${l[0]}" aria-label="${l[1]}" ${l[0] === b.id ? 'aria-current="page"' : ''}>${ic[l[0]]}<span>${l[1]}</span></button>`).join('')}</nav><button class="mais" data-folha="f-registrar" aria-label="Registrar">${ic.mais}</button>` : '';
      $('#doca').classList.remove('mini');
      const andamento = b.id === 'hoje' && (b.e === 'andamento' || b.e === 'parado');
      el.classList.toggle('com-tira', !!(P.glob.treino && lugar && !andamento));
      $('#tira').innerHTML = P.glob.treino && lugar && !andamento ? `<button class="tira" data-ir="serie" aria-label="Voltar ao treino B, 8 de 22 séries"><i></i><span>Treino B · 8 de 22</span>${ic.seta}</button>` : '';
      const g = $('#gruda'); g.innerHTML = tb.gruda ? tb.gruda(b.e) : ''; g.classList.remove('on');
    }
    // faixas: só redesenha quando mudam, para não reanimar a cada navegação
    const fx = (P.glob.falha ? `<div class="faixa" role="alert">${ic.atencao}<span>1 série não foi guardada</span><button data-folha="f-falhou">Ver</button></div>` : '') + (P.glob.rede ? `<div class="faixa rede" role="status">${ic.semrede}<span>Sem rede. Tudo fica guardado neste aparelho.</span></div>` : '');
    if (fx !== ULT.faixas) { $('#faixas').innerHTML = fx; ULT.faixas = fx; }
    $('#desf').innerHTML = P.desfazer ? `<div class="desfazer ${lugar ? 'sobe' : ''}" role="status"><span>${P.desfazer}</span><button data-desfaz>Desfazer</button></div>` : '';
    const f = P.folha ? TELAS[P.folha.id] : null, fo = $('#folha'), veu = $('#veu');
    if (f) { fo.innerHTML = f.r(P.folha.e || '', P); armaReguas(fo); if (window.armaExtras) armaExtras(fo); fo.classList.add('on'); veu.classList.add('on'); fo.scrollTop = 0; }
    else { fo.classList.remove('on'); veu.classList.remove('on'); }
    const cur = atual(), tc = TELAS[cur.id];
    $('#sim-nm').textContent = tc.n;
    const se = $('#sim-e'); se.innerHTML = (tc.es || [['', 'um estado só']]).map(e => `<option value="${e[0]}" ${e[0] === (cur.e || '') ? 'selected' : ''}>${e[1]}</option>`).join(''); se.disabled = !tc.es;
    desenhaLado();
    ULT.chave = chave; ULT.id = b.id; ULT.n = P.pilha.length;
  };
  if (tipo && document.startViewTransition && !reduzMovimento()) {
    nomeia(el, tipo);
    document.documentElement.dataset.vt = tipo;
    const vt = VT = document.startViewTransition(() => { try { pinta(); } catch (e) { console.error('pinta', e); throw e; } });
    vt.finished.finally(() => { if (VT === vt) VT = null; if (document.documentElement.dataset.vt === tipo) delete document.documentElement.dataset.vt; });
  } else pinta();
  history.replaceState(null, '', hashDe());
  if (P.folha) setTimeout(() => { const t = $('#folha-t'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } }, 60);
}

function desenhaLado() {
  const cur = atual(), t = TELAS[cur.id];
  const lk = ids => (ids || []).filter(i => TELAS[i]).map(i => `<a href="#t-${i}">${TELAS[i].n}</a>`).join('');
  const de = ORDEM.filter(i => (TELAS[i].vai || []).includes(cur.id));
  const chega = [...new Set([...(t.de || []), ...de])];
  $('#lado').innerHTML = `<h2>${t.n}</h2><span class="cam">${CAMADA[t.c]}${t.c === 'folha' ? ' sobre ' + TELAS[t.base].n : ''}</span>
    ${t.d ? `<p>${t.d}</p>` : ''}
    ${t.es ? `<h3>Estados</h3><div class="lks">${t.es.map(e => `<button data-est="${e[0]}" aria-pressed="${e[0] === cur.e}">${e[1]}</button>`).join('')}</div>` : ''}
    ${chega.length ? `<h3>Chega-se de</h3><div class="lks">${lk(chega)}</div>` : ''}
    ${(t.vai || []).length ? `<h3>Leva a</h3><div class="lks">${lk(t.vai)}</div>` : ''}
    <h3>O Voltar</h3><p style="margin-top:4px">${t.v || ({ lugar: 'Sai do app: é a raiz.', destino: 'Volta à tela de onde veio, na posição em que estava.', acao: 'Recolhe a tela de ação. O que foi confirmado já está guardado.', folha: 'Fecha a folha; a tela de baixo não mexe.' })[t.c]}</p>
    <h3>Simular no app inteiro</h3><div class="lks">${[['rede', 'sem rede'], ['falha', 'falha ao guardar'], ['treino', 'treino aberto']].map(x => `<button data-glob="${x[0]}" aria-pressed="${P.glob[x[0]]}">${x[1]}</button>`).join('')}</div>
    <h3>Todas as telas</h3>${GRUPOS.map(g => { const l = ORDEM.filter(i => TELAS[i].g === g[0]); return l.length ? `<details ${l.includes(cur.id) ? 'open' : ''}><summary>${g[1]} · ${l.length}</summary><div class="todas">${l.map(i => `<a href="#t-${i}" ${i === cur.id ? 'aria-current="true"' : ''}>${TELAS[i].n}</a>`).join('')}</div></details>` : ''; }).join('')}
    <p style="margin-top:22px">A tira tracejada no topo do aparelho é da página, não do app.</p>`;
}

function vaiPara(alvo, empilha = true) {
  const [id, e] = alvo.split('--'), t = TELAS[id]; if (!t) return;
  P.desfazer = null;
  if (t.c === 'folha') { if (t.base !== topo().id && !empilha) abreTela(id, e); P.folha = { id, e: e || (t.es ? t.es[0][0] : null) }; }
  else {
    P.folha = null; const el = $('#tela'), novo = { id, e: e || (t.es ? t.es[0][0] : null) };
    // passo da mesma tarefa (tela de ação para tela de ação) troca o topo: o Voltar recolhe a tarefa inteira
    if (TELAS[topo().id].c === 'acao' && t.c === 'acao') P.pilha[P.pilha.length - 1] = novo;
    else { if (el) topo().y = el.scrollTop; P.pilha.push(novo); }
  }
  desenhaAparelho();
}
function voltar() {
  if (P.folha) { P.folha = null; desenhaAparelho(); return; }
  if (P.pilha.length > 1) { P.pilha.pop(); desenhaAparelho(); return; }
  const t = TELAS[topo().id];
  if (t.c !== 'lugar') { P.pilha = [{ id: t.lugar || 'hoje', e: null }]; const l = TELAS[P.pilha[0].id]; P.pilha[0].e = l.es ? l.es[0][0] : null; desenhaAparelho(); }
}

/* cliques do aparelho */
document.addEventListener('click', ev => {
  if (!$('#fone')) return;
  if (ev.target.id === 'veu') { voltar(); return; }
  const b = ev.target.closest('[data-ir],[data-lugar],[data-folha],[data-voltar],[data-fecha],[data-est],[data-glob],[data-desfazer],[data-desfaz],[data-radio],[data-chave],[data-marca],[data-passo],[data-par],[data-dia],[data-mes],[data-tirar-resposta]');
  if (!b || !b.closest('#fone, #lado')) return;
  const d = b.dataset;
  if (b.getAttribute('aria-disabled') === 'true') return;
  if (d.mes != null) { topo().mes = Math.min(0, (topo().mes || 0) + Number(d.mes)); delete topo().dia; desenhaAparelho(); return; }
  if (d.dia != null) { topo().dia = Number(d.dia); desenhaAparelho(); return; }
  const grupoDia = b.closest('[data-resposta-dia]');
  if ((d.radio != null || d.tirarResposta != null) && grupoDia) {
    const t = topo(), chave = [t.mes || 0, grupoDia.dataset.escolhido];
    t.respostasDias ||= {};
    const edicao = t.respostasDias[chave] ||= {};
    const escolha = b.textContent;
    if (grupoDia.dataset.respostaDia === 'frequencia') {
      if (b.getAttribute('aria-checked') === 'true') return;
      edicao.frequencia = d.tirarResposta != null ? '' : escolha === 'Descanso' ? 'desc' : 'falta';
      edicao.motivo = '';
    } else if (grupoDia.dataset.respostaDia === 'motivo') {
      edicao.motivo = b.getAttribute('aria-checked') === 'true' ? '' : escolha;
    } else {
      edicao.comida = { 'Foi, sim': 'sim', 'Quase': 'quase', 'Não lembro': 'naosei' }[escolha];
    }
    t.edicaoDia = (t.edicaoDia || 0) + 1;
    desenhaAparelho();
    return;
  }
  if (d.radio != null) { const g = b.closest('[role=radiogroup]') || b.parentElement; g.querySelectorAll('[data-radio]').forEach(x => x.setAttribute('aria-checked', x === b)); }
  if (d.chave != null) { b.setAttribute('aria-checked', b.getAttribute('aria-checked') !== 'true'); return; }
  if (d.marca != null) { b.setAttribute('aria-checked', b.getAttribute('aria-checked') !== 'true'); return; }
  if (d.passo) { const r = document.getElementById(d.r); r.scrollLeft += +d.passo * +r.dataset.px; return; }
  if (d.par) { const p = b.closest('.par'); p.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); return; }
  if (d.glob) { P.glob[d.glob] = !P.glob[d.glob]; desenhaAparelho(); return; }
  if (d.desfaz != null) { P.desfazer = null; $('#desf').innerHTML = ''; return; }
  if (d.est != null && b.closest('#lado, #fone')) { const a = atual(); a.e = d.est; delete a.mes; delete a.dia; desenhaAparelho(); return; }
  if (d.desfazer) { P.folha = null; desenhaAparelho(); P.desfazer = d.desfazer; $('#desf').innerHTML = `<div class="desfazer ${TELAS[topo().id].c === 'lugar' ? 'sobe' : ''}" role="status"><span>${d.desfazer}</span><button data-desfaz>Desfazer</button></div>`; return; }
  if (d.fecha != null) { voltar(); return; }
  if (d.voltar != null) { voltar(); return; }
  if (d.lugar) { abreTela(d.lugar); desenhaAparelho(); return; }
  if (d.folha) { vaiPara(d.folha); return; }
  if (d.ir) { vaiPara(d.ir); }
});
document.addEventListener('change', ev => { if (ev.target.id === 'sim-e') { atual().e = ev.target.value; delete atual().mes; delete atual().dia; desenhaAparelho(); } });
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && $('#fone')) voltar(); });
let ultY = 0;
document.addEventListener('scroll', ev => {
  const t = ev.target; if (!t || t.id !== 'tela') return;
  const y = t.scrollTop, dc = $('#doca');
  if (dc) { if (y > ultY + 6 && y > 60) dc.classList.add('mini'); else if (y < ultY - 6 || y < 30) dc.classList.remove('mini'); }
  ultY = y;
  const g = $('#gruda'), m = t.querySelector('.momento');
  if (g && g.innerHTML && m) g.classList.toggle('on', y > m.offsetHeight - 70);
}, true);
