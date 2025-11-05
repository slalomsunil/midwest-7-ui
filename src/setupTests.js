// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock fetch globally to prevent real API calls
global.fetch = jest.fn();

// Mock sessionStorage globally
const createMockStorage = () => {
  let store = {};
  
  const mockStorage = {
    getItem: jest.fn().mockImplementation((key) => store[key] || null),
    setItem: jest.fn().mockImplementation((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn().mockImplementation((key) => {
      delete store[key];
    }),
    clear: jest.fn().mockImplementation(() => {
      store = {};
    }),
    get _store() {
      return store;
    },
    _reset() {
      store = {};
      // Re-implement the mocks to use the new store reference
      mockStorage.getItem.mockImplementation((key) => store[key] || null);
      mockStorage.setItem.mockImplementation((key, value) => {
        store[key] = String(value);
      });
      mockStorage.removeItem.mockImplementation((key) => {
        delete store[key];
      });
      mockStorage.clear.mockImplementation(() => {
        store = {};
      });
    }
  };
  
  return mockStorage;
};

const mockSessionStorage = createMockStorage();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
  configurable: true
});

// Mock localStorage globally
const mockLocalStorage = createMockStorage();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
  if (window.sessionStorage._reset) {
    window.sessionStorage._reset();
  }
  if (window.localStorage._reset) {
    window.localStorage._reset();
  }
});

// Clean up after each test
afterEach(() => {
  jest.restoreAllMocks();
});
