import './index.scss'
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

const element = document.getElementById('root');
const root = createRoot(element);
root.render(
    <FluentProvider theme={webLightTheme}>
        <App />
    </FluentProvider>
);