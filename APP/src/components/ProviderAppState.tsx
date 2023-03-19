import type { Kiosk } from '@prisma/client';
import React, { useEffect, useReducer, type Dispatch } from 'react';
import { api } from '../utils/api';

type IState = {
    dev: boolean,
    kiosk: {
        id: string | null,
        valid: boolean | "UNKNOWN",
        obj: Kiosk | undefined,
    }
}


const initialState : IState = {
	dev: false,
    kiosk: {
        id: null,
        valid: "UNKNOWN",
        obj: undefined,
    }
};

const stateReducer = (initialState : IState, action: Partial<IState>) : IState => {
    return {...initialState, ...action}
};

const AppStateContext = React.createContext<IState>(initialState);
const AppDispatchContext = React.createContext<Dispatch<Partial<IState>>>({} as Dispatch<Partial<IState>>);

export function useAppState() {
	const context = React.useContext(AppStateContext);
	if (context === undefined) {
		throw new Error('useAppState must be used within a ProviderAppState');
	}

	return context;
}

export function useAppDispatch() {
	const context = React.useContext(AppDispatchContext);
	if (context === undefined) {
		throw new Error('useAppDispatch must be used within a ProviderAppState');
	}

	return context;
}

const ProviderAppState = ({ children } : { children: React.ReactNode }) => {
	const [state, dispatch] = useReducer(stateReducer, initialState);

    // FIXME: Async query??
    const validate = api.kiosk.checkValid.useMutation()


    useEffect(() => {
        const callback = (event: KeyboardEvent) => {
            // event.metaKey - pressed Command key on Macs
            // event.ctrlKey - pressed Control key on Linux or Windows
            if ((event.ctrlKey) && event.code === 'KeyB') {
                console.log(`Dev mode: ${state.dev ? "ON" : "OFF"}`)
                dispatch({dev: !state.dev});
            }
        };

        document.addEventListener('keydown', callback); 
        return () => {
            document.removeEventListener('keydown', callback);
        };
    }, [state.dev])

    useEffect(() => {
        async function checkKioskId(){
            const kiosk_id = localStorage.getItem("kiosk_id");
            // Check if kiosk id is assigned
            if (!kiosk_id){
                dispatch({kiosk: {id: null, valid: false, obj: undefined}});
                return
            }
          
            const kiosk = await validate.mutateAsync({id: kiosk_id});
            dispatch({kiosk: {id: kiosk_id, valid: kiosk ? true : false, obj: kiosk}});  
    }

        void checkKioskId()
    }, [state.kiosk.id])
    //}   , [])

	return (
		<AppStateContext.Provider value={state}>
            <AppDispatchContext.Provider value={dispatch}>
			    {children}
            </AppDispatchContext.Provider>
		</AppStateContext.Provider>
	);
};

export  default ProviderAppState