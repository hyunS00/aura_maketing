// import PropTyps from "prop-types";
import InputFile from "../common/InputFile";

const WeeklyFile = ({ filePaths, setFilePaths }) => {
  const handleClick = async () => {
    console.log("업로드 파일 클릭");

    const filePath = await window.electronAPI.uploadFile();
    console.log(filePath);
    setFilePaths((pre) => ({
      ...pre,
      current: filePath,
    }));
  };
  return (
    <>
      <InputFile filePath={filePaths.current} onClick={handleClick} />
    </>
  );
};

// WeeklyFile.propTypes = {
//   // filePaths: PropTyps.objectOf(
//   //   PropTyps.object({
//   //     prev: PropTyps.string,
//   //     current: PropTyps.string,
//   //   })
//   // ),
//   setFiles: PropTyps.func.isRequired,
// };

export default WeeklyFile;
