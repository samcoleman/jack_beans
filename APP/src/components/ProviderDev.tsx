

import React, { useEffect } from 'react';


const DevContext = React.createContext(false);

export function useDev() {
	const context = React.useContext(DevContext);
	if (context === undefined) {
		throw new Error('useAuthState must be used within a AuthProvider');
	}

	return context;
}

export function ProviderDev({ children }) {
  const [dev, setDev] = React.useState(false);

    useEffect(() => {
        const callback = (event: KeyboardEvent) => {
            // event.metaKey - pressed Command key on Macs
            // event.ctrlKey - pressed Control key on Linux or Windows
            if ((event.ctrlKey) && event.code === 'KeyD') {
                console.log(`Dev mode: ${dev}`)
                setDev(!dev);
            }
        };

        document.addEventListener('keydown', callback);

        return () => {
            document.removeEventListener('keydown', callback);
        };
    }, [dev])

  return (
    <DevContext.Provider value={ dev }>
      {children}
    </DevContext.Provider>
  );
}

export default ProviderDev;