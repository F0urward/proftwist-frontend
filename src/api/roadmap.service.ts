import { api } from "./axios";
import { Roadmap } from "../types/roadmap";

export const roadmapService = {
  async getGraph(roadmapId: string): Promise<Roadmap | null> {
    try {
      const { data } = await api.get(`/roadmaps/${roadmapId}`);
      const payload = (data as any)?.roadmap ?? data;
      if (!payload) return null;

      const nodes = Array.isArray(payload.nodes) ? payload.nodes : [];
      const edges = Array.isArray(payload.edges) ? payload.edges : [];

      return { nodes: nodes, edges };
    } catch (e: any) {
      if (e?.response?.status === 404) return null;
      throw e;
    }
  },
  async updateGraph(
    roadmapId: string,
    payload: { nodes: any[]; edges: any[] },
  ): Promise<void> {
    try {
      await api.put(`/roadmaps/${roadmapId}`, payload);
    } catch (e: any) {
      throw e;
    }
  },
};
