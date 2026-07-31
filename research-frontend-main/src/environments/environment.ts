export const environment = {
  production: false,

  // In dev we call the API gateway directly.
  apiUrls: {
    auth: 'http://localhost:8080/auth',
    user: 'http://localhost:8080/users',
    paper: 'http://localhost:8080/api',
    review: 'http://localhost:8080/api',
    notification: 'http://localhost:8080/notifications',
    report: 'http://localhost:8080/report',
  },

  tokenStorageKey: 'rkm_access_token',
  userStorageKey: 'rkm_current_user',
};
