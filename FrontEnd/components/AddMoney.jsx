import { useState } from "react";
import api from "../api/api";

export default function AddMoney({ refreshWallet }) {
  const [amount, setAmount] = useState("");

  const addMoney = async () => {
    await api.post("/wallet/add-money", { amount: Number(amount) });
    refreshWallet();
    setAmount("");
  };

  return (
    <div>
      <h4>Add Money</h4>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
      <button onClick={addMoney}>Add</button>
    </div>
  );
}
