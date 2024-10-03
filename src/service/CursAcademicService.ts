import {axios} from 'boot/axios'
import {CursAcademic} from "src/model/gestib/CursAcademic";

export class CursAcademicService {

  static async getCursAcademicActual(): Promise<CursAcademic> {
    const response = await axios.get(process.env.API + '/api/core/cursAcademic/actual');
    const cursAcademic = await response.data;

    return {
      id: cursAcademic.id,
      nom: cursAcademic.nom,
      actual: cursAcademic.actual
    };
  }

}
