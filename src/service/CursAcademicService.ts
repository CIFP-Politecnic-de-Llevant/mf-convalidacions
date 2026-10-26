import {axios} from 'boot/axios'
import {CursAcademic} from "src/model/gestib/CursAcademic";

export class CursAcademicService {

  static async getCursAcademicActual(): Promise<CursAcademic> {
    const response = await axios.get(process.env.API + '/api/core/cursAcademic/actual');
    const cursAcademic = await response.data;

    return this.fromJSON(cursAcademic);
  }

  static async getCursAcademicById(id:number): Promise<CursAcademic> {
    const response = await axios.get(process.env.API + '/api/core/cursAcademic/getById/' + id);
    const cursAcademic = await response.data;

    return this.fromJSON(cursAcademic);
  }

  private static fromJSON(cursAcademic:any): CursAcademic {
    return {
      id: cursAcademic.idcursAcademic,
      nom: cursAcademic.nom,
      actual: cursAcademic.actual
    };
  }

}
