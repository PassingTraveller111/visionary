import { combineReducers } from'redux';
import userReducer from './features/userSlice';
import articleReducer from './features/articleSlice';

const rootReducer = combineReducers({
    userReducer,
    articleReducer,
});

export default rootReducer;
