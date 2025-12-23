rpc.exports = {
  init(stage, parameters) {
    console.log('[init]', stage, JSON.stringify(parameters));

    Interceptor.attach(Module.getGlobalExportByName('open'), {
      onEnter(args) {
        const path = args[0].readUtf8String();
        console.log('open("' + path + '")');
      }
    });
  },
  dispose() {
    console.log('[dispose]');
  }
};