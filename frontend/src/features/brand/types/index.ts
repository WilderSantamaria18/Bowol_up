export type BrandVoiceTone =
  | 'PROFESSIONAL'
  | 'INNOVATIVE'
  | 'BOLD'
  | 'FRIENDLY'
  | 'AUTHORITATIVE'
  | 'PLAYFUL'
  | 'MINIMALIST';

export interface BrandProfile {
  id: string;
  organizationId: string;
  brandName: string;
  tagline?: string;
  brandVoiceTone: BrandVoiceTone;
  targetAudience?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  keyValues: string[];
  doGuidelines?: string;
  dontGuidelines?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SaveBrandProfilePayload {
  brandName: string;
  tagline?: string;
  brandVoiceTone: BrandVoiceTone;
  targetAudience?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontHeading?: string;
  fontBody?: string;
  keyValues?: string[];
  doGuidelines?: string;
  dontGuidelines?: string;
  logoUrl?: string;
}
