import { useState } from "react";
import InputText from "../components/common/InputText.jsx";
import InputSelect from "../components/common/InputSelect.jsx";
import InputRadio from "../components/common/InputRadio.jsx";
import Button from "../components/common/Button.jsx";
import LoadingButton from "../components/common/LoadingButton.jsx";
import WeeklyFile from "../components/specific/WeeklyFile.jsx";
import MonthlyFile from "../components/specific/MonthlyFile.jsx";
import option from "../option.config.js";

const Home = () => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [type, setType] = useState("");
  const [filePaths, setFilePaths] = useState({ prev: null, current: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };
  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  const handlePlatformChange = (e) => {
    setPlatform(e.target.value);
  };
  const handleTypeChange = (e) => {
    setType(e.target.value);
  };
  const handleClick = async () => {
    if (!code) {
      window.electronAPI.error("광고 코드 누락");
      return;
    }
    if (!name) {
      window.electronAPI.error("광고주 누락");
      return;
    }
    if (!platform) {
      window.electronAPI.error("플랫폼 누락");
      return;
    }
    if (!type) {
      window.electronAPI.error("보고서 타입 누락");
      return;
    }

    if (!filePaths.current) {
      window.electronAPI.error("최근 파일 누락");
      return;
    }
    if (type === "monthly" && !filePaths.prev) {
      window.electronAPI.error("이전 파일 누락");
      return;
    }

    setIsProcessing(true);
    try {
      const reportBuffer = await window.electronAPI.generateReport({
        filePaths,
        code,
        name,
        platform,
        type,
      });
    } catch (error) {
      window.electronAPI.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="container content-center w-fit mx-auto my-8">
        <InputText
          labelName="광고 코드"
          name="code"
          value={code}
          onChange={handleCodeChange}
        />
        <InputText
          labelName="광고주 명"
          name="name"
          value={name}
          onChange={handleNameChange}
        />
        <InputSelect
          labelName="플랫폼"
          name="platform"
          onChange={handlePlatformChange}
          options={option.platform}
        />
        <InputRadio
          name="type"
          options={option.type}
          onChange={handleTypeChange}
        />
        {type && type === "weekly" ? (
          <WeeklyFile filePaths={filePaths} setFilePaths={setFilePaths} />
        ) : (
          <MonthlyFile filePaths={filePaths} setFilePaths={setFilePaths} />
        )}
        {isProcessing ? (
          <LoadingButton />
        ) : (
          <Button text="보고서 생성" onClick={handleClick} />
        )}
      </div>
    </>
  );
};

export default Home;
