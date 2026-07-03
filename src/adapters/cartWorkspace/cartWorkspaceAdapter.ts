import type { CartLineInput, CartLineItem } from '@/types';

export interface CartWorkspaceAdapter {
  getLines(): Promise<CartLineItem[]>;
  addLine(input: CartLineInput): Promise<CartLineItem[]>;
  updateQuantity(lineId: string, quantity: number): Promise<CartLineItem[]>;
  removeLine(lineId: string): Promise<CartLineItem[]>;
  clearCart(): Promise<CartLineItem[]>;
}
