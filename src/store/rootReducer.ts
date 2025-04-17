import { combineReducers } from'redux';
import userReducer from './features/userSlice';
import articleReducer from './features/articleSlice';
import draftReducer from './features/draftSlice';
import reviewReducer from './features/reviewSlice';
import assistantReducer from './features/assistantSlice';
import diagramReducer from'./features/diagramSlice';

const rootReducer = combineReducers({
    userReducer,
    articleReducer,
    draftReducer,
    reviewReducer,
    assistantReducer,
    diagramReducer,
});

export default rootReducer;
