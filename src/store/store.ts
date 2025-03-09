import {configureStore} from '@reduxjs/toolkit';
import patientsReducer from './slices/patientsSlice';
import visitsReducer, {VisitsState} from './slices/visitsSlice';
import authReducer from './slices/authSlice';

export interface RootState {
  patients: ReturnType<typeof patientsReducer>;
  visits: VisitsState;
  auth: ReturnType<typeof authReducer>;
}

export const store = configureStore({
  reducer: {
    patients: patientsReducer,
    visits: visitsReducer,
    auth: authReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
