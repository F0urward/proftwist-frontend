import { useState } from "react";
import { Box, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

type MessageComposerProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  attachment: File | null;
  onPickAttachment: (file: File | null) => void;
  onClearAttachment: () => void;
};

const MessageComposer = ({
  draft,
  onDraftChange,
  onSend,
  isSending,
  attachment,
  onClearAttachment,
}: MessageComposerProps) => {
  const theme = useTheme();
  const MAX_MESSAGE_LEN = 256;
  const SHOW_COUNTER_FROM = 200;

  const [isFocused, setIsFocused] = useState(false);

  const trimmedDraft = draft.trim();
  const showCounter = isFocused && draft.length >= SHOW_COUNTER_FROM;
  const isTooLong = draft.length > MAX_MESSAGE_LEN;

  return (
    <Box sx={{ px: 2, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
      {attachment && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={attachment.name}
            onDelete={onClearAttachment}
            deleteIcon={<CloseIcon />}
            sx={{ bgcolor: alpha(theme.palette.text.primary, 0.08), color: "text.primary" }}
          />
        </Box>
      )}

      <Stack direction="row" spacing={2} alignItems="flex-end">
        <Box sx={{ position: "relative", flex: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Напишите сообщение"
            value={draft}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(event) => {
              const next = event.target.value;
              onDraftChange(next.slice(0, MAX_MESSAGE_LEN));
            }}
            slotProps={{
              htmlInput: {
                maxLength: MAX_MESSAGE_LEN,
              },
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            multiline
            minRows={1}
            maxRows={4}
            sx={{
              "& .MuiInputBase-root": {
                bgcolor: "background.default",
                borderRadius: 3,
                minHeight: 44,
              },
              "& fieldset": { borderColor: alpha(theme.palette.text.primary, 0.16) },
            }}
          />
          {showCounter && (
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                right: -60,
                opacity: 0.7,
                userSelect: "none",
              }}
            >
              {draft.length} / {MAX_MESSAGE_LEN}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          onClick={onSend}
          endIcon={<SendIcon />}
          disabled={
            isSending ||
            trimmedDraft.length === 0 ||
            Boolean(attachment) ||
            isTooLong
          }
          sx={{
            height: 44,
            width: 44,
            color: "text.primary",
            "&.Mui-disabled": {
              color: "text.primary",
              opacity: 0.6,
            },
            "& .MuiButton-endIcon": { m: 0 },
          }}
        />
      </Stack>
    </Box>
  );
};

export default MessageComposer;
export type { MessageComposerProps };