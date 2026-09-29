import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, ShieldCheck, UserCheck, Search, Filter, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers([]);
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setStatusMsg({ type: 'success', text: `User role updated to ${newRole}` });
      setTimeout(() => setStatusMsg(null), 3500);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update user role' });
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (u.storeName || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Platform User Directory</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">User Access &amp; Role Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit registered accounts, oversee store affiliations, and manage RBAC permission assignments.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in duration-150 ${
          statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold">{statusMsg.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or store..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SHOPKEEPER">Shopkeeper</option>
            <option value="SUPERMARKET_MANAGER">Store Manager</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Store Link</th>
                <th className="px-5 py-3">Assigned Role</th>
                <th className="px-5 py-3 text-right">Role Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-100">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div>{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">ID: #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">{u.email}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {u.storeName ? (
                        <span className="font-semibold text-slate-800">{u.storeName}</span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        u.role === 'SUPERMARKET_MANAGER' || u.role === 'STORE_MANAGER' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        u.role === 'SHOPKEEPER' || u.role === 'RETAILER' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="SHOPKEEPER">SHOPKEEPER</option>
                        <option value="SUPERMARKET_MANAGER">SUPERMARKET_MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
