import { createSlice } from "@reduxjs/toolkit";
import type { Edge as FlowEdge } from "@xyflow/react";
import { Node } from "../../types";

interface StateInterface {
  nodes: Node[];
  edges: FlowEdge[];
  selectedElementId: string | null;
}

const editorSlice = createSlice({
  name: "counter",
  initialState: {
    nodes: [],
    edges: [] as FlowEdge[],
    selectedElementId: null,
  } as StateInterface,
  reducers: {
    setNodes: (state, action) => {
      state.nodes = action.payload;
    },
    addNode: (state, action) => {
      state.nodes.push(action.payload);
    },
    updateNode: (state, action) => {
      const { id, data } = action.payload;
      const node = state.nodes.find((node) => node.id === id);
      if (node) {
        node.data = { ...node.data, ...data };
      }
    },

    setEdges: (state, action) => {
      state.edges = action.payload;
    },

    updateEdgeType: (state, action) => {
      const { id, type } = action.payload;
      state.edges = state.edges.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              type,
              data: {
                ...(edge.data ?? {}),
                variant: type,
              },
            }
          : edge
      );
    },

    markElementAsSelected: (state, action) => {
      const elementId = action.payload;

      state.selectedElementId = elementId;
      state.nodes.forEach((node) => {
        if (node.id === elementId) node.data.isSelected = true;
        else node.data.isSelected = false;
      });
    },
  },
});

// Экспортируем действия
export const { actions: editorSliceActions } = editorSlice;

// Экспортируем редьюсер
export default editorSlice.reducer;
