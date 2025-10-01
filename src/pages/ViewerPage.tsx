import "@xyflow/react/dist/style.css";

import { ReactFlow, Background, Controls } from "@xyflow/react";

const nodeTypes = {
  custom: Node,
};

const ViewerPage = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export default ViewerPage;
