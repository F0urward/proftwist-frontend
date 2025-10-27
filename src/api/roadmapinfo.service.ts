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
  async getById(roadmapinfoId: string): Promise<RoadmapInfo> {
    const { data } = await api.get(`/roadmapsinfo/${roadmapinfoId}`)
    const item = (data as any)?.roadmap_info ?? data;
    return item as RoadmapInfo;
  }
};
