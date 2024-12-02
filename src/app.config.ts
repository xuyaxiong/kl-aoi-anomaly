const AppConfig = {
  DLL_PATH: 'D:\\kl-storage\\dll\\', // dll路径
  CRASH_DUMP_DIR: 'D:\\kl-storage\\crashDump\\aoi-anomaly', // dll崩溃dump文件保存路径
  APP_LOG_DIR: 'D:\\kl-storage\\app-logs\\aoi-anomaly', // 服务日志保存路径
  TMP_DIR: 'D:\\tmp', // 临时文件夹

  imgInfo: {
    width: 5120,
    height: 5120,
    channel: 3,
  },

  exportPath: {
    appPath: 'D:\\kl-storage\\',
    recipePath: 'D:\\kl-storage\\gallery\\recipe\\',
    dbPath: 'D:\\kl-storage\\gallery\\db\\',
    samplePath: 'D:\\kl-storage\\gallery\\sample\\',
  },
};
export default AppConfig;
