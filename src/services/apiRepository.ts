import type {
  ConsultaResumen,
  DataRepository,
  EvolucionItem,
} from '../types/models';
import { RepositoryError } from '../types/models';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '');

const errorFromResponse = async (response: Response, fallback: string) => {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'detail' in body) {
      const detail = (body as { detail?: unknown }).detail;
      if (typeof detail === 'string') return detail;
    }
  } catch {
    // La API puede devolver una respuesta sin cuerpo JSON.
  }

  return fallback;
};

const request = async (url: string, options?: RequestInit) => {
  try {
    return await fetch(url, options);
  } catch {
    throw new RepositoryError('API_ERROR', 'No se pudo conectar con el servidor.');
  }
};

export const apiRepository: DataRepository = {
  async crearConsulta(input) {
    const response = await request(`${API_URL}/consultas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dni_paciente: input.dniPaciente,
        motivo_consulta: input.motivo,
        descripcion_problema: input.descripcion,
        id_medico: input.idMedico,
        ...(input.datosPaciente ? { datos_paciente: input.datosPaciente } : {}),
      }),
    });

    if (!response.ok) {
      throw new RepositoryError(
        'API_ERROR',
        await errorFromResponse(response, 'No se pudo registrar la consulta.'),
      );
    }

    const body: unknown = await response.json();
    const idConsulta =
      body && typeof body === 'object' && 'id_consulta' in body
        ? String((body as { id_consulta: unknown }).id_consulta)
        : '';

    return { idConsulta };
  },

  async buscarConsultasPorDni(dni) {
    const response = await request(`${API_URL}/pacientes/${encodeURIComponent(dni)}/consultas`);

    if (!response.ok) {
      const code = response.status === 404 ? 'PATIENT_NOT_FOUND' : 'API_ERROR';
      throw new RepositoryError(
        code,
        await errorFromResponse(response, 'No se pudieron obtener las consultas.'),
      );
    }

    const body = (await response.json()) as Array<{
      id_consulta: string;
      motivo?: string;
      motivo_consulta?: string;
      fecha_hora: string;
    }>;

    return body.map<ConsultaResumen>((consulta) => ({
      idConsulta: consulta.id_consulta,
      motivo: consulta.motivo ?? consulta.motivo_consulta ?? 'Consulta',
      fechaHora: consulta.fecha_hora,
    }));
  },

  async crearMedicion(input) {
    const response = await request(`${API_URL}/mediciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_consulta: input.idConsulta,
        tipo_metrica: input.tipoMetrica,
        valor: input.valor,
        unidad: input.unidad,
      }),
    });

    if (!response.ok) {
      throw new RepositoryError(
        'API_ERROR',
        await errorFromResponse(response, 'No se pudo guardar la medición.'),
      );
    }
  },

  async obtenerEvolucion(dni, metrica) {
    const response = await request(
      `${API_URL}/pacientes/${encodeURIComponent(dni)}/evolucion?metrica=${encodeURIComponent(metrica)}`,
    );

    if (!response.ok) {
      const code = response.status === 404 ? 'PATIENT_NOT_FOUND' : 'API_ERROR';
      throw new RepositoryError(
        code,
        await errorFromResponse(response, 'No se pudo obtener la evolución.'),
      );
    }

    const body = (await response.json()) as {
      evolucion: Array<{ fecha_hora: string; valor: number; unidad: string }>;
    };

    return body.evolucion.map<EvolucionItem>((item) => ({
      fechaHora: item.fecha_hora,
      valor: item.valor,
      unidad: item.unidad,
    }));
  },
};
