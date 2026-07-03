import type { CartWorkspaceAdapter } from './cartWorkspaceAdapter';

/**
 * Default adapter when no in-memory data source is injected. Returns an
 * empty cart from every method so no runtime path assumes cart lines exist
 * until a real adapter (mock or future persistence) is connected.
 */
export const unavailableCartWorkspaceAdapter: CartWorkspaceAdapter = {
  async getLines() { return []; },
  async addLine() { return []; },
  async updateQuantity() { return []; },
  async removeLine() { return []; },
  async clearCart() { return []; },
};
