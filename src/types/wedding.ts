import { Tables } from "@/integrations/supabase/types";

export type Wedding = Tables<"weddings">;
export type Profile = Tables<"profiles">;
export type Guest = Tables<"guests">;
export type GuestGroup = Tables<"guest_groups">;

export type AppRole = Tables<"user_roles">["role"];

export interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
  responded: number;
  responseRate: number;
}

export const EMPTY_GUEST_STATS: GuestStats = {
  total: 0,
  confirmed: 0,
  pending: 0,
  declined: 0,
  responded: 0,
  responseRate: 0,
};
