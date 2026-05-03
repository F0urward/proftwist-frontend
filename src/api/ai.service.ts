import { api } from "./axios";
import type { Roadmap } from "../types/roadmap";

export type GenerateRoadmapNodeDescriptionPayload = {
  roadmap_id?: string;
  node_id: string;
  node_label: string;
  node_type?: string;
  current_description?: string;
};

export type GenerateRoadmapPayload = {
  roadmap_id?: string;
  prompt: string;
};

const extractRoadmap = (data: unknown): Roadmap => {
  const payload =
    (data as any)?.roadmap ??
    (data as any)?.graph ??
    (data as any)?.generated_roadmap ??
    data;

  const nodes = (payload as any)?.nodes;
  const edges = (payload as any)?.edges;

  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    throw new Error("AI service returned an invalid roadmap");
  }

  return { nodes, edges };
};

export const aiService = {
  async generateRoadmap(payload: GenerateRoadmapPayload): Promise<Roadmap> {
    const { data } = await api.post("/ai/roadmap", payload);

    return extractRoadmap(data);
  },

  async generateRoadmapNodeDescription(
    payload: GenerateRoadmapNodeDescriptionPayload,
  ): Promise<string> {
    const { data } = await api.post("/ai/roadmap-node-description", payload);

    const description =
      (data as any)?.description ??
      (data as any)?.node_description ??
      (data as any)?.text ??
      data;

    if (typeof description !== "string") {
      throw new Error("AI service returned an invalid node description");
    }

    return description;
  },
};
