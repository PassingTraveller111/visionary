import { combineReducers } from'redux';
import userReducer from './features/userSlice';
import articleReducer from './features/articleSlice';
import draftReducer from './features/draftSlice';

const rootReducer = combineReducers({
    userReducer,
    articleReducer,
    draftReducer,
});

export default rootReducer;
