import { combineReducers } from "@reduxjs/toolkit";
import editorSlice from "./slices/editorSlice";
import viewSlice from "./slices/viewSlice";
import authSlice from "./slices/authSlice";
import themeSlice from "./slices/themeSlice";

const rootReducer = combineReducers({
  editor: editorSlice,
  view: viewSlice,
  auth: authSlice,
  theme: themeSlice,
});

export default rootReducer;
