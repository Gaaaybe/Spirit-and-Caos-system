import { DomainValidationError } from '@/core/errors/domain-validation-error';

export interface EquippedItem {
  itemId: string;
  quantity: number;
}

export interface EquipmentSlotsProps {
  suitId?: string;
  accessoryId?: string;
  hands: EquippedItem[];
  quickAccess: EquippedItem[];
  numberOfHands: number;
}

export class EquipmentSlots {
  private readonly props: EquipmentSlotsProps;

  private constructor(props: EquipmentSlotsProps) {
    this.props = {
      suitId: props.suitId,
      accessoryId: props.accessoryId,
      hands: props.hands.map((h) => ({ ...h })),
      quickAccess: props.quickAccess.map((q) => ({ ...q })),
      numberOfHands: props.numberOfHands,
    };
  }

  static create(props: Partial<EquipmentSlotsProps> & { numberOfHands?: number }): EquipmentSlots {
    const hands = props.hands ?? [];
    const quickAccess = props.quickAccess ?? [];
    const numberOfHands = props.numberOfHands ?? 2;

    if (hands.length > numberOfHands) {
      throw new DomainValidationError(
        `Não é possível equipar mais itens nas mãos do que a quantidade de mãos disponíveis (${numberOfHands}).`,
        'hands',
      );
    }

    const maxQuickAccess = 2;
    if (quickAccess.length > maxQuickAccess) {
      throw new DomainValidationError(
        `O limite de acesso rápido é ${maxQuickAccess}.`,
        'quickAccess',
      );
    }

    return new EquipmentSlots({
      suitId: props.suitId,
      accessoryId: props.accessoryId,
      hands,
      quickAccess,
      numberOfHands,
    });
  }

  get suitId(): string | undefined {
    return this.props.suitId;
  }

  get accessoryId(): string | undefined {
    return this.props.accessoryId;
  }

  get hands(): EquippedItem[] {
    return this.props.hands.map((h) => ({ ...h }));
  }

  get quickAccess(): EquippedItem[] {
    return this.props.quickAccess.map((q) => ({ ...q }));
  }

  get numberOfHands(): number {
    return this.props.numberOfHands;
  }

  get maxQuickAccessSlots(): number {
    return 2;
  }

  equipSuit(itemId: string): EquipmentSlots {
    return new EquipmentSlots({ ...this.props, suitId: itemId });
  }

  equipAccessory(itemId: string): EquipmentSlots {
    return new EquipmentSlots({ ...this.props, accessoryId: itemId });
  }

  unequipSuit(): EquipmentSlots {
    return new EquipmentSlots({ ...this.props, suitId: undefined });
  }

  unequipAccessory(): EquipmentSlots {
    return new EquipmentSlots({ ...this.props, accessoryId: undefined });
  }

  equipHand(itemId: string, quantity: number = 1, maxStack: number = 1): EquipmentSlots {
    const existingIndex = this.props.hands.findIndex((h) => h.itemId === itemId);

    if (existingIndex >= 0) {
      const currentQuantity = this.props.hands[existingIndex].quantity;
      if (currentQuantity + quantity > maxStack) {
        throw new DomainValidationError(`O limite de empilhamento para este item é ${maxStack}.`, 'hands');
      }

      const newHands = [...this.props.hands];
      newHands[existingIndex] = { itemId, quantity: currentQuantity + quantity };
      return new EquipmentSlots({ ...this.props, hands: newHands });
    }

    if (this.props.hands.length >= this.props.numberOfHands) {
      throw new DomainValidationError('Mãos cheias. Desequipe um item primeiro.', 'hands');
    }

    return new EquipmentSlots({
      ...this.props,
      hands: [...this.props.hands, { itemId, quantity }],
    });
  }

  unequipHand(itemId: string, quantity: number = 1): EquipmentSlots {
    const existingIndex = this.props.hands.findIndex((h) => h.itemId === itemId);

    if (existingIndex === -1) {
      return this;
    }

    const currentQuantity = this.props.hands[existingIndex].quantity;

    let newHands = [...this.props.hands];

    if (currentQuantity <= quantity) {
      newHands = newHands.filter((h) => h.itemId !== itemId);
    } else {
      newHands[existingIndex] = { itemId, quantity: currentQuantity - quantity };
    }

    return new EquipmentSlots({ ...this.props, hands: newHands });
  }

  addQuickAccess(itemId: string, quantity: number = 1, maxStack: number = 1): EquipmentSlots {
    const existingIndex = this.props.quickAccess.findIndex((q) => q.itemId === itemId);

    if (existingIndex >= 0) {
      const currentQuantity = this.props.quickAccess[existingIndex].quantity;
      if (currentQuantity + quantity > maxStack) {
        throw new DomainValidationError(`O limite de empilhamento para este item é ${maxStack}.`, 'quickAccess');
      }

      const newQuickAccess = [...this.props.quickAccess];
      newQuickAccess[existingIndex] = { itemId, quantity: currentQuantity + quantity };
      return new EquipmentSlots({ ...this.props, quickAccess: newQuickAccess });
    }

    if (this.props.quickAccess.length >= this.maxQuickAccessSlots) {
      throw new DomainValidationError('Acesso rápido cheio.', 'quickAccess');
    }

    return new EquipmentSlots({
      ...this.props,
      quickAccess: [...this.props.quickAccess, { itemId, quantity }],
    });
  }

  removeQuickAccess(itemId: string, quantity: number = 1): EquipmentSlots {
    const existingIndex = this.props.quickAccess.findIndex((q) => q.itemId === itemId);

    if (existingIndex === -1) {
      return this;
    }

    const currentQuantity = this.props.quickAccess[existingIndex].quantity;

    let newQuickAccess = [...this.props.quickAccess];

    if (currentQuantity <= quantity) {
      newQuickAccess = newQuickAccess.filter((q) => q.itemId !== itemId);
    } else {
      newQuickAccess[existingIndex] = { itemId, quantity: currentQuantity - quantity };
    }

    return new EquipmentSlots({ ...this.props, quickAccess: newQuickAccess });
  }
}
