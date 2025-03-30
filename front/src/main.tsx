import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.tsx";
import { SearchProvider } from "./context/SearchContext.tsx";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import "./index.css";
import App from "./App.tsx";

const client = new ApolloClient({
  uri: "https://back-asocial.onrender.com/",
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SearchProvider>
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      </SearchProvider>
    </AuthProvider>
  </StrictMode>
);
