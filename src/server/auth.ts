import api from "./api";

export const createAccount = async (body: any) => {
  const res = await api.post("/auth/registration/", body);
  return res.data;
};
export const login = async (body: any) => {
  const res = await api.post("/auth/login/", body);
  return res.data;
};
export const verify = async (body: any) => {
  const res = await api.post("/auth/verify-email/", body);
  return res.data;
};
export const resendEmail = async (body: any) => {
  const res = await api.post("/auth/resend-email/", body);
  return res.data;
};
export const changePassword = async (body: any) => {
  const res = await api.post("/auth/password/change/", body);
  return res.data;
};
export const resetPassword = async (body: any) => {
  const res = await api.post("/auth/password-reset/", body);
  return res.data;
};
export const resetPasswordConfirmation = async (body: any, uid: any, token: any) => {
  const res = await api.post(`/auth/password-reset-confirm/${uid}/${token}/`, {
    new_password1: body.new_password1,
    new_password2: body.new_password2,
    uid: uid,
    token: token,
  });
  return res.data;
};