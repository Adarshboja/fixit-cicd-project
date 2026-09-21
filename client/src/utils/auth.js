export const getToken = () => localStorage.getItem('fixit-token') || '';

export const isAuthenticated = () => Boolean(getToken());

export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('fixit-user') || 'null');
  return user?.role === 'ADMIN';
};

export const logout = () => {
  localStorage.removeItem('fixit-token');
  localStorage.removeItem('fixit-user');
};
