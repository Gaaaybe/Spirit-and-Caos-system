import { Modal } from '@/shared/ui';
import { CriadorDeItem } from './CriadorDeItem';
import type { ItemResponse } from '@/services/types';

interface CriadorDeItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemParaEditar: ItemResponse;
  onSave?: (item: ItemResponse) => void;
}

export function CriadorDeItemModal({ isOpen, onClose, itemParaEditar, onSave }: CriadorDeItemModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Instância de Item"
      size="xl"
    >
      <div className="py-4">
        <CriadorDeItem itemInicial={itemParaEditar} onSaved={onSave} />
      </div>
    </Modal>
  );
}
