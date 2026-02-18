import { jwtDecode } from "jwt-decode";

export const getRoleFromToken = (token) => {
  if (!token) return 'warehouse_staff'; 

  try {
    const decoded = jwtDecode(token);
    return decoded.role; 
  } catch (error) {
    return 'warehouse_staff';
  }
};
