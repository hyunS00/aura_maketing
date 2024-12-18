import PropTypes from "prop-types";

const InputSelect = ({ labelName, name, onChange, options }) => {
  return (
    <>
      <select
        className="select select-bordered w-full max-w-xs mb-8"
        name={name}
        onChange={onChange}
        defaultValue=""
      >
        <option value="" disabled>
          {labelName}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
    </>
  );
};

InputSelect.propTypes = {
  labelName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  onChange: PropTypes.func.isRequired,
};
export default InputSelect;
