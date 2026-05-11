const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export interface Event {
  id: string;
  name: string;
  description: string;
  quota: number;
  started_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
}

interface GetEventsResponse {
  code: number;
  message: string;
  data: Event[];
}

export const getEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${API_BASE_URL}/events/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result: GetEventsResponse = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memuat daftar event");
  }

  return result.data ?? [];
};