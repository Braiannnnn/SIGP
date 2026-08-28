import { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { dataRepository } from './services/dataRepository';
import type { EvolucionItem } from './types/models';
import { RepositoryError } from './types/models';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const mensajeDeError = (error: unknown) =>
  error instanceof RepositoryError ? error.message : 'Ocurrió un error inesperado.';

export const CurvasDesarrollo = () => {
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [evolucionPeso, setEvolucionPeso] = useState<EvolucionItem[]>([]);
  const [pacienteEncontrado, setPacienteEncontrado] = useState(false);

  const buscarPaciente = async () => {
    if (!dniBusqueda.trim()) {
      setError('Ingresá un DNI.');
      return;
    }

    setCargando(true);
    setError('');
    setEvolucionPeso([]);
    setPacienteEncontrado(false);

    try {
      const evolucion = await dataRepository.obtenerEvolucion(dniBusqueda, 'peso');
      setPacienteEncontrado(true);
      setEvolucionPeso(evolucion);

      if (evolucion.length === 0) {
        setError('El paciente no tiene mediciones de peso registradas aún.');
      }
    } catch (caughtError) {
      setError(mensajeDeError(caughtError));
    } finally {
      setCargando(false);
    }
  };

  const labels = evolucionPeso.map((item) =>
    new Date(item.fechaHora).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }),
  );
  const valores = evolucionPeso.map((item) => item.valor);

  const hayCambioAbrupto = valores.some((valor, index) => {
    if (index === 0 || valores[index - 1] === 0) return false;
    const diferencia = Math.abs(valor - valores[index - 1]) / valores[index - 1];
    return diferencia > 0.2;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-sky-100 flex flex-col sm:flex-row gap-4">
        <input
          className="flex-1 border-2 p-3 rounded-xl outline-none focus:border-blue-500"
          inputMode="numeric"
          aria-label="DNI del paciente"
          placeholder="Ingrese DNI del paciente..."
          value={dniBusqueda}
          onChange={(event) => {
            setDniBusqueda(event.target.value);
            setError('');
          }}
          onKeyDown={(event) => event.key === 'Enter' && buscarPaciente()}
        />
        <button type="button" onClick={buscarPaciente} disabled={cargando} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50">
          {cargando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl font-bold text-center" role="status">
          {error}
        </div>
      )}

      {hayCambioAbrupto && (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl font-bold text-center border border-yellow-200">
          ⚠️ Se detectó un cambio abrupto en el peso del paciente
        </div>
      )}

      {evolucionPeso.length > 0 && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-sky-100">
          <h3 className="font-extrabold text-slate-800 mb-2">Evolución de Peso</h3>
          <p className="text-slate-500 text-sm mb-6">
            {evolucionPeso.length} medición(es) registrada(s) — última: {valores[valores.length - 1]} kg
          </p>
          <div className="h-[300px]">
            <Line
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { title: { display: true, text: 'Peso (kg)' } } },
              }}
              data={{
                labels,
                datasets: [{
                  label: 'Peso (kg)',
                  data: valores,
                  borderColor: hayCambioAbrupto ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)',
                  backgroundColor: hayCambioAbrupto ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  tension: 0.3,
                  pointRadius: 5,
                }],
              }}
            />
          </div>
        </div>
      )}

      {!pacienteEncontrado && !error && !cargando && (
        <div className="p-8 bg-sky-50 text-slate-500 rounded-xl text-center">
          Ingresá un DNI para ver la evolución del paciente
        </div>
      )}
    </div>
  );
};
