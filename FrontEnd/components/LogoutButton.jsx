import api from "../api/api"; 
 
 export default function LogoutButton({ onLogout }) { 
   const handleLogout = async () => { 
     await api.post("/auth/logout"); 
     onLogout(); 
   }; 
 
   return ( 
     <button onClick={handleLogout} style={{ marginTop: "20px", backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "10px 15px", cursor: "pointer" }}> 
       Logout 
     </button> 
   ); 
 } 
