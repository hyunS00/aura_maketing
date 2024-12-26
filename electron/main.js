const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("node:path");
const Generator = require("./generator/generator.js");
const { platform } = require("node:os");

function createWindow() {
  console.log("path: ", path.resolve(__dirname, "preload.js"));

  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js"), // Preload 스크립트 경로
      nodeIntegration: false, // 보안 강화: 렌더러 프로세스에 Node 통합 비활성화
      contextIsolation: true, // 보안 설정
      sandbox: false,
    },
  });

  if (process.env.NODE_ENV === "development") {
    // 개발 중: Vite 개발 서버 URL 로드
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "undocked" });
  } else {
    // 프로덕션 빌드 시: 빌드된 파일 로드
    win.loadFile(path.resolve(__dirname, "../front/dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC 핸들러 설정: 렌더러 프로세스로부터 보고서 생성 요청을 처리
ipcMain.handle("upload-file", async () => {
  try {
    console.log("업로드 파일");

    const result = await dialog.showOpenDialog(
      BrowserWindow.getFocusedWindow(),
      {
        properties: ["openFile"],
        defaultPath: path.join(app.getPath("downloads")),
        filters: [{ name: "file", extensions: ["csv", "xlsx", "excel"] }],
      }
    );

    if (result.canceled) return null; // 사용자가 다이얼로그를 취소했을 경우
    return result.filePaths[0];
  } catch (error) {
    console.error("파일 업로드 오류", error);
    dialog.showErrorBox("파일 업로드 오류", `${error}`);
  }
});

const config = {
  platform: {
    coupang: "쿠팡",
    naver: "네이버",
  },
  type: {
    weekly: "주간",
    monthly: "월간",
  },
};
ipcMain.handle(
  "generate-report",
  async (event, { filePaths, code, name, platform, type }) => {
    try {
      code, name, platform, type;
      const generator = new Generator();
      const workbook = await generator.generateReport(
        filePaths,
        code,
        name,
        platform,
        type
      );

      const outputPath = await dialog.showSaveDialog(
        BrowserWindow.getFocusedWindow(),
        {
          defaultPath: path.join(
            app.getPath("downloads"),
            `${name} ${config.platform[platform]} ${config.type[type]} 광고성과 보고서.xlsx`
          ),
          buttonLabel: "저장",
        }
      );

      if (outputPath.canceled) return null; // 사용자가 저장 다이얼로그를 취소했을 경우

      const result = generator.downloadReport(workbook, outputPath.filePath);
      console.log("결과", result);
      shell.openPath(app.getPath("downloads"));
      return result;
    } catch (error) {
      console.error("보고서 생성 오류:", error);
      dialog.showErrorBox("보고서 생성 오류", `${error}`);
    }
  }
);
