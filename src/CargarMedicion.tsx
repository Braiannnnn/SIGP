import { useState } from 'react';
import { dataRepository } from './services/dataRepository';
import type { ConsultaResumen } from './types/models';
import { RepositoryError } from './types/models';

const METRICAS = [
  { valor: 'peso', etiqueta: 'Peso', unidad: 'kg' },
  { valor: 'talla', etiqueta: 'Talla', unidad: 'cm' },
  { valor: 'colesterol', etiqueta: 'Colesterol', unidad: 'mg/dL' },
  { valor: 'glucosa', etiqueta: 'Glucosa', unidad: 'mg/dL' },
  { valor: 'presion', etiqueta: 'Presión', unidad: 'mmHg' },
];

const mensajeDeError = (error: unknown) =>
  error instanceof RepositoryError ? error.message : 'Ocurrió un error inesperado.';

export const CargarMedicion = () => {
  const [dni, setDni] = useState('');
  const [consultas, setConsultas] = useState<ConsultaResumen[]>([]);
  const [idConsultaSeleccionada, setIdConsultaSeleccionada] = useState('');
  const [metrica, setMetrica] = useState(METRICAS[0].valor);
  const [valor, setValor] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [paso, setPaso] = useState<1 | 2>(1);

  const unidadActual = METRICAS.find((item) => item.valor === metrica)?.unidad ?? '';

  const buscarConsultas = async () => {
    if (!dni.trim()) {
      setMensaje('❌ Ingresá un DNI.');
      return;
    }

    setCargando(true);
    setMensaje('');
    setPaso(1);

    try {
      const resultado = await dataRepository.buscarConsultasPorDni(dni);
      if (resultado.length === 0) {
        setConsultas([]);
        setMensaje('❌ El paciente no tiene consultas registradas.');
        return;
      }

      setConsultas(resultado);
      setIdConsultaSeleccionada(resultado[0].idConsulta);
      setPaso(2);
    } catch (error) {
      setConsultas([]);
      setMensaje(`❌ ${mensajeDeError(error)}`);
    } finally {
      setCargando(false);
    }
  };

  const guardarMedicion = async () => {
    const valorNumerico = Number(valor);
    if (!idConsultaSeleccionada || !valor.trim() || !Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setMensaje('❌ Ingresá un valor mayor que cero.');
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      await dataRepository.crearMedicion({
        idConsulta: idConsultaSeleccionada,
        tipoMetrica: metrica,
        valor: valorNumerico,
        unidad: unidadActual,
      });
      setMensaje('✅ Medición registrada exitosamente.');
      setValor('');
    } catch (error) {
      setMensaje(`❌ ${mensajeDeError(error)}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-sky-100 animate-in fade-in duration-500">
      <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center">
        <span className="mr-3">📏</span> Cargar Medición
      </h2>

      <div className="space-y-4 mb-6">
        <label className="font-bold text-slate-700" htmlFor="dni-medicion">DNI del paciente</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="dni-medicion"
            className="flex-1 border-2 p-3 rounded-xl outline-none focus:border-blue-500"
            inputMode="numeric"
            placeholder="Ej: 40111222"
            value={dni}
            onChange={(event) => {
              setDni(event.target.value);
              setPaso(1);
              setMensaje('');
            }}
            onKeyDown={(event) => event.key === 'Enter' && buscarConsultas()}
          />
          <button type="button" onClick={buscarConsultas} disabled={cargando} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50">
            {cargando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {paso === 2 && (
        <div className="space-y-5 border-t pt-6">
          <div>
            <label className="font-bold text-slate-700 block mb-2" htmlFor="consulta-medicion">Consulta asociada</label>
            <select id="consulta-medicion" className="w-full border-2 p-3 rounded-xl" value={idConsultaSeleccionada} onChange={(event) => setIdConsultaSeleccionada(event.target.value)}>
              {consultas.map((consulta) => (
                <option key={consulta.idConsulta} value={consulta.idConsulta}>
                  {new Date(consulta.fechaHora).toLocaleDateString('es-AR')} — {consulta.motivo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-2" htmlFor="tipo-medicion">Tipo de métrica</label>
            <select id="tipo-medicion" className="w-full border-2 p-3 rounded-xl" value={metrica} onChange={(event) => setMetrica(event.target.value)}>
              {METRICAS.map((item) => <option key={item.valor} value={item.valor}>{item.etiqueta} ({item.unidad})</option>)}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-2" htmlFor="valor-medicion">
              Valor <span className="text-slate-400 font-normal">({unidadActual})</span>
            </label>
            <input
              id="valor-medicion"
              className="w-full border-2 p-3 rounded-xl"
              type="number"
              min="0"
              step="0.1"
              placeholder={`Ej: ${metrica === 'peso' ? '30.5' : metrica === 'talla' ? '135' : '100'}`}
              value={valor}
              onChange={(event) => setValor(event.target.value)}
            />
          </div>

          <button type="button" onClick={guardarMedicion} disabled={cargando} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-lg shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50">
            {cargando ? 'Guardando...' : 'Guardar Medición'}
          </button>
        </div>
      )}

      {mensaje && (
        <div className={`mt-4 p-4 rounded-xl font-bold text-center ${mensaje.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role="status">
          {mensaje}
        </div>
      )}
    </div>
  );
};
