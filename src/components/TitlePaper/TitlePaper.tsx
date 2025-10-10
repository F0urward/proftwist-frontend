import { Paper, Typography, Box } from "@mui/material";
import React from "react";

type TitlePaperProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export const TitlePaper: React.FC<TitlePaperProps> = ({ title, subtitle, children }) => {
  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontFamily: '"TDAText", "Lato", sans-serif',
          fontWeight: 900,
          mb: 1,
          backgroundImage: "linear-gradient(90deg, #BC57FF, #FF4DCA)",
          backgroundClip: "text",
          color: "transparent",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography variant="body1" 
          sx={{ mb: children ? 2 : 0 }}
        >
          {subtitle}
        </Typography>
      )}

      {children && <Box sx={{ mt: 1 }}>{children}</Box>}
    </Paper>
  );
};

export default TitlePaper;