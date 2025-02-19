import { combineReducers } from'redux';
import userReducer from './features/userSlice';
import articleReducer from './features/articleSlice';
import draftReducer from './features/draftSlice';
import reviewReducer from './features/reviewSlice';

const rootReducer = combineReducers({
    userReducer,
    articleReducer,
    draftReducer,
    reviewReducer,
});

export default rootReducer;
