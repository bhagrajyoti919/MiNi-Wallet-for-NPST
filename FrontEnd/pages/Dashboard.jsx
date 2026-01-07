import { useEffect, useState } from "react";
import api from "../api/api";
import AddMoney from "../components/AddMoney";
import TransferMoney from "../components/TransferMoney";
import LogoutButton from "../components/LogoutButton";

export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function loadData() {
      const me = await api.get("/users/me");
      const walletRes = await api.get("/wallet");
      const tx = await api.get("/transactions/recent");

      setUser(me.data);
      setWallet(walletRes.data);
      setTransactions(tx.data);
    }
    loadData();
  }, []);

  if (!user || !wallet) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <h3>Balance: ₹{wallet.balance}</h3>

      <AddMoney refreshWallet={() => api.get("/wallet").then(r => setWallet(r.data))} />
      <TransferMoney refreshWallet={() => api.get("/wallet").then(r => setWallet(r.data))} />

      <h3>Recent Transactions</h3>
      {transactions.length === 0 && <p>No transactions</p>}
      <ul>
        {transactions.map(tx => (
          <li key={tx.id}>
            {tx.type} - ₹{tx.amount} - {tx.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
