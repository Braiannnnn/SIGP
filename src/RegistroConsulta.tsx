import { useState } from 'react';
import { dataRepository } from './services/dataRepository';
import type { Sexo } from './types/models';
import { RepositoryError } from './types/models';

const ID_MEDICO_DEMO = 'medico-demo-001';

type TipoPaciente = 'nuevo' | 'registrado';

const mensajeDeError = (error: unknown) =>
  error instanceof RepositoryError
    ? error.message
    : 'Ocurrió un error inesperado al registrar la consulta.';

export const RegistroConsulta = () => {
  const [tipoPaciente, setTipoPaciente] = useState<TipoPaciente>('registrado');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const [dni, setDni] = useState('');
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [dniNuevo, setDniNuevo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState<Sexo>('NS');
  const [cobertura, setCobertura] = useState('');
  const [enfermedades, setEnfermedades] = useState('');
  const [cirugias, setCirugias] = useState('');
  const [habitos, setHabitos] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [alergias, setAlergias] = useState('');
  const [motivoNuevo, setMotivoNuevo] = useState('');
  const [descripcionNuevo, setDescripcionNuevo] = useState('');

  const handleSubmit = async () => {
    setMensaje('');

    if (tipoPaciente === 'registrado' && (!dni.trim() || !motivo.trim() || !descripcion.trim())) {
      setMensaje('❌ Completá todos los campos obligatorios.');
      return;
    }

    if (
      tipoPaciente === 'nuevo' &&
      (!nombreCompleto.trim() ||
        !dniNuevo.trim() ||
        !fechaNacimiento ||
        !motivoNuevo.trim() ||
        !descripcionNuevo.trim())
    ) {
      setMensaje('❌ Completá todos los campos obligatorios.');
      return;
    }

    setCargando(true);

    try {
      if (tipoPaciente === 'registrado') {
        await dataRepository.crearConsulta({
          dniPaciente: dni,
          motivo,
          descripcion,
          idMedico: ID_MEDICO_DEMO,
        });
      } else {
        const partes = nombreCompleto.trim().split(/\s+/);
        if (partes.length < 2) {
          setMensaje('❌ Ingresá al menos un nombre y un apellido.');
          return;
        }

        const apellido = partes.pop() ?? '';
        const nombre = partes.join(' ');

        await dataRepository.crearConsulta({
          dniPaciente: dniNuevo,
          motivo: motivoNuevo,
          descripcion: descripcionNuevo,
          idMedico: ID_MEDICO_DEMO,
          datosPaciente: {
            nombre,
            apellido,
            fecha_nacimiento: fechaNacimiento,
            sexo,
            cobertura_medica: cobertura.trim(),
            enfermedades_previas: enfermedades.trim(),
            cirugias_internaciones: cirugias.trim(),
            habitos: habitos.trim(),
            medicacion_habitual: medicamentos.trim(),
            alergias: alergias.trim(),
          },
        });
      }

      setMensaje('✅ Consulta registrada exitosamente.');
    } catch (error) {
      setMensaje(`❌ ${mensajeDeError(error)}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-sky-100 animate-in fade-in duration-500">
      <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center">
        <span className="mr-3">🩺</span> Admisión de Consulta
      </h2>

      <div className="flex gap-4 mb-8 bg-sky-50 p-2 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            setTipoPaciente('registrado');
            setMensaje('');
          }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipoPaciente === 'registrado' ? 'bg-white shadow text-blue-900' : 'text-slate-500'}`}
        >
          Paciente Registrado
        </button>
        <button
          type="button"
          onClick={() => {
            setTipoPaciente('nuevo');
            setMensaje('');
          }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipoPaciente === 'nuevo' ? 'bg-white shadow text-blue-900' : 'text-slate-500'}`}
        >
          Paciente Nuevo
        </button>
      </div>

      <div className="space-y-6">
        {tipoPaciente === 'nuevo' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="md:col-span-2 text-lg font-bold text-blue-900 border-b pb-2">
              Información Personal
            </h3>
            <input className="border-2 p-3 rounded-xl w-full" placeholder="Nombre completo *" value={nombreCompleto} onChange={(event) => setNombreCompleto(event.target.value)} />
            <input className="border-2 p-3 rounded-xl w-full" inputMode="numeric" placeholder="DNI *" value={dniNuevo} onChange={(event) => setDniNuevo(event.target.value)} />
            <input className="border-2 p-3 rounded-xl w-full" type="date" aria-label="Fecha de nacimiento" value={fechaNacimiento} onChange={(event) => setFechaNacimiento(event.target.value)} />
            <select className="border-2 p-3 rounded-xl w-full" aria-label="Sexo" value={sexo} onChange={(event) => setSexo(event.target.value as Sexo)}>
              <option value="NS">Sexo no especificado</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
              <option value="X">No binario / X</option>
            </select>

            <h3 className="md:col-span-2 text-lg font-bold text-blue-900 border-b pb-2 mt-4">Consulta</h3>
            <input className="md:col-span-2 border-2 p-3 rounded-xl w-full" placeholder="Motivo de consulta *" value={motivoNuevo} onChange={(event) => setMotivoNuevo(event.target.value)} />
            <textarea className="md:col-span-2 border-2 p-3 rounded-xl" placeholder="Descripción del problema *" value={descripcionNuevo} onChange={(event) => setDescripcionNuevo(event.target.value)} />

            <h3 className="md:col-span-2 text-lg font-bold text-blue-900 border-b pb-2 mt-4">Antecedentes Médicos</h3>
            <input className="border-2 p-3 rounded-xl w-full" placeholder="Cobertura médica" value={cobertura} onChange={(event) => setCobertura(event.target.value)} />
            <textarea className="border-2 p-3 rounded-xl" placeholder="Enfermedades previas" value={enfermedades} onChange={(event) => setEnfermedades(event.target.value)} />
            <textarea className="border-2 p-3 rounded-xl" placeholder="Cirugías e internaciones" value={cirugias} onChange={(event) => setCirugias(event.target.value)} />
            <textarea className="border-2 p-3 rounded-xl" placeholder="Hábitos" value={habitos} onChange={(event) => setHabitos(event.target.value)} />
            <textarea className="border-2 p-3 rounded-xl" placeholder="Medicamentos actuales" value={medicamentos} onChange={(event) => setMedicamentos(event.target.value)} />
            <textarea className="border-2 p-3 rounded-xl" placeholder="Alergias" value={alergias} onChange={(event) => setAlergias(event.target.value)} />
          </div>
        ) : (
          <div className="space-y-4">
            <input className="w-full border-2 p-3 rounded-xl" inputMode="numeric" placeholder="DNI del paciente *" value={dni} onChange={(event) => setDni(event.target.value)} />
            <input className="w-full border-2 p-3 rounded-xl" placeholder="Motivo de consulta *" value={motivo} onChange={(event) => setMotivo(event.target.value)} />
            <textarea className="w-full border-2 p-3 rounded-xl h-32" placeholder="Descripción del problema actual *" value={descripcion} onChange={(event) => setDescripcion(event.target.value)} />
          </div>
        )}

        {mensaje && (
          <div className={`p-4 rounded-xl font-bold text-center ${mensaje.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role="status">
            {mensaje}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={cargando}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {cargando ? 'Registrando...' : 'Finalizar Admisión'}
        </button>
      </div>
    </div>
  );
};
