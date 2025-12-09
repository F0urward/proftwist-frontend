import { Box, Stack } from "@mui/material";
import { useState } from "react";
import BaseLayout from "../components/BaseLayout/BaseLayout";
import CategoryList from "../components/CategoryList/CategoryList";
import ProfileView from "../components/ProfileView/ProfileView";

const ProfilePage = () => {
  const categories = ["Профиль"];
  const [selected] = useState<number>(0);
  return (
    <BaseLayout>
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Box sx={{ width: { xs: 200, md: 320 }, alignSelf: "flex-start" }}>
          <CategoryList items={categories} selected={selected} />
        </Box>
        <Box>{selected === 0 ? <ProfileView /> : <div></div>}</Box>
      </Stack>
    </BaseLayout>
  );
};

export default ProfilePage;
