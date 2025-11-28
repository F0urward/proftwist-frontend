import { api } from "./axios";
import { Material } from "../types/material";

export const materialsService = {
  async getByNode(nodeId: string): Promise<Material[]> {
    const { data } = await api.get(`/materials/node/${nodeId}`);
    return (data as any).materials ?? data;
  },

  async getUserMaterials(): Promise<Material[]> {
    const { data } = await api.get("/materials");
    return (data as any).materials ?? data;
  },

  async create(payload: {
    name: string;
    url: string;
    roadmap_node_id: string;
  }): Promise<Material> {
    const { data } = await api.post("/materials", payload);
    return (data as any).material ?? data;
  },

  async delete(materialId: string): Promise<void> {
    await api.delete(`/materials/${materialId}`);
  },
};
