import { createSlice } from "@reduxjs/toolkit";
import { Node } from "../../types";

interface StateInterface {
  nodes: Node[];
  edges: [];
  selectedElementId: string | null;
}

const viewSlice = createSlice({
  name: "counter",
  initialState: {
    nodes: [],
    edges: [],
    selectedElementId: null,
  } as StateInterface,
  reducers: {
    setNodes: (state, action) => {
      state.nodes = action.payload;
    },

    setEdges: (state, action) => {
      state.edges = action.payload;
    },
  },
});

// Экспортируем действия
export const { actions: viewSliceActions } = viewSlice;

// Экспортируем редьюсер
export default viewSlice.reducer;
