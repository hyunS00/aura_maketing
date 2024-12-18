import PropsType from "prop-types";

const InputFile = ({ filePath, onClick }) => {
  return (
    <>
      <label className="join w-full max-w-xs mb-8" onClick={onClick}>
        <button className="btn join-item btn-neutral rounded-r-full text-white">
          파일 선택
        </button>
        <input
          className="input input-bordered join-item w-full text-black"
          value={filePath ? filePath : "선택된 파일 없음"}
          readOnly
        />
      </label>
    </>
  );
};

InputFile.propsType = {
  filePath: PropsType.string,
  onClick: PropsType.func.isRequired,
};

export default InputFile;
