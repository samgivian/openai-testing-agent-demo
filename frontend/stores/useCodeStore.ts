import { create } from "zustand";

interface CodeStoreState {
  testCode: string;
  setTestCode: (code: string) => void;
}

export const useCodeStore = create<CodeStoreState>((set) => ({
  testCode: "",
  setTestCode: (code) => set({ testCode: code }),
}));

export default useCodeStore;
