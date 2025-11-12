import { api } from "./axios";
import { Category } from "../types/category";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>("/categories");
    return (data as any).categories;
  },
  async getById(categoryId: string): Promise<Category> {
    const { data } = await api.get(`/categories/${categoryId}`);
    return data as Category;
  },
};
