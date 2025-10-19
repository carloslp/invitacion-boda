export interface Guest {
  id: string;
  hash: string;
  name: string;
  confirmed: boolean;
  confirmed_at: string | null;
  created_at: string;
}
