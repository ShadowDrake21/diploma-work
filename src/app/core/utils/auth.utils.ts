import { HttpHeaders } from '@angular/common/http';

export const getAuthHeaders = () => {
  const token =
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  return token
    ? {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      }
    : {};
};
