// A galeria dos componentes do visual novo: cada um com dados de exemplo.
// Só para desenvolvimento (v3.html); o app não importa este arquivo.

import { render } from 'preact';
import { useState } from 'preact/hooks';
import { Bloco, Cabecalho, Acoes, Botao, Saida, Secao, Apoio, Linha, Chave, Segmentos, Seletor, Quadros, Selo, Pergunta, Vazio, Faixa, Folha, TelaDeAcao } from './base.jsx';
import { Regua } from './regua.jsx';
import { Doca } from './doca.jsx';
import { ic } from './icones.jsx';

function Galeria() {
  const [kg, setKg] = useState(77.6);
  const [liga, setLiga] = useState(true);
  const [modo, setModo] = useState('lado');
  const [resp, setResp] = useState(null);
  const [aba, setAba] = useState('agora');
  const [folha, setFolha] = useState(false);
  const [acao, setAcao] = useState(false);
  if (acao) return (
    <TelaDeAcao cor="treino"
      topo={<><button onClick={() => setAcao(false)} aria-label="Recolher">{ic.baixo}</button><span>Treino B · 12:40</span><button aria-label="Lista">{ic.lista}</button></>}
      pe={<Botao grande>{ic.ok} Feito</Botao>}
      links={<><button>Mudar</button><button>Histórico</button></>}>
      <Segmentos total={22} feitos={3} />
      <div style="flex:1" />
      <h2 style="font:800 30px/1 var(--f-titulo);letter-spacing:-.03em">Cadeira flexora sentada</h2>
      <div class="v3-gigante" style="margin:12px 0">45<small>kg × 12</small></div>
      <Regua min={0} max={240} passo={2.5} valor={45} cada={10} largura={16} aoMudar={() => {}} rotulo="carga em kg" />
    </TelaDeAcao>
  );
  return (
    <div class="v3">
      <Bloco cor="treino" chave="treino" quando="daqui a 10 min" vivo titulo="Treino B"
             apoio="Pernas completas e panturrilhas. 22 séries, perto de uma hora."
             linha0={<><span>segunda, 16 nov · 06h05</span><button aria-label="O que aparece">{ic.ajuste}</button></>}>
        <Acoes><Botao onClick={() => setAcao(true)}>Começar {ic.seta}</Botao></Acoes>
        <Saida>Hoje não vou treinar</Saida>
      </Bloco>

      <Secao titulo="Botões" nota="um principal por tela">
        <Acoes><Botao>{ic.ok} Comi</Botao><Botao tipo="contorno">Ver</Botao></Acoes>
        <Acoes><Botao espera>Arraste a régua para pesar hoje</Botao></Acoes>
        <Acoes><Botao disabled>Guardar</Botao></Acoes>
        <Acoes><Botao tipo="contorno" cheio onClick={() => setFolha(true)}>Abrir uma folha</Botao></Acoes>
      </Secao>

      <Secao titulo="Régua" nota="arraste, ou use as setas">
        <div class="v3-gigante" style="margin:10px 0 8px">{String(kg.toFixed(1)).replace('.', ',')}<small>kg</small></div>
        <Regua min={60} max={100} passo={0.1} valor={kg} cada={1} largura={12} aoMudar={setKg} rotulo="peso em kg" />
      </Secao>

      <Secao titulo="Lista" nota="com seta, abre">
        <Linha titulo="Cintura" apoio="+1,5 cm desde 01/10" valor="86,0" unidade="cm" aoTocar={() => {}} />
        <Linha titulo="Treino A" apoio="6h00 às 7h00 · 20 séries" marca="A" aoTocar={() => {}} />
        <Linha titulo="Mais 6 medidas" apoio="desligadas" quieta mais aoTocar={() => {}} />
        <Linha titulo="Braço direito" apoio="primeira medida" valor="35,0" unidade="cm" />
      </Secao>

      <Secao titulo="Chave, seletor e segmentos">
        <Chave titulo="Água" apoio="contar copos" ligada={liga} aoMudar={setLiga} />
        <Chave titulo="Fotos do corpo" apoio="sessão a cada 14 dias" ligada={false} aoMudar={() => {}} />
        <div style="height:12px" />
        <Seletor rotulo="Como comparar" valor={modo} aoMudar={setModo}
                 opcoes={[{ k: 'lado', t: 'Lado a lado' }, { k: 'cortina', t: 'Cortina' }, { k: 'sobre', t: 'Sobrepor' }]} />
        <div style="height:14px" />
        <Segmentos total={11} feitos={4} grupos={[4, 7, 10]} rotulo="foto 5 de 11" />
      </Secao>

      <Secao titulo="Quadros e selos" nota="8 semanas">
        <Quadros itens={[{ k: 'p', valor: '+3,3', unidade: 'kg', rotulo: 'peso' }, { k: 'c', valor: '+1,5', unidade: 'cm', rotulo: 'cintura', aoTocar: () => {} }]} />
        <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
          <Selo>{ic.ok} no padrão</Selo><Selo tom="atencao">outra luz</Selo><Selo tom="quieto">abaixo do alvo</Selo><Selo tom="agora">agora</Selo>
        </div>
      </Secao>

      <Secao titulo="Pergunta">
        <Pergunta pergunta="A comida deste dia foi como o plano?" nota="Sem resposta, o dia fica fora da conta. Não vira zero."
                  valor={resp} aoResponder={setResp}
                  respostas={[{ k: 's', t: 'Foi, sim' }, { k: 'q', t: 'Quase' }, { k: 'n', t: 'Não lembro' }]} />
      </Secao>

      <Secao titulo="Vazio e avisos">
        <Vazio titulo="Uma pesagem não faz linha."><p>Com duas aparece a diferença; com uma semana, a média.</p></Vazio>
        <Apoio>Texto de apoio: pequeno, em tinta 2, nunca abaixo de 12 px.</Apoio>
      </Secao>
      <Faixa>Sem rede. Tudo fica guardado neste aparelho.</Faixa>
      <Faixa falha acao="Ver" aoAgir={() => {}}>1 série não foi guardada</Faixa>

      <Cabecalho titulo="Destino" nota="cabeçalho fino" aoVoltar={() => {}} />
      <Cabecalho titulo="Dias" nota="novembro · 10 treinos" raiz />

      {folha && (
        <Folha titulo="Registrar" sub="O mais provável agora vem primeiro." aoFechar={() => setFolha(false)}>
          <Acoes><Botao onClick={() => setFolha(false)}>Fechar</Botao></Acoes>
        </Folha>
      )}
      <Doca ativa={aba} onMuda={setAba} aoRegistrar={() => setFolha(true)} />
    </div>
  );
}

render(<Galeria />, document.getElementById('g'));
