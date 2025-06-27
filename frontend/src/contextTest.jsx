// This file tests React context in isolation to diagnose any issues
import React from 'react';
import ReactDOM from 'react-dom/client';

// Create a simple context
const TestContext = React.createContext(null);

// Create a provider component
function TestProvider({ children }) {
    const [value, setValue] = React.useState('test value');
    return (
        <TestContext.Provider value={{ value, setValue }}>
            {children}
        </TestContext.Provider>
    );
}

// Create a consumer component
function TestConsumer() {
    const context = React.useContext(TestContext);
    if (!context) {
        return <div>Context error: Context is undefined</div>;
    }
    return <div>Context value: {context.value}</div>;
}

// Root component
function TestApp() {
    return (
        <TestProvider>
            <h1>React Context Test</h1>
            <TestConsumer />
        </TestProvider>
    );
}

// Mount for testing only
// This doesn't actually render in your app
if (process.env.NODE_ENV === 'development') {
    const testDiv = document.createElement('div');
    testDiv.id = 'context-test';
    testDiv.style.display = 'none';
    document.body.appendChild(testDiv);

    try {
        ReactDOM.createRoot(testDiv).render(<TestApp />);
        console.log('Context test passed - React context is working correctly');
    } catch (error) {
        console.error('Context test failed:', error);
    }
}

export { TestContext, TestProvider, TestConsumer };
