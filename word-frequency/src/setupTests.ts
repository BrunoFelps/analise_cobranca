import '@testing-library/jest-dom';

// Recharts uses ResizeObserver internally; jsdom does not implement it
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
