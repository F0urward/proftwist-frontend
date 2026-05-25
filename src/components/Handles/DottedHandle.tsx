import { Handle, Position } from "@xyflow/react";
import { useTheme } from "@mui/material/styles";

export const DottedHandle = ({ position, source }) => {
  const theme = useTheme();

  return (
    <Handle
      type="target"
      position={position}
      isValidConnection={(connection) => connection.source === source}
      onConnect={(params) => console.log("handle onConnect", params)}
      style={{ background: theme.palette.text.primary }}
    />
  );
};
