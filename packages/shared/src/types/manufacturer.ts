import { Product } from "./product";

export type Manufacturer = {
    id: number;
    name: string;
    
    active: boolean;

    customFields: string; //Json

    createdAt: Date;
    updatedAt: Date;

    products?: Product[]
};
