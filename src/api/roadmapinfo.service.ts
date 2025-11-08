import { api } from "./axios";
import { RoadmapInfo } from "../types/roadmapinfo";

export const roadmapinfoService = {
  async getAllRoadmapsInfo(): Promise<RoadmapInfo[]> {
    const { data } = await api.get("/roadmapsinfo");
    return (data as any).roadmaps_info;
  },
  async getByCategory(categoryId: string): Promise<RoadmapInfo[]> {
    const { data } = await api.get(`/roadmapsinfo/category/${categoryId}`);
    return (data as any).roadmaps_info;
  },
  async getById(roadmapinfoId: string): Promise<RoadmapInfo | null> {
    try {
      const { data } = await api.get(`/roadmapsinfo/${roadmapinfoId}`)
      const item = (data as any)?.roadmap_info ?? data;
      return item as RoadmapInfo;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },
  async create(payload: { category_id: string; 
                          name: string; description?: 
                          string; is_public?: boolean; 
                          referenced_roadmap_info_id?: string | null; 
                        }): Promise<RoadmapInfo> {
    const { data } = await api.post("/roadmapsinfo", {
      ...payload,
    });

    const created = (data as any)?.roadmap_info ?? data;
    return created as RoadmapInfo;
  },
  async updateGraph(roadmapId: string, nodes: any[], edges: any[]): Promise<void> {
    await api.put(`/roadmaps/${roadmapId}`, {
      nodes,
      edges,
    });
  },
};
