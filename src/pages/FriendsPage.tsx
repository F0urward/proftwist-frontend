import { useMemo, useState } from "react";
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
import BaseLayout from "../components/BaseLayout/BaseLayout";
import { useNavigate } from "react-router-dom";

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

const mockFriends: Friend[] = [
  {
    id: "mentor-mira",
    name: "Mira Pavlova",
    username: "@miracodes",
    expertise: "Frontend / React",
    focus: "Design Systems",
    sharedRoadmaps: 4,
    online: true,
    chatId: "chat-mira",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "mentor-max",
    name: "Maxim Volkov",
    username: "@maxvolkov",
    expertise: "Backend / Go",
    focus: "Highload Patterns",
    sharedRoadmaps: 2,
    online: false,
    chatId: "chat-max",
    avatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "mentor-sophia",
    name: "Sofia Ivanova",
    username: "@sivanova",
    expertise: "Product / Research",
    focus: "AI copilots",
    sharedRoadmaps: 3,
    online: true,
    chatId: "chat-sofia",
  },
  {
    id: "mentor-ilya",
    name: "Ilya Petrov",
    username: "@ipetrov",
    expertise: "Data / ML",
    focus: "Recommendation Systems",
    sharedRoadmaps: 1,
    online: false,
    chatId: "chat-ilya",
  },
];

const mockRequests: FriendRequest[] = [
  {
    id: "req-01",
    name: "Elena Markova",
    username: "@emarkova",
    message: "Loved your AI roadmap - let's collaborate!",
    mutualRoadmaps: 2,
    direction: "incoming",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "req-02",
    name: "Ivan Kuznetsov",
    username: "@ivan_k",
    message: "Working on ML benchmarks, would love to connect.",
    mutualRoadmaps: 1,
    direction: "incoming",
  },
  {
    id: "req-03",
    name: "Daria Smirnova",
    username: "@daria-sm",
    message: "Sent an invite yesterday - waiting on approval.",
    mutualRoadmaps: 3,
    direction: "outgoing",
  },
];

const FriendsPage = () => {
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>(
    mockRequests.filter((request) => request.direction === "incoming"),
  );
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>(
    mockRequests.filter((request) => request.direction === "outgoing"),
  );
  const [query, setQuery] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<Friend | null>(null);
  const [activeSection, setActiveSection] = useState<"requests" | "friends">(
    "friends",
  );
  const navigate = useNavigate();

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

  const handleRemoveFriend = () => {
    if (!pendingRemoval) return;
    setFriends((prev) => prev.filter((friend) => friend.id !== pendingRemoval.id));
    setPendingRemoval(null);
  };

  const handleMessage = (friend: Friend) => {
    navigate(`/chats?chat=${encodeURIComponent(friend.chatId)}`);
  };

  const buildFriendFromRequest = (request: FriendRequest): Friend => ({
    id: request.id,
    name: request.name,
    username: request.username,
    avatar: request.avatar,
    expertise: "New connection",
    focus: request.message ?? "Exploring collaboration",
    sharedRoadmaps: request.mutualRoadmaps,
    online: false,
    chatId: `chat-${request.id}`,
  });

  const handleAcceptRequest = (request: FriendRequest) => {
    setFriends((prev) => [...prev, buildFriendFromRequest(request)]);
    setIncomingRequests((prev) => prev.filter((item) => item.id !== request.id));
  };

  const handleDeclineRequest = (requestId: string) => {
    setIncomingRequests((prev) => prev.filter((item) => item.id !== requestId));
  };

  const handleCancelRequest = (requestId: string) => {
    setOutgoingRequests((prev) => prev.filter((item) => item.id !== requestId));
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
            Friends
          </Typography>
          <Stack spacing={1}>
            <Button
              fullWidth
              variant={activeSection === "friends" ? "contained" : "text"}
              color={activeSection === "friends" ? "primary" : "inherit"}
              onClick={() => setActiveSection("friends")}
              sx={{ justifyContent: "space-between", borderRadius: 3 }}
            >
              <span>Friend list</span>
              <Chip size="small" label={friends.length} />
            </Button>
            <Button
              fullWidth
              variant={activeSection === "requests" ? "contained" : "text"}
              color={activeSection === "requests" ? "primary" : "inherit"}
              onClick={() => setActiveSection("requests")}
              sx={{ justifyContent: "space-between", borderRadius: 3 }}
            >
              <span>Requests</span>
              <Badge
                color="error"
                badgeContent={incomingRequests.length}
                invisible={incomingRequests.length === 0}
              >
                <Chip size="small" label={totalRequests} />
              </Badge>
            </Button>
          </Stack>
        </Paper>

        <Stack sx={{ flex: 1 }} spacing={3}>
          {activeSection === "requests" ? (
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
                      Friend requests
                    </Typography>
                    <Typography sx={{ opacity: 0.7 }}>
                      Respond to new invites or manage the ones you sent.
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      totalRequests === 0
                        ? "No pending requests"
                        : `${totalRequests} pending`
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
                    <Typography>No requests right now</Typography>
                    <Typography sx={{ opacity: 0.7 }}>
                      When someone adds you, it will appear here.
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1.5}>
                        <Typography sx={{ fontWeight: 600, opacity: 0.9 }}>
                          Incoming ({incomingRequests.length})
                        </Typography>
                        {incomingRequests.length === 0 ? (
                          <Typography sx={{ opacity: 0.6, fontSize: 14 }}>
                            Nothing to review.
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
                              <Stack direction="row" spacing={2} alignItems="center">
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
                                      sx={{ mt: 0.5, opacity: 0.7, fontSize: 14 }}
                                    >
                                      {request.message}
                                    </Typography>
                                  )}
                                  <Chip
                                    label={`${request.mutualRoadmaps} mutual roadmaps`}
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
                                  Accept
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="inherit"
                                  onClick={() => handleDeclineRequest(request.id)}
                                >
                                  Decline
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
                          Outgoing ({outgoingRequests.length})
                        </Typography>
                        {outgoingRequests.length === 0 ? (
                          <Typography sx={{ opacity: 0.6, fontSize: 14 }}>
                            No pending invites.
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
                              <Stack direction="row" spacing={2} alignItems="center">
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
                                      sx={{ mt: 0.5, opacity: 0.7, fontSize: 14 }}
                                    >
                                      {request.message}
                                    </Typography>
                                  )}
                                  <Chip
                                    label={`${request.mutualRoadmaps} mutual roadmaps`}
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
                                  onClick={() => handleCancelRequest(request.id)}
                                >
                                  Cancel request
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
                      Friends
                    </Typography>
                    <Typography sx={{ mt: 1, opacity: 0.8 }}>
                      Keep track of mentors, teammates, and study buddies. Start a chat,
                      share a roadmap, or declutter your list when someone is no longer
                      active.
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
                      <Chip
                        label={`${incomingRequests.length} incoming requests`}
                        color="secondary"
                        variant="outlined"
                      />
                      <Chip
                        label={`${outgoingRequests.length} pending invites`}
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
                    <Typography sx={{ opacity: 0.7 }}>friends</Typography>
                    {totalRequests > 0 && (
                      <Typography sx={{ opacity: 0.7, fontSize: 14 }}>
                        {totalRequests} open request{totalRequests === 1 ? "" : "s"}
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
                    placeholder="Search by name, nickname, or stack"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <Chip
                    label={`${friends.filter((friend) => friend.online).length} online`}
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`${friends.reduce(
                      (acc, friend) => acc + friend.sharedRoadmaps,
                      0,
                    )} shared roadmaps`}
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
                  <Typography variant="h6">Nothing matched your search</Typography>
                  <Typography sx={{ opacity: 0.7, mt: 1 }}>
                    Try a different keyword or clear the search to see the full list.
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
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {friend.name}
                              </Typography>
                              <Tooltip title={friend.online ? "Online" : "Offline"} arrow>
                                <CircleIcon
                                  fontSize="small"
                                  sx={{
                                    color: friend.online ? "#4caf50" : "rgba(255,255,255,.4)",
                                    fontSize: 12,
                                  }}
                                />
                              </Tooltip>
                            </Stack>
                            <Typography sx={{ opacity: 0.7 }}>{friend.username}</Typography>
                          </Box>
                          <IconButton
                            color="error"
                            edge="end"
                            onClick={() => setPendingRemoval(friend)}
                            aria-label={`Remove ${friend.name}`}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Stack>

                        <Stack spacing={1.5}>
                          <Typography sx={{ fontWeight: 600 }}>
                            {friend.expertise}
                          </Typography>
                          <Typography sx={{ opacity: 0.8 }}>{friend.focus}</Typography>
                          <Chip
                            label={`${friend.sharedRoadmaps} shared roadmaps`}
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
                            Write message
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
        <DialogTitle id="remove-friend-title">Remove friend</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingRemoval
              ? `Are you sure you want to remove ${pendingRemoval.name} from your friends list? You can add them again later if you reconnect.`
              : null}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingRemoval(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleRemoveFriend}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </BaseLayout>
  );
};

export default FriendsPage;
