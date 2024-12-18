import PropTypes from "prop-types";

const Button = ({ text, onClick }) => {
  return (
    <button className="btn btn-accent w-full max-w-xs mb-8" onClick={onClick}>
      {text}
    </button>
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Button;
