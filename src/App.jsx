import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Moon, Sun, Package, 
  LayoutDashboard, Loader2, Edit3, X, Calendar 
} from 'lucide-react';
import { supabase } from '../supabase';
import Swal from 'sweetalert2';

const InventorySystem = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', qty: '' });
  const [editingId, setEditingId] = useState(null);

  // Custom Toast for small updates
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    background: '#1e293b',
    color:'#f1f5f9',
  });

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase.from('MyinventoryDB').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemData = { name: form.name, price: parseFloat(form.price), qty: parseInt(form.qty) };

    if (editingId) {
      const { error } = await supabase.from('MyinventoryDB').update(itemData).eq('id', editingId);
      if (!error) Toast.fire({ icon: 'success', title: 'Updated Successfully' });
    } else {
      const { error } = await supabase.from('MyinventoryDB').insert([itemData]);
      if (!error) {
        // Colored SweetAlert for "Saved"
        Swal.fire({
          title: 'Saved!',
          text: 'Product added to stock.',
          icon: 'success',
          iconColor: '#6366f1',
          background: '#0f172a',
          color: '#f1f5f9',
          confirmButtonColor: '#6366f1',
        });
      }
    }
    setEditingId(null);
    setForm({ name: '', price: '', qty: '' });
    fetchInventory();
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Item?',
      text: `Are you sure you want to remove ${name}?`,
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      background: '#0f172a',
      color: '#f1f5f9',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Delete',
    });

    if (result.isConfirmed) {
      await supabase.from('MyinventoryDB').delete().eq('id', id);
      fetchInventory();
    }
  };

  const totalValue = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8">
        
        {/* Header */}
        <header className="flex flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Package size={24} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Quantify <span className="text-indigo-600">Pro</span></h1>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow border border-slate-200 dark:border-slate-800">
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl">
              <p className="text-indigo-100 text-sm font-medium">Total Value</p>
              <h3 className="text-3xl font-bold mt-1">${totalValue.toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2 text-sm bg-black/10 w-fit px-3 py-1 rounded-full">
                <LayoutDashboard size={16} /> {items.length} Products
              </div>
            </div>

            <div className={`p-6 rounded-2xl shadow-xl border transition-all ${editingId ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
              <h2 className="font-bold flex items-center gap-2 mb-6">
                {editingId ? <Edit3 size={18} className="text-amber-500" /> : <Plus size={18} className="text-indigo-600" />}
                {editingId ? 'Edit Product' : 'Add Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" required placeholder="Name" className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3 outline-none ring-indigo-500 focus:ring-2" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}/>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="0.01" required placeholder="Price" className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3 outline-none" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})}/>
                  <input type="number" required placeholder="Qty" className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3 outline-none" value={form.qty} onChange={(e) => setForm({...form, qty: e.target.value})}/>
                </div>
                <button className={`w-full font-bold py-3 rounded-xl text-white transition-all cursor-pointer active:scale-95 ${editingId ? 'bg-amber-500' : 'bg-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none'}`}>
                  {editingId ? 'Update Now' : 'Save to Inventory'}
                </button>
              </form>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                <h2 className="font-bold">Inventory List</h2>
                {loading && <Loader2 className="animate-spin text-indigo-500" size={18} />}
              </div>

              {/* Mobile View */}
              <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                {items.map(item => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-lg">{item.name}</h4>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(item.id)} className="p-1 text-slate-400"><Edit3 size={18}/></button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="p-1 text-red-400"><Trash2 size={18}/></button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <div className="text-slate-500 flex flex-col">
                        <span>Stock: {item.qty}</span>
                        <span className="text-[10px] flex items-center gap-1 mt-1"><Calendar size={10}/> {formatDate(item.created_at)}</span>
                      </div>
                      <span className="font-bold text-indigo-600 text-lg">${(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Added Date</th>
                      <th className="p-4 text-center">Stock</th>
                      <th className="p-4 text-right">Value</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-4 font-semibold">{item.name}</td>
                        <td className="p-4 text-sm text-slate-400">{formatDate(item.created_at)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.qty < 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {item.qty} units
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-indigo-600">${(item.price * item.qty).toLocaleString()}</td>
                        <td className="p-4 text-right space-x-3">
                          <button onClick={() => { setEditingId(item.id); setForm({name: item.name, price: item.price, qty: item.qty}) }} className="text-slate-300 hover:text-amber-500"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(item.id, item.name)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InventorySystem;
