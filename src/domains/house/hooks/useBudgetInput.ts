import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  type BudgetInput,
  emptyBudgetInput,
} from '@/domains/house/utils/calculate-budget';

type BudgetInputStore = {
  input: BudgetInput;
  setField: <Key extends keyof BudgetInput>(
    key: Key,
    value: BudgetInput[Key]
  ) => void;
  clear: () => void;
};

export const useBudgetInput = create<BudgetInputStore>()(
  persist(
    (set) => ({
      input: { ...emptyBudgetInput },
      setField: (key, value) =>
        set((state) => ({ input: { ...state.input, [key]: value } })),
      clear: () => set({ input: { ...emptyBudgetInput } }),
    }),
    {
      name: 'house-budget-input',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ input: state.input }),
    }
  )
);
