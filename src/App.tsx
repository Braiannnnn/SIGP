import { useState } from 'react';
import { RegistroConsulta } from './RegistroConsulta';
import { CurvasDesarrollo } from './CurvasDesarrollo';
import { CargarMedicion } from './CargarMedicion';
import { isDemoMode, resetDemoDatabase } from './services/dataRepository';

type Vista = 'registro' | 'medicion' | 'grafico';

function App() {
  const [vistaActual, setVistaActual] = useState<Vista>('registro');
  const [reiniciando, setReiniciando] = useState(false);
  const [mensajeDemo, setMensajeDemo] = useState('');
  const [databaseVersion, setDatabaseVersion] = useState(0);

  const reiniciarDatos = async () => {
    const confirmado = window.confirm(
      'Se eliminarán los cambios realizados en este navegador y se restaurarán los datos ficticios iniciales. ¿Continuar?',
    );
    if (!confirmado) return;

    setReiniciando(true);
    setMensajeDemo('');
    try {
      await resetDemoDatabase();
      setDatabaseVersion((version) => version + 1);
      setMensajeDemo('Datos de prueba restablecidos.');
    } catch {
      setMensajeDemo('No se pudieron restablecer los datos.');
    } finally {
      setReiniciando(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 font-sans text-slate-800">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-sky-100 px-4 py-4 md:px-6 flex flex-col lg:flex-row gap-4 justify-between items-center z-10">
        <h1 className="text-2xl font-black text-blue-900 tracking-tight">
          SIGP<span className="text-blue-500">.Med</span>
        </h1>

        <nav className="bg-sky-100 p-1 rounded-2xl sm:rounded-full flex flex-wrap justify-center gap-1" aria-label="Secciones principales">
          <button type="button" onClick={() => setVistaActual('registro')} className={`px-4 md:px-6 py-2 rounded-full font-bold transition-all ${vistaActual === 'registro' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-700 hover:bg-sky-200'}`}>
            Consulta
          </button>
          <button type="button" onClick={() => setVistaActual('medicion')} className={`px-4 md:px-6 py-2 rounded-full font-bold transition-all ${vistaActual === 'medicion' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-700 hover:bg-sky-200'}`}>
            Mediciones
          </button>
          <button type="button" onClick={() => setVistaActual('grafico')} className={`px-4 md:px-6 py-2 rounded-full font-bold transition-all ${vistaActual === 'grafico' ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-700 hover:bg-sky-200'}`}>
            Evolución
          </button>
        </nav>
      </header>

      {isDemoMode && (
        <aside className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-3">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="text-sm">
              <strong>Modo demostración:</strong> los datos son ficticios y se guardan sólo en este navegador.
              <span className="block md:inline md:ml-2">Probá: <code className="font-bold">40111222</code> (normal), <code className="font-bold">38999888</code> (alerta) o <code className="font-bold">42123456</code> (sin mediciones).</span>
              {mensajeDemo && <span className="block font-bold mt-1" role="status">{mensajeDemo}</span>}
            </div>
            <button type="button" onClick={reiniciarDatos} disabled={reiniciando} className="shrink-0 bg-white border border-amber-300 hover:bg-amber-100 px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50">
              {reiniciando ? 'Restableciendo...' : 'Restablecer datos'}
            </button>
          </div>
        </aside>
      )}

      <main key={databaseVersion} className="p-4 md:p-8 max-w-5xl mx-auto">
        {vistaActual === 'registro' && <RegistroConsulta />}
        {vistaActual === 'medicion' && <CargarMedicion />}
        {vistaActual === 'grafico' && <CurvasDesarrollo />}
      </main>
    </div>
  );
}

export default App;
