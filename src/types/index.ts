// =============================================
// Database row types (match Supabase schema)
// =============================================

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type TripMood = "amazing" | "good" | "neutral" | "tough" | "terrible";

export type Trip = {
  id: string;
  user_id: string;
  country_code: string;
  country_name: string;
  city: string | null;
  title: string | null;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  mood: TripMood | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type Photo = {
  id: string;
  trip_id: string;
  user_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type AiPortrait = {
  id: string;
  user_id: string;
  archetype: string | null;
  content: string;
  trips_count: number | null;
  model_version: string | null;
  generated_at: string;
};

export type VisitedCountry = {
  id: string;
  user_id: string;
  country_code: string;
  created_at: string;
};

// =============================================
// Insert / Update helpers
// =============================================

export type TripInsert = Omit<Trip, "id" | "created_at" | "updated_at">;
export type TripUpdate = Partial<Omit<Trip, "id" | "user_id" | "created_at" | "updated_at">>;

export type PhotoInsert = Omit<Photo, "id" | "created_at">;

export type AiPortraitInsert = Omit<AiPortrait, "id" | "generated_at">;

export type VisitedCountryInsert = Omit<VisitedCountry, "id" | "created_at">;

// =============================================
// Supabase generated Database type
// =============================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
        Relationships: [];
      };
      trips: {
        Row: Trip;
        Insert: TripInsert & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: TripUpdate;
        Relationships: [
          {
            foreignKeyName: "trips_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      photos: {
        Row: Photo;
        Insert: PhotoInsert & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Photo, "id" | "trip_id" | "user_id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "photos_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_portraits: {
        Row: AiPortrait;
        Insert: AiPortraitInsert & {
          id?: string;
          generated_at?: string;
        };
        Update: Partial<Omit<AiPortrait, "id" | "user_id" | "generated_at">>;
        Relationships: [
          {
            foreignKeyName: "ai_portraits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      visited_countries: {
        Row: VisitedCountry;
        Insert: VisitedCountryInsert & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<VisitedCountry, "id" | "user_id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "visited_countries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      trip_mood: TripMood;
    };
    CompositeTypes: Record<string, never>;
  };
};

// =============================================
// Composite / UI types
// =============================================

/** Trip with its photos attached (for detail pages) */
export type TripWithPhotos = Trip & {
  photos: Photo[];
};

/** Photo with a signed URL ready for display */
export type PhotoWithUrl = Photo & {
  url: string;
};

/** Parsed AI portrait sections for UI rendering */
export type ParsedPortrait = {
  archetype: string;
  analysis: string;
  insight: string;
  recommendation: string;
  raw: string;
};
