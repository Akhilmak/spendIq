import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { MainTabs } from './src/navigation/MainTabs';
import { initDb } from './src/database/db';
import { SpendIQSplash } from './src/components/SpendIQSplash';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    initDb().then(() => setDbReady(true)).catch(e => console.error("DB Init Error:", e));
  }, []);

  return (
    <Provider store={store}>
      {(!dbReady || !splashFinished) ? (
        <SpendIQSplash onFinish={() => setSplashFinished(true)} />
      ) : (
        <MainTabs />
      )}
    </Provider>
  );
}
