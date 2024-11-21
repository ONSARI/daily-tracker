import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function App() {
  const [movimientos, setMovimientos] = useState([]);
  const [montoTotal, setMontoTotal] = useState(0);
  const [formData, setFormData] = useState({
    fecha: format(new Date(), 'yyyy-MM-dd'),
    ventas: '',
    gastos: '',
    comentarios: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'movimientos'), orderBy('fecha', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const movimientosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMovimientos(movimientosData);
      
      const total = movimientosData.reduce((acc, mov) => {
        return acc + (Number(mov.ventas) - Number(mov.gastos));
      }, 0);
      setMontoTotal(total);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'movimientos'), {
        ...formData,
        ventas: Number(formData.ventas),
        gastos: Number(formData.gastos),
        fecha: formData.fecha,
      });

      setFormData({
        fecha: format(new Date(), 'yyyy-MM-dd'),
        ventas: '',
        gastos: '',
        comentarios: ''
      });
    } catch (error) {
      console.error('Error al agregar documento: ', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Control Diario</h1>
        
        {/* Formulario de ingreso */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ventas</label>
              <input
                type="number"
                value={formData.ventas}
                onChange={(e) => setFormData({...formData, ventas: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gastos</label>
              <input
                type="number"
                value={formData.gastos}
                onChange={(e) => setFormData({...formData, gastos: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Comentarios</label>
              <input
                type="text"
                value={formData.comentarios}
                onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Guardar
          </button>
        </form>

        {/* Total */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">Balance Total</h2>
          <p className={`text-2xl font-bold ${montoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${montoTotal.toLocaleString('es-AR')}
          </p>
        </div>

        {/* Lista de movimientos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gastos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comentarios
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(movimiento.fecha), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">
                    ${Number(movimiento.ventas).toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">
                    ${Number(movimiento.gastos).toLocaleString('es-AR')}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                    movimiento.ventas - movimiento.gastos >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${(movimiento.ventas - movimiento.gastos).toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {movimiento.comentarios}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
