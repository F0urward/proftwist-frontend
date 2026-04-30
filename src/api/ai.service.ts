import { api } from "./axios";

export type GenerateRoadmapNodeDescriptionPayload = {
  roadmap_id?: string;
  node_id: string;
  node_label: string;
  node_type?: string;
  current_description?: string;
};

export const aiService = {
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
