import { Attribute } from './attribute';

export type PhysicalAttribute = 'strength' | 'dexterity' | 'constitution';
export type MentalAttribute = 'intelligence' | 'wisdom' | 'charisma';

export interface AttributeSetProps {
  strength: Attribute;
  dexterity: Attribute;
  constitution: Attribute;
  intelligence: Attribute;
  wisdom: Attribute;
  charisma: Attribute;
  keyPhysical: PhysicalAttribute;
  keyMental: MentalAttribute;
}

export class AttributeSet {
  private readonly props: AttributeSetProps;

  private constructor(props: AttributeSetProps) {
    this.props = props;
  }

  static create(props: AttributeSetProps): AttributeSet {
    return new AttributeSet(props);
  }

  get strength(): Attribute {
    return this.props.strength;
  }
  get dexterity(): Attribute {
    return this.props.dexterity;
  }
  get constitution(): Attribute {
    return this.props.constitution;
  }
  get intelligence(): Attribute {
    return this.props.intelligence;
  }
  get wisdom(): Attribute {
    return this.props.wisdom;
  }
  get charisma(): Attribute {
    return this.props.charisma;
  }

  get keyPhysical(): PhysicalAttribute {
    return this.props.keyPhysical;
  }
  get keyMental(): MentalAttribute {
    return this.props.keyMental;
  }

  getPhysicalKeyBaseModifier(): number {
    return this.props[this.props.keyPhysical].baseModifier;
  }

  getMentalKeyBaseModifier(): number {
    return this.props[this.props.keyMental].baseModifier;
  }
}
