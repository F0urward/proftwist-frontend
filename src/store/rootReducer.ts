import { combineReducers } from "@reduxjs/toolkit";
import editorSlice from "./slices/editorSlice";

const rootReducer = combineReducers({
  editor: editorSlice,
});

export default rootReducer;
