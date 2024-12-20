import PropTyps from "prop-types";
import InputFile from "../common/InputFile";

const MonthlyFile = ({ filePaths, setFilePaths }) => {
  const handlePrevChange = async () => {
    const filePath = await window.electronAPI.uploadFile();
    setFilePaths((pre) => ({
      ...pre,
      prev: filePath,
    }));
  };

  const handleCurrentChange = async (e) => {
    const filePath = await window.electronAPI.uploadFile();
    setFilePaths((pre) => ({
      ...pre,
      current: filePath,
    }));
  };
  return (
    <>
      <label className="form-control w-full max-w-xs mb-4">
        <span className="label label-text">전월 데이터</span>
        <InputFile filePath={filePaths.prev} onClick={handlePrevChange} />
      </label>
      <label className="form-control w-full max-w-xs mb-8">
        <span className="label label-text">이번월 데이터</span>
        <InputFile filePath={filePaths.current} onClick={handleCurrentChange} />
      </label>
    </>
  );
};

MonthlyFile.propTypes = {
  setFilePaths: PropTyps.func.isRequired,
};

export default MonthlyFile;
