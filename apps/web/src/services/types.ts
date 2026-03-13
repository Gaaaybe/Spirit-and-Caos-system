// ─── Domínio ──────────────────────────────────────────────────────────────────

export type DomainName =
  | 'natural'
  | 'sagrado'
  | 'sacrilegio'
  | 'psiquico'
  | 'cientifico'
  | 'peculiar'
  | 'arma-branca'
  | 'arma-fogo'
  | 'arma-tensao'
  | 'arma-explosiva'
  | 'arma-tecnologica';

export interface DominioResponse {
  name: DomainName;
  areaConhecimento: string | null;
  peculiarId: string | null;
}

// ─── Custo ────────────────────────────────────────────────────────────────────

export interface CustoResponse {
  pda: number;
  pe: number;
  espacos: number;
}

export interface CustoAlternativoResponse {
  tipo: 'pe' | 'pv' | 'atributo' | 'item' | 'material';
  quantidade: number;
  descricao?: string;
  atributo?: string;
  itemId?: string;
}

// ─── Modificação aplicada ─────────────────────────────────────────────────────

export interface ModificacaoAplicadaResponse {
  modificationBaseId: string;
  scope: 'global' | 'local';
  grau: number | null;
  parametros: Record<string, unknown> | null;
  nota: string | null;
}

// ─── Efeito aplicado ──────────────────────────────────────────────────────────

export interface EfeitoAplicadoResponse {
  id: string;
  effectBaseId: string;
  grau: number;
  configuracaoId: string | null;
  inputValue: string | number | null;
  custo: CustoResponse;
  modifications: ModificacaoAplicadaResponse[];
  nota: string | null;
}

// ─── Poder ────────────────────────────────────────────────────────────────────

export interface PoderResponse {
  id: string;
  userId: string | null;
  nome: string;
  descricao: string;
  isPublic: boolean;
  icone: string | null;
  notas: string | null;
  dominio: DominioResponse;
  parametros: { acao: number; alcance: number; duracao: number };
  custoTotal: CustoResponse;
  custoAlternativo: CustoAlternativoResponse | null;
  effects: EfeitoAplicadoResponse[];
  globalModifications: ModificacaoAplicadaResponse[];
  createdAt: string;
  updatedAt: string | null;
}

// ─── Payload criação/atualização de Poder ─────────────────────────────────────

export interface ModificacaoAplicadaPayload {
  modificationBaseId: string;
  scope: 'global' | 'local';
  grau?: number;
  parametros?: Record<string, unknown>;
  nota?: string;
}

export interface EfeitoAplicadoPayload {
  effectBaseId: string;
  grau: number;
  configuracaoId?: string;
  inputValue?: string | number;
  modifications?: ModificacaoAplicadaPayload[];
  nota?: string;
}

export interface CustoAlternativoPayload {
  tipo: 'pe' | 'pv' | 'atributo' | 'item' | 'material';
  quantidade: number;
  descricao?: string;
  atributo?: string;
  itemId?: string;
}

export interface CreatePoderPayload {
  nome: string;
  descricao: string;
  dominio: { name: DomainName; areaConhecimento?: string; peculiarId?: string };
  parametros: { acao: number; alcance: number; duracao: number };
  effects: EfeitoAplicadoPayload[];
  globalModifications?: ModificacaoAplicadaPayload[];
  custoAlternativo?: CustoAlternativoPayload;
  isPublic?: boolean;
  notas?: string;
  icone?: string;
}

export type UpdatePoderPayload = Omit<Partial<CreatePoderPayload>, 'icone'> & {
  icone?: string | null;
};

// ─── Acervo ───────────────────────────────────────────────────────────────────

export interface AcervoResponse {
  id: string;
  userId: string | null;
  nome: string;
  descricao: string;
  isPublic: boolean;
  icone: string | null;
  notas: string | null;
  dominio: DominioResponse;
  parametrosBase: { acao: number; alcance: number; duracao: number } | null;
  custoTotal: CustoResponse;
  powers: PoderResponse[];
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAcervoPayload {
  nome: string;
  descricao: string;
  dominio: { name: DomainName; areaConhecimento?: string; peculiarId?: string };
  powerIds: string[];
  parametrosBase?: { acao: number; alcance: number; duracao: number };
  isPublic?: boolean;
  notas?: string;
  icone?: string;
}

export type UpdateAcervoPayload = Omit<Partial<CreateAcervoPayload>, 'icone'> & {
  icone?: string | null;
};

// ─── Peculiaridade ────────────────────────────────────────────────────────────

export interface PeculiaridadeResponse {
  id: string;
  userId: string;
  nome: string;
  descricao: string;
  espiritual: boolean;
  isPublic: boolean;
  icone: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreatePeculiaridadePayload {
  nome: string;
  descricao: string;
  espiritual: boolean;
  isPublic?: boolean;
  icone?: string;
}

export type UpdatePeculiaridadePayload = Omit<
  Partial<CreatePeculiaridadePayload>,
  'icone'
> & {
  icone?: string | null;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  masterConfirm?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
