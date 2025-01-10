import { combineReducers } from'redux';
import userReducer from './features/userSlice';

const rootReducer = combineReducers({
    userReducer,
});

export default rootReducer;
