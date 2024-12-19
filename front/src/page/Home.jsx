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
      console.log("code 누락");
      return;
    }
    if (!name) {
      console.log("name 누락");
      return;
    }
    if (!platform) {
      console.log("platform 누락");
      return;
    }
    if (!type) {
      console.log("type 누락");
      return;
    }

    if (!filePaths.current) {
      console.log("current 누락");
      return;
    }
    if (type === "monthly" && !filePaths.prev) {
      console.log("prev 누락");
      return;
    }

    console.log(code, name, platform, type, filePaths.current);
    setIsProcessing(true);
    const reportBuffer = await window.electronAPI.generateReport({
      filePaths,
      code,
      name,
      platform,
      type,
    });
    console.log(reportBuffer);
    setIsProcessing(false);
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
          <MonthlyFile setFiles={setFilePaths} />
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
