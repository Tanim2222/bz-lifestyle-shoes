import { useEffect, useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import DataTable, { type Column } from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import AddStaffModal from "./AddStaffModal";
import { useAuth } from "../../context/AuthContext";
import * as adminUsersService from "../../services/adminUsers.service";
import type { AdminUser } from "../../types";

export default function Settings() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setUsers(await adminUsersService.getAdminUsers());
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (id: string) => {
    await adminUsersService.toggleAdminUserActive(id);
    load();
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-400/20 border border-teal-400/30 flex items-center justify-center text-teal-300 text-xs font-bold uppercase">
            {u.name.charAt(0)}
          </div>
          <span className="font-medium text-white">{u.name}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (u) => <span className="text-white/70">{u.email}</span> },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${u.role === "admin" ? "bg-teal-400/10 text-teal-300 border-teal-400/20" : "bg-white/5 text-white/60 border-white/10"}`}>
          {u.role}
        </span>
      ),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      render: (u) => <span className="text-white/50 text-xs">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-PH") : "Never"}</span>,
    },
    {
      key: "status",
      header: "Status",
      className: "text-right",
      render: (u) => (
        <button
          onClick={() => handleToggle(u.id)}
          disabled={u.id === currentUser?.id}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            u.active ? "bg-teal-400/10 text-teal-300 border-teal-400/20" : "bg-white/5 text-white/40 border-white/10"
          }`}
        >
          {u.active ? "Active" : "Deactivated"}
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <ShieldCheck className="w-4 h-4" />
          Admin &amp; staff accounts
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black text-sm font-bold hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Staff Account
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        emptyState={<EmptyState icon={ShieldCheck} title="No accounts found" />}
      />

      {showAddModal && (
        <AddStaffModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}
