import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import DataTable, { type Column } from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import * as customersService from "../../services/customers.service";
import type { Customer } from "../../types";

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

export default function CustomersList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    customersService.getCustomers().then((data) => {
      setCustomers(data);
      setIsLoading(false);
    });
  }, []);

  const columns: Column<Customer>[] = [
    { key: "name", header: "Name", render: (c) => <span className="font-medium text-white">{c.name}</span> },
    { key: "email", header: "Email", render: (c) => <span className="text-white/70">{c.email}</span> },
    { key: "phone", header: "Phone", render: (c) => <span className="text-white/70">{c.phone}</span> },
    { key: "orders", header: "Orders", render: (c) => c.totalOrders },
    { key: "spent", header: "Total Spent", render: (c) => formatPeso(c.totalSpent) },
    { key: "joined", header: "Joined", render: (c) => new Date(c.joinedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) },
  ];

  return (
    <div>
      <p className="text-white/50 text-sm mb-5">{customers.length} registered customers</p>
      <DataTable
        columns={columns}
        data={customers}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search customers..."
        searchKeys={["name", "email"]}
        isLoading={isLoading}
        onRowClick={(c) => navigate(`/admin/customers/${c.id}`)}
        emptyState={<EmptyState icon={Users} title="No customers yet" />}
      />
    </div>
  );
}
