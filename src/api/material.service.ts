import { api } from "./axios";
import { Material } from "../types/material";

export const materialsService = {
  async getByNode(roadmapId: string, nodeId: string): Promise<Material[]> {
    const { data } = await api.get(
      `/roadmaps/${roadmapId}/nodes/${nodeId}/materials`,
    );
    return (data as any).materials ?? data;
  },

  async getUserMaterials(): Promise<Material[]> {
    const { data } = await api.get("/materials");
    return (data as any).materials ?? data;
  },

  async create(
    roadmapId: string,
    nodeId: string,
    payload: { name: string; url: string },
  ): Promise<Material> {
    const { data } = await api.post(
      `/roadmaps/${roadmapId}/nodes/${nodeId}/materials`,
      payload,
    );
    return (data as any).material ?? data;
  },

  async delete(
    roadmapId: string,
    nodeId: string,
    materialId: string,
  ): Promise<void> {
    await api.delete(
      `/roadmaps/${roadmapId}/nodes/${nodeId}/materials/${materialId}`,
    );
  },
};
