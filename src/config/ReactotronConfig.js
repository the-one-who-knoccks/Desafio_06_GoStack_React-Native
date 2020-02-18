import Reactotron from 'reactotron-react-native';

if (__DEV__) {
  const tron = Reactotron.configure({host: '172.17.0.1'})
    .useReactNative()
    .connect();

  console.tron = tron;

  tron.clear();
}
