import { create } from "zustand";
import { TEST_CASE } from "@/lib/constants";

interface TestCaseState {
  testCase: string;
  setTestCase: (val: string) => void;
}

export const useTestCaseStore = create<TestCaseState>((set) => ({
  testCase: TEST_CASE,
  setTestCase: (val) => set({ testCase: val }),
}));

export default useTestCaseStore;
