import { DomainValidationError } from '@/core/errors/domain-validation-error';

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface InventoryProps {
  runics: number;
  bag: InventoryItem[];
}

export class Inventory {
  private readonly props: InventoryProps;

  private constructor(props: InventoryProps) {
    this.props = {
      runics: props.runics,
      bag: [...props.bag],
    };
  }

  static create(props?: Partial<InventoryProps>): Inventory {
    return new Inventory({
      runics: props?.runics ?? 0,
      bag: props?.bag ?? [],
    });
  }

  get runics(): number {
    return this.props.runics;
  }

  get bag(): InventoryItem[] {
    return [...this.props.bag];
  }

  addRunics(amount: number): Inventory {
    if (amount < 0)
      throw new DomainValidationError('Não pode adicionar runics negativos', 'runics');
    return new Inventory({ ...this.props, runics: this.props.runics + amount });
  }

  spendRunics(amount: number): Inventory {
    if (amount < 0) throw new DomainValidationError('Não pode gastar runics negativos', 'runics');
    if (this.props.runics < amount) {
      throw new DomainValidationError('Runics insuficientes', 'runics');
    }
    return new Inventory({ ...this.props, runics: this.props.runics - amount });
  }

  addItem(itemId: string, quantity: number = 1): Inventory {
    if (quantity <= 0) throw new DomainValidationError('Quantidade deve ser positiva', 'quantity');

    const newBag = [...this.props.bag];
    const existingIndex = newBag.findIndex((item) => item.itemId === itemId);

    if (existingIndex >= 0) {
      newBag[existingIndex] = {
        ...newBag[existingIndex],
        quantity: newBag[existingIndex].quantity + quantity,
      };
    } else {
      newBag.push({ itemId, quantity });
    }

    return new Inventory({ ...this.props, bag: newBag });
  }

  removeItem(itemId: string, quantity: number = 1): Inventory {
    if (quantity <= 0) throw new DomainValidationError('Quantidade deve ser positiva', 'quantity');

    const newBag = [...this.props.bag];
    const existingIndex = newBag.findIndex((item) => item.itemId === itemId);

    if (existingIndex === -1) {
      throw new DomainValidationError('Item não encontrado no inventário', 'bag');
    }

    const currentQuantity = newBag[existingIndex].quantity;
    if (currentQuantity < quantity) {
      throw new DomainValidationError('Não há quantidade suficiente para remover', 'bag');
    }

    if (currentQuantity === quantity) {
      newBag.splice(existingIndex, 1);
    } else {
      newBag[existingIndex] = { ...newBag[existingIndex], quantity: currentQuantity - quantity };
    }

    return new Inventory({ ...this.props, bag: newBag });
  }

  setItemQuantity(itemId: string, quantity: number): Inventory {
    if (quantity < 0) throw new DomainValidationError('Quantidade não pode ser negativa', 'quantity');

    const newBag = [...this.props.bag];
    const existingIndex = newBag.findIndex((item) => item.itemId === itemId);

    if (existingIndex === -1 && quantity > 0) {
      newBag.push({ itemId, quantity });
    } else if (existingIndex >= 0) {
      if (quantity === 0) {
        newBag.splice(existingIndex, 1);
      } else {
        newBag[existingIndex] = { ...newBag[existingIndex], quantity };
      }
    }

    return new Inventory({ ...this.props, bag: newBag });
  }
}
