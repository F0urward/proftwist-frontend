import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Typography,
} from "@mui/material";
import type { ChatUser, FriendshipUiState } from "../../types/chat";
import {
  getFriendshipUiState,
  getStatusMeta,
  initialsFrom,
  normalizeUserId,
} from "../../utils/chat-utils";

type ParticipantsDialogProps = {
  open: boolean;
  onClose: () => void;
  participants: ChatUser[];
  loading: boolean;
  error: string | null;
  friendRequestSent: Record<string, boolean>;
  addingFriendId: string | null;
  friendRequestError: string | null;
  leaveLoading: boolean;
  leaveError: string | null;
  resolvedUserId: string;
  onAddFriend: (user: ChatUser) => void;
  onLeaveChat: () => void;
};

const ParticipantsDialog = ({
  open,
  onClose,
  participants,
  loading,
  error,
  friendRequestSent,
  addingFriendId,
  friendRequestError,
  leaveLoading,
  leaveError,
  resolvedUserId,
  onAddFriend,
  onLeaveChat,
}: ParticipantsDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Участники чата</DialogTitle>

      <DialogContent dividers sx={{ px: { xs: 1, sm: 2 } }}>
        {loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && error && (
          <Typography sx={{ textAlign: "center", opacity: 0.8 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && participants.length === 0 && (
          <Typography sx={{ textAlign: "center", opacity: 0.8 }}>
            Нет участников
          </Typography>
        )}

        {!loading && !error && participants.length > 0 && (
          <List disablePadding>
            {participants.map((user) => {
              const displayName = user.nickname || user.name || "Пользователь";
              const initials = initialsFrom(displayName);

              const participantId = user.originalId ?? user.id;
              const normalizedParticipantId = normalizeUserId(participantId);
              const participantKey = normalizedParticipantId ?? participantId ?? user.id;

              const isCurrentUser =
                user.isCurrentUser ??
                (resolvedUserId && normalizedParticipantId
                  ? normalizedParticipantId === resolvedUserId
                  : user.id === resolvedUserId);

              const requestSent = participantKey
                ? Boolean(friendRequestSent[participantKey])
                : false;

              const isSubmitting = participantKey
                ? addingFriendId === participantKey
                : false;

              const friendshipState: FriendshipUiState = getFriendshipUiState(
                user,
                requestSent,
              );
              const statusMeta = !isCurrentUser
                ? getStatusMeta(friendshipState)
                : null;

              const canAdd =
                !isCurrentUser &&
                friendshipState.status === "none" &&
                Boolean(participantKey) &&
                !isSubmitting;

              return (
                <ListItem key={participantKey} disablePadding>
                  <ListItemButton
                    disableRipple
                    sx={{
                      px: 1.25,
                      py: 1.25,
                      minHeight: 64,
                      alignItems: "center",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{
                        width: "100%",
                        minWidth: 0,
                      }}
                    >
                      <Avatar
                        {...(user.avatar ? { src: user.avatar } : {})}
                        alt={displayName}
                        sx={{ width: 55, height: 55, flexShrink: 0 }}
                      >
                        {!user.avatar && initials}
                      </Avatar>
                      <Stack
                        direction="row"
                        gap={1}
                        sx={{
                          justifyContent: "space-between",
                          flex: 1,
                          flexDirection: "row",
                          flexWrap: "wrap",
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 130 }}>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {displayName}
                          </Typography>
                          <Typography
                            sx={{
                              opacity: 0.7,
                              fontSize: 13,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {user.username ?? ""}
                          </Typography>
                        </Box>

                        {!isCurrentUser && (
                          <Box
                            sx={{
                              minHeight: 22,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                            }}
                          >
                            {statusMeta ? (
                              <Chip
                                size="small"
                                label={statusMeta.label}
                                color={statusMeta.color}
                                variant="outlined"
                                sx={{
                                  height: 22,
                                  maxWidth: "100%",
                                  "& .MuiChip-label": { px: 1 },
                                  width: "140px",
                                }}
                              />
                            ) : null}
                            {isSubmitting ? (
                              <CircularProgress size={18} />
                            ) : canAdd ? (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  onAddFriend(user);
                                }}
                                sx={{
                                  width: "100%",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Добавить
                              </Button>
                            ) : null}
                          </Box>
                        )}
                      </Stack>
                    </Stack>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}

        {friendRequestError && (
          <Typography
            color="error"
            variant="body2"
            sx={{ mt: 2, textAlign: "center" }}
          >
            {friendRequestError}
          </Typography>
        )}

        {leaveError && (
          <Typography
            color="error"
            variant="body2"
            sx={{ mt: 2, textAlign: "center" }}
          >
            {leaveError}
          </Typography>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            color="error"
            variant="contained"
            onClick={onLeaveChat}
            disabled={leaveLoading}
          >
            {leaveLoading ? "Выход..." : "Покинуть чат"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantsDialog;