import { honoClient } from "@/lib/hono";

export interface Spot {
  id: string;
  name: string;
  cityId: number;
}

export interface Prefecture {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  prefectureId: number;
}

export const fetchSpots = async (): Promise<Spot[]> => {
  const response = await honoClient.spot.$get();
  if (!response.ok) {
    throw new Error("Failed to fetch spots.");
  }
  return response.json();
};

export const fetchPrefectures = async (): Promise<Prefecture[]> => {
  const response = await honoClient.master.prefectures.$get();
  if (!response.ok) {
    throw new Error("Failed to fetch prefectures.");
  }
  return response.json();
};

export const fetchCities = async (prefectureId: string): Promise<City[]> => {
  const response = await honoClient.master.cities[":prefectureId"].$get({
    param: { prefectureId },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch cities.");
  }
  return response.json();
};
