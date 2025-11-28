export interface Author {
  id: string;
  username: string;
  avatar_url: string;
}

export interface Material {
  id: string;
  name: string;
  url: string;
  roadmap_node_id: string;
  author: Author;
  created_at?: string;
  updated_at?: string;
}
