import { Box } from "@mui/material";
import React from "react";

type Props = {
  children: React.ReactNode;
  justifyContent?: string;
  py?: number;
};

const BaseLayout: React.FC<Props> = ({
  children,
  justifyContent = "center",
  py = 3,
}) => {
  return (
    <Box
      sx={{
        minHeight: { xs: "calc(100dvh - 56px)", sm: "calc(100vh - 64px)" },
        bgcolor: "background.default",
        overflow: "hidden",
        backgroundImage: "url(/assets/bg-glow.svg), url(/assets/bg-glow.svg)",
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundPosition: "right -25vw top -50vh, left -25vw bottom -50vh",
        backgroundSize:
          "clamp(520px, 65vw, 1000px), clamp(520px, 65vw, 1000px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: {
          xs: "flex-start",
          md: justifyContent,
        },
        gap: { xs: 2, md: 3 },
        py: { xs: py, md: 4 },
        px: 2,
      }}
    >
      {children}
    </Box>
  );
};

export default BaseLayout;
