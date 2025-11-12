import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CircleIcon from "@mui/icons-material/Circle";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import { FriendRequestSummary, friendsService, FriendSummary } from "../api";

type Friend = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  expertise: string;
  focus: string;
  sharedRoadmaps: number;
  online: boolean;
  chatId: string;
};

type FriendRequest = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  message?: string;
  mutualRoadmaps: number;
  direction: "incoming" | "outgoing";
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const pickStringField = (
  sources: Array<Record<string, unknown> | undefined>,
  fields: string[],
  fallback?: string,
) => {
  for (const source of sources) {
    if (!source) continue;
    for (const field of fields) {
      const rawValue = source[field];
      if (typeof rawValue === "string" && rawValue.trim().length > 0) {
        return rawValue;
      }
    }
  }
  return fallback;
};

const pickNumberField = (
  sources: Array<Record<string, unknown> | undefined>,
  fields: string[],
  fallback?: number,
) => {
  for (const source of sources) {
    if (!source) continue;
    for (const field of fields) {
      const rawValue = source[field];
      if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
        return rawValue;
      }
      if (typeof rawValue === "string") {
        const parsed = Number(rawValue);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }
  }
  return fallback;
};

const formatUsername = (value?: string) => {
  if (!value || value.trim().length === 0) return "@friend";
  return value.startsWith("@") ? value : `@${value}`;
};

const mapFriendSummary = (friend: FriendSummary): Friend => ({
  id: friend.user_id,
  name: friend.display_name?.trim().length
    ? friend.display_name
    : (friend.username ?? "Community member"),
  username: formatUsername(
    friend.username ?? friend.display_name ?? friend.user_id,
  ),
  avatar: friend.avatar_url,
  expertise: friend.expertise ?? "Curious builder",
  focus: friend.focus ?? "Exploring collaboration opportunities",
  sharedRoadmaps: friend.shared_roadmaps ?? 0,
  online: Boolean(friend.online),
  chatId: friend.chat_id ?? "",
});

const mapFriendRequestSummary = (
  request: FriendRequestSummary,
  direction: "incoming" | "outgoing",
): FriendRequest => {
  const raw = request as Record<string, unknown>;
  const relatedProfiles = [
    raw,
    asRecord(raw["user"]),
    asRecord(raw["from_user"]),
    asRecord(raw["to_user"]),
    asRecord(raw["sender"]),
    asRecord(raw["recipient"]),
  ];

  const name =
    pickStringField(
      relatedProfiles,
      ["display_name", "name"],
      "Community member",
    ) ?? "Community member";
  const username =
    pickStringField(relatedProfiles, ["username", "handle"], name) ?? name;
  const avatar = pickStringField(relatedProfiles, [
    "avatar_url",
    "avatar",
    "photo",
    "photo_url",
  ]);
  const mutualRoadmaps =
    pickNumberField(
      [raw],
      ["mutual_roadmaps", "mutualRoadmaps", "shared_roadmaps"],
      0,
    ) ?? 0;
  const message =
    request.message ?? pickStringField([raw], ["note", "reason", "details"]);

  return {
    id: request.id,
    name,
    username: formatUsername(username),
    avatar,
    message,
    mutualRoadmaps,
    direction,
  };
};

const FriendsPage = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [query, setQuery] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<Friend | null>(null);
  const [activeSection, setActiveSection] = useState<"requests" | "friends">(
    "friends",
  );
  const navigate = useNavigate();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const fetchFriendsData = useCallback(async () => {
    try {
      const [{ data: friendsData }, { data: requestsData }] = await Promise.all(
        [friendsService.listFriends(), friendsService.listFriendRequests()],
      );

      setFriends(
        (friendsData?.friends ?? []).map((friend) => mapFriendSummary(friend)),
      );
      setIncomingRequests(
        (requestsData?.received ?? []).map((request) =>
          mapFriendRequestSummary(request, "incoming"),
        ),
      );
      setOutgoingRequests(
        (requestsData?.sent ?? []).map((request) =>
          mapFriendRequestSummary(request, "outgoing"),
        ),
      );
    } catch (error) {
      console.error("Failed to load friends data", error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        await fetchFriendsData();
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchFriendsData]);

  const filteredFriends = useMemo(() => {
    const lower = query.toLowerCase().trim();
    if (!lower) return friends;
    return friends.filter(
      (friend) =>
        friend.name.toLowerCase().includes(lower) ||
        friend.username.toLowerCase().includes(lower) ||
        friend.expertise.toLowerCase().includes(lower),
    );
  }, [friends, query]);

  const handleRemoveFriend = async () => {
    if (!pendingRemoval) return;
    try {
      await friendsService.deleteFriend(pendingRemoval.id);
      setFriends((prev) =>
        prev.filter((friend) => friend.id !== pendingRemoval.id),
      );
      await fetchFriendsData();
    } catch (error) {
      console.error("Failed to remove friend", error);
    } finally {
      setPendingRemoval(null);
    }
  };

  const handleMessage = async (friend: Friend) => {
    try {
      const { data } = await friendsService.createOrGetChat(friend.id);
      const chatId = data?.chat_id ?? friend.chatId ?? friend.id;
      navigate(`/chats?chat=${encodeURIComponent(chatId)}`);
    } catch (error) {
      console.error("Failed to start chat with friend", error);
      const fallbackChatId = friend.chatId || friend.id;
      navigate(`/chats?chat=${encodeURIComponent(fallbackChatId)}`);
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      await friendsService.acceptFriendRequest(request.id);
      setIncomingRequests((prev) =>
        prev.filter((item) => item.id !== request.id),
      );
      await fetchFriendsData();
    } catch (error) {
      console.error("Failed to accept friend request", error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await friendsService.deleteFriendRequest(requestId);
      setIncomingRequests((prev) =>
        prev.filter((item) => item.id !== requestId),
      );
    } catch (error) {
      console.error("Failed to decline friend request", error);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await friendsService.deleteFriendRequest(requestId);
      setOutgoingRequests((prev) =>
        prev.filter((item) => item.id !== requestId),
      );
    } catch (error) {
      console.error("Failed to cancel friend request", error);
    }
  };

  const totalRequests = incomingRequests.length + outgoingRequests.length;

  return (
    <BaseLayout justifyContent="flex-start">
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={3}
        sx={{ width: "100%", maxWidth: 1200 }}
      >
        <Paper
          elevation={0}
          sx={{
            width: { xs: "100%", lg: 260 },
            flexShrink: 0,
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,.08)",
            bgcolor: "rgba(18,18,18,.9)",
            p: 2.5,
            position: "sticky",
            top: 32,
            alignSelf: "flex-start",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
            Друзья
          </Typography>
          <Stack spacing={1}>
            <Button
              fullWidth
              variant={activeSection === "friends" ? "contained" : "text"}
              color={activeSection === "friends" ? "primary" : "inherit"}
              onClick={() => setActiveSection("friends")}
              sx={{ justifyContent: "space-between", borderRadius: 3 }}
            >
              <span>Список друзей</span>
              <Chip size="small" label={friends.length} />
            </Button>
            <Button
              fullWidth
              variant={activeSection === "requests" ? "contained" : "text"}
              color={activeSection === "requests" ? "primary" : "inherit"}
              onClick={() => setActiveSection("requests")}
              sx={{ justifyContent: "space-between", borderRadius: 3 }}
            >
              <span>Заявки</span>

              <Chip size="small" label={totalRequests} />
            </Button>
          </Stack>
        </Paper>

        <Stack sx={{ flex: 1 }} spacing={3}>
          {isBootstrapping ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,.08)",
                bgcolor: "rgba(24,24,24,.85)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Loading friends...
              </Typography>
              <Typography sx={{ opacity: 0.7 }}>
                Fetching your friends and requests. One moment.
              </Typography>
            </Paper>
          ) : activeSection === "requests" ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,.08)",
                bgcolor: "rgba(24,24,24,.85)",
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.5}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Заявки в друзья
                    </Typography>
                    <Typography sx={{ opacity: 0.7 }}>
                      Обрабатывайте новые запросы и управляйте отправленными.
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      totalRequests === 0
                        ? "Нет ожидающих заявок"
                        : `${totalRequests} в ожидании`
                    }
                    color={totalRequests === 0 ? "default" : "warning"}
                    variant="outlined"
                  />
                </Stack>

                {totalRequests === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px dashed rgba(255,255,255,.2)",
                      p: 3,
                      textAlign: "center",
                      bgcolor: "transparent",
                    }}
                  >
                    <Typography>Пока нет заявок</Typography>
                    <Typography sx={{ opacity: 0.7 }}>
                      Когда кто-то добавит вас, запрос появится здесь.
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container columns={2} direction="column" spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1.5}>
                        <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>
                          Входящие ({incomingRequests.length})
                        </Typography>
                        {incomingRequests.length === 0 ? (
                          <Typography sx={{ opacity: 0.6, fontSize: 14 }}>
                            Пока нечего проверять.
                          </Typography>
                        ) : (
                          incomingRequests.map((request) => (
                            <Paper
                              key={request.id}
                              elevation={0}
                              sx={{
                                borderRadius: 3,
                                border: "1px solid rgba(255,255,255,.08)",
                                p: 2,
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Avatar
                                  src={request.avatar}
                                  alt={request.name}
                                  sx={{ width: 48, height: 48 }}
                                >
                                  {request.name
                                    .split(" ")
                                    .map((segment) => segment[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={{ fontWeight: 600 }}>
                                    {request.name}
                                  </Typography>
                                  <Typography sx={{ opacity: 0.7 }}>
                                    {request.username}
                                  </Typography>
                                  {request.message && (
                                    <Typography
                                      sx={{
                                        mt: 0.5,
                                        opacity: 0.7,
                                        fontSize: 14,
                                      }}
                                    >
                                      {request.message}
                                    </Typography>
                                  )}
                                  <Chip
                                    label={`${request.mutualRoadmaps} общих роадмэпов`}
                                    size="small"
                                    sx={{ mt: 1 }}
                                  />
                                </Box>
                              </Stack>
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1}
                                sx={{ mt: 2 }}
                              >
                                <Button
                                  variant="contained"
                                  onClick={() => handleAcceptRequest(request)}
                                >
                                  Принять
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="inherit"
                                  onClick={() =>
                                    handleDeclineRequest(request.id)
                                  }
                                >
                                  Отклонить
                                </Button>
                              </Stack>
                            </Paper>
                          ))
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1.5}>
                        <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>
                          Исходящие ({outgoingRequests.length})
                        </Typography>
                        {outgoingRequests.length === 0 ? (
                          <Typography sx={{ opacity: 0.6, fontSize: 14 }}>
                            Нет активных приглашений.
                          </Typography>
                        ) : (
                          outgoingRequests.map((request) => (
                            <Paper
                              key={request.id}
                              elevation={0}
                              sx={{
                                borderRadius: 3,
                                border: "1px solid rgba(255,255,255,.08)",
                                p: 2,
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Avatar
                                  src={request.avatar}
                                  alt={request.name}
                                  sx={{ width: 48, height: 48 }}
                                >
                                  {request.name
                                    .split(" ")
                                    .map((segment) => segment[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={{ fontWeight: 600 }}>
                                    {request.name}
                                  </Typography>
                                  <Typography sx={{ opacity: 0.7 }}>
                                    {request.username}
                                  </Typography>
                                  {request.message && (
                                    <Typography
                                      sx={{
                                        mt: 0.5,
                                        opacity: 0.7,
                                        fontSize: 14,
                                      }}
                                    >
                                      {request.message}
                                    </Typography>
                                  )}
                                  <Chip
                                    label={`${request.mutualRoadmaps} общих роадмэпов`}
                                    size="small"
                                    sx={{ mt: 1 }}
                                  />
                                </Box>
                              </Stack>
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1}
                                sx={{ mt: 2 }}
                              >
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() =>
                                    handleCancelRequest(request.id)
                                  }
                                >
                                  Отменить заявку
                                </Button>
                              </Stack>
                            </Paper>
                          ))
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                )}
              </Stack>
            </Paper>
          ) : (
            <>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,.08)",
                  background:
                    "linear-gradient(135deg, rgba(188,87,255,0.1), rgba(255,77,202,0.08))",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems="center"
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      Друзья
                    </Typography>
                    <Typography sx={{ mt: 1, opacity: 0.8 }}>
                      Отслеживайте наставников, тиммейтов и партнёров по учебе.
                      Начинайте диалоги, делитесь роадмэпами или очищайте
                      список, когда контакт становится неактивным.
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 2, flexWrap: "wrap" }}
                    >
                      <Chip
                        label={`${incomingRequests.length} входящих заявок`}
                        color="secondary"
                        variant="outlined"
                      />
                      <Chip
                        label={`${outgoingRequests.length} ожидающих приглашений`}
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      borderRadius: 3,
                      bgcolor: "rgba(24,24,24,.7)",
                      border: "1px solid rgba(255,255,255,.1)",
                      textAlign: "center",
                      minWidth: 180,
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {friends.length}
                    </Typography>
                    <Typography sx={{ opacity: 0.7 }}>друзей</Typography>
                    {totalRequests > 0 && (
                      <Typography sx={{ opacity: 0.7, fontSize: 14 }}>
                        {`${totalRequests} активн${totalRequests === 1 ? "ая заявка" : "ых заявок"}`}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,.08)",
                  bgcolor: "rgba(18,18,18,.85)",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <TextField
                    fullWidth
                    placeholder="Поиск по имени, нику или стеку"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <Chip
                    label={`${friends.filter((friend) => friend.online).length} онлайн`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`${friends.reduce(
                      (acc, friend) => acc + friend.sharedRoadmaps,
                      0,
                    )} общих роадмэпов`}
                    variant="outlined"
                  />
                </Stack>
              </Paper>

              {filteredFriends.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    border: "1px dashed rgba(255,255,255,.2)",
                    p: 4,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6">Ничего не найдено</Typography>
                  <Typography sx={{ opacity: 0.7, mt: 1 }}>
                    Попробуйте другой запрос или очистите поиск, чтобы увидеть
                    весь список.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {filteredFriends.map((friend) => (
                    <Grid
                      item
                      xs={12}
                      md={6}
                      key={friend.id}
                      sx={{ display: "flex" }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 4,
                          border: "1px solid rgba(255,255,255,.08)",
                          height: "100%",
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={friend.avatar}
                            alt={friend.name}
                            sx={{ width: 56, height: 56, fontWeight: 600 }}
                          >
                            {friend.name
                              .split(" ")
                              .map((segment) => segment[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {friend.name}
                              </Typography>
                              <Tooltip
                                title={friend.online ? "В сети" : "Не в сети"}
                                arrow
                              >
                                <CircleIcon
                                  fontSize="small"
                                  sx={{
                                    color: friend.online
                                      ? "#4caf50"
                                      : "rgba(255,255,255,.4)",
                                    fontSize: 12,
                                  }}
                                />
                              </Tooltip>
                            </Stack>
                            <Typography sx={{ opacity: 0.7 }}>
                              {friend.username}
                            </Typography>
                          </Box>
                          <IconButton
                            color="error"
                            edge="end"
                            onClick={() => setPendingRemoval(friend)}
                            aria-label={`Удалить ${friend.name}`}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Stack>

                        <Stack spacing={1.5}>
                          <Typography sx={{ fontWeight: 600 }}>
                            {friend.expertise}
                          </Typography>
                          <Typography sx={{ opacity: 0.8 }}>
                            {friend.focus}
                          </Typography>
                          <Chip
                            label={`${friend.sharedRoadmaps} общих роадмэпов`}
                            size="small"
                            variant="outlined"
                            sx={{ alignSelf: "flex-start" }}
                          />
                        </Stack>

                        <Box
                          sx={{
                            display: "flex",
                            gap: 1.5,
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            variant="contained"
                            startIcon={<ChatBubbleOutlineIcon />}
                            onClick={() => handleMessage(friend)}
                            fullWidth
                          >
                            Написать сообщение
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Stack>
      </Stack>

      <Dialog
        open={Boolean(pendingRemoval)}
        onClose={() => setPendingRemoval(null)}
        aria-labelledby="remove-friend-title"
      >
        <DialogTitle id="remove-friend-title">Удалить из друзей</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingRemoval
              ? `Удалить ${pendingRemoval.name} из списка друзей? При желании сможете добавить этого человека снова.`
              : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingRemoval(null)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRemoveFriend}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </BaseLayout>
  );
};

export default FriendsPage;
