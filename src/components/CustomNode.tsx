import { useMemo } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { Handle, Position } from "@xyflow/react";
import { NodeProgressStatus } from "../types/nodeProgressStatus";
import { progressMeta } from "../types/nodeProgressStatus";

import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import SkipNextRoundedIcon from "@mui/icons-material/SkipNextRounded";

type NodeType = "primary" | "secondary" | "root";

const statusDot: Record<
  NodeProgressStatus,
  { bg: string; fg: string; Icon: any }
> = {
  ожидает: {
    bg: "rgba(255,255,255,0.48)",
    fg: "rgba(255,255,255,0.92)",
    Icon: HourglassEmptyRoundedIcon,
  },
  "в процессе": {
    bg: "rgba(126,87,255,0.85)",
    fg: "#fff",
    Icon: AutorenewRoundedIcon,
  },
  завершено: {
    bg: "rgba(0,200,120,0.90)",
    fg: "#fff",
    Icon: CheckRoundedIcon,
  },
  пропущено: {
    bg: "rgba(255,180,0,0.90)",
    fg: "#111",
    Icon: SkipNextRoundedIcon,
  },
};

interface NodeProps {
  id: string;
  data: {
    label: string;
    type: NodeType;
    showProgress?: boolean;
    progress?: { status?: NodeProgressStatus };
  };
  progress?: { status?: NodeProgressStatus };
  selected: boolean;
}

export const CustomNode = ({
  id,
  data: { label, type, showProgress, progress: dataProgress },
  progress,
  selected,
}: NodeProps) => {
  const background = useMemo(() => {
    switch (type) {
      case "primary":
        return "#FF89DC";
      case "secondary":
        return "#D596FF";
      case "root":
        return "linear-gradient(90deg, #D596FF 0%, #FF89DC 100%)";
    }
  }, [type]);

  const status = progress?.status ?? dataProgress?.status;
  const canShow = Boolean(showProgress) && Boolean(status);
  const meta = canShow ? progressMeta[status as NodeProgressStatus] : null;

  return (
    <div className="text-updater-node">
      <Box
        sx={{
          position: "relative",
          borderRadius: "10px",
          padding: "10px",
          minWidth: "140px",
          minHeight: type === "root" ? "70px" : "30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: background,
          outline: selected
            ? "1px solid rgba(255,255,255,0.95)"
            : "1px solid transparent",
          outlineOffset: 0,
          boxSizing: "border-box",
          cursor: "pointer",
          transition: "all 0.25s ease",
          transformOrigin: "center",

          "&:hover": {
            transform: "scale(1.06)",
            boxShadow: "0 0 18px rgba(188, 87, 255, 0.65)",
            zIndex: 10,
          },
        }}
      >
        {meta && status ? (
          <Tooltip arrow placement="top" title={`Статус: ${meta.label}`}>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                transform: "translate(30%, -30%)",
                width: 22,
                height: 22,
                borderRadius: "999px",
                display: "grid",
                placeItems: "center",
                background: statusDot[status].bg,
                color: statusDot[status].fg,
                border: "1px solid rgba(255,255,255,0.35)",
                boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              {(() => {
                const Icon = statusDot[status].Icon;
                return (
                  <Icon
                    sx={{
                      fontSize: 14,
                      opacity: 0.95,
                    }}
                  />
                );
              })()}
            </Box>
          </Tooltip>
        ) : null}
        <Typography>{label}</Typography>
      </Box>
      {type !== "root" && <Handle type="target" position={Position.Top} />}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
