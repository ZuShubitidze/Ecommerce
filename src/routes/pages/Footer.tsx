import { Link } from "react-router";

const Footer = () => {
  return (
    <div className="flex gap-20 md:gap-50 justify-center">
      <Link to="/contact">Contact</Link>
    </div>
  );
};

export default Footer;
