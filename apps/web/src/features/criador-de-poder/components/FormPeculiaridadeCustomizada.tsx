import { useState, useEffect } from 'react';
import { Modal, ModalFooter, Button, Input, Textarea, InlineHelp } from '../../../shared/ui';
import { Sparkles } from 'lucide-react';
import type { CreatePeculiaridadePayload } from '@/services/types';

type PeculiaridadeFormPayload = Omit<CreatePeculiaridadePayload, 'icone'> & {
  icone?: string | null;
};

interface FormPeculiaridadeCustomizadaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PeculiaridadeFormPayload) => void | Promise<void>;
  initialValues?: { nome: string; descricao: string; espiritual: boolean; icone?: string };
  title?: string;
  submitLabel?: string;
}

export function FormPeculiaridadeCustomizada({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  title = 'Nova Peculiaridade',
  submitLabel = 'Criar Peculiaridade',
}: FormPeculiaridadeCustomizadaProps) {
  const [nome, setNome] = useState('');
  const [espiritual, setEspiritual] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [icone, setIcone] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNome(initialValues?.nome ?? '');
      setDescricao(initialValues?.descricao ?? '');
      setEspiritual(initialValues?.espiritual ?? false);
      setIcone(initialValues?.icone ?? '');
    }
  }, [isOpen, initialValues]);

  const handleSubmit = async () => {
    if (!nome.trim() || !descricao.trim()) return;
    await onSubmit({
      nome: nome.trim(),
      descricao: descricao.trim(),
      espiritual,
      icone: initialValues ? (icone.trim() ? icone.trim() : null) : (icone.trim() || undefined),
    });
    handleClose();
  };

  const handleClose = () => {
    setNome('');
    setEspiritual(false);
    setDescricao('');
    setIcone('');
    onClose();
  };

  const isValid = nome.trim() && descricao.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase">Definir Peculiaridade</span>
        </div>

        <InlineHelp
          type="info"
          text="Descreva o fundamento conceitual da peculiaridade. Você pode usar Markdown: **negrito**, *itálico*, listas, etc."
          dismissible={true}
          storageKey="peculiar-form-info"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome *
          </label>
          <Input
            value={nome}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
            placeholder="Ex: Poderes Lunares, Controle Temporal..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ícone (opcional)
          </label>
          <Input
            value={icone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIcone(e.target.value)}
            placeholder="Cole o link da imagem..."
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="espiritual-form"
            checked={espiritual}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEspiritual(e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="espiritual-form" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            Esta peculiaridade é de natureza espiritual
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição *
          </label>
          <Textarea
            value={descricao}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescricao(e.target.value)}
            placeholder="Descreva o que é, como funciona, regras internas e requerimentos... Você pode incluir tabelas Markdown aqui!"
            rows={14}
          />
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
          {submitLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
