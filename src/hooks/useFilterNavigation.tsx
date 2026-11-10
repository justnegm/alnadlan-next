import { useNavigate } from "react-router";

const useFilterNavigation = () => {
  const navigate = useNavigate();

  const handleFilters = (filters: Record<string, unknown>, path = "/properties") => {
    const cleanFilters: Record<string, string> = Object.fromEntries(
      Object.entries(filters)
        .filter(([_, value]) => value !== "" && value != null)
        .map(([key, value]) => [key, String(value)])
    );

    const queryString = new URLSearchParams(cleanFilters).toString();

    navigate(`${path}?${queryString}`);
  };

  return { handleFilters };
};

export default useFilterNavigation;