// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { AttributeDisplayType } from "../constants/attribute";
import { Language } from "./language";

// Rappresenta come l'attributo è definito all'interno di 'variants'
export type Attribute = {
  id: number;
  attributeGroupId: number;
  code: string;
  colorHex?: string | null;
  colorHex2?: string | null;
  colorPms?: string | null;
  colorPms2?: string | null;
  imageUrl?: string | null;
  position: number;

  translations: AttributeTranslation[];

  // Il Gruppo è ANNIDATO qui
  attributeGroup?: AttributeGroup;
}

export type AttributeTranslation = {
  languageId: number;
  language: Language;
  name: string;
}

// Rappresenta la struttura del gruppo di attributi
export type AttributeGroup = {
  id: number;
  code: string;
  displayType: AttributeDisplayType;
  position: number;
  isPublic?: boolean;
  attributes?: Attribute[];
  translations?: AttributeGroupTranslation[];
}

export type AttributeGroupTranslation = {
    languageId: number;
    language: Language;
    name: string;
    publicName?: string;
}