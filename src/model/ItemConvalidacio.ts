import {CategoriaConvalidacio} from "src/model/CategoriaConvalidacio";

export interface ItemConvalidacio {
  id?: number;
  codi: string;
  nom: string;
  nomOriginal: string;
  impartitAlCentre: boolean;
  categoria: CategoriaConvalidacio;
  composa?: Array<ItemConvalidacio>;
  label?: string;
  value?: string;
  selected?: boolean;
}
