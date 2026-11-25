"use client";

import { Provider } from "react-redux";
import { useEffect } from "react";
import { store } from "./store";
import { fetchCurrentUser } from "./slices/authSlice";

function AuthInitializer({ children }) {
  useEffect(() => {
    store.dispatch(fetchCurrentUser());
  }, []);

  return children;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
