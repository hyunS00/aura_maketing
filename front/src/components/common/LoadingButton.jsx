import PropTypes from "prop-types";

const LoadingButton = () => {
  return (
    <button className="btn btn-accent w-full max-w-xs mb-8" disabled>
      <span className="loading loading-spinner"></span>
      생성중
    </button>
  );
};

export default LoadingButton;
