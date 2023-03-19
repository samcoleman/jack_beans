import React, { Dispatch, useReducer } from 'react';

type IState = {
    dev: boolean,
    serial: "CONNECTED" | "DISCONNECTED" | "ERROR",
    kiosk: {
        assigned: boolean,
        id: string | null,
    }
}


const initialState : IState = {
	dev: false,
    serial: "DISCONNECTED",
    kiosk: {
        assigned: false,
        id: null,
    }
};

const stateReducer = (initialState : IState, action: Partial<IState>) : IState => {
    return {...initialState, ...action}
};

const AppStateContext = React.createContext<{state: IState, dispatch: Dispatch<Partial<IState>>}>({state: initialState, dispatch: () => {}});
export function useAppState() {
	const context = React.useContext(AppStateContext);
	if (context === undefined) {
		throw new Error('useAppState must be used within a ProviderAppState');
	}

	return context;
}

const ProviderAppState = ({ children } : { children: React.ReactNode }) => {
	const [state, dispatch] = useReducer(stateReducer, initialState);

	return (
		<AppStateContext.Provider 
            value={{state, dispatch}}
        >
			{children}
		</AppStateContext.Provider>
	);
};

export  default ProviderAppState