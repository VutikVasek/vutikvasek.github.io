import { Link, useLocation } from "react-router-dom";

export default function SmartLink({ to, ...props }) {
  const location = useLocation();

  const currentPath = decodeURIComponent(location.pathname);
  const targetPath = decodeURIComponent(typeof to === "string" ? to : to.pathname);

  const handleClick = (e) => {
    if (currentPath === targetPath) {
      e.preventDefault();
    }
  };

  return <Link to={to} onClick={handleClick} {...props} />;
}