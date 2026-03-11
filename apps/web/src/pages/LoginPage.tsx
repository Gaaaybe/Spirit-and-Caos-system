import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

type Aba = 'entrar' | 'cadastrar';

export function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Destino após autenticação: rota anterior (passada pelo PrivateRoute) ou biblioteca
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/biblioteca';

  // Se o usuário já está autenticado ao visitar /entrar, redireciona imediatamente
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // apenas na montagem

  const [aba, setAba] = useState<Aba>('entrar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      if (aba === 'entrar') {
        await login({ email, password });
        navigate(from, { replace: true });
      } else {
        await register({ name: nome, email, password });
        setAba('entrar');
        setPassword('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setErro(msg);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          {/* Abas */}
          <div className="flex">
            <button
              onClick={() => { setAba('entrar'); setErro(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                aba === 'entrar'
                  ? 'bg-espirito-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setAba('cadastrar'); setErro(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                aba === 'cadastrar'
                  ? 'bg-espirito-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-center mb-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-espirito-600 to-purple-600 bg-clip-text text-transparent">
                Aetherium
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {aba === 'entrar' ? 'Acesse sua conta' : 'Crie sua conta gratuita'}
              </p>
            </div>

            {aba === 'cadastrar' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  minLength={2}
                  placeholder="Seu nome"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-espirito-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-espirito-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-espirito-500"
              />
            </div>

            {erro && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-2.5 rounded-lg bg-espirito-600 hover:bg-espirito-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {carregando
                ? aba === 'entrar' ? 'Entrando…' : 'Cadastrando…'
                : aba === 'entrar' ? 'Entrar' : 'Criar conta'}
            </button>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              <Link to="/" className="hover:text-espirito-600 dark:hover:text-espirito-400 transition-colors">
                ← Voltar para o início
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
