import PropTypes from "prop-types";
import { useState } from "react";

const InputRadio = ({ name, options, onChange }) => {
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (e) => {
    setSelectedValue(e.target.value);
    onChange(e);
  };

  return (
    <div className="join flex justify-center w-full max-w-xs mb-4">
      {options.map((option, index) => (
        <label
          key={`${option.value}-${index}`}
          className={`join-item btn w-1/2 ${
            selectedValue === option.value ? "btn-accent" : ""
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={handleChange}
            className="hidden"
            aria-label={option.label}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

InputRadio.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string,
};

export default InputRadio;
