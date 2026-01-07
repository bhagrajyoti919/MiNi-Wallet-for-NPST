import { useEffect, useState } from "react";
import api from "../api/api";

export default function TransferMoney({ refreshWallet }) {
  const [users, setUsers] = useState([]);
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    api.get("/users").then(res => setUsers(res.data));
  }, []);

  const transfer = async () => {
    await api.post("/wallet/transfer", {
      toUserId,
      amount: Number(amount)
    });
    refreshWallet();
  };

  return (
    <div>
      <h4>Transfer Money</h4>
      <select onChange={e => setToUserId(e.target.value)}>
        <option>Select User</option>
        {users.map(u => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
      <input type="number" onChange={e => setAmount(e.target.value)} />
      <button onClick={transfer}>Transfer</button>
    </div>
  );
}
