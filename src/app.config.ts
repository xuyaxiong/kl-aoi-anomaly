const path = require('path');

const KL_STORAGE_PATH = 'D:\\kl-storage';

const AppConfig = {
  DLL_PATH: path.join(KL_STORAGE_PATH, 'dll'), // dll路径
  CRASH_DUMP_DIR: path.join(KL_STORAGE_PATH, 'crashDump', 'aoi-anomaly'), // dll崩溃dump文件保存路径
  APP_LOG_DIR: path.join(KL_STORAGE_PATH, 'app-logs', 'aoi-anomaly'), // 服务日志保存路径
  TMP_DIR: 'D:\\tmp', // 临时文件夹

  imgInfo: {
    width: 5120,
    height: 5120,
    channel: 3,
  },

  exportPath: {
    appPath: `${KL_STORAGE_PATH}\\`,
    recipePath: `${KL_STORAGE_PATH}\\gallery\\recipe\\`,
    dbPath: `${KL_STORAGE_PATH}\\gallery\\db\\`,
    samplePath: `${KL_STORAGE_PATH}\\gallery\\sample\\`,
  },

  registerHealthCheck: 'ws://127.0.0.1:9000?clientType=service',
  serviceName: '外观检测服务',
  event: 'AnomalyService',
};
export default AppConfig;
