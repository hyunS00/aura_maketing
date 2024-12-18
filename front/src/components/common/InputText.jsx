import PropTypes from "prop-types";

const InputText = ({ labelName, name, value, onChange }) => {
  return (
    <>
      <label className="input input-bordered flex items-center w-full max-w-xs mb-8">
        {`${labelName}:`}
        <input
          type="text"
          className="grow"
          name={name}
          value={value}
          onChange={onChange}
        />
      </label>
    </>
  );
};

InputText.propTypes = {
  labelName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
export default InputText;
