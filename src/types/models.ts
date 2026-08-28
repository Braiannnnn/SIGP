export type Sexo = 'F' | 'M' | 'X' | 'NS';

export interface DatosPaciente {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  sexo: Sexo;
  cobertura_medica: string;
  enfermedades_previas: string;
  cirugias_internaciones: string;
  habitos: string;
  medicacion_habitual: string;
  alergias: string;
}

export interface Paciente extends DatosPaciente {
  id_paciente: string;
  dni: string;
}

export interface Medico {
  id_medico: string;
  nombre: string;
  apellido: string;
  matricula: string;
}

export interface Consulta {
  id_consulta: string;
  dni_paciente: string;
  motivo_consulta: string;
  descripcion_problema: string;
  id_medico: string;
  fecha_hora: string;
}

export interface Medicion {
  id_medicion: string;
  id_consulta: string;
  tipo_metrica: string;
  valor: number;
  unidad: string;
  fecha_hora: string;
}

export interface DemoDatabase {
  meta: {
    schema_version: number;
    descripcion: string;
  };
  medicos: Medico[];
  pacientes: Paciente[];
  consultas: Consulta[];
  mediciones: Medicion[];
}

export interface CrearConsultaInput {
  dniPaciente: string;
  motivo: string;
  descripcion: string;
  idMedico: string;
  datosPaciente?: DatosPaciente;
}

export interface CrearConsultaResultado {
  idConsulta: string;
}

export interface ConsultaResumen {
  idConsulta: string;
  motivo: string;
  fechaHora: string;
}

export interface CrearMedicionInput {
  idConsulta: string;
  tipoMetrica: string;
  valor: number;
  unidad: string;
}

export interface EvolucionItem {
  fechaHora: string;
  valor: number;
  unidad: string;
}

export interface DataRepository {
  crearConsulta(input: CrearConsultaInput): Promise<CrearConsultaResultado>;
  buscarConsultasPorDni(dni: string): Promise<ConsultaResumen[]>;
  crearMedicion(input: CrearMedicionInput): Promise<void>;
  obtenerEvolucion(dni: string, metrica: string): Promise<EvolucionItem[]>;
}

export type RepositoryErrorCode =
  | 'PATIENT_NOT_FOUND'
  | 'PATIENT_ALREADY_EXISTS'
  | 'CONSULTATION_NOT_FOUND'
  | 'INVALID_DATA'
  | 'DATA_UNAVAILABLE'
  | 'API_ERROR';

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;

  constructor(code: RepositoryErrorCode, message: string) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
  }
}
