// Camada de storage.
//
// Mesma interface assíncrona de window.storage: get -> {value} | null, set,
// delete. Ordem: window.storage (Claude.ai) -> localStorage (navegador) ->
// memória (última rede). Toda escrita é espelhada no localStorage, então
// trocar de ambiente não perde histórico.
//
// Não há servidor e não há sincronização: um usuário, um escritor, dados
// minúsculos, offline obrigatório.

/** O que o app precisa de um armazenamento, seja ele qual for. */
export interface Armazenamento {
  readonly mode: Modo | null;
  ready(): Promise<Modo>;
  get(k: string): Promise<{ value: string } | null>;
  set(k: string, v: string): Promise<boolean>;
  delete(k: string): Promise<boolean>;
}

export type Modo = 'host' | 'local' | 'mem';

declare global {
  interface Window {
    storage?: {
      get(k: string): Promise<{ value?: string } | null>;
      set(k: string, v: string): Promise<unknown>;
      delete(k: string): Promise<unknown>;
    };
  }
}

// ---------- camada de storage ----------
// Mesma interface assíncrona de window.storage: get -> {value} | null, set, delete.
// Ordem: window.storage (Claude.ai) -> localStorage (navegador) -> memória (última rede).
// Toda escrita é espelhada no localStorage, então trocar de ambiente não perde histórico.
export const DB: Armazenamento = (function () {
  let mode: Modo | null = null;                 // 'host' | 'local' | 'mem'
  // guardado na sonda: usar window.storage direto obrigaria a reprovar a
  // existência dele em cada método, e é a mesma referência de qualquer forma
  let host: Window['storage'] | null = null;
  const mem = Object.create(null);

  const hasLocal = (function () {
    try {
      const k = '__t' + Date.now();
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }  // Safari privado, file:// travado, etc.
  })();

  function localGet(k: string): string | null {
    if (hasLocal) { try { return localStorage.getItem(k); } catch (e) {} }
    return k in mem ? mem[k] : null;
  }
  function localSet(k: string, v: string): void {
    mem[k] = v;
    if (hasLocal) { try { localStorage.setItem(k, v); } catch (e) {} }
  }
  function localDel(k: string): void {
    delete mem[k];
    if (hasLocal) { try { localStorage.removeItem(k); } catch (e) {} }
  }

  // Sonda de verdade: window.storage pode existir e mesmo assim falhar.
  async function probe(): Promise<Modo> {
    if (mode) return mode;
    if (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function') {
      try { await window.storage.get('__probe__'); mode = 'host'; host = window.storage; }
      catch (e) { mode = hasLocal ? 'local' : 'mem'; }
    } else {
      mode = hasLocal ? 'local' : 'mem';
    }
    return mode;
  }

  return {
    get mode() { return mode; },
    ready: probe,

    async get(k: string) {
      await probe();
      if (mode === 'host') {
        try {
          const r = await host!.get(k);
          if (r && r.value != null) return { value: r.value };
          // host vazio mas existe espelho local: resgata em vez de começar do zero
          const m = localGet(k);
          return m != null ? { value: m } : null;
        } catch (e) { mode = hasLocal ? 'local' : 'mem'; }
      }
      const v = localGet(k);
      return v != null ? { value: v } : null;
    },

    async set(k: string, v: string) {
      await probe();
      localSet(k, v);                                // espelho primeiro, sempre
      if (mode === 'host') {
        try { await host!.set(k, v); }
        catch (e) { mode = hasLocal ? 'local' : 'mem'; }
      }
      return true;
    },

    async delete(k: string) {
      await probe();
      localDel(k);
      if (mode === 'host') {
        try { await host!.delete(k); }
        catch (e) { mode = hasLocal ? 'local' : 'mem'; }
      }
      return true;
    }
  };
})();