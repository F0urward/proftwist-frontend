import "@xyflow/react/dist/style.css";

import { ReactFlow, Background, Controls } from "@xyflow/react";
import { RootState, useAppDispatch, useAppSelector } from "../store";
import { edgeTypes, nodeTypes } from "../consts";
import { useEffect } from "react";
import { viewSliceActions } from "../store/slices/viewSlice";

const RoadmapPage = () => {
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
    <div style={{ width: "100vw", height: "100vh", color: "#000" }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Controls position="center-left" showZoom={false}></Controls>

        <Background color="#fff" bgColor="#000" />
      </ReactFlow>
    </div>
  );
};

export default RoadmapPage;