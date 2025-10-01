import { Handle, Position } from "@xyflow/react";

export const DottedHandle = ({ position, source }) => {
  return (
    <Handle
      type="target"
      position={position}
      isValidConnection={(connection) => connection.source === source}
      onConnect={(params) => console.log("handle onConnect", params)}
      style={{ background: "#fff" }}
    />
  );
};
