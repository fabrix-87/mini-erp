import { Language } from "./language";
import { Product } from "./product";

export type Category = {
    id: number;
    parentId?: number;
        
    // Relazione auto-referenziante per la gerarchia
    parent?: Category;
    children?: Category[];

    active: boolean;
    position: number;
    level: number;

    translations: CategoryTranslation[];
    products: Product[]
}

export type CategoryTranslation = {
    id: number;
    categoryId: number;
    languageId: number;
    language: Language;
    name: string;
    description?: string;
    linkRewrite?: string;
    metaTitle?: string;
    metaDescription?: string;    
}