import { combineReducers } from "@reduxjs/toolkit";
import editorSlice from "./slices/editorSlice";
import viewSlice from "./slices/viewSlice";

const rootReducer = combineReducers({
  editor: editorSlice,
  view: viewSlice,
});

export default rootReducer;
