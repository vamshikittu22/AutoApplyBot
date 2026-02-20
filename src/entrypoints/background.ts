export default defineBackground(() => {
  console.log('AutoApply Copilot background service worker started');
  
  browser.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
  });
});
