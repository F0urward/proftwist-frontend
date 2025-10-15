import { combineReducers } from "@reduxjs/toolkit";
import editorSlice from "./slices/editorSlice";
import viewSlice from "./slices/viewSlice";
import authSlice from "./slices/authSlice";

const rootReducer = combineReducers({
  editor: editorSlice,
  view: viewSlice,
  auth: authSlice,
});

export default rootReducer;
