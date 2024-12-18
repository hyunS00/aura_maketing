import PropTyps from "prop-types";

const MonthlyFile = ({ setFiles }) => {
  const handlePrevChange = (e) => {
    console.log(e.target.files[0]);
    setFiles((pre) => ({
      ...pre,
      prev: e.target.files[0],
    }));
  };

  const handleCurrentChange = (e) => {
    console.log(e.target.files[0]);
    setFiles((pre) => ({
      ...pre,
      current: e.target.files[0],
    }));
  };
  return (
    <>
      <label className="form-control w-full max-w-xs mb-4">
        <span className="label label-text">전월 데이터</span>
        <input
          type="file"
          className="file-input file-input-bordered w-full max-w-xs"
          accept=".csv,.xlsx"
          onChange={handlePrevChange}
        />
      </label>
      <label className="form-control w-full max-w-xs mb-8">
        <span className="label label-text">이번월 데이터</span>
        <input
          type="file"
          className="file-input file-input-bordered w-full max-w-xs"
          accept=".csv,.xlsx"
          onChange={handleCurrentChange}
        />
      </label>
    </>
  );
};

MonthlyFile.propTypes = {
  setFiles: PropTyps.func.isRequired,
};

export default MonthlyFile;
