import puppeteer from 'puppeteer-core'
import { print } from '../utils/log.js'
import { getUserConfig, setUserConfig, isCookieExpired } from '../utils/cfg_mgt.js'

async function login(userConfig) {
  const browser = await puppeteer.launch({
    executablePath: userConfig.puppeteer.chromePath,
    headless: userConfig.puppeteer.headless
  });
  const page = await browser.newPage();

  let loginRequest;
  // 监听请求事件，识别登录请求
  page.on('request', request => {
    if (request.method() === 'POST' && request.url().includes('login')) { // 根据实际的登录请求 URL 和方法调整
      loginRequest = request;
    }
  });

  // 监听响应事件，提取 Set-Cookie
  page.on('response', async response => {
    if (response.request() === loginRequest) { // 检查响应是否来自登录请求
      const cookies = response.headers()['set-cookie'];
      if (cookies) {
        print('info', '提取并保存 Cookie');
        userConfig.account.cookies = cookies;
        setUserConfig(userConfig);
      }
    }
  });

  await page.goto('https://www.yuque.com/login/');

  // 切换到手机号登录
  await page.waitForSelector('span[data-testid="switchBtn"]');
  await page.click('span[data-testid="switchBtn"]');

  // 输入用户名和密码
  await page.waitForSelector('input[data-testid="prefix-phone-input"]');
  await page.type('input[data-testid="prefix-phone-input"]', userConfig.account.user, { delay: 100 });

  await page.waitForSelector('input[data-testid="loginPasswordInput"]');
  await page.type('input[data-testid="loginPasswordInput"]', userConfig.account.password, { delay: 100 });

  // 勾选复选框
  await page.waitForSelector('input[data-testid="protocolCheckBox"]');
  await page.click('input[data-testid="protocolCheckBox"]');

  // 滑动滑块
  await page.waitForSelector('.nc_iconfont.btn_slide');
  const slider = await page.$$('.nc_iconfont.btn_slide');
  const sliderBox = await slider[0].boundingBox();
  const startX = sliderBox.x + sliderBox.width / 2;
  const startY = sliderBox.y + sliderBox.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  const sliderContainer = await page.$$('.nc-container');
  const containerBox = await sliderContainer[0].boundingBox();
  const endX = containerBox.x + containerBox.width;

  await page.mouse.move(endX, startY, { steps: 10 });
  await page.mouse.up();

  // 等待滑块验证
  await new Promise(resolve => setTimeout(resolve, userConfig.puppeteer.slideSleep));

  // 点击登录
  await page.waitForSelector('button[data-testid="btnLogin"]');
  await page.click('button[data-testid="btnLogin"]');

  // 等待页面跳转
  await page.waitForNavigation();

  await browser.close();
}

export async function loginToYuque(options) {
  print('info', '登录中...')

  const userConfig = getUserConfig();
  if (!userConfig) {
    print('error', '配置文件不存在，请先进行初始化');
    return;
  }

  if (!userConfig.account.user || !userConfig.account.password) {
    print('error', '语雀账号信息未配置，请先进行配置');
    return;
  }
  
  if (!userConfig.puppeteer.chromePath) {
    print('error', '未指定 Chrome 路径，请先进行配置');
    return;
  }

  if (!options || !options.force) {
    if (userConfig.account.cookies && !isCookieExpired(userConfig.account.cookies)) {
      print('success', 'Cookie 有效，无需重复登录')
      return;
    }
  }

  try {
    await login(userConfig);
    print('success', '登录成功！');
  } catch (error) {
    print('error', '登录失败...');
    print('error', error);
  }
}

