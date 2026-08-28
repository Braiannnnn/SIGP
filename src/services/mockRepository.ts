import type {
  ConsultaResumen,
  DataRepository,
  DemoDatabase,
  EvolucionItem,
} from '../types/models';
import { RepositoryError } from '../types/models';

const STORAGE_KEY = 'sigp-demo-db-v1';
const SCHEMA_VERSION = 1;

let memoryDatabase: DemoDatabase | null = null;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const normalizarDni = (dni: string) => dni.replace(/\D/g, '');

const isDemoDatabase = (value: unknown): value is DemoDatabase => {
  if (!value || typeof value !== 'object') return false;

  const database = value as Partial<DemoDatabase>;
  return (
    database.meta?.schema_version === SCHEMA_VERSION &&
    Array.isArray(database.medicos) &&
    Array.isArray(database.pacientes) &&
    Array.isArray(database.consultas) &&
    Array.isArray(database.mediciones)
  );
};

const cargarDatosIniciales = async (): Promise<DemoDatabase> => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/db.json`, {
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const database: unknown = await response.json();
    if (!isDemoDatabase(database)) throw new Error('Formato de base de datos inválido');

    return clone(database);
  } catch {
    throw new RepositoryError(
      'DATA_UNAVAILABLE',
      'No se pudieron cargar los datos iniciales de demostración.',
    );
  }
};

const guardarDatabase = (database: DemoDatabase) => {
  memoryDatabase = clone(database);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  } catch {
    // Algunos navegadores bloquean localStorage. La copia en memoria permite seguir probando.
  }
};

const leerDatabase = async (): Promise<DemoDatabase> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isDemoDatabase(parsed)) {
        memoryDatabase = clone(parsed);
        return clone(parsed);
      }
    }
  } catch {
    // Se ignora una copia corrupta o un localStorage no disponible y se vuelve al seed.
  }

  if (memoryDatabase) return clone(memoryDatabase);

  const initialDatabase = await cargarDatosIniciales();
  guardarDatabase(initialDatabase);
  return clone(initialDatabase);
};

export const mockRepository: DataRepository = {
  async crearConsulta(input) {
    const database = await leerDatabase();
    const dni = normalizarDni(input.dniPaciente);
    const pacienteExistente = database.pacientes.find((paciente) => paciente.dni === dni);

    if (input.datosPaciente) {
      if (pacienteExistente) {
        throw new RepositoryError(
          'PATIENT_ALREADY_EXISTS',
          'Ya existe un paciente registrado con ese DNI.',
        );
      }

      database.pacientes.push({
        id_paciente: crypto.randomUUID(),
        dni,
        ...input.datosPaciente,
      });
    } else if (!pacienteExistente) {
      throw new RepositoryError(
        'PATIENT_NOT_FOUND',
        'No se encontró un paciente registrado con ese DNI.',
      );
    }

    const idConsulta = crypto.randomUUID();
    database.consultas.push({
      id_consulta: idConsulta,
      dni_paciente: dni,
      motivo_consulta: input.motivo.trim(),
      descripcion_problema: input.descripcion.trim(),
      id_medico: input.idMedico,
      fecha_hora: new Date().toISOString(),
    });

    guardarDatabase(database);
    return { idConsulta };
  },

  async buscarConsultasPorDni(dniInput) {
    const database = await leerDatabase();
    const dni = normalizarDni(dniInput);

    if (!database.pacientes.some((paciente) => paciente.dni === dni)) {
      throw new RepositoryError('PATIENT_NOT_FOUND', 'Paciente no encontrado.');
    }

    return database.consultas
      .filter((consulta) => consulta.dni_paciente === dni)
      .sort((a, b) => b.fecha_hora.localeCompare(a.fecha_hora))
      .map<ConsultaResumen>((consulta) => ({
        idConsulta: consulta.id_consulta,
        motivo: consulta.motivo_consulta,
        fechaHora: consulta.fecha_hora,
      }));
  },

  async crearMedicion(input) {
    const database = await leerDatabase();

    if (!database.consultas.some((consulta) => consulta.id_consulta === input.idConsulta)) {
      throw new RepositoryError('CONSULTATION_NOT_FOUND', 'La consulta seleccionada no existe.');
    }

    if (!Number.isFinite(input.valor)) {
      throw new RepositoryError('INVALID_DATA', 'El valor de la medición no es válido.');
    }

    database.mediciones.push({
      id_medicion: crypto.randomUUID(),
      id_consulta: input.idConsulta,
      tipo_metrica: input.tipoMetrica,
      valor: input.valor,
      unidad: input.unidad,
      fecha_hora: new Date().toISOString(),
    });

    guardarDatabase(database);
  },

  async obtenerEvolucion(dniInput, metrica) {
    const database = await leerDatabase();
    const dni = normalizarDni(dniInput);

    if (!database.pacientes.some((paciente) => paciente.dni === dni)) {
      throw new RepositoryError('PATIENT_NOT_FOUND', 'Paciente no encontrado.');
    }

    const consultasPaciente = new Set(
      database.consultas
        .filter((consulta) => consulta.dni_paciente === dni)
        .map((consulta) => consulta.id_consulta),
    );

    return database.mediciones
      .filter(
        (medicion) =>
          consultasPaciente.has(medicion.id_consulta) && medicion.tipo_metrica === metrica,
      )
      .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))
      .map<EvolucionItem>((medicion) => ({
        fechaHora: medicion.fecha_hora,
        valor: medicion.valor,
        unidad: medicion.unidad,
      }));
  },
};

export const resetMockDatabase = async () => {
  const initialDatabase = await cargarDatosIniciales();
  guardarDatabase(initialDatabase);
};
