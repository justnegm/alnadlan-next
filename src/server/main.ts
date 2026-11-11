import api from "./api";
import { useAuth } from "@/store/auth-slice";

const cleanParams = (params: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  );
export const getMaintenanceMode = async () => {
  const res = await api.get(`/core/maintenance-mode/`);
  return res.data;
};


export const getUser = async () => {
  if (!useAuth.getState().isAuth) {
    return null;
  }
  const res = await api.get("/auth/user/");
  return res.data;
};

export const updateUser = async (formData: any) => {
  const res = await api.patch("/auth/user/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updatePassword = async (body: any) => {
  const res = await api.post("/auth/password/change/", body);
  return res.data;
};

export const getProjects = async (page?: any, filters?: any) => {
  const { price_from, price_to, property_type, query, contract_type, area, city, company } =
    filters || {};

  const res = await api.get("/projects/", {
    params: cleanParams({
      page,
      price_from,
      price_to,
      property_type,
      query,
      contract_type,
      area,
      city,
      company
    }),
  });
  return res.data;
};

export const getProject = async (slug: string) => {
  const res = await api.get(`/projects/${slug}/`);
  return res.data;
};

export const getProperties = async (page?: any, filters?: any) => {
  const { price_from, price_to, property_type, query, contract_type, area, city, user, is_premium, company } =
    filters || {};

  const res = await api.get("/properties/", {
    params: cleanParams({
      page,
      user,
      price_from,
      price_to,
      property_type,
      query,
      contract_type,
      area,
      city,
      is_premium,
      company,
    }),
  });
  return res.data;
};

export const getNotifications = async (page?: any) => {
  const res = await api.get("/properties/customer/matching-requests/", {
    params: { page }
  });
  return res.data;
};
export const getSpecialProperties = async (page?: any, filters?: any) => {
  const { price_from, price_to, property_type, query, contract_type, area, city, user } =
    filters || {};

  const res = await api.get("/property-ads/", {
    params: cleanParams({
      page,
      user,
      price_from,
      price_to,
      property_type,
      query,
      contract_type,
      area,
      city,
    }),
  });
  return res.data;
};
export const getProperty = async (slug: string) => {
  const res = await api.get(`/properties/${slug}/`);
  return res.data;
};
export const createProperty = async (formData: any) => {
  const res = await api.post("/properties/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
export const updateProperty = async (id: string, formData: any) => {
  const res = await api.patch(`/properties/${id}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
export const deleteProperty = async (id: string) => {
  const res = await api.delete(`/properties/${id}/`);
  return res.data;
};

export const getLawyers = async (page?: any, filters?: any) => {
  const { query, area, city, expertise } = filters || {};
  const res = await api.get("/profiles/lawyers/", {
    params: cleanParams({ page, query, area, city, expertise }),
  });
  return res.data;
};
export const getLawyer = async (slug: string) => {
  const res = await api.get(`/profiles/lawyers/${slug}/`);
  return res.data;
};

export const getDesigners = async (page?: any, filters?: any) => {
  const { query, area, city, expertise } = filters || {};
  const res = await api.get("/profiles/designers/", {
    params: cleanParams({ page, query, area, city, expertise }),
  });
  return res.data;
};

export const getDesigner = async (slug: string) => {
  const res = await api.get(`/profiles/designers/${slug}/`);
  return res.data;
};

export const getLoanAdvisors = async (page?: any, filters?: any) => {
  const { query, area, city, expertise } = filters || {};
  const res = await api.get("/profiles/loan-advisors/", {
    params: cleanParams({ page, query, area, city, expertise }),
  });
  return res.data;
};

export const getLoanAdvisor = async (slug: string) => {
  const res = await api.get(`/profiles/loan-advisors/${slug}/`);
  return res.data;
};

export const getBrokers = async (page?: any, filters?: any) => {
  const { query, area, city, expertise, company } = filters || {};
  const res = await api.get("/profiles/brokers/", {
    params: cleanParams({ page, query, area, city, expertise, company }),
  });
  return res.data;
};

export const getBroker = async (slug: string) => {
  const res = await api.get(`/profiles/brokers/${slug}/`);
  return res.data;
};

export const getOffices = async (page?: any, filters?: any) => {
  const { query, area, city, expertise } = filters || {};
  const res = await api.get("/profiles/companies/", {
    params: cleanParams({ page, query, area, city, expertise }),
  });
  return res.data;
};

export const getOffice = async (slug: string) => {
  const res = await api.get(`/profiles/companies/${slug}/`);
  return res.data;
};

export const getTypes = async () => {
  const res = await api.get("/core/property-groups/", { params: { no_pagination: true } });
  return res.data;
};
export const getAreasAndCities = async () => {
  const res = await api.get("/core/areas/", { params: { no_pagination: true } });
  return res.data;
};
export const getCities = async (id: string) => {
  const res = await api.get(`/core/areas/${id}/cities/`, { params: { no_pagination: true } });
  return res.data;
};
export const getAllCities = async (page?: any, name?: string) => {
  const res = await api.get(`/core/all-cities/`, {
    params: {
      page,
      name: name || "",
    },
  });
  return res.data;
};
export const getStreets = async (id: string) => {
  const res = await api.get(`/core/cities/${id}/streets/`, { params: { no_pagination: true } });
  return res.data;
};

export const createContact = async (formData: any) => {
  const res = await api.post("/info/contact-us/", formData);
  return res.data;
};

export const createLeadMessageAll = async (body: any) => {
  const res = await api.post("/leads/messages/", body);
  return res.data;
};

export const getTerms = async () => {
  const res = await api.get("/info/terms-and-conditions/");
  return res.data;
};

export const getPrivacy = async () => {
  const res = await api.get("/info/privacy-policy/");
  return res.data;
};
export const getPeopleWithDisabilities = async () => {
  const res = await api.get("/info/people-with-disabilities/");
  return res.data;
};
export const getMainInfo = async () => {
  const res = await api.get("/info/main-info/");
  return res.data;
};

export const getBankInfo = async () => {
  const res = await api.get("/info/bank-info/");
  return res.data;
};

export const addFavorite = async (body: any) => {
  const res = await api.post("/favorites/", body);
  return res.data;
};

export const removeFavoriteProperty = async (slug: string) => {
  const res = await api.delete(`/favorites/property/remove/${slug}/`);
  return res.data;
};

export const removeFavoriteProject = async (slug: string) => {
  const res = await api.delete(`/favorites/project/remove/${slug}/`);
  return res.data;
};

export const getFavoriteProperties = async (page: number = 1) => {
  const res = await api.get(`/favorites/properties/?page=${page}`);
  return res.data;
};

export const getFavoriteProjects = async (page: number = 1) => {
  const res = await api.get(`/favorites/projects/?page=${page}`);
  return res.data;
};

export const getAdvertisements = async () => {
  const res = await api.get("/info/advertisements/", {
    params: {
      no_pagination: true,
    },
  });
  return res.data;
};

export const socialClickAnalytics = async (id: number) => {
  const res = await api.post(`/analytics/social-click/${id}/`);
  return res.data;
};

export const createAppointmentLead = async (
  userId: number | string,
  body: {
    customer: number | string;
    broker: number | string;
    property: number | string;
    name: string;
    email: string;
    phone: string;
    day: string;
    time_from: string;
    time_to: string;
  }
) => {
  const res = await api.post(`/leads/appointment/${userId}/`, body);
  return res.data;
};

export const getAppointmentLeads = async (
  userId: number | string,
  params?: { status?: string; day?: string; page?: number }
) => {
  const res = await api.get(`/leads/appointment/${userId}/`, {
    params: cleanParams({
      status: params?.status,
      day: params?.day,
      page: params?.page,
    }),
  });
  return res.data;
};

export const updateAppointmentLeadStatus = async (
  appointmentId: number | string,
  status: "accepted" | "declined"
) => {
  const res = await api.patch(`/leads/appointment/update/${appointmentId}/`, {
    status,
  });
  return res.data;
};

export interface UserAppointmentHourPayload {
  day: string;
  time_from: string;
  time_to: string;
}

export const getUserAppointmentHours = async () => {
  const res = await api.get("/auth/user/appointment-hours/");
  return res.data;
};

export const createUserAppointmentHours = async (
  body: UserAppointmentHourPayload[]
) => {
  const res = await api.post("/auth/user/appointment-hours/", body);
  return res.data;
};

export const updateUserAppointmentHours = async (
  body: UserAppointmentHourPayload[]
) => {
  const res = await api.patch("/auth/user/appointment-hours/", body);
  return res.data;
};
