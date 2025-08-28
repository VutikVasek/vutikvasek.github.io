import { Link, useLocation, useNavigate } from "react-router-dom";

export default function SmartLink({ to, className, as, dontStop, onClick, ...props }) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = decodeURIComponent(location.pathname);
  const targetPath = decodeURIComponent(typeof to === "string" ? to : to.pathname);

  if (as === "span") {
    const handleClick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (onClick) onClick();
      if (currentPath !== targetPath) {
        navigate(to);
      }
    };

    return <span onClick={handleClick} className={"cursor-pointer " + className} {...props} />;
  } else if (as === "div") {
    return <div className={className} {...props} />
  } else {
    const handleClick = (e) => {
      if (!dontStop) e.stopPropagation();
      if (currentPath === targetPath) {
        e.preventDefault();
      }
      if (onClick) onClick();
    };

    return <Link to={to} onClick={handleClick} className={className} {...props} />;
  }
}