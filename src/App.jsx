import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Moon, Sun, Package, 
  DollarSign, Hash, LayoutDashboard, Loader2, Edit3, X 
} from 'lucide-react';
import { supabase } from '../supabase';
import Swal from 'sweetalert2';

const InventorySystem = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', qty: '' });
  const [editingId, setEditingId] = useState(null);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
  });

  // Theme Persistence
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const fetchInventory = async () => {
    setLoading(true);
    const { data } = await supabase.from('MyinventoryDB').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchInventory(); }, 
  []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemData = { name: form.name, price: parseFloat(form.price), qty: parseInt(form.qty) };

    if (editingId) {
      const { error } = await supabase.from('MyinventoryDB').update(itemData).eq('id', editingId);
      if (!error) Toast.fire({ icon: 'success', title: 'Updated' });
    } else {
      const { error } = await supabase.from('MyinventoryDB').insert([itemData]);
      if (!error) Swal.fire('Saved!', 'Added to stock.', 'success');
    }
    setEditingId(null);
    setForm({ name: '', price: '', qty: '' });
    fetchInventory();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, price: item.price, qty: item.qty });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete?',
      text: `Remove ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete'
    });
    if (result.isConfirmed) {
      await supabase.from('MyinventoryDB').delete().eq('id', id);
      fetchInventory();
    }
  };

  const totalValue = items.reduce((acc, item) => acc + (Number(item.amount) || (item.price * item.qty)), 0);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6 md:p-8">
        
        {/* Responsive Header */}
        <header className="flex flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><Package size={24} /></div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Quantify <span className="text-indigo-600">Pro</span></h1>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow border border-slate-200 dark:border-slate-800">
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Form & Stats Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg">
              <p className="text-indigo-100 text-sm font-medium">Total Value</p>
              <h3 className="text-3xl font-bold mt-1">${totalValue.toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2 text-sm bg-black/10 w-fit px-3 py-1 rounded-full">
                <LayoutDashboard size={16} /> {items.length} Products
              </div>
            </div>

            <div className={`p-6 rounded-2xl shadow-xl border transition-all ${editingId ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold flex items-center gap-2">
                  {editingId ? <Edit3 size={18} className="text-amber-500" /> : <Plus size={18} className="text-indigo-600" />}
                  {editingId ? 'Edit Item' : 'Add Item'}
                </h2>
                {editingId && <X size={20} className="cursor-pointer" onClick={() => {setEditingId(null); setForm({name:'',price:'',qty:''})}} />}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" required placeholder="Name" className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3 outline-none ring-indigo-500 focus:ring-2" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}/>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="0.01" required placeholder="Price" className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3 outline-none" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})}/>
                  <input type="number" required placeholder="Qty" className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl p-3 outline-none" value={form.qty} onChange={(e) => setForm({...form, qty: e.target.value})}/>
                </div>
                <button className={`w-full font-bold py-3 rounded-xl text-white ${editingId ? 'bg-amber-500' : 'bg-indigo-600'}`}>{editingId ? 'Update' : 'Add Product'}</button>
              </form>
            </div>
          </div>

          {/* Table/List Column */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                <h2 className="font-bold">Inventory List</h2>
                {loading && <Loader2 className="animate-spin text-indigo-500" size={18} />}
              </div>

              {/* Mobile View: Cards (Hidden on Medium+ Screens) */}
              <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                {items.map(item => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{item.name}</h4>
                      <div className="flex gap-2">
                        <Edit3 size={18} className="text-slate-400" onClick={() => startEdit(item)} />
                        <Trash2 size={18} className="text-red-400" onClick={() => handleDelete(item.id, item.name)} />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Stock: {item.qty}</span>
                      <span className="font-bold text-indigo-600">${(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Table (Hidden on Small Screens) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4 text-center">Qty</th>
                      <th className="p-4 text-right">Total</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-4 font-semibold">{item.name}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.qty < 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            Stock: {item.qty}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-indigo-600">${(item.price * item.qty).toLocaleString()}</td>
                        <td className="p-4 text-right space-x-3">
                          <button onClick={() => startEdit(item)} className="text-slate-400 hover:text-amber-500"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(item.id, item.name)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
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