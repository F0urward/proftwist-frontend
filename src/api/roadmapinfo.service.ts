import { api } from "./axios";
import { RoadmapInfo } from "../types/roadmapinfo";

export const roadmapinfoService = {
  async getAllRoadmapsInfo(): Promise<RoadmapInfo[]> {
    const { data } = await api.get("/roadmapsinfo/public");
    return (data as any).roadmaps_info;
  },

  async getByCategory(categoryId: string): Promise<RoadmapInfo[]> {
    const { data } = await api.get(
      `/roadmapsinfo/public/category/${categoryId}`,
    );
    return (data as any).roadmaps_info;
  },

  async getByRoadmapId(roadmapId: string): Promise<RoadmapInfo> {
    const { data } = await api.get(`/roadmapsinfo/roadmap/${roadmapId}`);
    return data.roadmap_info;
  },

  async getById(roadmapinfoId: string): Promise<RoadmapInfo | null> {
    try {
      const { data } = await api.get(`/roadmapsinfo/${roadmapinfoId}`);
      const item = (data as any)?.roadmap_info ?? data;
      return item as RoadmapInfo;
    } catch (error: any) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },

  async searchPublic(
    query: string,
    categoryId?: string,
  ): Promise<RoadmapInfo[]> {
    const params: any = { q: query };
    if (categoryId) params.category_id = categoryId;

    const { data } = await api.get("/roadmapsinfo/public/search", { params });

    return (data as any).roadmaps_info;
  },

  async create(payload: {
    category_id: string;
    name: string;
    description?: string;
    is_public?: boolean;
    referenced_roadmap_info_id?: string | null;
  }): Promise<RoadmapInfo> {
    const { data } = await api.post("/roadmapsinfo/private", {
      ...payload,
      is_public: payload.is_public ?? false,
    });

    const created = (data as any)?.roadmap_info ?? data;
    return created as RoadmapInfo;
  },

  async update(
    roadmapInfoId: string,
    payload: {
      category_id?: string;
      name?: string;
      description?: string;
      is_public?: boolean;
      referenced_roadmap_info_id?: string;
    },
  ): Promise<void> {
    await api.put(`/roadmapsinfo/private/${roadmapInfoId}`, { ...payload });
  },

  async updateGraph(
    roadmapId: string,
    nodes: any[],
    edges: any[],
  ): Promise<void> {
    await api.put(`/roadmaps/${roadmapId}`, {
      nodes,
      edges,
    });
  },

  async getByUser(): Promise<RoadmapInfo[]> {
    const { data } = await api.get("/roadmapsinfo");
    return (data as any).roadmaps_info ?? data;
  },

  async getSubscribed(): Promise<RoadmapInfo[]> {
    const { data } = await api.get("/roadmapsinfo/public/subscribed");
    return (data as any).roadmaps_info ?? data;
  },

  async subscribe(roadmapInfoId: string): Promise<void> {
    await api.post(`/roadmapsinfo/public/${roadmapInfoId}/subscribe`);
  },

  async unsubscribe(roadmapInfoId: string): Promise<void> {
    await api.delete(`/roadmapsinfo/public/${roadmapInfoId}/unsubscribe`);
  },

  async checkSubscription(roadmapInfoId: string): Promise<boolean> {
    const { data } = await api.get(
      `/roadmapsinfo/public/${roadmapInfoId}/subscription`,
    );
    return data.is_subscribed ?? data.subscribed ?? false;
  },

  async fork(roadmapInfoId: string): Promise<RoadmapInfo> {
    const { data } = await api.post(
      `/roadmapsinfo/public/${roadmapInfoId}/fork`,
    );
    return (data as any).roadmap_info ?? data;
  },

  async publish(roadmapInfoId: string): Promise<RoadmapInfo> {
    const { data } = await api.post(
      `/roadmapsinfo/private/${roadmapInfoId}/publish`,
    );
    return (data as any).roadmap_info ?? data;
  },

  async delete(roadmapInfoId: string): Promise<void> {
    await api.delete(`/roadmapsinfo/${roadmapInfoId}`);
  },
};
