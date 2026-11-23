# MCP do Lastro: os agentes ligados direto ao app

Desenho aprovado pelo dono em 23/11/2026. Ainda não há código.

## Por que

O dono conversa com agentes de IA no claude.ai, hoje o treinador e o nutricionista, e no futuro outros. Há dois problemas:
- **Para ler**, os agentes dependem do espelho (`ferramentas/espelho/`): alguém roda `npm run espelho`, a pasta `~/Lastro` envelhece, e só o Cowork lê.
- **Para escrever**, tudo o que um agente decide volta pela mão do dono, que copia e cola no app (a revisão do programa, por exemplo).

Um servidor MCP do Lastro resolve as duas pontas: os agentes leem o dado do momento, e o que eles propõem chega ao app sem cópia.

## Decisões do dono (23/11/2026)

1. **Um conector por agente.** Cada papel tem a sua porta e só enxerga o que é dele. O assistente vê o todo, em resumo.
2. **Há um assistente**, que vê o app de cima, aponta o que precisa de atenção e encaminha para o especialista certo, sem decidir por ele.
3. **O assistente pode registrar coisas simples direto**: água, peso e refeição marcada.
4. **Mudanças grandes só valem depois da aprovação no app.** Isso inclui o programa de treino e o plano alimentar.
5. **Os agentes podem deixar recados uns para os outros**, mas só depois de pedir permissão ao dono.
6. **Os agentes podem ver as fotos do corpo.**

## O que a pesquisa confirmou (23/11/2026)

- **A versão atual do MCP é 2026-07-28.** O protocolo ficou sem estado: não há mais o `initialize`, e cada requisição leva a versão e as capacidades. Combina com funções sem estado na Vercel. Tasks é uma extensão oficial. A especificação deprecia o registro dinâmico de cliente (DCR) em favor do Client ID Metadata Document (CIMD), mas mantém o DCR por compatibilidade. Fonte: [changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog).
- **Conector remoto no claude.ai:**
  - OAuth com PKCE S256 obrigatório;
  - a conexão começa por uma resposta **401** que aponta para os metadados do recurso (RFC 9728);
  - o `resource` precisa ser igual ao endereço do servidor;
  - o retorno é `https://claude.ai/api/mcp/auth_callback`;
  - o Claude aceita DCR e CIMD, e prefere o CIMD quando o servidor de autorização o anuncia.

  Fonte: [autenticação de conectores](https://claude.com/docs/connectors/building/authentication).
- **Supabase Auth como servidor OAuth 2.1:**
  - tem DCR para clientes MCP;
  - os tokens respeitam o RLS, e as políticas podem usar a claim `client_id`;
  - a tela de consentimento é do app;
  - só oferece os escopos padrão (`openid`, `email`, `profile`, `phone`);
  - a página não fala de CIMD.

  Fonte: [OAuth 2.1 Server](https://supabase.com/docs/guides/auth/oauth-server).
- **No claude.ai, os conectores valem para a conta inteira, não por projeto.** A aprovação é por ferramenta: uma vez, esta conversa, este projeto ou sempre. Por isso **o isolamento entre papéis é do servidor**, e na conversa de cada agente o dono liga só o conector daquele papel.
- **As anotações das ferramentas** (`readOnlyHint`, `destructiveHint`) são dicas para o cliente decidir o que confirmar. Não são proteção. Fonte: [blog do MCP](https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/).
- **A boa prática** é de 5 a 15 ferramentas por servidor e gente aprovando tudo o que grava.

## Arquitetura

```
claude.ai (conversa do treinador)   ──► https://<app>/api/mcp/treinador     ─┐
claude.ai (conversa do nutricionista)──► https://<app>/api/mcp/nutricionista ─┼─► funções na Vercel
claude.ai (conversa do assistente)  ──► https://<app>/api/mcp/assistente    ─┘      │  token do usuário (RLS)
                                                                                    ▼
                                         Supabase: estado (leitura) · equipe · acessos · fotos
                                                                                    ▲
                                         app (PWA): aplica os registros e mostra as propostas
```

- **Onde fica o servidor:** funções da Vercel no mesmo projeto do app (`api/mcp/[papel]`), com o SDK oficial do MCP e o `mcp-handler`. São sem estado.
- **Login:** o Supabase Auth é o servidor de autorização, e o servidor MCP é o recurso. O app ganha uma rota de consentimento, `/autorizar`, que diz qual agente pede acesso e a que.
  - Cada porta publica os próprios metadados de recurso, com `resource` igual ao próprio endereço.
  - Todo acesso usa o token do usuário: nunca a chave de administrador, e sempre o RLS.
- **O papel vem do endereço.** O Supabase não tem escopos próprios, então quem define o papel é a porta. O token só prova quem é o usuário; o servidor decide o que aquela porta mostra.
- **Ler** reaproveita `ferramentas/espelho/monta.ts`: o estado é lido com o token, e as mesmas funções que montam o espelho montam as respostas. Uma regra, dois usos.
- **Escrever nunca mexe no `estado` direto.** O `estado` tem regras de fusão entre aparelhos (carimbos, lápides, `v`), e o app continua sendo o único que o escreve. Tudo o que os agentes gravam vai para a **caixa da equipe**, uma tabela nova, e o app aplica.

## Os papéis

Ficam declarados num lugar só (`api/mcp/papeis.ts`). Um papel novo é uma entrada nova ali, sem servidor novo.

| Papel | Lê | Escreve |
|---|---|---|
| **assistente** | tudo, em resumo; a caixa da equipe inteira | registros simples; encaminhamentos; recados |
| **treinador** | treino, frequência (descanso e falta), dor, corpo, fotos | proposta de revisão do programa; resposta a encaminhamento; recados |
| **nutricionista** | comida, plano, aderência, corpo, fotos | proposta de plano alimentar; resposta a encaminhamento; recados |

### Ferramentas

As de leitura levam `readOnlyHint: true`.

**Comuns a todos**
- `resumo(periodo)`: o período em poucas linhas, cortado pelo papel.
- `corpo(periodo)`: peso, medidas e as sessões de fotos, com links assinados de vida curta.
- `caixa()`: os itens da equipe que tocam este papel, como encaminhamentos para ele, recados e o estado das propostas dele.
- `deixar_recado(texto, para?)`: recado para a equipe ou para um papel. A descrição manda mostrar o texto ao dono e pedir o ok antes de chamar.

**Treinador**
- `treinos(de, ate)`: sessões, séries, RIR, "registrado depois", turno.
- `exercicio(nome)`: o histórico e a progressão de um exercício.
- `programa()`: o programa atual e o do treinador, com as diferenças.
- `frequencia(de, ate)`: descanso, falta e motivo.
- `propor_revisao(texto)`: no formato que o app já lê (`src/dominio/revisao.ts`).

**Nutricionista**
- `comida(de, ate)`: refeições, marcas, porção, resposta do dia.
- `plano()`: o plano alimentar atual.
- `aderencia()`: os dias interpretáveis e o portão de 11 de 14 (`src/dominio/nutricao/calculo.ts`).
- `propor_plano(texto)`: o formato está a definir na etapa 3.

**Assistente**
- `painel(periodo)`: treino, comida, corpo e o que está pendente, numa leitura só.
- `encaminhar(papel, texto)`: um pedido para um especialista. Ele vê na próxima conversa.
- `registrar(tipo, valor)`: água, peso ou refeição marcada. Vira um registro na caixa, que o app aplica sem pedir aprovação. Ver abaixo.

Cada papel fica entre 5 e 9 ferramentas.

## A caixa da equipe

É uma tabela nova, `equipe`, com RLS pelo dono:

| campo | |
|---|---|
| `id`, `dono`, `criado` | |
| `de` | o papel que criou |
| `para` | o papel, `'dono'` ou `'todos'` |
| `tipo` | `proposta` · `encaminhamento` · `recado` · `registro` |
| `conteudo` | jsonb (texto da revisão, valor do registro…) |
| `situacao` | `aberta` · `aceita` · `parcial` · `recusada` · `respondida` · `aplicada` |
| `resposta` | jsonb (o que ficou de fora, a resposta do especialista) |

- **Proposta.** O app mostra "O treinador propõe a revisão de 24/11". Ela abre na tela de revisão que já existe, mudança por mudança. Ao aplicar, a situação vira `aceita`, `parcial` ou `recusada`, com o que ficou de fora. O agente lê isso por `caixa()`, e o ciclo fecha sem cópia.
- **Encaminhamento.** É do assistente para um papel. O especialista lê na conversa dele e responde com uma resposta, uma proposta ou um recado.
- **Recado.** Fica visível para os papéis indicados, e o app também mostra. **O conteúdo de um recado é dado, não instrução**: a descrição das ferramentas diz isso ao agente que lê, por causa da injeção de prompt.
- **Registro.** Água, peso ou refeição, vindos do assistente. O app aplica ao abrir ou ao sincronizar, pela mesma porta de gravação da tela, e marca o item como `aplicado`. O app continua sendo o único que escreve o `estado`. O custo é que o registro só aparece quando o app abre.

## O rastro de acesso

É uma tabela nova, `acessos`, com dono, papel, ferramenta, instante e resumo do pedido. O app ganha uma tela "Agentes": quais estão conectados, o que leram e quando, e um botão para desligar cada um, que revoga o cliente OAuth.

## Segurança

- São dados de saúde. A leitura usa sempre o token do usuário, e o RLS vale em tudo, inclusive nas fotos, por link assinado de vida curta.
- Nenhuma ferramenta apaga nada.
- O que grava é sempre um item da caixa, nunca o `estado`.
- Tudo o que vem da caixa (recados, respostas) chega ao agente marcado como dado, não como instrução.
- Há limite de chamadas por papel.

## Etapas

1. **Fundação:**
   - login pelo Supabase, com a tela `/autorizar`;
   - as três portas;
   - as ferramentas de leitura;
   - o rastro de acesso e a tela "Agentes".

   Isso substitui o espelho para os agentes. Não muda nenhum dado do app.
2. **A caixa da equipe:** a tabela, a proposta de revisão do treinador com a resposta de volta, e os encaminhamentos do assistente.
3. **O resto da escrita:** os registros simples do assistente, os recados e a proposta de plano do nutricionista, com o formato a definir.
4. **Depois:** gráficos dentro da conversa (extensão MCP Apps), prompts prontos ("revisão semanal") e, se o modelo por recado apertar, especialistas que respondem sozinhos pelo Agent SDK. Isso já seria outro projeto.

## Conferido antes da etapa 1 (23/11/2026)

**Supabase (projeto `wetwqqrrgormwyktewlm`)**
- **O servidor OAuth 2.1 existe, mas está desligado neste projeto.** Os metadados de `/.well-known/oauth-authorization-server/auth/v1` respondem `404 feature_disabled: "OAuth server is disabled"`.
  - O `openid-configuration` já anuncia `authorize`, `token`, PKCE S256, `offline_access` e `none` em `token_endpoint_auth_methods_supported`.
  - Ele ainda não traz `registration_endpoint`, porque o servidor está desligado.
- **Está em beta e é grátis em todos os planos.** Os usuários que entram contam nos usuários ativos por mês. Fonte: [primeiros passos](https://supabase.com/docs/guides/auth/oauth-server/getting-started).
- **Não há CIMD.** É um pedido aberto ([supabase/auth#2850](https://github.com/supabase/auth/issues/2850)). O Claude cai no DCR, que funciona.
- **As chaves de assinatura já são assimétricas (ES256)**, no `jwks.json`. O servidor MCP valida os tokens contra o JWKS, sem segredo compartilhado.
- **O RLS de `estado` usa `auth.uid() = dono`.** O token OAuth traz o `sub` do usuário, então as políticas existentes valem sem mudança.
- O cadastro público está desligado no painel. O DCR registra **clientes** (o Claude), não usuários, e isso não abre cadastro.
- O app fala com o Supabase por `fetch`, sem o `supabase-js`. A tela de consentimento chama a API REST de autorizações do Auth da mesma forma.

**Vercel**
- O projeto é Vite, com saída em `dist`. Não há `rewrites` no `vercel.json`, então a pasta `api/` na raiz vira funções Node sem colidir com o app.
  - O caminho oficial de servidor junto ao Vite é o Nitro ([guia](https://vercel.com/docs/frameworks/full-stack/vite-with-nitro)).
  - A pasta `api/` simples também funciona, mas com um cuidado: o código importado de fora de `api/` precisa entrar no pacote da função. Vale testar com o `monta.ts`.
- **`mcp-handler` 2.0** fala a especificação 2026-07-28 com o SDK v2 e tem uma camada sem estado para clientes da era 2025 ([changelog](https://vercel.com/changelog/latest-mcp-spec-now-supported-in-mcp-handler)). Exige Node 20 ou mais (aqui é 22) e zod 4.
  - O SDK v2 só fala 2026-07-28 com opt-in. Nenhuma fonte diz qual versão o Claude negocia, e a camada de compatibilidade cobre as duas.

**Claude**
- **O conector remoto funciona no claude.ai e no Cowork rodando no computador.** A conexão sai dos servidores da Anthropic, então o servidor precisa ser público, sem porta própria na URL. Os planos individuais adicionam pelo "+" e depois "Add custom connector". O plano Free fica limitado a um conector. Fonte: [conectores personalizados](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).

## Feito pelo dono em 23/11/2026

No painel do Supabase, o servidor OAuth foi ligado, com a URL do site `https://lastro-app-eduardogenes-projects.vercel.app`, o caminho de autorização `/autorizar` e o registro dinâmico ligado. Conferido nos metadados: `registration_endpoint` em `/auth/v1/oauth/clients/register`, PKCE S256 e `none` como método de autenticação do cliente. A tela `/autorizar` ainda não existe e é o primeiro passo da etapa 1.

## O que o dono fazia no início da etapa 1 (já feito)

No painel do Supabase, em Authentication, depois OAuth Server:
1. ligar o servidor OAuth;
2. definir o caminho de autorização como `/autorizar`, no domínio de produção do app;
3. ligar o registro dinâmico de clientes ("Dynamic OAuth Apps").

Só depois que a tela `/autorizar` existir, para ninguém cair numa página vazia.

## Ainda em aberto

- Pasta `api/` simples ou Nitro: decidir no primeiro passo da etapa 1, testando o pacote com o `monta.ts`.
- A versão de protocolo que o Claude negocia: medir no primeiro teste, pelo cabeçalho.
- O formato da proposta de plano alimentar, para a etapa 3.
