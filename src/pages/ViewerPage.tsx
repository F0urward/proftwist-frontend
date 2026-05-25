import "@xyflow/react/dist/style.css";

import { ReactFlow, Background, Controls } from "@xyflow/react";
import { useTheme } from "@mui/material/styles";
import { RootState, useAppDispatch, useAppSelector } from "../store";
import { edgeTypes, nodeTypes } from "../consts";
import { useEffect } from "react";
import { viewSliceActions } from "../store/slices/viewSlice";

export const ViewerPage = () => {
  const theme = useTheme();
  const { nodes, edges } = useAppSelector((state: RootState) => state.editor);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const data = localStorage.getItem("flow");
    if (!data) return;

    console.log(data);

    const { nodes, edges } = JSON.parse(data);
    dispatch(viewSliceActions.setNodes(nodes));
    dispatch(viewSliceActions.setEdges(edges));
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", color: theme.palette.text.primary }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Controls position="center-left" showZoom={false}></Controls>

        <Background color={theme.palette.mode === "dark" ? "#fff" : theme.palette.text.secondary} bgColor={theme.palette.mode === "dark" ? "#000" : theme.palette.background.default} />
      </ReactFlow>
    </div>
  );
};
