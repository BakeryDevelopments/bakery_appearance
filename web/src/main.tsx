import {createRoot} from 'react-dom/client';
import {StrictMode} from 'react';
import {MantineProvider} from '@mantine/core';
import {VisibilityProvider} from './Providers/VisibilityProvider';
import {ConfigProvider} from './Providers/ConfigProvider';
import {AppearanceStoreProvider} from './Providers/AppearanceStoreProvider';
import {CustomizationProvider} from './Providers/CustomizationProvider';
import {App} from './Components/App';
import {AdminMenu} from './Components/AdminMenu';
import {DebugProvider} from './Providers/debug';
import {IsRunningInBrowser} from './Utils/Misc';
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={{
      colorScheme: 'dark',
      fontFamily: '"Inter", sans-serif',
      fontSizes: {
        xs: '14px',
        sm: '15px',
        md: '16px',
        lg: '17px',
        xl: '20px',
      },
      globalStyles: (theme) => ({
        body: {
          fontWeight: 500,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeSpeed',
          fontSize: '14px',
        },
        '*': {
          fontWeight: 500,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }
      })
    }}>
      <CustomizationProvider>
        <ConfigProvider>
          <AppearanceStoreProvider>
            {IsRunningInBrowser() ? (
              <DebugProvider />
            ) : (
              <>
                <VisibilityProvider component='App'>
                  <App/>
                </VisibilityProvider>
                {/* Render AdminMenu outside App visibility so it can open independently */}
                <AdminMenu />
              </>
            )}
          </AppearanceStoreProvider>
        </ConfigProvider>
      </CustomizationProvider>
    </MantineProvider>
  </StrictMode>
);