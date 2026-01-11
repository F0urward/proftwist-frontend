export interface RoadmapInfo {
  id: string;
  roadmap_id: string;
  author?: {
    user_id: string;
    username: string;
    avatar_url?: string;
  };
  category_id?: string;
  name: string;
  description?: string;
  subscriber_count?: number;
  is_public?: boolean;
  referenced_roadmap_info_id?: string | null;
  created_at?: string;
  updated_at?: string;
}
