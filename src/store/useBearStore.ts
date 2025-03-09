import {create} from "../zustand";
import {immer} from "../zustand/middleware/immer";

interface BearState {
  bears: number;

  increase: (by?: number) => void;
  decrease: (by?: number) => void;
  reset: () => void;
}

const useBearStore = create(immer<BearState>((set) => ({
  bears: 0,
  increase: (num = 1) => set((state) => ({bears: state.bears + num})),
  decrease: (num = 1) => set((state) => {
    state.bears -= num
  }),
  reset: () => set({bears: 0}),
})))

export default useBearStore