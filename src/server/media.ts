import api from "./api";

export const getAuthMedia = async () => {
    const res = await api.get(`/pages/auth/`);
    return res.data;
};

export const getHomeMedia = async () => {
    const res = await api.get(`/pages/home/`);
    return res.data;
};
export const getBrokerProfileMedia = async () => {
    const res = await api.get(`/pages/broker-profile/`);
    return res.data;
};
export const getBrokerPropertyDetailsMedia = async () => {
    const res = await api.get(`/pages/broker-property-details/`);
    return res.data;
};
export const getBrokersMedia = async () => {
    const res = await api.get(`/pages/brokers/`);
    return res.data;
};

export const getCompanyProfileMedia = async () => {
    const res = await api.get(`/pages/company-profile/`);
    return res.data;
};

export const getContactUsMedia = async () => {
    const res = await api.get(`/pages/contact-us/`);
    return res.data;
};

export const getCustomerProfileMedia = async () => {
    const res = await api.get(`/pages/customer-profile/`);
    return res.data;
};

export const getCustomerPropertyDetailsMedia = async () => {
    const res = await api.get(`/pages/customer-property-details/`);
    return res.data;
};

export const getDesignerProfileMedia = async () => {
    const res = await api.get(`/pages/designer-profile/`);
    return res.data;
};

export const getDesignersMedia = async () => {
    const res = await api.get(`/pages/designers/`);
    return res.data;
};

export const getLawyerProfileMedia = async () => {
    const res = await api.get(`/pages/lawyer-profile/`);
    return res.data;
};

export const getLawyersMedia = async () => {
    const res = await api.get(`/pages/lawyers/`);
    return res.data;
};

export const getLoanAdvisorProfileMedia = async () => {
    const res = await api.get(`/pages/loan-advisor-profile/`);
    return res.data;
};

export const getLoanAdvisorsMedia = async () => {
    const res = await api.get(`/pages/loan-advisors/`);
    return res.data;
};

export const getProjectDetailsMedia = async () => {
    const res = await api.get(`/pages/project-details/`);
    return res.data;
};

export const getProjectsMedia = async () => {
    const res = await api.get(`/pages/projects/`);
    return res.data;
};

export const getPropertiesMedia = async () => {
    const res = await api.get(`/pages/properties/`);
    return res.data;
};

export const getPropertyAddMedia = async () => {
    const res = await api.get(`/pages/property-add/`);
    return res.data;
};
